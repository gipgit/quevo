"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { BusinessProvider } from "@/lib/business-context"
import { SessionProvider } from "next-auth/react"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import AnimatedLoadingBackground from "@/components/ui/AnimatedLoadingBackground"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SessionProvider>
  )
}

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // If not authenticated, redirect to signin
    if (status !== "loading" && !session) {
      console.log('[dashboard] No session found, redirecting to signin', { status, session })
      // Get the current locale from the URL
      const pathname = window.location.pathname
      const locale = pathname.split('/')[1] || 'it'
      router.push(`/${locale}/signin/business`)
    } else if (status === "authenticated" && session) {
      console.log('[dashboard] Session found, user authenticated', { 
        userId: session.user?.id, 
        userEmail: session.user?.email,
        userRole: session.user?.role 
      })
    }
  }, [session, status, router])

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <AnimatedLoadingBackground>
        <div className="text-center">
          <LoadingSpinner size="xl" color="blue" />
        </div>
      </AnimatedLoadingBackground>
    )
  }

  // Don't render anything if not authenticated
  if (!session) {
    return null
  }

  // Wrap children with BusinessProvider which will handle business-related checks
  return <BusinessProvider>{children}</BusinessProvider>
}

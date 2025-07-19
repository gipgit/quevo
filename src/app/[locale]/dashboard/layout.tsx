"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { BusinessProvider } from "@/lib/business-context"
import { SessionProvider } from "next-auth/react"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

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
      router.push("/signin/manager")
    }
  }, [session, status, router])

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" color="blue" />
      </div>
    )
  }

  // Don't render anything if not authenticated
  if (!session) {
    return null
  }

  // Wrap children with BusinessProvider which will handle business-related checks
  return <BusinessProvider>{children}</BusinessProvider>
}

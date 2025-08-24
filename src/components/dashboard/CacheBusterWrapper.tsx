"use client"

import { useBusiness } from "@/lib/business-context"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

interface CacheBusterWrapperProps {
  children: React.ReactNode
}

export default function CacheBusterWrapper({ children }: CacheBusterWrapperProps) {
  const { currentBusiness } = useBusiness()
  const router = useRouter()
  const pathname = usePathname()
  const lastBusinessId = useRef<string | null>(null)
  const hasRefreshed = useRef(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    // Only refresh if we're on a dashboard page (not select-business)
    if (pathname.startsWith('/dashboard') && pathname !== '/dashboard/select-business') {
      const currentBusinessId = currentBusiness?.business_id
      
      // Check if the business has actually changed
      if (currentBusinessId && lastBusinessId.current && currentBusinessId !== lastBusinessId.current && !hasRefreshed.current) {
        console.log('CacheBusterWrapper: Business changed, refreshing page to clear server-side cache')
        console.log(`From: ${lastBusinessId.current} To: ${currentBusinessId}`)
        hasRefreshed.current = true
        setIsRefreshing(true)
        
        // Force a hard refresh immediately
        window.location.reload()
        return
      }
      
      // Update the last business ID
      if (currentBusinessId) {
        lastBusinessId.current = currentBusinessId
      }
    }
  }, [pathname, currentBusiness])

  // Reset the refresh flag when the pathname changes
  useEffect(() => {
    hasRefreshed.current = false
    setIsRefreshing(false)
  }, [pathname])

  if (isRefreshing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" color="blue" />
          <p className="mt-4 text-gray-600">Loading new business data...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

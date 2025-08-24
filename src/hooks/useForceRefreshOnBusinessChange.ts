"use client"

import { useEffect, useRef } from 'react'
import { useBusiness } from '@/lib/business-context'
import { usePathname } from 'next/navigation'

export function useForceRefreshOnBusinessChange() {
  const { currentBusiness } = useBusiness()
  const pathname = usePathname()
  const lastBusinessId = useRef<string | null>(null)
  const hasRefreshed = useRef(false)

  useEffect(() => {
    // Only apply to dashboard pages (not select-business)
    if (pathname.startsWith('/dashboard') && pathname !== '/dashboard/select-business') {
      const currentBusinessId = currentBusiness?.business_id
      
      // Check if business has changed
      if (currentBusinessId && lastBusinessId.current && currentBusinessId !== lastBusinessId.current && !hasRefreshed.current) {
        console.log('useForceRefreshOnBusinessChange: Business changed, forcing refresh')
        console.log(`From: ${lastBusinessId.current} To: ${currentBusinessId}`)
        console.log(`Current path: ${pathname}`)
        
        hasRefreshed.current = true
        
        // Force a hard refresh
        window.location.reload()
        return
      }
      
      // Update the last business ID
      if (currentBusinessId) {
        lastBusinessId.current = currentBusinessId
      }
    }
  }, [currentBusiness, pathname])

  // Reset the refresh flag when the pathname changes
  useEffect(() => {
    hasRefreshed.current = false
  }, [pathname])
}

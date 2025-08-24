"use client"

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useBusiness } from '@/lib/business-context'

export default function NavigationInterceptor() {
  const pathname = usePathname()
  const router = useRouter()
  const { currentBusiness } = useBusiness()
  const lastBusinessId = useRef<string | null>(null)
  const lastPathname = useRef<string | null>(null)

  useEffect(() => {
    // Only intercept navigation to dashboard pages (not select-business)
    if (pathname.startsWith('/dashboard') && pathname !== '/dashboard/select-business') {
      const currentBusinessId = currentBusiness?.business_id
      
      // Check if this is a navigation to a different page
      const isNavigation = lastPathname.current && lastPathname.current !== pathname
      
      // Check if business has changed since last render
      const businessChanged = lastBusinessId.current && currentBusinessId && lastBusinessId.current !== currentBusinessId
      
      // If we're navigating to a new page and business has changed, force refresh
      if (isNavigation && businessChanged) {
        console.log('NavigationInterceptor: Business changed during navigation, forcing refresh')
        console.log(`From: ${lastBusinessId.current} To: ${currentBusinessId}`)
        console.log(`Path: ${lastPathname.current} -> ${pathname}`)
        
        // Force a hard refresh to ensure fresh data
        window.location.reload()
        return
      }
      
      // Update refs
      if (currentBusinessId) {
        lastBusinessId.current = currentBusinessId
      }
      lastPathname.current = pathname
    }
  }, [pathname, currentBusiness])

  return null
}

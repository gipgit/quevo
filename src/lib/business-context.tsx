"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { setCurrentBusinessIdCookie, BUSINESS_ID_COOKIE_NAME } from "./business-utils"

interface Business {
  business_id: string
  business_name: string
  business_urlname: string
  business_country: string
  business_region: string
  business_address: string
  business_email: string
  business_phone: string
  business_descr: string
  business_img_profile: string | null
  business_img_cover: string | null
  business_public_uuid: string
  date_created: string
}

interface Plan {
  plan_id: number
  plan_name: string
  // Add other plan fields as needed
}

interface UserManager {
  id: string
  name_first: string
  name_last: string
  email: string
  plan: Plan
}

// Replace the old UsageData interface with a flexible type
// interface UsageData { ... }
type UsageData = Record<string, number>;

interface PlanLimits {
  maxBusinesses: number
  maxProducts: number
  maxServices: number
  maxPromos: number
  maxBookings: number
  maxQuestionsPerService: number
}

interface BusinessContextType {
  userManager: UserManager | null
  userPlan: Plan | null
  businesses: Business[]
  currentBusiness: Business | null
  usage: UsageData | null
  planLimits: any[] | null // changed from PlanLimits | null
  switchBusiness: (businessId: string) => void
  addBusiness: (business: Business) => void
  refreshBusinesses: () => Promise<void>
  refreshUsage: () => Promise<void>
  refreshUsageForFeature: (feature: keyof UsageData) => Promise<void>
  loading: boolean
  error: string | null
  businessSwitchKey: number // Add this to track business switches
  cacheBuster: string // Add cache buster for server-side data invalidation
}

interface InitialData {
  userManager: UserManager
  userPlan: Plan
  businesses: Business[]
  currentBusiness: Business | null
  usage?: UsageData
  planLimits?: any[]
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined)

export function BusinessProvider({ 
  children, 
  initialData 
}: { 
  children: ReactNode
  initialData?: InitialData
}) {
  const router = useRouter()
  const [userManager, setUserManager] = useState<UserManager | null>(initialData?.userManager || null)
  const [userPlan, setUserPlan] = useState<Plan | null>(initialData?.userPlan || null)
  const [businesses, setBusinesses] = useState<Business[]>(initialData?.businesses || [])
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(initialData?.currentBusiness || null)
  const [usage, setUsage] = useState<UsageData | null>(initialData?.usage || null)
  const [planLimits, setPlanLimits] = useState<any[] | null>(initialData?.planLimits || null)
  const [loading, setLoading] = useState(!initialData) // If we have initial data, we're not loading
  const [error, setError] = useState<string | null>(null)
  const [businessSwitchKey, setBusinessSwitchKey] = useState(0) // Force re-render key
  const [cacheBuster, setCacheBuster] = useState(`?v=${Date.now()}`) // Cache buster for server-side data
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const fetchManagerDashboard = useCallback(async (retryCount = 0) => {
    try {
      console.log("BusinessContext: Starting fetchManagerDashboard, retry:", retryCount)
      setLoading(true)
      setError(null)
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      })
      
      console.log("BusinessContext: About to make fetch request...")
      const fetchPromise = fetch("/api/user/manager-dashboard", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      console.log("BusinessContext: Fetch request initiated")
      
      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response
      
      console.log("BusinessContext: API response status:", response.status)
      console.log("BusinessContext: API response headers:", Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        console.error("BusinessContext: API error:", response.status, response.statusText)
        
        // Retry on 5xx errors (server errors)
        if (response.status >= 500 && retryCount < 2) {
          console.log("BusinessContext: Retrying due to server error...")
          setTimeout(() => fetchManagerDashboard(retryCount + 1), 1000 * (retryCount + 1))
          return
        }
        
        throw new Error(`Failed to fetch manager dashboard: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log("BusinessContext: API data received:", {
        hasUserManager: !!data.userManager,
        businessesCount: data.businesses?.length || 0,
        hasPlan: !!data.userManager?.plan
      })
      
      setUserManager(data.userManager)
      console.log("BusinessContext: setUserManager", data.userManager)
      setUserPlan(data.userManager?.plan || null)
      console.log("BusinessContext: setUserPlan", data.userManager?.plan)
      setBusinesses(data.businesses || [])

      // If user has no businesses, we'll let the useEffect handle the redirect
      if (!data.businesses || data.businesses.length === 0) {
        console.log("BusinessContext: No businesses found, setting currentBusiness to null")
        setCurrentBusiness(null)
        return
      }

      // Check if we're on the select-business page
      const isSelectBusinessPage = window.location.pathname.includes('/select-business')
      
      if (isSelectBusinessPage) {
        console.log("BusinessContext: On select-business page, not setting current business")
        setCurrentBusiness(null)
        return
      }

      // Set current business from session or first business (only if not on select-business page)
      const currentBusinessId = sessionStorage.getItem("currentBusinessId")
      console.log("BusinessContext: Session business ID:", currentBusinessId)
      
      let business = null
      if (currentBusinessId) {
        business = data.businesses.find((b: Business) => b.business_id === currentBusinessId)
        console.log("BusinessContext: Found business from session:", !!business)
      }
      if (!business) {
        business = data.businesses[0]
        console.log("BusinessContext: Using first business:", business?.business_name)
      }
      setCurrentBusiness(business)
      console.log("BusinessContext: setCurrentBusiness", business)
      if (business) {
        sessionStorage.setItem("currentBusinessId", business.business_id)
        setCurrentBusinessIdCookie(business.business_id) // Set cookie for server-side access
      }
    } catch (err) {
      console.error("BusinessContext: Error in fetchManagerDashboard:", err)
      
      // Retry on network errors or timeouts
      if (retryCount < 2) {
        console.log("BusinessContext: Retrying due to error...")
        setTimeout(() => fetchManagerDashboard(retryCount + 1), 1000 * (retryCount + 1))
        return
      }
      
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      console.log("BusinessContext: fetchManagerDashboard completed, setting loading to false")
      // Clear the timeout since the API call completed
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      setLoading(false)
    }
  }, [])

  const fetchPlanLimits = useCallback(async () => {
    try {
      console.log("BusinessContext: fetchPlanLimits called, userPlan:", userPlan)
      if (!userPlan?.plan_id) return
      const response = await fetch(`/api/plan-limits/${userPlan.plan_id}`)
      if (!response.ok) throw new Error("Failed to fetch plan limits")
      const data = await response.json()
      setPlanLimits(data.limits)
      console.log("BusinessContext: setPlanLimits", data.limits)
    } catch (err) {
      console.error("Error fetching plan limits:", err)
    }
  }, [userPlan?.plan_id])

  const fetchUsage = useCallback(async () => {
    try {
      console.log("BusinessContext: fetchUsage called, currentBusiness:", currentBusiness, "planLimits:", planLimits)
      if (!currentBusiness?.business_id || !planLimits) return
      const response = await fetch(`/api/plan-usage?businessId=${currentBusiness.business_id}`)
      if (!response.ok) throw new Error("Failed to fetch usage")
      const data = await response.json()
      setUsage(data.usage)
      console.log("BusinessContext: setUsage", data.usage)
    } catch (err) {
      console.error("Error fetching usage:", err)
    }
  }, [currentBusiness?.business_id, planLimits])

  useEffect(() => {
    // Only fetch if we don't have initial data
    if (initialData) {
      console.log("BusinessContext: Using initial data from server", {
        hasUserManager: !!initialData.userManager,
        businessesCount: initialData.businesses?.length || 0,
        hasCurrentBusiness: !!initialData.currentBusiness,
        currentBusinessId: initialData.currentBusiness?.business_id
      })
      // Set the cookie for the current business to ensure it's available for server-side requests
      if (initialData.currentBusiness) {
        sessionStorage.setItem("currentBusinessId", initialData.currentBusiness.business_id)
        setCurrentBusinessIdCookie(initialData.currentBusiness.business_id)
      }
      return
    }

    console.log("BusinessContext: useEffect - fetchManagerDashboard triggered")
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Add timeout to prevent infinite loading
    timeoutRef.current = setTimeout(() => {
      console.error("BusinessContext: Loading timeout reached, setting error")
      setError("Timeout: La richiesta ha impiegato troppo tempo")
      setLoading(false)
    }, 30000) // 30 seconds timeout

    fetchManagerDashboard()

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [initialData, fetchManagerDashboard])

  // Removed client-side redirect logic - server-side provider handles this case
  // This prevents conflicts with server-side redirects and infinite loops

  useEffect(() => {
    console.log("BusinessContext: useEffect - userPlan changed:", userPlan?.plan_id)
    // Fetch plan limits when user plan changes
    if (userPlan?.plan_id) {
      fetchPlanLimits()
    }
  }, [userPlan?.plan_id, fetchPlanLimits])

  useEffect(() => {
    console.log("BusinessContext: useEffect - fetchUsage trigger", {
      currentBusiness: currentBusiness?.business_id,
      planLimitsLoaded: !!planLimits
    })
    if (currentBusiness?.business_id && planLimits) {
      fetchUsage()
    }
  }, [currentBusiness?.business_id, planLimits, fetchUsage])

  const refreshBusinesses = useCallback(async () => {
    await fetchManagerDashboard()
  }, [fetchManagerDashboard])

  const refreshUsage = useCallback(async () => {
    await fetchUsage()
  }, [fetchUsage])

  const refreshUsageForFeature = useCallback(async (feature: keyof UsageData) => {
    try {
      if (!currentBusiness?.business_id) return
      
      // Fetch only the specific feature usage
      const response = await fetch(`/api/plan-usage?businessId=${currentBusiness.business_id}&feature=${feature}`)
      if (response.ok) {
        const data = await response.json()
        setUsage(prev => prev ? { ...prev, [feature]: data.usage[feature] } : null)
      }
    } catch (err) {
      console.error(`Error refreshing usage for ${feature}:`, err)
    }
  }, [currentBusiness?.business_id])

  const addBusiness = useCallback((business: Business) => {
    setBusinesses(prev => [...prev, business])
    setCurrentBusiness(business)
    sessionStorage.setItem("currentBusinessId", business.business_id)
    setCurrentBusinessIdCookie(business.business_id) // Set cookie for server-side access
  }, [])

  const switchBusiness = useCallback(async (businessId: string) => {
    const business = businesses.find((b) => b.business_id === businessId)
    
    if (business) {
      try {
        console.log("BusinessContext: Starting business switch to:", business.business_name)
        
        // Set all state updates synchronously
        setCurrentBusiness(business)
        sessionStorage.setItem("currentBusinessId", business.business_id)
        
        // Set cookie immediately and verify it
        setCurrentBusinessIdCookie(business.business_id)
        
        // Force a small delay to ensure cookie is set
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Verify cookie was set
        const cookies = document.cookie.split(';')
        const businessCookie = cookies.find(cookie => 
          cookie.trim().startsWith(`${BUSINESS_ID_COOKIE_NAME}=`)
        )
        
        if (!businessCookie) {
          console.warn('Cookie not set, retrying...')
          // Retry setting the cookie
          setCurrentBusinessIdCookie(business.business_id)
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        
        setBusinessSwitchKey(prev => prev + 1)
        setCacheBuster(`?v=${Date.now()}`) // Update cache buster to force server-side refetch
        
        // Store the business switch time in session storage for the CacheBusterWrapper
        sessionStorage.setItem("businessSwitchTime", Date.now().toString())
        
        console.log("BusinessContext: Business switch completed successfully")
        // Note: Navigation is now handled by the calling component
      } catch (error) {
        console.error("Error switching business:", error)
        // Reset state on error
        setCurrentBusiness(null)
        setBusinessSwitchKey(prev => prev + 1)
        throw error
      }
    } else {
      setCurrentBusiness(null)
      setBusinessSwitchKey(prev => prev + 1)
    }
  }, [businesses])

  return (
    <BusinessContext.Provider
      value={{
        userManager,
        userPlan,
        businesses,
        currentBusiness,
        usage,
        planLimits,
        switchBusiness,
        addBusiness,
        refreshBusinesses,
        refreshUsage,
        refreshUsageForFeature,
        loading,
        error,
        businessSwitchKey,
        cacheBuster,
      }}
    >
      {(() => {
        console.log("BusinessContext.Provider render:", {
          hasUserManager: !!userManager,
          businessesCount: businesses.length,
          hasCurrentBusiness: !!currentBusiness,
          currentBusinessId: currentBusiness?.business_id,
          loading,
          error
        })
        return children
      })()}
    </BusinessContext.Provider>
  )
}

export function useBusiness() {
  const context = useContext(BusinessContext)
  if (context === undefined) {
    throw new Error("useBusiness must be used within a BusinessProvider")
  }
  return context
}

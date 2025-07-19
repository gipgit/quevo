"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react"
import { useRouter } from "next/navigation"

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

interface UsageData {
  businesses: number
  products: number
  services: number
  promos: number
  bookings: number
}

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
  planLimits: PlanLimits | null
  switchBusiness: (businessId: string) => void
  refreshUsage: () => Promise<void>
  refreshUsageForFeature: (feature: keyof UsageData) => Promise<void>
  loading: boolean
  error: string | null
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined)

export function BusinessProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [userManager, setUserManager] = useState<UserManager | null>(null)
  const [userPlan, setUserPlan] = useState<Plan | null>(null)
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null)
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [planLimits, setPlanLimits] = useState<PlanLimits | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const fetchManagerDashboard = async (retryCount = 0) => {
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
      setUserPlan(data.userManager?.plan || null)
      setBusinesses(data.businesses || [])

      // If user has no businesses, we'll let the useEffect handle the redirect
      if (!data.businesses || data.businesses.length === 0) {
        console.log("BusinessContext: No businesses found, setting currentBusiness to null")
        setCurrentBusiness(null)
        return
      }

      // Set current business from session or first business
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
      if (business) {
        sessionStorage.setItem("currentBusinessId", business.business_id)
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
  }

  const fetchPlanLimits = useCallback(async () => {
    try {
      if (!userPlan?.plan_id) return
      
      const response = await fetch(`/api/plan-limits/${userPlan.plan_id}`)
      if (response.ok) {
        const data = await response.json()
        // Map the API response to the expected interface structure
        const mappedLimits: PlanLimits = {
          maxBusinesses: data.limits.businesses || 0,
          maxProducts: data.limits.products || 0,
          maxServices: data.limits.services || 0,
          maxPromos: data.limits.promos || 0,
          maxBookings: data.limits.bookings || 0,
          maxQuestionsPerService: data.limits.questions_per_service || 0,
        }
        setPlanLimits(mappedLimits)
      }
    } catch (err) {
      console.error("Error fetching plan limits:", err)
    }
  }, [userPlan?.plan_id])

  const fetchUsage = useCallback(async () => {
    try {
      if (!currentBusiness?.business_id) return
      
      const response = await fetch(`/api/plan-usage?businessId=${currentBusiness.business_id}`)
      if (response.ok) {
        const data = await response.json()
        setUsage(data.usage)
      }
    } catch (err) {
      console.error("Error fetching usage:", err)
    }
  }, [currentBusiness?.business_id])

  useEffect(() => {
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
  }, [])

  useEffect(() => {
    console.log("BusinessContext: useEffect - checking redirect conditions:", {
      loading,
      hasUserManager: !!userManager,
      businessesCount: businesses.length
    })
    // If we have a userManager but no businesses, redirect to onboarding
    if (!loading && userManager && businesses.length === 0) {
      console.log("BusinessContext: Redirecting to onboarding - no businesses found")
      router.push("/dashboard/onboarding")
    }
  }, [loading, userManager, businesses, router])

  useEffect(() => {
    console.log("BusinessContext: useEffect - userPlan changed:", userPlan?.plan_id)
    // Fetch plan limits when user plan changes
    if (userPlan?.plan_id) {
      fetchPlanLimits()
    }
  }, [userPlan, fetchPlanLimits])

  useEffect(() => {
    console.log("BusinessContext: useEffect - currentBusiness changed:", currentBusiness?.business_id)
    // Fetch usage when current business changes
    if (currentBusiness?.business_id) {
      fetchUsage()
    }
  }, [currentBusiness, fetchUsage])

  const refreshUsage = async () => {
    await fetchUsage()
  }

  const refreshUsageForFeature = async (feature: keyof UsageData) => {
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
  }

  const switchBusiness = (businessId: string) => {
    const business = businesses.find((b) => b.business_id === businessId)
    setCurrentBusiness(business || null)
    if (business) {
      sessionStorage.setItem("currentBusinessId", business.business_id)
    }
  }

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
        refreshUsage,
        refreshUsageForFeature,
        loading,
        error,
      }}
    >
      {children}
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

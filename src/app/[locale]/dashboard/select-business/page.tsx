"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { useBusiness } from "@/lib/business-context"

// Define Business interface to match the one in business-context
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

// Utility function to get profile image URL following the same pattern as business layout
const getProfileImageUrl = (business: Business) => {
  const R2_PUBLIC_DOMAIN = "https://pub-eac238aed876421982e277e0221feebc.r2.dev";
  
  // Use local path if business_img_profile is empty/undefined, otherwise use R2 predefined path
  return !business?.business_img_profile 
    ? `/uploads/business/${business?.business_public_uuid}/profile.webp`
    : `${R2_PUBLIC_DOMAIN}/business/${business?.business_public_uuid}/profile.webp`;
};

// Helper to get initial letter
const getInitial = (name: string) => name?.charAt(0)?.toUpperCase() || "?"

export default function BusinessSelectionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const t = useTranslations("Dashboard")
  const { businesses, switchBusiness } = useBusiness()
  const [loading, setLoading] = useState(true)
  const [avatarError, setAvatarError] = useState<{ [id: string]: boolean }>({})
  const [selectingBusiness, setSelectingBusiness] = useState<string | null>(null)

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/signin/business")
      return
    }

    // If businesses are already loaded from context, we don't need to fetch them
    if (businesses.length > 0) {
      setLoading(false)
      return
    }

    // Fetch user's businesses if not available in context
    const fetchBusinesses = async () => {
      try {
        const response = await fetch("/api/user/businesses")
        if (response.ok) {
          const data = await response.json()
          // Note: We don't set businesses here as they should come from context
          // This is just to ensure we have the data
        }
      } catch (error) {
        console.error("Error fetching businesses:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBusinesses()
  }, [session, status, router, businesses.length])

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" color="white" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  const handleBusinessSelect = async (businessId: string) => {
    // Prevent multiple clicks
    if (selectingBusiness) {
      console.log("Business selection already in progress, ignoring click")
      return
    }
    
    console.log("Starting business selection for:", businessId)
    setSelectingBusiness(businessId)
    
    try {
      // Use the switchBusiness function from context which properly updates session and redirects
      console.log("Calling switchBusiness...")
      await switchBusiness(businessId)
      console.log("switchBusiness completed successfully")
      
      // Add a more robust fallback check with multiple retries
      let retryCount = 0
      const maxRetries = 3
      
      const checkBusinessSwitch = () => {
        setTimeout(() => {
          const currentBusinessId = sessionStorage.getItem("currentBusinessId")
          console.log(`Checking business switch - expected: ${businessId}, actual: ${currentBusinessId}`)
          
          if (currentBusinessId !== businessId && retryCount < maxRetries) {
            console.warn(`Business switch may have failed, retry ${retryCount + 1}/${maxRetries}...`)
            retryCount++
            checkBusinessSwitch()
          } else if (retryCount >= maxRetries) {
            console.error("Business switch failed after multiple retries")
            setSelectingBusiness(null)
          }
        }, 1000 * (retryCount + 1)) // Exponential backoff
      }
      
      checkBusinessSwitch()
      
    } catch (error) {
      console.error("Error switching business:", error)
      setSelectingBusiness(null)
      
      // Show user-friendly error message
      alert("Failed to switch business. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <p className="text-xl mb-6">
            {t("welcome", { name: session.user?.name?.split(" ")[0] || "" })}
          </p>
          <h2 className="text-3xl font-bold mb-12">{t("whatToManage")}</h2>
          {selectingBusiness && (
            <div className="text-blue-400 text-lg font-medium animate-pulse">
              <div className="flex items-center justify-center space-x-2">
                <LoadingSpinner size="sm" color="blue" />
                <span>Switching to business...</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 max-w-6xl mx-auto">
          {businesses.map((business) => {
            const isSelecting = selectingBusiness === business.business_id
            const isDisabled = selectingBusiness !== null
            
            return (
              <button
                key={business.business_id}
                onClick={() => handleBusinessSelect(business.business_id)}
                disabled={isDisabled}
                className={`bg-white text-gray-900 rounded-2xl p-4 lg:p-6 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 ${
                  isSelecting 
                    ? 'opacity-75 cursor-not-allowed ring-2 ring-blue-500' 
                    : isDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-lg hover:bg-gray-100'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-200 mb-2 lg:mb-4 overflow-hidden relative">
                    {isSelecting && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                        <LoadingSpinner size="sm" color="white" />
                      </div>
                    )}
                    {!avatarError[business.business_id] ? (
                      <Image
                        src={getProfileImageUrl(business)}
                        alt={business.business_name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        onError={() => setAvatarError(errs => ({ ...errs, [business.business_id]: true }))}
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-blue-200 text-blue-700 flex items-center justify-center font-bold text-lg">
                        {getInitial(business.business_name)}
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium text-sm leading-tight">{business.business_name}</h3>
                </div>
              </button>
            )
          })}
        </div>

        <div className="text-center mt-16">
          <div className="text-2xl font-bold"></div>
        </div>
      </div>
    </div>
  )
}

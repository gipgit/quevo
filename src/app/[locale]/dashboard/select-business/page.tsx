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
  const t = useTranslations("dashboard")
  const { businesses, switchBusiness, loading: contextLoading } = useBusiness()
  const [avatarError, setAvatarError] = useState<{ [id: string]: boolean }>({})
  const [selectingBusiness, setSelectingBusiness] = useState<string | null>(null)

  // Debug logging
  console.log("SelectBusinessPage render:", {
    sessionStatus: status,
    contextLoading,
    businessesCount: businesses.length,
    businesses: businesses.map(b => ({ id: b.business_id, name: b.business_name })),
    selectingBusiness
  })

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/signin/business")
      return
    }
  }, [session, status, router])

  // Show loading if session is loading or business context is loading
  if (status === "loading" || contextLoading) {
    console.log("SelectBusinessPage: Showing loading state")
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center">
        <LoadingSpinner size="lg" color="white" />
      </div>
    )
  }

  if (!session) {
    console.log("SelectBusinessPage: No session, returning null")
    return null
  }

  // If no businesses, show error or redirect
  if (businesses.length === 0) {
    console.log("SelectBusinessPage: No businesses found")
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">No businesses found</h2>
          <p>Please contact support if you believe this is an error.</p>
        </div>
      </div>
    )
  }

  const handleBusinessSelect = async (businessId: string) => {
    console.log("handleBusinessSelect called with businessId:", businessId)
    
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
      
      // Navigate to dashboard after successful business switch with cache-busting
      console.log("Navigating to dashboard...")
      router.push(`/dashboard?t=${Date.now()}&fresh=true`)
      
      // Add a fallback navigation in case router.push doesn't work
      setTimeout(() => {
        console.log("Fallback navigation: Using window.location")
        window.location.href = `/dashboard?t=${Date.now()}&fresh=true`
      }, 2000)
      
    } catch (error) {
      console.error("Error switching business:", error)
      setSelectingBusiness(null)
      
      // Show user-friendly error message
      alert("Failed to switch business. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-6">
          <p className="mb-2 text-gray-300">
            {t("welcome", { name: session.user?.name?.split(" ")[0] || "" })}
          </p>
          <p className="text-xl lg:text-2xl font-medium mb-8 text-white">{t("whatToManage")}</p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3 lg:gap-4 max-w-7xl justify-center items-center mx-auto">
          {businesses.map((business) => {
            const isSelecting = selectingBusiness === business.business_id
            const isDisabled = selectingBusiness !== null
            
            return (
              <button
                key={business.business_id}
                onClick={() => handleBusinessSelect(business.business_id)}
                disabled={isDisabled}
                className={`w-full sm:min-w-[200px] sm:w-auto bg-white text-gray-900 rounded-2xl p-4 lg:p-6 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 ${
                  isSelecting 
                    ? 'opacity-75 cursor-not-allowed ring-2 ring-blue-500' 
                    : isDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-lg hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-200 mb-2 lg:mb-4 overflow-hidden relative">
                    {isSelecting && (
                      <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
                        <LoadingSpinner size="sm" color="white" />
                      </div>
                    )}
                    {!avatarError[business.business_id] ? (
                      <Image
                        src={getProfileImageUrl(business)}
                        alt={business.business_name}
                        width={isSelecting ? 48 : 64}
                        height={isSelecting ? 48 : 64}
                        className="w-full h-full object-cover"
                        onError={() => setAvatarError(errs => ({ ...errs, [business.business_id]: true }))}
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-blue-200 text-blue-700 flex items-center justify-center font-bold text-sm md:text-lg">
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

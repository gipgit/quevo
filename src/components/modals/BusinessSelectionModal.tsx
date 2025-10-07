"use client"

import { useTranslations } from "next-intl"
import { X as XMarkIcon } from 'lucide-react'
import { useBusiness } from "@/lib/business-context"
import { useState, useEffect } from "react"

interface BusinessSelectionModalProps {
  isOpen: boolean
  onClose: () => void
}

// Utility function to get profile image URL following the same pattern as business layout
const getProfileImageUrl = (business: any) => {
  const R2_PUBLIC_DOMAIN = "https://pub-eac238aed876421982e277e0221feebc.r2.dev";
  
  // Use local path if business_img_profile is empty/undefined, otherwise use R2 predefined path
  return !business?.business_img_profile 
    ? `/uploads/business/${business?.business_public_uuid}/profile.webp`
    : `${R2_PUBLIC_DOMAIN}/business/${business?.business_public_uuid}/profile.webp`;
};

export default function BusinessSelectionModal({ isOpen, onClose }: BusinessSelectionModalProps) {
  const t = useTranslations("dashboard")
  const { businesses, currentBusiness, switchBusiness, businessSwitchKey } = useBusiness()
  const [avatarError, setAvatarError] = useState<{ [id: string]: boolean }>({})
  const [selectingBusiness, setSelectingBusiness] = useState<string | null>(null)

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

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
      
      // Close the modal
      onClose()
      
      // Force a hard refresh to ensure fresh data
      console.log("Forcing page refresh to ensure fresh data")
      window.location.reload()
      
    } catch (error) {
      console.error("Error switching business:", error)
      setSelectingBusiness(null)
      
      // Show user-friendly error message
      alert("Failed to switch business. Please try again.")
    }
  }

  // Determine modal width based on number of businesses
  const modalWidthClass = businesses.length > 4 ? "w-[99%] max-w-[99%]" : "max-w-4xl"

  // Helper to get initial letter
  const getInitial = (name: string) => name?.charAt(0)?.toUpperCase() || "?"

  return (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
       <div className="bg-[var(--dashboard-bg-card)] w-full max-h-screen lg:rounded-xl lg:p-16 lg:shadow-lg relative">
         <button 
           className="absolute top-4 right-4 lg:top-2 lg:right-2 text-[var(--dashboard-text-tertiary)] hover:text-[var(--dashboard-text-secondary)] z-10" 
           onClick={onClose}
         >
           <XMarkIcon className="h-6 w-6" />
         </button>
         <div className="p-4 lg:p-0 h-full flex flex-col max-h-screen overflow-hidden">
           <h2 className="text-lg lg:text-xl font-medium mb-4 text-center mt-8 lg:mt-0 flex-shrink-0 text-[var(--dashboard-text-primary)]">{t("currentBusiness.selectBusiness")}</h2>
           {selectingBusiness && (
             <div className="text-blue-500 text-sm font-medium animate-pulse text-center mb-4">
               Switching to business...
             </div>
           )}
           <div className={`grid gap-2 lg:gap-4 pb-2 flex-1 overflow-y-auto ${businesses.length > 4 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6" : "flex flex-col lg:flex-row lg:flex-wrap lg:items-center lg:justify-center"}`}>
          {businesses.map((b) => (
                         <div
               key={b.business_id}
               className={`relative rounded-2xl p-4 lg:p-4 transition-all flex-shrink-0 flex flex-row lg:flex-col items-center justify-center min-w-[120px] min-h-[60px] lg:min-w-[200px] lg:min-h-[140px] ${
                 selectingBusiness 
                   ? "opacity-50 cursor-not-allowed" 
                   : "cursor-pointer"
               } ${
                 currentBusiness?.business_id === b.business_id 
                   ? "bg-[var(--dashboard-active-bg)] ring-2 ring-[var(--dashboard-active-border)]" 
                   : "bg-[var(--dashboard-bg-card)] hover:bg-[var(--dashboard-bg-tertiary)] hover:shadow-lg border border-[var(--dashboard-border-primary)]"
               }`}
               onClick={() => !selectingBusiness && handleBusinessSelect(b.business_id)}
             >
                                {/* Avatar */}
               <div className="absolute left-2 lg:relative lg:left-auto flex items-center justify-center lg:mb-2 lg:mr-0">
                 {selectingBusiness === b.business_id && (
                   <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 rounded-full">
                     <div className="animate-spin rounded-full h-4 w-4 lg:h-6 lg:w-6 border-b-2 border-white"></div>
                   </div>
                 )}
                 {!avatarError[b.business_id] ? (
                   <img
                     src={getProfileImageUrl(b)}
                     alt={b.business_name}
                     className="w-8 h-8 lg:w-16 lg:h-16 rounded-full object-cover bg-[var(--dashboard-bg-tertiary)]"
                     onError={() => setAvatarError(errs => ({ ...errs, [b.business_id]: true }))}
                   />
                 ) : (
                   <div
                     className="w-8 h-8 lg:w-16 lg:h-16 rounded-full bg-[var(--dashboard-active-bg)] text-[var(--dashboard-active-text)] flex items-center justify-center font-bold text-sm lg:text-lg"
                   >
                     {getInitial(b.business_name)}
                   </div>
                 )}
               </div>
                               <div className={`text-center w-full truncate text-sm lg:text-base pl-8 lg:pl-0 font-medium leading-tight ${
                                 currentBusiness?.business_id === b.business_id 
                                   ? "text-[var(--dashboard-active-text)]" 
                                   : "text-[var(--dashboard-text-primary)]"
                               }`}>{b.business_name}</div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  )
} 
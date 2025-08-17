"use client"

import { useTranslations } from "next-intl"
import { XMarkIcon } from "@heroicons/react/24/outline"
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



  if (!isOpen) return null

  const handleBusinessSelect = (businessId: string) => {
    switchBusiness(businessId)
    onClose()
  }

  // Determine modal width based on number of businesses
  const modalWidthClass = businesses.length > 4 ? "w-[99%] max-w-[99%]" : "max-w-4xl"

  // Helper to get initial letter
  const getInitial = (name: string) => name?.charAt(0)?.toUpperCase() || "?"

  return (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900 bg-opacity-40">
       <div className="bg-zinc-800 w-full max-h-screen lg:rounded-xl lg:p-8 lg:shadow-lg relative">
         <button 
           className="absolute top-4 right-4 lg:top-2 lg:right-2 text-zinc-400 hover:text-zinc-600 z-10" 
           onClick={onClose}
         >
           <XMarkIcon className="h-6 w-6" />
         </button>
         <div className="p-4 lg:p-0 h-full flex flex-col max-h-screen overflow-hidden">
           <h2 className="text-xl font-bold mb-4 text-center mt-8 lg:mt-0 flex-shrink-0">{t("currentBusiness.selectBusiness")}</h2>
           <div className={`grid gap-2 lg:gap-4 pb-2 flex-1 overflow-y-auto ${businesses.length > 4 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6" : "flex flex-col lg:flex-row lg:flex-wrap lg:items-center lg:justify-center"}`}>
          {businesses.map((b) => (
                         <div
               key={b.business_id}
               className={`relative rounded-lg p-2 cursor-pointer transition-all flex-shrink-0 flex flex-row lg:flex-col items-center justify-center min-w-[120px] min-h-[60px] lg:min-w-[160px] lg:min-h-[160px] ${
                 currentBusiness?.business_id === b.business_id 
                   ? "bg-blue-600" 
                   : "bg-zinc-700 hover:bg-zinc-600"
               }`}
               onClick={() => handleBusinessSelect(b.business_id)}
             >
               {/* Avatar */}
               <div className="absolute left-2 lg:relative lg:left-auto flex items-center justify-center lg:mb-2 lg:mr-0">
                 {!avatarError[b.business_id] ? (
                   <img
                     src={getProfileImageUrl(b)}
                     alt={b.business_name}
                     className="w-8 h-8 lg:w-16 lg:h-16 rounded-full object-cover bg-zinc-100"
                     onError={() => setAvatarError(errs => ({ ...errs, [b.business_id]: true }))}
                   />
                 ) : (
                   <div
                     className="w-8 h-8 lg:w-16 lg:h-16 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center font-bold text-sm lg:text-2xl"
                   >
                     {getInitial(b.business_name)}
                   </div>
                 )}
               </div>
                               <div className="text-zinc-100 text-center w-full truncate text-sm lg:text-base pl-8 lg:pl-0">{b.business_name}</div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  )
} 
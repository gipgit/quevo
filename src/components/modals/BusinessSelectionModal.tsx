"use client"

import { useTranslations } from "next-intl"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { useBusiness } from "@/lib/business-context"
import { useState } from "react"

interface BusinessSelectionModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function BusinessSelectionModal({ isOpen, onClose }: BusinessSelectionModalProps) {
  const t = useTranslations("dashboard")
  const { businesses, currentBusiness, switchBusiness } = useBusiness()
  const [avatarError, setAvatarError] = useState<{ [id: string]: boolean }>({})

  if (!isOpen) return null

  const handleBusinessSelect = (businessId: string) => {
    switchBusiness(businessId)
    onClose()
  }

  // Determine modal width based on number of businesses
  const modalWidthClass = businesses.length > 4 ? "w-[99%] max-w-[99%]" : "max-w-4xl"

  // Helper to get avatar URL
  const getAvatarUrl = (business: any) => `/uploads/business/${business.business_public_uuid}/profile.webp`

  // Helper to get initial letter
  const getInitial = (name: string) => name?.charAt(0)?.toUpperCase() || "?"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className={`bg-white rounded-xl p-8 w-auto shadow-lg relative ${modalWidthClass}`}>
        <button 
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" 
          onClick={onClose}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-bold mb-4 text-center">{t("currentBusiness.selectBusiness")}</h2>
        <div className={`grid gap-4 pb-2 ${businesses.length > 4 ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6" : "flex flex-col lg:flex-row lg:flex-wrap lg:items-center lg:justify-center"}`}>
          {businesses.map((b) => (
            <div
              key={b.business_id}
              className={`relative border rounded-lg p-2 cursor-pointer transition-all flex-shrink-0 flex flex-col items-center justify-center min-w-[120px] min-h-[120px] lg:min-w-[160px] lg:min-h-[160px] ${
                currentBusiness?.business_id === b.business_id 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-200 hover:border-blue-300"
              }`}
              onClick={() => handleBusinessSelect(b.business_id)}
            >
              {/* Avatar */}
              <div className="mb-2 flex items-center justify-center">
                {!avatarError[b.business_id] ? (
                  <img
                    src={getAvatarUrl(b)}
                    alt={b.business_name}
                    className="w-16 h-16 rounded-full object-cover border border-gray-200 bg-gray-100"
                    onError={() => setAvatarError(errs => ({ ...errs, [b.business_id]: true }))}
                  />
                ) : (
                  <div
                    className="w-16 h-16 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center font-bold text-2xl"
                  >
                    {getInitial(b.business_name)}
                  </div>
                )}
              </div>
              <div className="text-gray-900 text-center w-full truncate">{b.business_name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 
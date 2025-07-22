"use client"

import { useTranslations } from "next-intl"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { useBusiness } from "@/lib/business-context"

interface BusinessSelectionModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function BusinessSelectionModal({ isOpen, onClose }: BusinessSelectionModalProps) {
  const t = useTranslations("dashboard")
  const { businesses, currentBusiness, switchBusiness } = useBusiness()

  if (!isOpen) return null

  const handleBusinessSelect = (businessId: string) => {
    switchBusiness(businessId)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl p-8 max-w-5xl w-auto shadow-lg relative">
        <button 
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" 
          onClick={onClose}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-bold mb-4 text-center">{t("currentBusiness.selectBusiness")}</h2>
        <div className="flex flex-col gap-2 pb-2 lg:flex-row lg:flex-wrap lg:items-center lg:justify-center lg:gap-4">
          {businesses.map((b) => (
            <div
              key={b.business_id}
              className={`w-full h-14 border rounded-lg p-2 cursor-pointer transition-all flex-shrink-0 flex items-center justify-center lg:w-40 lg:h-24 lg:p-4 ${
                currentBusiness?.business_id === b.business_id 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-200 hover:border-blue-300"
              }`}
              onClick={() => handleBusinessSelect(b.business_id)}
            >
              <div className="font-semibold text-gray-900 text-center w-full">{b.business_name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 
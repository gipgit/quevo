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
      <div className="bg-white rounded-xl p-8 max-w-3xl w-full shadow-lg relative">
        <button 
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" 
          onClick={onClose}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-bold mb-4">{t("currentBusiness.selectBusiness")}</h2>
        <div className="flex flex-row items-center justify-center flex-wrap gap-4">
          {businesses.map((b) => (
            <div
              key={b.business_id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                currentBusiness?.business_id === b.business_id 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-200 hover:border-blue-300"
              }`}
              onClick={() => handleBusinessSelect(b.business_id)}
            >
              <div className="font-semibold text-gray-900">{b.business_name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 
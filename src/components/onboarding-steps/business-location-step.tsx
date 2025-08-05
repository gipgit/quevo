"use client"

import { useEffect } from "react"
import { useTranslations } from "next-intl"
import type { BusinessFormData } from "../business-onboarding-form"

interface BusinessLocationStepProps {
  formData: BusinessFormData
  updateFormData: (updates: Partial<BusinessFormData>) => void
  onValidationChange: (isValid: boolean) => void
}

export function BusinessLocationStep({ formData, updateFormData, onValidationChange }: BusinessLocationStepProps) {
  const t = useTranslations("BusinessOnboarding")
  
  useEffect(() => {
    // This step is always valid since all fields are optional
    onValidationChange(true)
  }, [onValidationChange])

  return (
    <div className="space-y-6">
      {/* Region */}
      <div>
        <label htmlFor="business_region" className="block text-sm font-medium text-gray-700 mb-2">
          {t("region")}
        </label>
        <input
          type="text"
          id="business_region"
          value={formData.business_region || ''}
          onChange={(e) => updateFormData({ business_region: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={t("regionPlaceholder")}
          maxLength={50}
        />
      </div>

      {/* City */}
      <div>
        <label htmlFor="business_city" className="block text-sm font-medium text-gray-700 mb-2">
          {t("city")}
        </label>
        <input
          type="text"
          id="business_city"
          value={formData.business_city || ''}
          onChange={(e) => updateFormData({ business_city: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={t("cityPlaceholder")}
          maxLength={50}
        />
      </div>

      {/* Address */}
      <div>
        <label htmlFor="business_address" className="block text-sm font-medium text-gray-700 mb-2">
          {t("address")}
        </label>
        <textarea
          id="business_address"
          value={formData.business_address || ''}
          onChange={(e) => updateFormData({ business_address: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={t("addressPlaceholder")}
          rows={3}
          maxLength={80}
        />
      </div>
    </div>
  )
} 
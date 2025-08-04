"use client"

import { useEffect } from "react"
import { useTranslations } from "next-intl"
import type { BusinessFormData } from "../business-onboarding-form"

interface BusinessInfoStepProps {
  formData: BusinessFormData
  updateFormData: (updates: Partial<BusinessFormData>) => void
  onValidationChange: (isValid: boolean) => void
}

export function BusinessInfoStep({ formData, updateFormData, onValidationChange }: BusinessInfoStepProps) {
  const t = useTranslations("BusinessOnboarding")

  useEffect(() => {
    const isValid = (formData.business_name?.trim() || '').length > 0 && (formData.business_country?.trim() || '').length > 0
    onValidationChange(isValid)
  }, [formData.business_name, formData.business_country, onValidationChange])

  const handleChange = (field: keyof BusinessFormData, value: string) => {
    const updates: Partial<BusinessFormData> = { [field]: value }

    // Auto-generate URL name from business name
    if (field === "business_name") {
      const urlName = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
      updates.business_urlname = urlName
    }

    updateFormData(updates)
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-1">
          {t("businessName")} *
        </label>
        <input
          id="business_name"
          type="text"
          value={formData.business_name || ''}
          onChange={(e) => handleChange("business_name", e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={t("businessNamePlaceholder")}
          required
        />
      </div>

      <div>
        <label htmlFor="business_country" className="block text-sm font-medium text-gray-700 mb-1">
          {t("country")} *
        </label>
        <input
          id="business_country"
          type="text"
          value={formData.business_country || ''}
          onChange={(e) => handleChange("business_country", e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={t("countryPlaceholder")}
          required
        />
      </div>


    </div>
  )
}

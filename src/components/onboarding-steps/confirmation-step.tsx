"use client"

import { useEffect } from "react"
import type { BusinessFormData } from "../business-onboarding-form"

interface ConfirmationStepProps {
  formData: BusinessFormData
  updateFormData: (updates: Partial<BusinessFormData>) => void
  onValidationChange: (isValid: boolean) => void
}

export function ConfirmationStep({ formData, onValidationChange }: ConfirmationStepProps) {
  useEffect(() => {
    // This step is always valid since it's just for confirmation
    onValidationChange(true)
  }, [onValidationChange])

  return (
    <div className="space-y-6">
      {/* Empty step - titles are handled by the main page */}
    </div>
  )
} 
"use client"

import { useEffect } from "react"
import type { BusinessFormData } from "../business-onboarding-form"

interface ProfileSettingsStepProps {
  formData: BusinessFormData
  updateFormData: (updates: Partial<BusinessFormData>) => void
  onValidationChange: (isValid: boolean) => void
}

const DEFAULT_PAGES = [
  { value: "promotions", label: "Promozioni" },
  { value: "bookings", label: "Prenotazioni" },
  { value: "products", label: "Prodotti" },
  { value: "services", label: "Servizi" },
]

export default function ProfileSettingsStep({
  formData,
  updateFormData,
  onValidationChange,
}: ProfileSettingsStepProps) {
  useEffect(() => {
    // This step is always valid since all settings have defaults
    onValidationChange(true)
  }, [onValidationChange])

  const updateSetting = (key: keyof BusinessFormData["settings"], value: any) => {
    updateFormData({
      settings: {
        ...formData.settings,
        [key]: value,
      },
    })
  }

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: (enabled: boolean) => void }) => (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        enabled ? "bg-blue-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  )

  return (
    <div className="space-y-8">
    
      {/* Default Page */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Pagina Predefinita</label>
        <select
          value={formData.settings.default_page}
          onChange={(e) => updateSetting("default_page", e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {DEFAULT_PAGES.map((page) => (
            <option key={page.value} value={page.value}>
              {page.label}
            </option>
          ))}
        </select>
      </div>

      {/* Visibility Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Elementi Visibili</h4>

        <div className="space-y-3">
          {[
            { key: "show_address", label: "Mostra Indirizzo" },
            { key: "show_website", label: "Mostra Sito Web" },
            { key: "show_socials", label: "Mostra Social Links" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{item.label}</span>
              <ToggleSwitch
                enabled={formData.settings[item.key as keyof BusinessFormData["settings"]] as boolean}
                onChange={(enabled) => updateSetting(item.key as keyof BusinessFormData["settings"], enabled)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Button Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Pulsanti di Azione</h4>

        <div className="space-y-3">
          {[
            { key: "show_btn_booking", label: "Pulsante Prenotazioni" },
            { key: "show_btn_payments", label: "Pulsante Pagamenti" },
            { key: "show_btn_review", label: "Pulsante Recensioni" },
            { key: "show_btn_phone", label: "Pulsante Telefono" },
            { key: "show_btn_email", label: "Pulsante Email" },
            { key: "show_btn_order", label: "Pulsante Ordini" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{item.label}</span>
              <ToggleSwitch
                enabled={formData.settings[item.key as keyof BusinessFormData["settings"]] as boolean}
                onChange={(enabled) => updateSetting(item.key as keyof BusinessFormData["settings"], enabled)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

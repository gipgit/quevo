"use client"

import type { BusinessFormData } from "../business-onboarding-form"
import { useEffect } from "react"
import { useTranslations } from "next-intl"

interface ProfileColorsFontStepProps {
  formData: BusinessFormData
  updateFormData: (updates: Partial<BusinessFormData>) => void
  onValidationChange: (isValid: boolean) => void
}

const FONT_OPTIONS = [
  { value: "1", label: "Font1", className: "font1" },
  { value: "2", label: "Font2", className: "font2" },
  { value: "3", label: "Font3", className: "font3" },
  { value: "4", label: "Font4", className: "font4" },
  { value: "5", label: "Font5", className: "font5" },
]

export default function ProfileColorsFontStep({
  formData,
  updateFormData,
  onValidationChange,
}: ProfileColorsFontStepProps) {
  const t = useTranslations("BusinessOnboarding")
  
  useEffect(() => {
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

  return (
    <div className="space-y-8">
      {/* Color Pickers */}
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {/* Sfondo */}
          <div className="space-y-2">
            <span className="text-xs text-gray-600">{t("background")}</span>
            <input 
              type="color" 
              value={formData.settings.theme_color_background} 
              onChange={e => updateSetting("theme_color_background", e.target.value)} 
              className="w-full h-10 rounded border border-gray-300 cursor-pointer" 
            />
            <input 
              type="text" 
              value={formData.settings.theme_color_background} 
              onChange={e => updateSetting("theme_color_background", e.target.value)} 
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-center" 
              placeholder="#FFFFFF" 
            />
          </div>
          {/* Testo */}
          <div className="space-y-2">
            <span className="text-xs text-gray-600">{t("text")}</span>
            <input 
              type="color" 
              value={formData.settings.theme_color_text} 
              onChange={e => updateSetting("theme_color_text", e.target.value)} 
              className="w-full h-10 rounded border border-gray-300 cursor-pointer" 
            />
            <input 
              type="text" 
              value={formData.settings.theme_color_text} 
              onChange={e => updateSetting("theme_color_text", e.target.value)} 
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-center" 
              placeholder="#000000" 
            />
          </div>
          {/* Pulsanti */}
          <div className="space-y-2">
            <span className="text-xs text-gray-600">{t("buttons")}</span>
            <input 
              type="color" 
              value={formData.settings.theme_color_button} 
              onChange={e => updateSetting("theme_color_button", e.target.value)} 
              className="w-full h-10 rounded border border-gray-300 cursor-pointer" 
            />
            <input 
              type="text" 
              value={formData.settings.theme_color_button} 
              onChange={e => updateSetting("theme_color_button", e.target.value)} 
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-center" 
              placeholder="#000000" 
            />
          </div>
        </div>
      </div>

      {/* Font Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">{t("font")}</label>
        <div className="flex flex-row lg:flex-col gap-2 overflow-x-scroll">
          {FONT_OPTIONS.map((font) => (
            <button
              key={font.value}
              type="button"
              onClick={() => updateSetting("theme_font", font.value)}
              className={`px-4 py-2 w-full rounded-xl flex items-center gap-2 border transition-colors ${formData.settings.theme_font === font.value ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-300 hover:border-gray-400"} ${font.className}`}
              style={{ fontFamily: font.label }}
            >
              <span className={`${font.className} text-xl lg:text-2xl font-bold`} style={{ fontFamily: font.label }}>
                {formData.business_name || 'Business Name'}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

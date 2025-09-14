import { useTranslations } from "next-intl"
import { useTheme } from "@/contexts/ThemeContext"

interface ProfileSettingsSectionProps {
  profileSettings: Record<string, any>
  onToggle: (setting: string) => void
  onDefaultPageChange: (value: string) => void
}

export default function ProfileSettingsSection({ profileSettings, onToggle, onDefaultPageChange }: ProfileSettingsSectionProps) {
  const t = useTranslations("profile")
  const { theme } = useTheme()
  return (
    <div className="space-y-8">
      {/* General Settings */}
      <div>
        <h3 className={`text-xs md:text-sm font-medium uppercase tracking-wide mb-4 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>{t("settings.general")}</h3>
        <div className="rounded-lg">
          <label className={`block text-xs font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>{t("settings.defaultPage")}</label>
          <select
            value={profileSettings.default_page}
            onChange={(e) => onDefaultPageChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base ${
              theme === 'dark' 
                ? 'bg-zinc-700 border-gray-600 text-gray-100' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="services">Services</option>
            <option value="promotions">Promotions</option>
            <option value="rewards">Rewards</option>
          </select>
        </div>
      </div>
      {/* Visibility Settings */}
      <div>
        <h3 className={`text-xs md:text-sm font-medium uppercase tracking-wide mb-4 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>{t("settings.visibility")}</h3>
        <div className="space-y-0.5">
          {[
            { key: "show_address", label: t("settings.showAddress") },
            { key: "show_website", label: t("settings.showWebsite") },
            { key: "show_socials", label: t("settings.showSocials") },
            { key: "show_btn_booking", label: t("settings.showBookingButton") },
            { key: "show_btn_payments", label: t("settings.showPaymentButton") },
          ].map((setting, index) => (
            <div key={setting.key} className={`flex items-center justify-between py-2 ${index < 4 ? theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-200' : ''}`}>
              <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}>{setting.label}</span>
              <button
                onClick={() => onToggle(setting.key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  profileSettings[setting.key] 
                    ? "bg-blue-600" 
                    : theme === 'dark' ? "bg-gray-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                    theme === 'dark' ? 'bg-gray-200' : 'bg-white'
                  } ${profileSettings[setting.key] ? "translate-x-6" : "translate-x-1"}`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

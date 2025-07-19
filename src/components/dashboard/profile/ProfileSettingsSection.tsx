import { useTranslations } from "next-intl"

interface ProfileSettingsSectionProps {
  profileSettings: Record<string, any>
  onToggle: (setting: string) => void
  onDefaultPageChange: (value: string) => void
}

export default function ProfileSettingsSection({ profileSettings, onToggle, onDefaultPageChange }: ProfileSettingsSectionProps) {
  const t = useTranslations("profile")
  return (
    <div className="space-y-8">
      {/* General Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("settings.general")}</h3>
        <div className="bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("settings.defaultPage")}</label>
          <select
            value={profileSettings.default_page}
            onChange={(e) => onDefaultPageChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="bookings">Home</option>
            <option value="menu">Menu</option>
            <option value="about">About</option>
          </select>
        </div>
      </div>
      {/* Visibility Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("settings.visibility")}</h3>
        <div className="space-y-4">
          {[
            { key: "show_address", label: t("settings.showAddress") },
            { key: "show_website", label: t("settings.showWebsite") },
            { key: "show_socials", label: t("settings.showSocials") },
            { key: "show_btn_booking", label: t("settings.showBookingButton") },
            { key: "show_btn_payments", label: t("settings.showPaymentButton") },
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between py-2">
              <span className="text-gray-900">{setting.label}</span>
              <button
                onClick={() => onToggle(setting.key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  profileSettings[setting.key] ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    profileSettings[setting.key] ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

import { useTranslations } from "next-intl"

interface ProfileAppearanceSectionProps {
  profileSettings: Record<string, any>
  onFontChange: (font: string) => void
  onColorChange: (key: string, value: string) => void
  businessName?: string
}

const FONT_OPTIONS = [
  { value: "1", label: "Font1", className: "font1" },
  { value: "2", label: "Font2", className: "font2" },
  { value: "3", label: "Font3", className: "font3" },
  { value: "4", label: "Font4", className: "font4" },
  { value: "5", label: "Font5", className: "font5" },
]

export default function ProfileAppearanceSection({ 
  profileSettings, 
  onFontChange, 
  onColorChange,
  businessName = "Business Name"
}: ProfileAppearanceSectionProps) {
  const t = useTranslations("profile")
  
  return (
    <div className="space-y-8">
      {/* Color Pickers */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">{t("appearance.colors")}</h4>
        <div className="grid grid-cols-3 gap-4">
          {/* Background */}
          <div className="space-y-2">
            <span className="text-xs text-gray-600">{t("appearance.backgroundColor")}</span>
            <input 
              type="color" 
              value={profileSettings.theme_color_background || "#FFFFFF"} 
              onChange={e => onColorChange("theme_color_background", e.target.value)} 
              className="w-full h-10 rounded border border-gray-300 cursor-pointer" 
            />
            <input 
              type="text" 
              value={profileSettings.theme_color_background || "#FFFFFF"} 
              onChange={e => onColorChange("theme_color_background", e.target.value)} 
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-center" 
              placeholder="#FFFFFF" 
            />
          </div>
          {/* Text */}
          <div className="space-y-2">
            <span className="text-xs text-gray-600">{t("appearance.textColor")}</span>
            <input 
              type="color" 
              value={profileSettings.theme_color_text || "#000000"} 
              onChange={e => onColorChange("theme_color_text", e.target.value)} 
              className="w-full h-10 rounded border border-gray-300 cursor-pointer" 
            />
            <input 
              type="text" 
              value={profileSettings.theme_color_text || "#000000"} 
              onChange={e => onColorChange("theme_color_text", e.target.value)} 
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-center" 
              placeholder="#000000" 
            />
          </div>
          {/* Buttons */}
          <div className="space-y-2">
            <span className="text-xs text-gray-600">{t("appearance.buttonColor")}</span>
            <input 
              type="color" 
              value={profileSettings.theme_color_button || "#3B82F6"} 
              onChange={e => onColorChange("theme_color_button", e.target.value)} 
              className="w-full h-10 rounded border border-gray-300 cursor-pointer" 
            />
            <input 
              type="text" 
              value={profileSettings.theme_color_button || "#3B82F6"} 
              onChange={e => onColorChange("theme_color_button", e.target.value)} 
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-center" 
              placeholder="#3B82F6" 
            />
          </div>
        </div>
      </div>

      {/* Font Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">{t("appearance.fonts")}</label>
        <div className="flex flex-col gap-2 flex-wrap">
          {FONT_OPTIONS.map((font) => (
            <button
              key={font.value}
              type="button"
              onClick={() => onFontChange(font.value)}
              className={`px-4 py-2 w-full rounded-sm flex items-center gap-2 border transition-colors ${
                profileSettings.theme_font === font.value 
                  ? "border-blue-500 bg-blue-50 text-blue-700" 
                  : "border-gray-300 hover:border-gray-400"
              } ${font.className}`}
              style={{ fontFamily: font.label }}
            >
              <span className={`${font.className} text-2xl font-bold`} style={{ fontFamily: font.label }}>
                {businessName}
              </span>
            </button>
          ))}
        </div>
      </div>


    </div>
  )
}

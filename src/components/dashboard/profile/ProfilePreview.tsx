import { useTranslations } from "next-intl"
import { ALLOWED_SOCIAL_LINKS } from "@/lib/social-links-config"
import { GlobeAltIcon } from "@heroicons/react/24/outline"

interface ProfilePreviewProps {
  profileData: Record<string, any>
  profileSettings: Record<string, any>
  profileImg?: string
  coverImg?: string
  businessName?: string
  socialLinks?: Record<string, { url: string; visible: boolean }>
}

const FONT_OPTIONS = [
  { value: "1", label: "Font1", className: "font1" },
  { value: "2", label: "Font2", className: "font2" },
  { value: "3", label: "Font3", className: "font3" },
  { value: "4", label: "Font4", className: "font4" },
  { value: "5", label: "Font5", className: "font5" },
]

export default function ProfilePreview({ 
  profileData, 
  profileSettings, 
  profileImg, 
  coverImg,
  businessName = "Business Name",
  socialLinks = {}
}: ProfilePreviewProps) {
  const t = useTranslations("profile")
  
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-2 shadow-2xl">
      <div className="flex flex-col items-center gap-3">
        {/* URL Pill */}
        <div className="bg-gray-800 text-gray-300 px-4 py-2 rounded-full text-sm font-medium flex items-center justify-between shadow-lg border border-gray-700 w-full max-w-[360px]">
          <div className="flex items-center gap-2">
            <GlobeAltIcon className="w-4 h-4 text-gray-400" />
            <span className="text-xs">quevo.app/{profileData?.business_urlname || 'your-business'}</span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`https://quevo.app/${profileData?.business_urlname || 'your-business'}`)
            }}
            className="text-gray-400 hover:text-white transition-colors"
            title="Copy URL"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
        
        {/* Profile Card */}
        <div 
          className="max-w-[360px] min-w-[250px] w-full overflow-hidden shadow-md" 
          style={{ background: profileSettings.theme_color_background || "#FFFFFF" }}
        >
          {/* Cover */}
          <div 
            className="w-full h-24 bg-gray-200" 
            style={{ 
              backgroundImage: coverImg ? `url(${coverImg})` : undefined, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center' 
            }} 
          />
          {/* Profile + Name + Button */}
          <div 
            className="flex flex-col items-center py-6" 
            style={{ background: profileSettings.theme_color_background || "#FFFFFF" }}
          >
            <div className="w-[100px] h-[100px] rounded-full bg-gray-300 border-2 border-white -mt-[60px] mb-1 overflow-hidden flex items-center justify-center">
              {profileImg ? (
                <img 
                  src={profileImg} 
                  alt="profile" 
                  className="w-full h-full object-cover rounded-full" 
                />
              ) : (
                <span className="text-gray-400">IMG</span>
              )}
            </div>
            
            {/* Social Media Icons */}
            {Object.keys(socialLinks).length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-2 mb-1">
                {ALLOWED_SOCIAL_LINKS.map((social) => {
                  const socialData = socialLinks[social.id]
                  // Show icon if it exists in socialLinks (selected) and is visible
                  if (!socialData || !socialData?.visible) return null
                  
                  return (
                    <div 
                      key={social.id}
                      className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center"
                      style={{ 
                        background: profileSettings.theme_color_background === "#FFFFFF" ? "#F3F4F6" : profileSettings.theme_color_background 
                      }}
                    >
                      <img 
                        src={social.iconPath} 
                        alt={social.name} 
                        className="w-4 h-4" 
                      />
                    </div>
                  )
                })}
              </div>
            )}
            
            <div 
              className={`mt-1 text-xl font-bold ${FONT_OPTIONS.find(f => f.value === profileSettings.theme_font)?.className || ''}`} 
              style={{ 
                color: profileSettings.theme_color_text || "#000000", 
                fontFamily: FONT_OPTIONS.find(f => f.value === profileSettings.theme_font)?.label 
              }}
            >
              {businessName}
            </div>
            <button 
              className="mt-4 px-4 py-2 rounded-full text-white text-xs" 
              style={{ 
                background: profileSettings.theme_color_button || "#3B82F6", 
                fontFamily: FONT_OPTIONS.find(f => f.value === profileSettings.theme_font)?.label 
              }}
            >
              {t("appearance.exampleButton") || "Example Button"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 
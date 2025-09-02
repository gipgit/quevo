import { useState } from "react"
import { ALLOWED_SOCIAL_LINKS } from "@/lib/social-links-config"
import { useTranslations } from "next-intl"
import { XMarkIcon } from "@heroicons/react/24/outline"

interface SocialLink {
  url: string
  visible: boolean
}

interface ProfileLinksSectionProps {
  socialLinks: Record<string, SocialLink>
  onChange: (platform: string, link: SocialLink) => void
}

export default function ProfileLinksSection({ socialLinks, onChange }: ProfileLinksSectionProps) {
  const t = useTranslations("profile")
  // Track which socials are selected for input
  const [selected, setSelected] = useState<string[]>(
    Object.keys(socialLinks).filter((key) => !!socialLinks[key]?.url)
  )



  const handleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
    if (selected.includes(id)) {
      // If unselecting, clear the value
      onChange(id, { url: "", visible: false })
    } else {
      // If selecting, add it with empty URL but visible
      onChange(id, { url: "", visible: true })
    }
  }

  const handleVisibilityToggle = (id: string) => {
    const current = socialLinks[id]
    if (current) {
      onChange(id, { ...current, visible: !current.visible })
    }
  }

  return (
    <div className="space-y-8">
      {/* Social Media Links */}
      <div>
        {/* Current Social Links Inputs */}
        <div className="space-y-2 mb-6">
          {selected.map((id) => {
            const social = ALLOWED_SOCIAL_LINKS.find((s) => s.id === id)
            if (!social) return null
            return (
              <div key={id} className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                <img src={social.iconPath} alt={social.name} className="w-5 h-5" />
                <input
                  type="url"
                  className="flex-1 px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                  placeholder={social.placeholder}
                  value={socialLinks[id]?.url || ""}
                  onChange={(e) => onChange(id, { url: e.target.value, visible: socialLinks[id]?.visible ?? true })}
                />
                <button
                  type="button"
                  className="bg-gray-400 hover:bg-gray-500 text-white p-1.5 rounded-full transition-colors"
                  onClick={() => handleSelect(id)}
                  title={t("links.remove")}
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            )
          })}
        </div>

        {/* Selectable Social Media Cards */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {ALLOWED_SOCIAL_LINKS.map((social) => {
            const isActive = selected.includes(social.id)
            return (
              <button
                key={social.id}
                type="button"
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all focus:outline-none h-16 ${
                  isActive
                    ? "ring-2 ring-gray-400 bg-gray-100 shadow-md"
                    : "border border-gray-300 hover:border-gray-400 bg-white"
                }`}
                onClick={() => handleSelect(social.id)}
              >
                <img src={social.iconPath} alt={social.name} className="w-5 h-5 mb-1" />
                <span className="text-xs text-gray-600 font-medium">{social.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

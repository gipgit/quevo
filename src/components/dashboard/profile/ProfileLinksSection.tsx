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
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          {ALLOWED_SOCIAL_LINKS.map((social) => {
            const isActive = selected.includes(social.id)
            return (
              <button
                key={social.id}
                type="button"
                className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all focus:outline-none h-20 ${
                  isActive
                    ? "ring-2 ring-gray-400 bg-gray-100 shadow-md"
                    : "border border-gray-300 hover:border-gray-400 bg-white"
                }`}
                onClick={() => handleSelect(social.id)}
              >
                <img src={social.iconPath} alt={social.name} className="w-8 h-8 mb-1" />
                <span className="text-xs text-gray-400">{social.name}</span>
              </button>
            )
          })}
        </div>
        <div className="space-y-0">
          {selected.map((id) => {
            const social = ALLOWED_SOCIAL_LINKS.find((s) => s.id === id)
            if (!social) return null
            return (
              <div key={id} className="flex items-center gap-4 bg-gray-50 rounded-lg p-4 mb-1">
                <img src={social.iconPath} alt={social.name} className="w-6 h-6" />
                <input
                  type="url"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder={social.placeholder}
                  value={socialLinks[id]?.url || ""}
                  onChange={(e) => onChange(id, { url: e.target.value, visible: socialLinks[id]?.visible ?? true })}
                />
                <button
                  type="button"
                  className="bg-gray-400 hover:bg-gray-500 text-white p-2 rounded-full transition-colors"
                  onClick={() => handleSelect(id)}
                  title={t("links.remove")}
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

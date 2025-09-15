import { useState } from "react"
import { ALLOWED_SOCIAL_LINKS } from "@/lib/social-links-config"
import { useTranslations } from "next-intl"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { useTheme } from "@/contexts/ThemeProvider"

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
  const { theme } = useTheme()
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
         <div key={id} className="flex items-center gap-2 md:gap-3 border rounded-lg p-3 shadow-sm bg-[var(--dashboard-bg-card)] border-[var(--dashboard-border-primary)]">
                <img src={social.iconPath} alt={social.name} className="w-5 h-5" />
                <input
                  type="url"
                  className="flex-1 px-2 py-1.5 border rounded-md text-xs md:text-sm bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                  placeholder={social.placeholder}
                  value={socialLinks[id]?.url || ""}
                  onChange={(e) => onChange(id, { url: e.target.value, visible: socialLinks[id]?.visible ?? true })}
                />
                <button
                  type="button"
                  className="bg-gray-400 hover:bg-gray-500 text-white w-[20px] h-[20px] md:w-[24px] md:h-[24px] aspect-square rounded-full transition-colors flex-shrink-0 flex items-center justify-center"
                  onClick={() => handleSelect(id)}
                  title={t("links.remove")}
                >
                  <XMarkIcon className="w-2.5 h-2.5 md:w-3 md:h-3" />
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
               ? "ring-2 ring-[var(--dashboard-ring-primary)] bg-[var(--dashboard-bg-tertiary)] shadow-md"
               : "border border-[var(--dashboard-border-primary)] hover:border-[var(--dashboard-border-secondary)] bg-[var(--dashboard-bg-card)]"
           }`}
                onClick={() => handleSelect(social.id)}
              >
                <img src={social.iconPath} alt={social.name} className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium text-[var(--dashboard-text-secondary)]">{social.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

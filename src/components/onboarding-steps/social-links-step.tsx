"use client"

import { useEffect } from "react"
import Image from "next/image" // Import Image component for optimized images
import type { BusinessFormData } from "../business-onboarding-form"

interface SocialLinksStepProps {
  formData: BusinessFormData
  updateFormData: (updates: Partial<BusinessFormData>) => void
  onValidationChange: (isValid: boolean) => void
}

const ALLOWED_LINK_TYPES = [
  { id: "tiktok", name: "TikTok", color: "bg-black" },
  { id: "youtube", name: "YouTube", color: "bg-red-600" },
  { id: "instagram", name: "Instagram", color: "bg-pink-500" },
  { id: "twitter", name: "Twitter", color: "bg-blue-400" },
  { id: "facebook", name: "Facebook", color: "bg-blue-600" },
  { id: "whatsapp", name: "WhatsApp", color: "bg-green-500" },
  { id: "paypal", name: "PayPal", color: "bg-blue-600" },
  { id: "linkedin", name: "LinkedIn", color: "bg-blue-700" },
  { id: "shopify", name: "Shopify", color: "bg-green-600" },
  { id: "amazon", name: "Amazon", color: "bg-orange-500" }, // Added Amazon
  { id: "patreon", name: "Patreon", color: "bg-red-500" }, // Added Patreon
]

export default function SocialLinksStep({ formData, updateFormData, onValidationChange }: SocialLinksStepProps) {
  useEffect(() => {
    // This step is always valid since social links are optional
    onValidationChange(true)
  }, [onValidationChange])

  const toggleLink = (linkId: string) => {
    const currentLinks = formData.selected_links
    const isSelected = currentLinks.includes(linkId)

    if (isSelected) {
      // Remove the link
      const newLinks = currentLinks.filter((id) => id !== linkId)
      const newUrls = { ...formData.link_urls }
      delete newUrls[linkId]

      updateFormData({
        selected_links: newLinks,
        link_urls: newUrls,
      })
    } else {
      // Add the link
      updateFormData({
        selected_links: [...currentLinks, linkId],
      })
    }
  }

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-4">
        {ALLOWED_LINK_TYPES.map((linkType) => {
          const isSelected = formData.selected_links.includes(linkType.id)
          // Updated icon path
          const iconPath = `/icons/links-icons/${linkType.id}.svg` 
          return (
            <button
              key={linkType.id}
              onClick={() => toggleLink(linkType.id)}
              className={`relative p-4 rounded-lg border-[1px] transition-all duration-200 ${
                isSelected
                  ? "bg-gray-50 text-gray-900 border-gray-500 shadow-lg"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-300 hover:shadow-md"
              }`}
            >
              <div className="text-center">
                {/* Use Next.js Image component for the SVG icon */}
                <Image
                  src={iconPath}
                  alt={`${linkType.name} icon`}
                  width={32} // Made icons smaller
                  height={32}
                  className="mx-auto mb-2" // Removed filter for selected state
                />
                <div className="text-xs font-medium">{linkType.name}</div>
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center">
                  {/* Changed checkmark color to white */}
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {formData.selected_links.length === 0 && (
        <div className="text-center py-0"></div>
      )}
    </div>
  )
}
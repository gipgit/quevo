"use client"

import { useEffect } from "react"
import Image from "next/image" // Import Image component for optimized images
import type { BusinessFormData } from "../business-onboarding-form"
import { ALLOWED_SOCIAL_LINKS } from "@/lib/social-links-config"

interface LinkUrlsStepProps {
  formData: BusinessFormData
  updateFormData: (updates: Partial<BusinessFormData>) => void
  onValidationChange: (isValid: boolean) => void
}

export default function LinkUrlsStep({ formData, updateFormData, onValidationChange }: LinkUrlsStepProps) {
  useEffect(() => {
    // Check if all selected links have valid URLs
    const allLinksValid = formData.selected_links.every((linkId) => {
      const url = formData.link_urls[linkId]
      // If a link is selected, its URL must be present and valid
      return url && url.trim().length > 0 && isValidUrl(url)
    })
    // If no links are selected, this step is also valid
    const isValid = formData.selected_links.length === 0 || allLinksValid;

    onValidationChange(isValid)
  }, [formData.selected_links, formData.link_urls, onValidationChange])

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      // Also ensure it has a scheme (http/https)
      return url.startsWith("http://") || url.startsWith("https://");
    } catch {
      return false
    }
  }

  const handleUrlChange = (linkId: string, url: string) => {
    updateFormData({
      link_urls: {
        ...formData.link_urls,
        [linkId]: url,
      },
    })
  }

  const getUrlValidation = (linkId: string) => {
    const url = formData.link_urls[linkId]
    if (!url || url.trim().length === 0) {
      return { isValid: false, message: "" } // No message if empty or just whitespace
    }
    const isValid = isValidUrl(url)
    return {
      isValid,
      message: isValid ? "" : "URL non valido", // Only show message for invalid URLs
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <p className="text-sm text-gray-600">Inserisci il link per gli elementi che hai selezionato.</p>
      </div>

      <div className="space-y-4">
        {/* Filter ALLOWED_SOCIAL_LINKS to only show selected ones */}
        {ALLOWED_SOCIAL_LINKS.filter(linkType => formData.selected_links.includes(linkType.id)).map((linkType) => {
          const validation = getUrlValidation(linkType.id)
          // Use iconPath from config
          const iconPath = linkType.iconPath

          return (
            <div key={linkType.id} className="space-y-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Image
                    src={iconPath}
                    alt={`${linkType.name} icon`}
                    width={20}
                    height={20}
                    className="text-gray-400"
                  />
                </div>
                <input
                  id={`url-${linkType.id}`}
                  type="url"
                  value={formData.link_urls[linkType.id] || ""}
                  onChange={(e) => handleUrlChange(linkType.id, e.target.value)}
                  className={`w-full p-3 pl-10 pr-10 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formData.link_urls[linkType.id] && validation.isValid
                      ? "border-green-300 bg-green-50"
                      : formData.link_urls[linkType.id] && !validation.isValid
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                  }`}
                  placeholder={linkType.placeholder}
                  required
                />
                {formData.link_urls[linkType.id] && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    {validation.isValid ? (
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                )}
              </div>
              {formData.link_urls[linkType.id] && validation.message && (
                <p className={`text-sm ${validation.isValid ? "text-green-600" : "text-red-600"}`}>
                  {validation.message}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {formData.selected_links.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Nessun social link da configurare.</p>
        </div>
      )}
    </div>
  )
}
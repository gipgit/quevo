'use client'

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useTheme } from "@/contexts/ThemeContext"
import { useToaster } from "@/components/ui/ToasterProvider"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { generateMarketingContentAction } from "./actions"

interface Business {
  business_id: string
  business_name: string
  business_descr: string | null
}

interface ServiceQuestion {
  question_id: number
  question_text: string
  question_type: string
  is_required: boolean | null
}

interface ServiceRequirement {
  requirement_block_id: number
  title: string | null
  requirements_text: string
}

interface ServiceItem {
  service_item_id: number
  item_name: string
  item_description: string | null
  price_base: any
  price_type: string | null
  price_unit: string | null
}

interface Service {
  service_id: string
  service_name: string
  description: string | null
  price_base: any | null
  price_type: string | null
  active_quotation: boolean | null
  has_items: boolean | null
  active_booking: boolean | null
  is_active: boolean | null
  display_order: number | null
  servicecategory: {
    category_name: string
  } | null
  servicequestion: ServiceQuestion[]
  servicerequirementblock: ServiceRequirement[]
  serviceitem: ServiceItem[]
}

interface MarketingContentDisplayProps {
  servicesText: string
  emailContent: string
  socialMediaTitle: string
  socialMediaDescription: string
  business: Business
  services: Service[]
  isGenerating: boolean
  hasServices: boolean
}

export default function MarketingContentDisplay({
  servicesText,
  emailContent: initialEmailContent,
  socialMediaTitle: initialSocialMediaTitle,
  socialMediaDescription: initialSocialMediaDescription,
  business,
  services,
  isGenerating: initialIsGenerating,
  hasServices
}: MarketingContentDisplayProps) {
  const t = useTranslations("marketing")
  const { showToast } = useToaster()
  const { theme } = useTheme()
  const [emailContent, setEmailContent] = useState(initialEmailContent)
  const [socialMediaTitle, setSocialMediaTitle] = useState(initialSocialMediaTitle)
  const [socialMediaDescription, setSocialMediaDescription] = useState(initialSocialMediaDescription)
  const [isGenerating, setIsGenerating] = useState(initialIsGenerating)

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      showToast({
        type: "success",
        title: t("copied"),
        message: t("copiedMessage", { type }),
        duration: 2000
      })
    } catch (error) {
      console.error("Failed to copy:", error)
      showToast({
        type: "error",
        title: t("error"),
        message: t("errorMessage"),
        duration: 3000
      })
    }
  }

  const handleGenerateContent = async () => {
    setIsGenerating(true)
    try {
      const result = await generateMarketingContentAction(business, services)
      setEmailContent(result.emailContent)
      setSocialMediaTitle(result.socialMediaTitle)
      setSocialMediaDescription(result.socialMediaDescription)
      
      showToast({
        type: "success",
        title: t("contentGenerated"),
        message: t("contentGeneratedMessage"),
        duration: 4000
      })
    } catch (error) {
      console.error("Error generating content:", error)
      showToast({
        type: "error",
        title: t("error"),
        message: t("generateError"),
        duration: 5000
      })
    } finally {
      setIsGenerating(false)
    }
  }

  if (!hasServices) {
    return (
      <div className={`text-center py-12 ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
      }`}>
        <svg className="mx-auto w-12 h-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <h3 className="text-lg font-medium mb-2">{t("noServices")}</h3>
        <p className="mb-4">{t("noServicesDescription")}</p>
        <button
          onClick={() => window.location.href = "/dashboard/services/create"}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          {t("createFirstService")}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Services Information */}
      <div className={`rounded-xl shadow-sm border p-6 ${
        theme === 'dark' 
          ? 'bg-zinc-800 border-gray-600' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-lg font-semibold ${
            theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>{t("businessInfo")}</h2>
          <button
            onClick={() => copyToClipboard(servicesText, "Services information")}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm ${
              theme === 'dark' 
                ? 'border-gray-400 text-gray-300 hover:bg-zinc-700' 
                : 'border-gray-300 text-gray-700 hover:bg-zinc-50'
            } border`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {t("copy")}
          </button>
        </div>
        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50'
        }`}>
          <pre className={`text-sm whitespace-pre-wrap ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>{servicesText}</pre>
        </div>
      </div>

      {/* Generate Content Button */}
      <div className="flex justify-center">
        <button
          onClick={handleGenerateContent}
          disabled={isGenerating}
          className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 ${
            isGenerating
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isGenerating ? (
            <>
              <LoadingSpinner size="sm" color="white" />
              {t("generating")}
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {t("generateContent")}
            </>
          )}
        </button>
      </div>

      {/* Email Marketing Section */}
      <div className={`rounded-xl shadow-sm border p-6 ${
        theme === 'dark' 
          ? 'bg-zinc-800 border-gray-600' 
          : 'bg-white border-gray-200'
      }`}>
        <h2 className={`text-lg font-semibold mb-4 ${
          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        }`}>{t("emailMarketing")}</h2>
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50'
          }`}>
            <textarea
              value={emailContent}
              readOnly
              placeholder={t("emailPlaceholder")}
              className={`w-full h-48 p-3 rounded-lg resize-none ${
                theme === 'dark' 
                  ? 'bg-zinc-800 text-gray-300 border-gray-600' 
                  : 'bg-white text-gray-700 border-gray-300'
              } border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => copyToClipboard(emailContent, "Email content")}
              disabled={!emailContent}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                !emailContent
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : theme === 'dark' 
                    ? 'border-gray-400 text-gray-300 hover:bg-zinc-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-zinc-50'
              } border`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {t("copyEmailContent")}
            </button>
          </div>
        </div>
      </div>

      {/* Social Media Marketing Section */}
      <div className={`rounded-xl shadow-sm border p-6 ${
        theme === 'dark' 
          ? 'bg-zinc-800 border-gray-600' 
          : 'bg-white border-gray-200'
      }`}>
        <h2 className={`text-lg font-semibold mb-4 ${
          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        }`}>{t("socialMediaMarketing")}</h2>
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>{t("postTitle")}</label>
            <input
              type="text"
              value={socialMediaTitle}
              readOnly
              placeholder={t("postTitlePlaceholder")}
              className={`w-full p-3 rounded-lg ${
                theme === 'dark' 
                  ? 'bg-zinc-800 text-gray-300 border-gray-600' 
                  : 'bg-white text-gray-700 border-gray-300'
              } border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>{t("postDescription")}</label>
            <textarea
              value={socialMediaDescription}
              readOnly
              placeholder={t("postDescriptionPlaceholder")}
              className={`w-full h-32 p-3 rounded-lg resize-none ${
                theme === 'dark' 
                  ? 'bg-zinc-800 text-gray-300 border-gray-600' 
                  : 'bg-white text-gray-700 border-gray-300'
              } border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => copyToClipboard(socialMediaTitle, "Post title")}
              disabled={!socialMediaTitle}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                !socialMediaTitle
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : theme === 'dark' 
                    ? 'border-gray-400 text-gray-300 hover:bg-zinc-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-zinc-50'
              } border`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {t("copyTitle")}
            </button>
            <button
              onClick={() => copyToClipboard(socialMediaDescription, "Post description")}
              disabled={!socialMediaDescription}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                !socialMediaDescription
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : theme === 'dark' 
                    ? 'border-gray-400 text-gray-300 hover:bg-zinc-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-zinc-50'
              } border`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {t("copyDescription")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

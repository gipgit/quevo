"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { BusinessOnboardingForm } from "@/components/business-onboarding-form"
import ProfilePreview from "@/components/dashboard/profile/ProfilePreview"
import { LocaleSwitcherButton } from "@/components/ui/LocaleSwitcherButton"
import { LocaleSelectModal } from "@/components/ui/LocaleSelectModal"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { useLocale } from "next-intl"

export default function OnboardingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const t = useTranslations("onboarding")
  const locale = useLocale()
  const [isLocaleModalOpen, setIsLocaleModalOpen] = useState(false)
  const [formData, setFormData] = useState<any>({
    business_name: "",
    business_urlname: "",
    business_phone: "",
    business_email: "",
    profile_image: null,
    cover_image_mobile: null,
    cover_image_desktop: null,
    selected_links: [],
    link_urls: {},
    settings: {
      default_page: "services",
      theme_color_background: "#FFFFFF",
      theme_color_text: "#000000",
      theme_color_button: "#000000",
      theme_font: "1",
      show_address: true,
      show_website: true,
      show_socials: true,
      show_btn_booking: true,
      show_btn_payments: true,
      show_btn_review: true,
      show_btn_phone: true,
      show_btn_email: true,
      show_btn_order: false,
    },
  })

  // Locale switching functions
  const handleLocaleButtonClick = () => {
    setIsLocaleModalOpen(true)
  }

  const handleLocaleSelect = (newLocale: string) => {
    setIsLocaleModalOpen(false)
    // Navigate to the new locale
    const currentPath = window.location.pathname
    const newPath = currentPath.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPath)
  }

  const availableLocales = [
    { code: 'it', label: 'Italiano' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'de', label: 'Deutsch' },
    { code: 'fr', label: 'Français' }
  ]

  // Create object URLs for image previews
  const [profileImgUrl, setProfileImgUrl] = useState<string | undefined>()
  const [coverImgUrl, setCoverImgUrl] = useState<string | undefined>()

  useEffect(() => {
    if (formData.profile_image) {
      const url = URL.createObjectURL(formData.profile_image)
      setProfileImgUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setProfileImgUrl(undefined)
    }
  }, [formData.profile_image])

  useEffect(() => {
    if (formData.cover_image_mobile) {
      const url = URL.createObjectURL(formData.cover_image_mobile)
      setCoverImgUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setCoverImgUrl(undefined)
    }
  }, [formData.cover_image_mobile])

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/signin/business")
      return
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" color="blue" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Convert form data to profile preview format
  const profileData = {
    business_urlname: formData.business_urlname,
    business_name: formData.business_name,
    business_phone: formData.business_phone,
    business_email: formData.business_email,
  }

  // Convert social links to the format expected by ProfilePreview
  const socialLinks = formData.selected_links.reduce((acc: any, linkType: string) => {
    acc[linkType] = {
      url: formData.link_urls[linkType] || "",
      visible: true
    }
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 opacity-50">
            <h1 className="text-md lg:text-2xl font-bold text-gray-900">Quevo</h1>
          </div>
          <div className="flex-1 text-sm text-gray-800 text-center">
              {t("createBusinessTitle")}
          </div>
          <div className="flex-1 opacity-50 text-right">
            <LocaleSwitcherButton onClick={handleLocaleButtonClick} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-4xl mx-auto w-full pb-24 lg:items-center py-4 px-6">
        {/* Left Column - Form */}
        <div className="lg:flex-1 min-w-0 p-4 lg:p-6">
          <BusinessOnboardingForm 
            onFormDataChange={setFormData}
            formData={formData}
          />
        </div>
        
        {/* Right Column - Preview */}
        <div className="w-full lg:w-96 flex-shrink-0 p-4 lg:p-6">
          <div className="lg:sticky lg:top-6">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-4 border rounded-xl flex flex-col">
              <div className="flex items-center justify-center">
                <ProfilePreview
                  profileData={profileData}
                  profileSettings={formData.settings}
                  profileImg={profileImgUrl}
                  coverImg={coverImgUrl}
                  businessName={formData.business_name || "Business Name"}
                  socialLinks={socialLinks}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Locale Select Modal */}
      <LocaleSelectModal
        isOpen={isLocaleModalOpen}
        onClose={() => setIsLocaleModalOpen(false)}
        currentLocale={locale}
        availableLocales={availableLocales}
        onLocaleSelect={handleLocaleSelect}
      />
    </div>
  )
}

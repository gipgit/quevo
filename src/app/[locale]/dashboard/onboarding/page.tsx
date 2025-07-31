"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { ArrowPathIcon } from "@heroicons/react/24/outline"
import { BusinessOnboardingForm } from "@/components/business-onboarding-form"
import ProfilePreview from "@/components/dashboard/profile/ProfilePreview"

export default function OnboardingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const t = useTranslations("onboarding")
  const [formData, setFormData] = useState<any>({
    business_name: "",
    business_urlname: "",
    business_phone: "",
    business_email: "",
    profile_image: null,
    cover_image: null,
    selected_links: [],
    link_urls: {},
    settings: {
      default_page: "bookings",
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
    if (formData.cover_image) {
      const url = URL.createObjectURL(formData.cover_image)
      setCoverImgUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setCoverImgUrl(undefined)
    }
  }, [formData.cover_image])

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/signin")
      return
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t("loading") || "Caricamento..."}</h2>
          <p className="text-gray-600">{t("pleaseWait") || "Attendere prego..."}</p>
        </div>
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
          {/* xs to md: centered layout */}
          <div className="flex flex-col items-center lg:hidden flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-lg font-bold text-gray-900">Quevo</h1>
            </div>
            <div className="text-sm text-gray-500 text-center">
              {t("createBusinessTitle")}
            </div>
          </div>
          
          {/* lg+: original layout */}
          <div className="hidden lg:flex items-center space-x-3">
            <h1 className="text-xl font-bold text-gray-900">Quevo</h1>
          </div>
          <div className="hidden lg:block text-sm text-gray-500">
            {t("createBusinessTitle")}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-4xl mx-auto w-full pb-24 lg:items-center py-0 px-6">
        {/* Left Column - Form */}
        <div className="flex-1 min-w-0 p-4 lg:p-6">
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
    </div>
  )
}

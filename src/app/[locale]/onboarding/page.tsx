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

// Step titles mapping
const STEP_TITLES = [
  { id: 1, name: "businessInfo" },
  { id: 2, name: "profileLink" },
  { id: 3, name: "location" },
  { id: 4, name: "contacts" },
  { id: 5, name: "images" },
  { id: 6, name: "profileSettings" },
  { id: 7, name: "colorsAndFont" },
  { id: 8, name: "socials" },
  { id: 9, name: "socialLinks" },
  { id: 10, name: "confirm" },
]

export default function OnboardingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const t = useTranslations("onboarding")
  const tBusiness = useTranslations("BusinessOnboarding")
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
    currentStep: 1,
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

  const handleFormDataChange = (newFormData: any) => {
    setFormData(newFormData)
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
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Panel - Form with Header and Navigation */}
      <div className="flex-1 flex flex-col bg-white relative">
        {/* Header */}
        <div className="px-4 lg:px-6 py-4">
          <div className="flex items-center">
            <div className="w-1/5 opacity-50">
              <h1 className="text-md lg:text-2xl font-bold text-gray-900">Flowia</h1>
            </div>
            <div className="flex-1 text-center">
              <div className="text-center mb-2">
                <span className="text-xs text-gray-800">{t("createBusinessTitle")}</span>
                <span className="text-xs text-gray-500 ml-2">
                  {tBusiness(STEP_TITLES.find(step => step.id === (formData.currentStep || 1))?.name || "businessInfo")}
                </span>
              </div>
              <div className="w-full px-4">
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div
                    className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${((formData.currentStep || 1) - 1) / 9 * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="w-1/5 opacity-50 text-right">
              <LocaleSwitcherButton onClick={handleLocaleButtonClick} />
            </div>
          </div>
        </div>

         {/* Form Content */}
         <div className="flex-1 flex items-center justify-center p-8 pb-32">
           <div className="w-full max-w-[400px]">
             <BusinessOnboardingForm 
               onFormDataChange={handleFormDataChange}
               formData={formData}
             />
           </div>
         </div>
      </div>
      
      {/* Right Panel - Profile Preview */}
      <div className="flex-1 bg-gray-900 flex items-center justify-center text-white p-8 relative overflow-hidden">
        {/* Gradient Layer 1 */}
        <div 
          className="absolute z-1"
          style={{
            background: 'linear-gradient(143.241deg, rgb(128, 169, 252) 0%, rgb(211, 123, 255) 31.087%, rgb(252, 171, 131) 70.4599%, rgb(255, 73, 212) 100%)',
            filter: 'blur(80px)',
            borderRadius: '100%',
            opacity: 0.24,
            height: '400px',
            left: '-200px',
            top: '-100px',
            width: '500px'
          }}
        ></div>
        
        {/* Gradient Layer 2 */}
        <div 
          className="absolute z-1"
          style={{
            background: 'linear-gradient(140.017deg, rgb(239, 232, 246) 0%, rgb(213, 136, 251) 60.8266%, rgb(255, 73, 212) 100%)',
            filter: 'blur(80px)',
            borderRadius: '100%',
            opacity: 0.18,
            height: '400px',
            right: '-150px',
            bottom: '-100px',
            width: '500px'
          }}
        ></div>
        
        {/* Bottom Color Layer 1 */}
        <div 
          className="absolute z-1"
          style={{
            background: '#8A5FBF',
            filter: 'blur(80px)',
            opacity: 0.9,
            height: '180px',
            bottom: '-90px',
            left: '0',
            width: '33.33%',
            borderRadius: '100%'
          }}
        ></div>
        
        {/* Bottom Color Layer 2 */}
        <div 
          className="absolute z-1"
          style={{
            background: '#FFB366',
            filter: 'blur(80px)',
            opacity: 0.9,
            height: '180px',
            bottom: '-90px',
            left: '33.33%',
            width: '33.33%',
            borderRadius: '100%'
          }}
        ></div>
        
        {/* Bottom Color Layer 3 */}
        <div 
          className="absolute z-1"
          style={{
            background: '#7ED321',
            filter: 'blur(80px)',
            opacity: 0.9,
            height: '180px',
            bottom: '-90px',
            left: '66.66%',
            width: '33.33%',
            borderRadius: '100%'
          }}
        ></div>
        
        {/* Profile Preview */}
        <div className="text-center py-8 max-w-md relative z-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
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

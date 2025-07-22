"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { useBusiness } from "@/lib/business-context"
import { ALLOWED_SOCIAL_LINKS } from "@/lib/social-links-config"
import ProfileInfoSection from "@/components/dashboard/profile/ProfileInfoSection"
import ProfileLinksSection from "@/components/dashboard/profile/ProfileLinksSection"
import ProfileSettingsSection from "@/components/dashboard/profile/ProfileSettingsSection"
import ProfileAppearanceSection from "@/components/dashboard/profile/ProfileAppearanceSection"
import ProfilePaymentMethodsSection from "@/components/dashboard/profile/ProfilePaymentMethodsSection"
import ProfileImageSection from "@/components/dashboard/profile/ProfileImageSection"
import ProfilePreview from "@/components/dashboard/profile/ProfilePreview"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { 
  UserIcon, 
  PhotoIcon, 
  LinkIcon, 
  CreditCardIcon, 
  Cog6ToothIcon, 
  SwatchIcon 
} from "@heroicons/react/24/outline"

// Domain constant for public link
const DOMAIN = typeof window !== "undefined" && window.location.hostname.includes("localhost")
  ? "http://localhost:3000"
  : "your-production-domain.com" // <-- Replace with your actual domain

interface SocialLink {
  url: string;
  visible: boolean;
}

export default function ProfilePage() {
  const t = useTranslations("profile")
  const router = useRouter();
  const params = useParams();
  const sectionParam = params?.section as string | undefined;
  const section = sectionParam || "info";
  const { currentBusiness, userManager } = useBusiness()
  const [profileData, setProfileData] = useState<any>(null)
  const [profileSettings, setProfileSettings] = useState<any>({})
  const [socialLinks, setSocialLinks] = useState<Record<string, SocialLink>>({})
  const [paymentMethods, setPaymentMethods] = useState<{ type: string; visible: boolean }[]>([])
  const [saving, setSaving] = useState<string | null>(null)
  const [saveMsg, setSaveMsg] = useState<string>("")
  const [profileImgFile, setProfileImgFile] = useState<File | null>(null)
  const [coverImgFile, setCoverImgFile] = useState<File | null>(null)
  const [profileImgPreview, setProfileImgPreview] = useState<string | null>(null)
  const [coverImgPreview, setCoverImgPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentBusiness) {
      setLoading(true)
      // Fetch all profile data from unified API endpoint
      fetch(`/api/businesses/${currentBusiness.business_id}/profile`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data) {
            setProfileData(data.profileData || {})
            setProfileSettings(data.profileSettings || {})
            setSocialLinks(data.socialLinks || {})
            setPaymentMethods(
              Array.isArray(data.paymentMethods)
                ? data.paymentMethods
                : []
            )
          } else {
            setProfileData({})
            setProfileSettings({})
            setSocialLinks({})
            setPaymentMethods([])
          }
        })
        .catch(() => {
          setProfileData({})
          setProfileSettings({})
          setSocialLinks({})
          setPaymentMethods([])
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [currentBusiness])

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev: Record<string, any>) => ({ ...prev, [field]: value }))
  }

  const handleSettingToggle = (setting: string) => {
    setProfileSettings((prev: Record<string, any>) => ({ ...prev, [setting]: !prev[setting] }))
  }

  const handleDefaultPageChange = (value: string) => {
    setProfileSettings((prev: Record<string, any>) => ({ ...prev, default_page: value }))
  }

  const handleFontChange = (font: string) => {
    setProfileSettings((prev: Record<string, any>) => ({ ...prev, theme_font: font }))
  }

  const handleColorChange = (key: string, value: string) => {
    setProfileSettings((prev: Record<string, any>) => ({ ...prev, [key]: value }))
  }

  // Update handleSocialLinkChange to accept SocialLink
  const handleSocialLinkChange = (platform: string, link: SocialLink) => {
    setSocialLinks((prev: Record<string, SocialLink>) => ({ ...prev, [platform]: link }))
  }

  // --- Handle emails/phones as arrays for saveSection ---
  const handleEmailsChange = (emails: string[] | { value: string }[]) => {
    setProfileData((prev: Record<string, any>) => ({ ...prev, business_emails: emails }))
  }
  const handlePhonesChange = (phones: string[] | { value: string }[]) => {
    setProfileData((prev: Record<string, any>) => ({ ...prev, business_phones: phones }))
  }

  // Upload handler for profile image
  const handleProfileImgChange = async (file: File, previewUrl: string) => {
    setProfileImgFile(file)
    setProfileImgPreview(previewUrl)
    // Optionally upload immediately or wait for save
  }
  // Upload handler for cover image
  const handleCoverImgChange = async (file: File, previewUrl: string) => {
    setCoverImgFile(file)
    setCoverImgPreview(previewUrl)
  }

  const safeParseError = async (res: Response, fallbackMsg: string) => {
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        const err = await res.json();
        return err.error || fallbackMsg;
      } catch {
        return fallbackMsg;
      }
    } else {
      return fallbackMsg;
    }
  };

  // Save handlers for each section
  const saveInfo = async () => {
    if (!currentBusiness) return;
    setSaving("info");
    setSaveMsg("");
    const res = await fetch(`/api/businesses/${currentBusiness.business_id}/profile/info`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileData),
    });
    if (res.ok) {
      setSaveMsg(t("saveSuccess"));
      await refreshProfile();
    } else {
      let errMsg = t("saveError");
      try {
        const err = await res.json();
        errMsg = err.error || errMsg;
      } catch (e) {
        // response is not JSON, keep default error
      }
      setSaveMsg(errMsg);
    }
    setSaving(null);
  };

  const saveLinks = async () => {
    if (!currentBusiness) return;
    setSaving("links");
    setSaveMsg("");
    const payload = { links: Object.entries(socialLinks).map(([type, { url, visible }]) => ({ link_type: type, link_url: url, visible })) };
    const res = await fetch(`/api/businesses/${currentBusiness.business_id}/profile/links`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setSaveMsg(t("saveSuccess"));
      await refreshProfile();
    } else {
      let errMsg = t("saveError");
      try {
        const err = await res.json();
        errMsg = err.error || errMsg;
      } catch (e) {
        // response is not JSON, keep default error
      }
      setSaveMsg(errMsg);
    }
    setSaving(null);
  };

  const savePayments = async () => {
    if (!currentBusiness) return;
    setSaving("payments");
    setSaveMsg("");
    const res = await fetch(`/api/businesses/${currentBusiness.business_id}/profile/payments`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payments: paymentMethods }),
    });
    if (res.ok) {
      setSaveMsg(t("saveSuccess"));
      await refreshProfile();
    } else {
      let errMsg = t("saveError");
      try {
        const err = await res.json();
        errMsg = err.error || errMsg;
      } catch (e) {
        // response is not JSON, keep default error
      }
      setSaveMsg(errMsg);
    }
    setSaving(null);
  };

  const saveSettings = async () => {
    if (!currentBusiness) return;
    setSaving("settings");
    setSaveMsg("");
    const res = await fetch(`/api/businesses/${currentBusiness.business_id}/profile/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: profileSettings }),
    });
    if (res.ok) {
      setSaveMsg(t("saveSuccess"));
      await refreshProfile();
    } else {
      let errMsg = t("saveError");
      try {
        const err = await res.json();
        errMsg = err.error || errMsg;
      } catch (e) {
        // response is not JSON, keep default error
      }
      setSaveMsg(errMsg);
    }
    setSaving(null);
  };

  // Save handler for images
  const saveImages = async () => {
    if (!currentBusiness) return
    setSaving("images")
    setSaveMsg("")
    const formData = new FormData()
    if (profileImgFile) formData.append("profile_image", profileImgFile)
    if (coverImgFile) formData.append("cover_image", coverImgFile)
    const res = await fetch(`/api/businesses/${currentBusiness.business_id}/upload-images`, {
      method: "POST",
      body: formData,
    })
    if (res.ok) {
      // Re-fetch profile data to get updated image URLs
      const profileRes = await fetch(`/api/businesses/${currentBusiness.business_id}/profile`)
      if (profileRes.ok) {
        const data = await profileRes.json()
        setProfileData(data.profileData || {})
        setProfileSettings(data.profileSettings || {})
        setSocialLinks(data.socialLinks || {})
        setPaymentMethods(Array.isArray(data.paymentMethods) ? data.paymentMethods : [])
      }
      setProfileImgFile(null)
      setProfileImgPreview(null)
      setCoverImgFile(null)
      setCoverImgPreview(null)
      setSaveMsg(t("saveSuccess"))
    } else {
      let errMsg = t("saveError");
      try {
        const err = await res.json();
        errMsg = err.error || errMsg;
      } catch (e) {
        // response is not JSON, keep default error
      }
      setSaveMsg(errMsg);
    }
    setSaving(null)
  }

  // Helper to refresh all profile data
  const refreshProfile = async () => {
    if (!currentBusiness) return;
    const res = await fetch(`/api/businesses/${currentBusiness.business_id}/profile`);
    if (res.ok) {
      const data = await res.json();
      setProfileData(data.profileData || {});
      setProfileSettings(data.profileSettings || {});
      setSocialLinks(data.socialLinks || {});
      setPaymentMethods(Array.isArray(data.paymentMethods) ? data.paymentMethods : []);
    }
  };

  if (!currentBusiness) return null

  const tabs = [
    { id: "info", label: t("tabs.information"), icon: "UserIcon" },
    { id: "images", label: t("tabs.images"), icon: "PhotoIcon" },
    { id: "links", label: t("tabs.links"), icon: "LinkIcon" },
    { id: "payments", label: t("tabs.paymentMethods"), icon: "CreditCardIcon" },
    { id: "settings", label: t("tabs.settings"), icon: "Cog6ToothIcon" },
    { id: "appearance", label: t("tabs.appearance"), icon: "SwatchIcon" },
  ]

  // Tab click handler
  const handleTabClick = (tabId: string) => {
    router.push(`/dashboard/profile/${tabId}`);
  };

  // Function to render tab icons
  const renderTabIcon = (iconName: string, isActive: boolean) => {
    const iconProps = {
      className: `w-5 h-5 ${isActive ? 'text-gray-900' : 'text-gray-500'}`,
    }
    
    switch (iconName) {
      case "UserIcon":
        return <UserIcon {...iconProps} />
      case "PhotoIcon":
        return <PhotoIcon {...iconProps} />
      case "LinkIcon":
        return <LinkIcon {...iconProps} />
      case "CreditCardIcon":
        return <CreditCardIcon {...iconProps} />
      case "Cog6ToothIcon":
        return <Cog6ToothIcon {...iconProps} />
      case "SwatchIcon":
        return <SwatchIcon {...iconProps} />
      default:
        return null
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t("title")}</h1>
          <a 
            href={`${DOMAIN}/${currentBusiness?.business_urlname || ""}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium transition-colors"
          >
            {t("openProfile")}
          </a>
        </div>
        {/* Tab Navigation Row - always visible */}
        <div className="bg-gray-200 rounded-lg p-2 mb-8">
          <nav className="flex justify-between overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = section === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center space-x-2 py-3 px-4 rounded-md font-medium text-sm whitespace-nowrap transition-colors flex-1 ${
                    isActive
                      ? "bg-gray-200 text-gray-900 shadow-sm"
                      : "text-gray-600"
                  }`}
                >
                  {renderTabIcon(tab.icon, isActive)}
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
        {/* Main Content with Preview */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" color="blue" />
          </div>
        ) : (
          <>
            <div className="flex flex-col lg:flex-row justify-between gap-8">
              {/* Left Column - Content Area */}
              <div className="max-w-2xl w-full">
              {/* Tab Content */}
                {section === "info" && (
                  <>
                    <ProfileInfoSection profileData={profileData} onChange={handleInputChange} />
                    <button
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                      disabled={saving === "info"}
                      onClick={saveInfo}
                    >{saving === "info" ? t("saving") : t("save")}</button>
                    {saveMsg && <div className="mt-2 text-sm text-green-600">{saveMsg}</div>}
                  </>
                )}
                {section === "images" && (
                  <>
                    <ProfileImageSection
                      profileImg={profileImgPreview || profileData?.business_img_profile}
                      coverImg={coverImgPreview || profileData?.business_img_cover}
                      onProfileImgChange={handleProfileImgChange}
                      onCoverImgChange={handleCoverImgChange}
                    />
                    <button
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                      disabled={saving === "images"}
                      onClick={saveImages}
                    >{saving === "images" ? t("saving") : t("save")}</button>
                    {saveMsg && <div className="mt-2 text-sm text-green-600">{saveMsg}</div>}
                  </>
                )}
                {section === "links" && (
                  <>
                    <ProfileLinksSection socialLinks={socialLinks} onChange={handleSocialLinkChange} />
                    <button
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                      disabled={saving === "links"}
                      onClick={saveLinks}
                    >{saving === "links" ? t("saving") : t("save")}</button>
                    {saveMsg && <div className="mt-2 text-sm text-green-600">{saveMsg}</div>}
                  </>
                )}
                {section === "payments" && (
                  <>
                    <ProfilePaymentMethodsSection paymentMethods={paymentMethods} onChange={setPaymentMethods} />
                    <button
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                      disabled={saving === "payments"}
                      onClick={savePayments}
                    >{saving === "payments" ? t("saving") : t("save")}</button>
                    {saveMsg && <div className="mt-2 text-sm text-green-600">{saveMsg}</div>}
                  </>
                )}
                {section === "settings" && (
                  <>
                    <ProfileSettingsSection
                      profileSettings={profileSettings}
                      onToggle={handleSettingToggle}
                      onDefaultPageChange={handleDefaultPageChange}
                    />
                    <button
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                      disabled={saving === "settings"}
                      onClick={saveSettings}
                    >{saving === "settings" ? t("saving") : t("save")}</button>
                    {saveMsg && <div className="mt-2 text-sm text-green-600">{saveMsg}</div>}
                  </>
                )}
                {section === "appearance" && (
                  <ProfileAppearanceSection
                    profileSettings={profileSettings}
                    onFontChange={handleFontChange}
                    onColorChange={handleColorChange}
                    businessName={profileData?.business_name}
                  />
                )}
              </div>
              {/* Right Column - Fixed Width Preview */}
              <div className="w-full lg:w-96 flex-shrink-0">
                <div className="lg:sticky lg:top-6 lg:h-full">
                  <div className="h-full bg-gradient-to-br from-gray-300 to-gray-400 p-4 border rounded-xl flex flex-col">
                    <div className="flex-1 flex items-center justify-center">
                      <ProfilePreview
                        profileData={profileData}
                        profileSettings={profileSettings}
                        profileImg={profileImgPreview || profileData?.business_img_profile}
                        coverImg={coverImgPreview || profileData?.business_img_cover}
                        businessName={profileData?.business_name}
                        socialLinks={socialLinks}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
} 
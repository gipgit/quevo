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
import SaveButton from "@/components/ui/SaveButton"
import { useToaster } from "@/components/ui/ToasterProvider"
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

// Deep comparison utility
const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object') return a === b;
  
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    return a.every((val, index) => deepEqual(val, b[index]));
  }
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every(key => keysB.includes(key) && deepEqual(a[key], b[key]));
};

// Get changed fields utility
const getChangedFields = (original: any, current: any): any => {
  if (!original || !current) return current;
  
  const changes: any = {};
  const allKeys = new Set([...Object.keys(original), ...Object.keys(current)]);
  
  for (const key of allKeys) {
    if (!deepEqual(original[key], current[key])) {
      changes[key] = current[key];
    }
  }
  
  return Object.keys(changes).length > 0 ? changes : null;
};

export default function ProfilePage() {
  const t = useTranslations("profile")
  const tCommon = useTranslations("Common")
  const { showToast } = useToaster()
  const router = useRouter();
  const params = useParams();
  const sectionParam = params?.section as string | undefined;
  const section = sectionParam || "info";
  const { currentBusiness, userManager } = useBusiness()
  
  // Current state
  const [profileData, setProfileData] = useState<any>(null)
  const [profileSettings, setProfileSettings] = useState<any>({})
  const [socialLinks, setSocialLinks] = useState<Record<string, SocialLink>>({})
  const [paymentMethods, setPaymentMethods] = useState<{ type: string; visible: boolean }[]>([])
  
  // Original state for change detection
  const [originalProfileData, setOriginalProfileData] = useState<any>(null)
  const [originalProfileSettings, setOriginalProfileSettings] = useState<any>({})
  const [originalSocialLinks, setOriginalSocialLinks] = useState<Record<string, SocialLink>>({})
  const [originalPaymentMethods, setOriginalPaymentMethods] = useState<{ type: string; visible: boolean }[]>([])
  
  // UI state
  const [saving, setSaving] = useState<string | null>(null)
  const [profileImgFile, setProfileImgFile] = useState<File | null>(null)
  const [coverImgFile, setCoverImgFile] = useState<File | null>(null)
  const [profileImgPreview, setProfileImgPreview] = useState<string | null>(null)
  const [coverImgPreview, setCoverImgPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Load initial data
  useEffect(() => {
    if (currentBusiness) {
      setLoading(true)
      fetch(`/api/businesses/${currentBusiness.business_id}/profile`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data) {
            const profileData = data.profileData || {}
            const profileSettings = data.profileSettings || {}
            const socialLinks = data.socialLinks || {}
            const paymentMethods = Array.isArray(data.paymentMethods) ? data.paymentMethods : []
            
            // Set current state
            setProfileData(profileData)
            setProfileSettings(profileSettings)
            setSocialLinks(socialLinks)
            setPaymentMethods(paymentMethods)
            
            // Set original state for change detection
            setOriginalProfileData(JSON.parse(JSON.stringify(profileData)))
            setOriginalProfileSettings(JSON.parse(JSON.stringify(profileSettings)))
            setOriginalSocialLinks(JSON.parse(JSON.stringify(socialLinks)))
            setOriginalPaymentMethods(JSON.parse(JSON.stringify(paymentMethods)))
          } else {
            setProfileData({})
            setProfileSettings({})
            setSocialLinks({})
            setPaymentMethods([])
            setOriginalProfileData({})
            setOriginalProfileSettings({})
            setOriginalSocialLinks({})
            setOriginalPaymentMethods([])
          }
        })
        .catch((error) => {
          console.error("Error loading profile data:", error)
          setProfileData({})
          setProfileSettings({})
          setSocialLinks({})
          setPaymentMethods([])
          setOriginalProfileData({})
          setOriginalProfileSettings({})
          setOriginalSocialLinks({})
          setOriginalPaymentMethods([])
          
          showToast({
            type: "error",
            title: t("toasts.error.loadError.title"),
            message: t("toasts.error.loadError.message"),
            duration: 8000
          })
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [currentBusiness, showToast])

  // Change detection functions
  const hasInfoChanges = useCallback(() => {
    return getChangedFields(originalProfileData, profileData) !== null
  }, [originalProfileData, profileData])

  const hasSettingsChanges = useCallback(() => {
    return getChangedFields(originalProfileSettings, profileSettings) !== null
  }, [originalProfileSettings, profileSettings])

  const hasLinksChanges = useCallback(() => {
    return getChangedFields(originalSocialLinks, socialLinks) !== null
  }, [originalSocialLinks, socialLinks])

  const hasPaymentsChanges = useCallback(() => {
    return getChangedFields(originalPaymentMethods, paymentMethods) !== null
  }, [originalPaymentMethods, paymentMethods])

  const hasImageChanges = useCallback(() => {
    return profileImgFile !== null || coverImgFile !== null
  }, [profileImgFile, coverImgFile])

  // Input handlers
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

  const handleSocialLinkChange = (platform: string, link: SocialLink) => {
    setSocialLinks((prev: Record<string, SocialLink>) => ({ ...prev, [platform]: link }))
  }

  const handleEmailsChange = (emails: string[] | { value: string }[]) => {
    setProfileData((prev: Record<string, any>) => ({ ...prev, business_emails: emails }))
  }

  const handlePhonesChange = (phones: string[] | { value: string }[]) => {
    setProfileData((prev: Record<string, any>) => ({ ...prev, business_phones: phones }))
  }

  const handleProfileImgChange = async (file: File, previewUrl: string) => {
    setProfileImgFile(file)
    setProfileImgPreview(previewUrl)
  }

  const handleCoverImgChange = async (file: File, previewUrl: string) => {
    setCoverImgFile(file)
    setCoverImgPreview(previewUrl)
  }

  // Helper function to parse API error response
  const parseApiError = async (res: Response): Promise<{ userMessage: string; technicalMessage: string }> => {
    let userMessage = "An error occurred while saving changes"
    let technicalMessage = `HTTP ${res.status}: ${res.statusText}`
    
    try {
      const errorData = await res.json()
      if (errorData.error) {
        userMessage = errorData.error
        technicalMessage = `API Error: ${JSON.stringify(errorData)}`
      } else if (errorData.message) {
        userMessage = errorData.message
        technicalMessage = `API Message: ${JSON.stringify(errorData)}`
      }
    } catch (e) {
      technicalMessage = `Failed to parse error response: ${e}`
    }
    
    return { userMessage, technicalMessage }
  }

  // Optimized save functions
  const saveInfo = async () => {
    if (!currentBusiness) return;
    
    // Check if there are actual changes
    if (!hasInfoChanges()) {
      showToast({
        type: "info",
        title: t("toasts.noChanges.title"),
        message: t("toasts.noChanges.message"),
        duration: 3000
      })
      return;
    }

    setSaving("info");
    
    // Only send changed fields
    const changes = getChangedFields(originalProfileData, profileData);
    if (!changes) {
      setSaving(null);
      return;
    }

    try {
      const res = await fetch(`/api/businesses/${currentBusiness.business_id}/profile/info`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      
      if (res.ok) {
        showToast({
          type: "success",
          title: t("toasts.success.info.title"),
          message: t("toasts.success.info.message"),
          duration: 4000
        })
        // Update original state to reflect new baseline
        setOriginalProfileData(JSON.parse(JSON.stringify(profileData)));
      } else {
        const { userMessage, technicalMessage } = await parseApiError(res)
        showToast({
          type: "error",
          title: t("toasts.error.saveFailed.title"),
          message: userMessage || t("toasts.error.saveFailed.message"),
          technicalDetails: technicalMessage,
          duration: 8000
        })
        console.error("API Error Details:", technicalMessage)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Network error"
      showToast({
        type: "error",
        title: "Network Error",
        message: "Failed to connect to server. Please check your connection.",
        duration: 6000
      })
      console.error("Network Error:", errorMessage)
    } finally {
      setSaving(null);
    }
  };

  const saveLinks = async () => {
    if (!currentBusiness) return;
    
    // Check if there are actual changes
    if (!hasLinksChanges()) {
      showToast({
        type: "info",
        title: t("toasts.noChanges.title"),
        message: t("toasts.noChanges.message"),
        duration: 3000
      })
      return;
    }

    setSaving("links");
    
    const payload = { 
      links: Object.entries(socialLinks).map(([type, { url, visible }]) => ({ 
        link_type: type, 
        link_url: url, 
        visible 
      })) 
    };
    
    try {
      const res = await fetch(`/api/businesses/${currentBusiness.business_id}/profile/links`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        showToast({
          type: "success",
          title: t("toasts.success.links.title"),
          message: t("toasts.success.links.message"),
          duration: 4000
        })
        // Update original state
        setOriginalSocialLinks(JSON.parse(JSON.stringify(socialLinks)));
      } else {
        const { userMessage, technicalMessage } = await parseApiError(res)
        showToast({
          type: "error",
          title: t("toasts.error.saveFailed.title"),
          message: userMessage || t("toasts.error.saveFailed.message"),
          technicalDetails: technicalMessage,
          duration: 8000
        })
        console.error("API Error Details:", technicalMessage)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Network error"
      showToast({
        type: "error",
        title: "Network Error",
        message: "Failed to connect to server. Please check your connection.",
        duration: 6000
      })
      console.error("Network Error:", errorMessage)
    } finally {
      setSaving(null);
    }
  };

  const savePayments = async () => {
    if (!currentBusiness) return;
    
    // Check if there are actual changes
    if (!hasPaymentsChanges()) {
      showToast({
        type: "info",
        title: t("toasts.noChanges.title"),
        message: t("toasts.noChanges.message"),
        duration: 3000
      })
      return;
    }

    setSaving("payments");
    
    try {
      const res = await fetch(`/api/businesses/${currentBusiness.business_id}/profile/payments`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payments: paymentMethods }),
      });
      
      if (res.ok) {
        showToast({
          type: "success",
          title: t("toasts.success.payments.title"),
          message: t("toasts.success.payments.message"),
          duration: 4000
        })
        // Update original state
        setOriginalPaymentMethods(JSON.parse(JSON.stringify(paymentMethods)));
      } else {
        const { userMessage, technicalMessage } = await parseApiError(res)
        showToast({
          type: "error",
          title: t("toasts.error.saveFailed.title"),
          message: userMessage || t("toasts.error.saveFailed.message"),
          technicalDetails: technicalMessage,
          duration: 8000
        })
        console.error("API Error Details:", technicalMessage)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Network error"
      showToast({
        type: "error",
        title: "Network Error",
        message: "Failed to connect to server. Please check your connection.",
        duration: 6000
      })
      console.error("Network Error:", errorMessage)
    } finally {
      setSaving(null);
    }
  };

  const saveSettings = async () => {
    if (!currentBusiness) return;
    
    // Check if there are actual changes
    if (!hasSettingsChanges()) {
      showToast({
        type: "info",
        title: t("toasts.noChanges.title"),
        message: t("toasts.noChanges.message"),
        duration: 3000
      })
      return;
    }

    setSaving("settings");
    
    // Only send changed fields
    const changes = getChangedFields(originalProfileSettings, profileSettings);
    if (!changes) {
      setSaving(null);
      return;
    }

    try {
      const res = await fetch(`/api/businesses/${currentBusiness.business_id}/profile/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: changes }),
      });
      
      if (res.ok) {
        showToast({
          type: "success",
          title: t("toasts.success.settings.title"),
          message: t("toasts.success.settings.message"),
          duration: 4000
        })
        // Update original state
        setOriginalProfileSettings(JSON.parse(JSON.stringify(profileSettings)));
      } else {
        const { userMessage, technicalMessage } = await parseApiError(res)
        showToast({
          type: "error",
          title: t("toasts.error.saveFailed.title"),
          message: userMessage || t("toasts.error.saveFailed.message"),
          technicalDetails: technicalMessage,
          duration: 8000
        })
        console.error("API Error Details:", technicalMessage)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Network error"
      showToast({
        type: "error",
        title: "Network Error",
        message: "Failed to connect to server. Please check your connection.",
        duration: 6000
      })
      console.error("Network Error:", errorMessage)
    } finally {
      setSaving(null);
    }
  };

  const saveImages = async () => {
    if (!currentBusiness) return;
    
    // Check if there are actual changes
    if (!hasImageChanges()) {
      showToast({
        type: "info",
        title: t("toasts.noChanges.title"),
        message: t("toasts.noChanges.message"),
        duration: 3000
      })
      return;
    }

    setSaving("images");
    
    const formData = new FormData();
    if (profileImgFile) formData.append("profile_image", profileImgFile);
    if (coverImgFile) formData.append("cover_image", coverImgFile);
    
    try {
      const res = await fetch(`/api/businesses/${currentBusiness.business_id}/upload-images`, {
        method: "POST",
        body: formData,
      });
      
      if (res.ok) {
        // Update profile data with new image paths
        const profileRes = await fetch(`/api/businesses/${currentBusiness.business_id}/profile`);
        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfileData(data.profileData || {});
          setOriginalProfileData(JSON.parse(JSON.stringify(data.profileData || {})));
        }
        
        // Clear file states
        setProfileImgFile(null);
        setProfileImgPreview(null);
        setCoverImgFile(null);
        setCoverImgPreview(null);
        
        showToast({
          type: "success",
          title: t("toasts.success.images.title"),
          message: t("toasts.success.images.message"),
          duration: 4000
        })
              } else {
          const { userMessage, technicalMessage } = await parseApiError(res)
          showToast({
            type: "error",
            title: t("toasts.error.uploadFailed.title"),
            message: userMessage || t("toasts.error.uploadFailed.message"),
            technicalDetails: technicalMessage,
            duration: 8000
          })
          console.error("API Error Details:", technicalMessage)
        }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Network error"
      showToast({
        type: "error",
        title: t("toasts.error.networkError.title"),
        message: t("toasts.error.networkError.message"),
        technicalDetails: errorMessage,
        duration: 8000
      })
      console.error("Network Error:", errorMessage)
    } finally {
      setSaving(null);
    }
  };

  // Navigation
  const handleTabClick = (tabId: string) => {
    router.push(`/dashboard/profile/${tabId}`);
  };

  const renderTabIcon = (iconName: string, isActive: boolean) => {
    const iconMap: Record<string, any> = {
      UserIcon,
      PhotoIcon,
      LinkIcon,
      CreditCardIcon,
      Cog6ToothIcon,
      SwatchIcon,
    };
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="h-5 w-5" /> : null;
  };

  // Tab configuration
  const tabs = [
    { id: "info", label: t("tabs.info"), icon: "UserIcon" },
    { id: "images", label: t("tabs.images"), icon: "PhotoIcon" },
    { id: "links", label: t("tabs.links"), icon: "LinkIcon" },
    { id: "payments", label: t("tabs.payments"), icon: "CreditCardIcon" },
    { id: "settings", label: t("tabs.settings"), icon: "Cog6ToothIcon" },
    { id: "appearance", label: t("tabs.appearance"), icon: "SwatchIcon" },
  ];

  // Public URL
  const publicUrl = `${DOMAIN}/${currentBusiness?.business_urlname || ""}`;

  if (!currentBusiness) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" color="blue" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t("title")}</h1>
          <a 
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium transition-colors"
          >
            {t("openProfile")}
          </a>
        </div>
        
        {/* Tab Navigation */}
        <div className="bg-gray-200 rounded-lg p-2 mb-8">
          <nav className="flex justify-between overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = section === tab.id;
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
              );
            })}
          </nav>
        </div>
        
        {/* Main Content */}
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
                    <div className="mt-4">
                      <SaveButton 
                        onClick={saveInfo} 
                        saving={saving === "info"}
                        disabled={!hasInfoChanges()}
                      />
                    </div>
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
                    <div className="mt-4">
                      <SaveButton 
                        onClick={saveImages} 
                        saving={saving === "images"}
                        disabled={!hasImageChanges()}
                      />
                    </div>
                  </>
                )}
                
                {section === "links" && (
                  <>
                    <ProfileLinksSection socialLinks={socialLinks} onChange={handleSocialLinkChange} />
                    <div className="mt-4">
                      <SaveButton 
                        onClick={saveLinks} 
                        saving={saving === "links"}
                        disabled={!hasLinksChanges()}
                      />
                    </div>
                  </>
                )}
                
                {section === "payments" && (
                  <>
                    <ProfilePaymentMethodsSection paymentMethods={paymentMethods} onChange={setPaymentMethods} />
                    <div className="mt-4">
                      <SaveButton 
                        onClick={savePayments} 
                        saving={saving === "payments"}
                        disabled={!hasPaymentsChanges()}
                      />
                    </div>
                  </>
                )}
                
                {section === "settings" && (
                  <>
                    <ProfileSettingsSection
                      profileSettings={profileSettings}
                      onToggle={handleSettingToggle}
                      onDefaultPageChange={handleDefaultPageChange}
                    />
                    <div className="mt-4">
                      <SaveButton 
                        onClick={saveSettings} 
                        saving={saving === "settings"}
                        disabled={!hasSettingsChanges()}
                      />
                    </div>
                  </>
                )}
                
                {section === "appearance" && (
                  <>
                    <ProfileAppearanceSection
                      profileSettings={profileSettings}
                      onFontChange={handleFontChange}
                      onColorChange={handleColorChange}
                      businessName={profileData?.business_name}
                    />
                    <div className="mt-4">
                      <SaveButton 
                        onClick={saveSettings} 
                        saving={saving === "settings"}
                        disabled={!hasSettingsChanges()}
                      />
                    </div>
                  </>
                )}
              </div>
              
              {/* Right Column - Preview */}
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
  );
} 
'use client'

import { useState, useCallback, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { useTheme } from "@/contexts/ThemeContext"
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

interface SocialLink {
  url: string;
  visible: boolean;
}

interface UserManager {
  id: string
  name_first: string | null
  name_last: string | null
  email: string | null
}

interface ProfileWrapperProps {
  section: string
  userManager: UserManager | null
  initialProfileData: any
  initialProfileSettings: any
  initialSocialLinks: Record<string, SocialLink>
  initialPaymentMethods: { type: string; visible: boolean; details?: any }[]
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

export default function ProfileWrapper({ 
  section: initialSection, 
  userManager,
  initialProfileData,
  initialProfileSettings,
  initialSocialLinks,
  initialPaymentMethods
}: ProfileWrapperProps) {
  const { currentBusiness } = useBusiness()
  
  // Domain state to avoid hydration mismatch
  const [DOMAIN, setDOMAIN] = useState("https://quevo.vercel.app")
  
  // Section state for client-side navigation
  const [section, setSection] = useState(initialSection)
  
  const t = useTranslations("profile")
  const tCommon = useTranslations("Common")
  const { showToast } = useToaster()
  const router = useRouter();
  const { theme } = useTheme()
  
  // Set the correct domain after component mounts
  useEffect(() => {
    const isLocalhost = window.location.hostname.includes("localhost")
    setDOMAIN(isLocalhost ? "http://localhost:3000" : "https://quevo.vercel.app")
  }, [])
  
  // Initialize state with server-fetched data
  const [currentProfileData, setCurrentProfileData] = useState<any>(initialProfileData || {})
  const [currentProfileSettings, setCurrentProfileSettings] = useState<any>(initialProfileSettings || {})
  const [currentSocialLinks, setCurrentSocialLinks] = useState<Record<string, SocialLink>>(initialSocialLinks || {})
  const [currentPaymentMethods, setCurrentPaymentMethods] = useState<{ type: string; visible: boolean; details?: any }[]>(initialPaymentMethods || [])
  
  // Original state for change detection (initialize with server data)
  const [originalProfileData, setOriginalProfileData] = useState<any>(initialProfileData || {})
  const [originalProfileSettings, setOriginalProfileSettings] = useState<any>(initialProfileSettings || {})
  const [originalSocialLinks, setOriginalSocialLinks] = useState<Record<string, SocialLink>>(initialSocialLinks || {})
  const [originalPaymentMethods, setOriginalPaymentMethods] = useState<{ type: string; visible: boolean; details?: any }[]>(initialPaymentMethods || [])
  
  // UI state
  const [saving, setSaving] = useState<string | null>(null)
  const [loading, setLoading] = useState(false) // Start with false since data is already loaded
  const [profileImgFile, setProfileImgFile] = useState<File | null>(null)
  const [coverImgFile, setCoverImgFile] = useState<File | null>(null)
  const [profileImgPreview, setProfileImgPreview] = useState<string | null>(null)
  const [coverImgPreview, setCoverImgPreview] = useState<string | null>(null)

  // Change detection functions
  const hasInfoChanges = useCallback(() => {
    return getChangedFields(originalProfileData, currentProfileData) !== null
  }, [originalProfileData, currentProfileData])

  const hasSettingsChanges = useCallback(() => {
    return getChangedFields(originalProfileSettings, currentProfileSettings) !== null
  }, [originalProfileSettings, currentProfileSettings])

  const hasLinksChanges = useCallback(() => {
    return getChangedFields(originalSocialLinks, currentSocialLinks) !== null
  }, [originalSocialLinks, currentSocialLinks])

  const hasPaymentsChanges = useCallback(() => {
    return getChangedFields(originalPaymentMethods, currentPaymentMethods) !== null
  }, [originalPaymentMethods, currentPaymentMethods])

  const hasImageChanges = useCallback(() => {
    return profileImgFile !== null || coverImgFile !== null
  }, [profileImgFile, coverImgFile])

  // Input handlers
  const handleInputChange = (field: string, value: string) => {
    setCurrentProfileData((prev: Record<string, any>) => ({ ...prev, [field]: value }))
  }

  const handleSettingToggle = (setting: string) => {
    setCurrentProfileSettings((prev: Record<string, any>) => ({ ...prev, [setting]: !prev[setting] }))
  }

  const handleDefaultPageChange = (value: string) => {
    setCurrentProfileSettings((prev: Record<string, any>) => ({ ...prev, default_page: value }))
  }

  const handleFontChange = (font: string) => {
    setCurrentProfileSettings((prev: Record<string, any>) => ({ ...prev, theme_font: font }))
  }

  const handleColorChange = (key: string, value: string) => {
    setCurrentProfileSettings((prev: Record<string, any>) => ({ ...prev, [key]: value }))
  }

  const handleSocialLinkChange = (platform: string, link: SocialLink) => {
    setCurrentSocialLinks((prev: Record<string, SocialLink>) => ({ ...prev, [platform]: link }))
  }

  const handleEmailsChange = (emails: string[] | { value: string }[]) => {
    setCurrentProfileData((prev: Record<string, any>) => ({ ...prev, business_emails: emails }))
  }

  const handlePhonesChange = (phones: string[] | { value: string }[]) => {
    setCurrentProfileData((prev: Record<string, any>) => ({ ...prev, business_phones: phones }))
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
    
    const changes = getChangedFields(originalProfileData, currentProfileData);
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
        setOriginalProfileData(JSON.parse(JSON.stringify(currentProfileData)));
      } else {
        const { userMessage, technicalMessage } = await parseApiError(res)
        showToast({
          type: "error",
          title: t("toasts.error.saveFailed.title"),
          message: userMessage || t("toasts.error.saveFailed.message"),
          technicalDetails: technicalMessage,
          duration: 8000
        })
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Network Error",
        message: "Failed to connect to server. Please check your connection.",
        duration: 6000
      })
    } finally {
      setSaving(null);
    }
  };

  const saveLinks = async () => {
    if (!currentBusiness) return;
    
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
      links: Object.entries(currentSocialLinks).map(([type, { url, visible }]) => ({ 
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
        setOriginalSocialLinks(JSON.parse(JSON.stringify(currentSocialLinks)));
      } else {
        const { userMessage, technicalMessage } = await parseApiError(res)
        showToast({
          type: "error",
          title: t("toasts.error.saveFailed.title"),
          message: userMessage || t("toasts.error.saveFailed.message"),
          technicalDetails: technicalMessage,
          duration: 8000
        })
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Network Error",
        message: "Failed to connect to server. Please check your connection.",
        duration: 6000
      })
    } finally {
      setSaving(null);
    }
  };

  const savePayments = async () => {
    if (!currentBusiness) return;
    
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
        body: JSON.stringify({ payments: currentPaymentMethods }),
      });
      
      if (res.ok) {
        showToast({
          type: "success",
          title: t("toasts.success.payments.title"),
          message: t("toasts.success.payments.message"),
          duration: 4000
        })
        setOriginalPaymentMethods(JSON.parse(JSON.stringify(currentPaymentMethods)));
      } else {
        const { userMessage, technicalMessage } = await parseApiError(res)
        showToast({
          type: "error",
          title: t("toasts.error.saveFailed.title"),
          message: userMessage || t("toasts.error.saveFailed.message"),
          technicalDetails: technicalMessage,
          duration: 8000
        })
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Network Error",
        message: "Failed to connect to server. Please check your connection.",
        duration: 6000
      })
    } finally {
      setSaving(null);
    }
  };

  const saveSettings = async () => {
    if (!currentBusiness) return;
    
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
    
    const changes = getChangedFields(originalProfileSettings, currentProfileSettings);
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
        setOriginalProfileSettings(JSON.parse(JSON.stringify(currentProfileSettings)));
      } else {
        const { userMessage, technicalMessage } = await parseApiError(res)
        showToast({
          type: "error",
          title: t("toasts.error.saveFailed.title"),
          message: userMessage || t("toasts.error.saveFailed.message"),
          technicalDetails: technicalMessage,
          duration: 8000
        })
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Network Error",
        message: "Failed to connect to server. Please check your connection.",
        duration: 6000
      })
    } finally {
      setSaving(null);
    }
  };

  const saveImages = async () => {
    if (!currentBusiness) return;
    
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
          setCurrentProfileData(data.profileData || {});
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
      }
    } catch (error) {
      showToast({
        type: "error",
        title: t("toasts.error.networkError.title"),
        message: t("toasts.error.networkError.message"),
        duration: 8000
      })
    } finally {
      setSaving(null);
    }
  };

  // Navigation - now uses state instead of router.push
  const handleTabClick = (tabId: string) => {
    setSection(tabId);
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
      <div className="max-w-7xl mx-auto p-2pm">
        {/* Header */}
        <div className="flex flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className={`text-xl lg:text-2xl font-bold ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>{t("title")}</h1>
          </div>
          <div>
            <a 
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 font-medium transition-colors"
            >
              {t("openProfile")}
            </a>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className={`rounded-lg p-2 mb-8 ${
          theme === 'dark' ? 'bg-zinc-700' : 'bg-zinc-200'
        }`}>
          <nav className="flex justify-between overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = section === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center space-x-2 py-3 px-4 rounded-md font-medium text-sm whitespace-nowrap transition-colors flex-1 ${
                    isActive
                      ? theme === 'dark' 
                        ? "bg-zinc-600 text-gray-100 shadow-sm" 
                        : "bg-zinc-200 text-gray-900 shadow-sm"
                      : theme === 'dark'
                        ? "text-gray-300"
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
        <div className="flex flex-col lg:flex-row justify-between gap-8">
          {/* Left Column - Content Area */}
          <div className="max-w-2xl w-full">
            {/* Tab Content */}
            {section === "info" && (
              <>
                <ProfileInfoSection profileData={currentProfileData} onChange={handleInputChange} />
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
                  profileImg={profileImgPreview || currentProfileData?.business_img_profile}
                  coverImg={coverImgPreview || currentProfileData?.business_img_cover}
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
                <ProfileLinksSection socialLinks={currentSocialLinks} onChange={handleSocialLinkChange} />
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
                <ProfilePaymentMethodsSection paymentMethods={currentPaymentMethods} onChange={setCurrentPaymentMethods} />
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
                  profileSettings={currentProfileSettings}
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
                  profileSettings={currentProfileSettings}
                  onFontChange={handleFontChange}
                  onColorChange={handleColorChange}
                  businessName={currentProfileData?.business_name}
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
              <div className={`h-full p-4 border rounded-xl flex flex-col ${
                theme === 'dark' 
                  ? 'bg-gradient-to-br from-gray-600 to-gray-700 border-gray-600' 
                  : 'bg-gradient-to-br from-gray-300 to-gray-400 border-gray-200'
              }`}>
                <div className="flex-1 flex items-center justify-center">
                  <ProfilePreview
                    profileData={currentProfileData}
                    profileSettings={currentProfileSettings}
                    profileImg={profileImgPreview || currentProfileData?.business_img_profile}
                    coverImg={coverImgPreview || currentProfileData?.business_img_cover}
                    businessName={currentProfileData?.business_name}
                    socialLinks={currentSocialLinks}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


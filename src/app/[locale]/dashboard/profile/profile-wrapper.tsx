'use client'

import { useState, useCallback } from "react"
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
  User as UserIcon,
  Image as PhotoIcon,
  Link as LinkIcon,
  CreditCard as CreditCardIcon,
  Cog as Cog6ToothIcon,
  Palette as SwatchIcon,
  Share2 as ShareIcon,
  X as XMarkIcon,
  Globe2 as GlobeAltIcon
} from "lucide-react"

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
  
  // Section state for client-side navigation
  const [section, setSection] = useState(initialSection)
  
  const t = useTranslations("profile")
  const tCommon = useTranslations("Common")
  const { showToast } = useToaster()
  
  
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
  const [clearImagePreviews, setClearImagePreviews] = useState<(() => void) | null>(null)
  
  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

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

  const handleCoverImgChange = async (mobileFile: File, desktopFile: File, mobilePreviewUrl: string, desktopPreviewUrl: string) => {
    setCoverImgFile(mobileFile) // Store mobile file as main cover file (API expects this)
    setCoverImgPreview(mobilePreviewUrl)
  }

  const handlePreviewsReady = (clearPreviews: () => void) => {
    setClearImagePreviews(() => clearPreviews)
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
        duration: 5000
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
          title: "", // No title for success
          message: t("toasts.success.message"),
          duration: 8000
        })
        setOriginalProfileData(JSON.parse(JSON.stringify(currentProfileData)));
      } else {
        const { userMessage, technicalMessage } = await parseApiError(res)
        showToast({
          type: "error",
          title: t("toasts.error.title"),
          message: technicalMessage || userMessage || t("toasts.error.saveFailed.message"),
          duration: 10000
        })
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "There was a problem",
        message: t("toasts.error.networkError.message"),
        duration: 8000
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
        duration: 5000
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
          title: "", // No title for success
          message: t("toasts.success.message"),
          duration: 8000
        })
        setOriginalSocialLinks(JSON.parse(JSON.stringify(currentSocialLinks)));
      } else {
        const { userMessage, technicalMessage } = await parseApiError(res)
        showToast({
          type: "error",
          title: t("toasts.error.title"),
          message: technicalMessage || userMessage || t("toasts.error.saveFailed.message"),
          duration: 10000
        })
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "There was a problem",
        message: t("toasts.error.networkError.message"),
        duration: 8000
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
        duration: 5000
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
          title: "", // No title for success
          message: t("toasts.success.message"),
          duration: 8000
        })
        setOriginalPaymentMethods(JSON.parse(JSON.stringify(currentPaymentMethods)));
      } else {
        const { userMessage, technicalMessage } = await parseApiError(res)
        showToast({
          type: "error",
          title: t("toasts.error.title"),
          message: technicalMessage || userMessage || t("toasts.error.saveFailed.message"),
          duration: 10000
        })
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "There was a problem",
        message: t("toasts.error.networkError.message"),
        duration: 8000
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
        duration: 5000
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
          title: "", // No title for success
          message: t("toasts.success.message"),
          duration: 8000
        })
        setOriginalProfileSettings(JSON.parse(JSON.stringify(currentProfileSettings)));
      } else {
        const { userMessage, technicalMessage } = await parseApiError(res)
        showToast({
          type: "error",
          title: t("toasts.error.title"),
          message: technicalMessage || userMessage || t("toasts.error.saveFailed.message"),
          duration: 10000
        })
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "There was a problem",
        message: t("toasts.error.networkError.message"),
        duration: 8000
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
        duration: 5000
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
        
        // Clear image previews in ProfileImageSection
        if (clearImagePreviews) {
          clearImagePreviews();
        }
        
        showToast({
          type: "success",
          title: "", // No title for success
          message: t("toasts.success.message"),
          duration: 8000
        })
      } else {
        const { userMessage, technicalMessage } = await parseApiError(res)
        showToast({
          type: "error",
          title: t("toasts.error.title"),
          message: technicalMessage || userMessage || t("toasts.error.uploadFailed.message"),
          duration: 10000
        })
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "There was a problem",
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

  // Share functionality
  const publicUrl = currentBusiness ? `https://quevo.vercel.app/${currentBusiness.business_public_uuid}` : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setIsAnimating(true);
      setTimeout(() => {
        setCopied(false);
        setIsAnimating(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handleOpen = () => {
    window.open(`${publicUrl}`, "_blank");
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
    return IconComponent ? <IconComponent className="h-5 w-5" strokeWidth={1} /> : null;
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
      <div className="max-w-[1600px] mx-auto">
        {/* Top Navbar (simulated) */}
        <div className="sticky top-0 z-10 px-6 py-4 lg:py-2 rounded-2xl mb-3 bg-[var(--dashboard-bg-primary)] border border-[var(--dashboard-border-primary)]">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-medium text-[var(--dashboard-text-primary)]">Profile</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleOpen}
                className="text-xs lg:text-sm text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] transition-colors flex items-center gap-1"
                title="Open Public Profile"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>Open</span>
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="text-xs lg:text-sm text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] transition-colors flex items-center gap-1"
                title="Share Link"
              >
                <ShareIcon className="w-3 h-3" strokeWidth={1} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="rounded-lg p-2 mb-3 bg-[var(--dashboard-bg-primary)] border border-[var(--dashboard-border-primary)]">
          <nav className="flex justify-between overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = section === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center space-x-2 py-3 px-4 rounded-md font-medium text-sm whitespace-nowrap transition-all duration-200 flex-1 border-b-2 ${
                    isActive
                      ? "bg-[var(--dashboard-bg-secondary)] text-[var(--dashboard-text-primary)] border-b-[var(--dashboard-border-primary)]" 
                      : "text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:bg-[var(--dashboard-bg-tertiary)] border-b-transparent hover:border-b-[var(--dashboard-border-secondary)]"
                  }`}
                >
                  {renderTabIcon(tab.icon, isActive)}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Wrapper with Background */}
        <div className="bg-[var(--dashboard-bg-primary)] rounded-2xl border border-[var(--dashboard-border-primary)] p-4 lg:p-8">
        
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row justify-between gap-8">
          {/* Left Column - Content Area */}
          <div className="max-w-5xl w-full">
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
                  coverImgMobile={coverImgPreview || currentProfileData?.business_img_cover_mobile}
                  coverImgDesktop={currentProfileData?.business_img_cover_desktop}
                  onProfileImgChange={handleProfileImgChange}
                  onCoverImgChange={handleCoverImgChange}
                  onPreviewsReady={handlePreviewsReady}
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
          <div className="w-full flex-shrink-1">
            <div className="lg:sticky lg:top-6 lg:h-full">
              <div className="h-full p-4 border rounded-xl flex flex-col bg-gradient-to-br from-[var(--dashboard-bg-tertiary)] to-[var(--dashboard-bg-secondary)] border-[var(--dashboard-border-primary)]">
                <div className="flex-1 flex items-center justify-center">
                  <ProfilePreview
                    profileData={currentProfileData}
                    profileSettings={currentProfileSettings}
                    profileImg={profileImgPreview || currentProfileData?.business_img_profile}
                    coverImg={coverImgPreview || currentProfileData?.business_img_cover_mobile}
                    businessName={currentProfileData?.business_name}
                    socialLinks={currentSocialLinks}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Share Link Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full rounded-lg shadow-xl bg-[var(--dashboard-bg-card)] text-[var(--dashboard-text-primary)]">
            <div className="flex items-center justify-between p-6 border-b border-[var(--dashboard-border-primary)]">
              <h3 className="text-lg font-semibold">Share Your Business Link</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 rounded-lg transition-colors text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:bg-[var(--dashboard-bg-tertiary)]"
              >
                <XMarkIcon className="h-5 w-5" strokeWidth={1} />
              </button>
            </div>
            <div className="p-6">
              <div className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 shadow-sm border mb-4 bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)] border-[var(--dashboard-border-primary)] transition-all duration-300 relative overflow-hidden ${
                isAnimating ? 'animate-pill-shine' : ''
              }`}>
                <GlobeAltIcon className="w-5 h-5 text-blue-600 flex-shrink-0" strokeWidth={1} />
                <span className="text-sm break-all">{publicUrl}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-all duration-300 flex items-center justify-center gap-2 bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)] border-[var(--dashboard-border-primary)] hover:bg-[var(--dashboard-bg-secondary)] hover:text-[var(--dashboard-text-primary)] ${
                    copied ? 'text-green-600 border-green-200 bg-green-50' : ''
                  }`}
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4 animate-checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleOpen}
                  className="px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)] border-[var(--dashboard-border-primary)] hover:bg-[var(--dashboard-bg-secondary)] hover:text-[var(--dashboard-text-primary)]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>Open</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}


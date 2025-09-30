import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useBusiness } from "@/lib/business-context"
import { signOut } from "next-auth/react"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import BusinessSelectionModal from "@/components/modals/BusinessSelectionModal"
import { getPlanColors, capitalizePlanName } from "@/lib/plan-colors"
import AnimatedLoadingBackground from "@/components/ui/AnimatedLoadingBackground"
import SupportButton from "@/components/ui/SupportButton"
import LocaleSwitcherButton from "@/components/ui/LocaleSwitcherButton"
import LocaleSelectModal from "@/components/ui/LocaleSelectModal"
import DashboardSupportModal from "@/components/modals/DashboardSupportModal"
import { useLocaleSwitcher } from "@/hooks/useLocaleSwitcher"
import { useTheme } from "@/contexts/ThemeProvider"
import { GlobeAltIcon } from "@heroicons/react/24/outline"
import CacheBusterWrapper from "./CacheBusterWrapper"
import { useBusinessSwitchTracker } from "@/hooks/useBusinessSwitchTracker"
import NavigationInterceptor from "./NavigationInterceptor"
import { useForceRefreshOnBusinessChange } from "@/hooks/useForceRefreshOnBusinessChange"
import { useAICredits } from "@/hooks/useAICredits"

import { 
  HomeIcon, 
  UserIcon, 
  WrenchScrewdriverIcon, 
  CubeIcon, 
  CalendarIcon, 
  CreditCardIcon,
  ChartBarIcon,
  DevicePhoneMobileIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  ClipboardDocumentListIcon,
  ClipboardDocumentIcon,
  Bars3Icon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  BellIcon,
  ShareIcon,
  UsersIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon
} from "@heroicons/react/24/outline"

interface DashboardLayoutProps {
  children: React.ReactNode
}

// Utility function to get profile image URL following the same pattern as business layout
const getProfileImageUrl = (business: any) => {
  const R2_PUBLIC_DOMAIN = "https://pub-eac238aed876421982e277e0221feebc.r2.dev";
  
  // Use local path if business_img_profile is empty/undefined, otherwise use R2 predefined path
  return !business?.business_img_profile 
    ? `/uploads/business/${business?.business_public_uuid}/profile.webp`
    : `${R2_PUBLIC_DOMAIN}/business/${business?.business_public_uuid}/profile.webp`;
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations("dashboard")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showBusinessModal, setShowBusinessModal] = useState(false)
  const [showSupportModal, setShowSupportModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const { currentBusiness, businesses, switchBusiness, loading, userManager, businessSwitchKey } = useBusiness()
  const { isModalOpen, setIsModalOpen, currentLocale, availableLocales, switchLocale } = useLocaleSwitcher()
  const { theme, toggleTheme } = useTheme()
  const { creditsStatus, loading: creditsLoading } = useAICredits(currentBusiness?.business_id || null)

  // Sync sidebar state with localStorage after hydration
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed') === 'true'
    if (savedState !== isSidebarCollapsed) {
      setIsSidebarCollapsed(savedState)
    }
  }, [])

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserDropdown) {
        const target = event.target as Element
        if (!target.closest('.user-dropdown-container')) {
          setShowUserDropdown(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserDropdown])
  
  // Debug logging
  console.log("DashboardLayout: currentBusiness:", currentBusiness)
  console.log("DashboardLayout: currentBusiness.plan:", currentBusiness?.plan)
  
  // Initialize business switch tracker
  useBusinessSwitchTracker()
  
  // Force refresh on business change
  useForceRefreshOnBusinessChange()
  
  // Domain state to avoid hydration mismatch
  const [DOMAIN, setDOMAIN] = useState("https://quevo.vercel.app")
  
  // Set the correct domain after component mounts
  useEffect(() => {
    const isLocalhost = window.location.hostname.includes("localhost")
    setDOMAIN(isLocalhost ? "http://localhost:3000" : "https://quevo.vercel.app")
  }, [])

  if (loading) {
    return (
      <AnimatedLoadingBackground>
        <div className="text-center">
          <LoadingSpinner size="xl" color="blue" />
        </div>
      </AnimatedLoadingBackground>
    )
  }

  // If no businesses at all, don't show any UI while redirecting
  if (!loading && userManager && (!businesses || businesses.length === 0)) {
    return null
  }

  // If there are businesses but none selected, show the select business UI
  if (!currentBusiness && businesses && businesses.length > 0) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t("selectBusiness")}</h2>
          <Link
            href="/dashboard/select-business"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {t("selectBusiness") || "Select Business"}
          </Link>
        </div>
      </div>
    )
  }

  // If no current business selected (and no businesses exist), show create business UI
  if (!currentBusiness) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t("noBusiness")}</h2>
          <Link
            href="/onboarding"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {t("createBusiness") || "Create Business"}
          </Link>
        </div>
      </div>
    )
  }

  const businessName = currentBusiness.business_name || "Business"
  const businessImage = currentBusiness.business_img_profile
  const businessUrlName = currentBusiness.business_urlname || ""

  const navigationItems = [
    { href: "/dashboard", label: t("nav.home") || "Home", icon: HomeIcon },
    { href: "/dashboard/profile", label: t("nav.profile") || "Profilo", icon: UserIcon },
    { href: "/dashboard/services", label: t("nav.services") || "Servizi", icon: WrenchScrewdriverIcon },
    { href: "/dashboard/service-requests", label: t("nav.serviceRequests") || "Richieste Servizi", icon: ClipboardDocumentListIcon },
    { href: "/dashboard/support-requests", label: t("nav.supportRequests") || "Support Requests", icon: ChatBubbleLeftRightIcon },
    { href: "/dashboard/service-boards", label: t("nav.serviceBoards") || "Bacheche Servizi", icon: ClipboardDocumentIcon },
    { href: "/dashboard/appointments", label: t("nav.appointments") || "Appuntamenti", icon: CalendarIcon },
    { href: "/dashboard/clients", label: t("nav.clients") || "Clients", icon: UsersIcon },
    { href: "/dashboard/marketing", label: t("nav.marketing") || "Marketing", icon: ShareIcon, comingSoon: true },
    { href: "/dashboard/marketing-email-assistant", label: t("nav.marketingEmailAssistant") || "Email Assistant", icon: EnvelopeIcon, comingSoon: true },
  ]

  const handleLogout = async () => {
    try {
      // Clear all session storage
      sessionStorage.clear()
      
      // Clear all cookies related to the application
      const cookies = document.cookie.split(";")
      cookies.forEach(cookie => {
        const eqPos = cookie.indexOf("=")
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
        // Clear all cookies except essential ones like locale
        if (name && !name.startsWith('next-i18next') && !name.startsWith('NEXT_LOCALE')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        }
      })
      
      // Clear local storage if needed
      localStorage.clear()
      
      // Sign out from NextAuth and redirect to signin/business page
      await signOut({ 
        callbackUrl: `/${currentLocale}/signin/business`,
        redirect: true
      })
    } catch (error) {
      console.error("Error during logout:", error)
      // Fallback to simple signOut if cleanup fails
      await signOut({ callbackUrl: `/${currentLocale}/signin/business` })
    }
  }

  const handleSupportRequest = () => {
    setShowSupportModal(true)
  }

  // Public link format: DOMAIN/business_urlname
  const publicUrl = `${DOMAIN}/${currentBusiness?.business_urlname || ""}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      setIsAnimating(true)
      setTimeout(() => setCopied(false), 2000)
      setTimeout(() => setIsAnimating(false), 300)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  const handleOpen = () => {
    window.open(`${publicUrl}`, "_blank")
  }

  const getManagerFullName = () => {
    if (!userManager) return ""
    const firstName = userManager.name_first || ""
    const lastName = userManager.name_last || ""
    return `${firstName} ${lastName}`.trim()
  }

  const getBusinessInitial = () => {
    return businessName.charAt(0).toUpperCase()
  }

  const getUserInitial = () => {
    if (!userManager) return ""
    const firstName = userManager.name_first || ""
    const lastName = userManager.name_last || ""
    const firstInitial = firstName.charAt(0).toUpperCase()
    const lastInitial = lastName.charAt(0).toUpperCase()
    return firstInitial + lastInitial
  }

  // Helper function to toggle sidebar and persist state
  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed
    setIsSidebarCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', newState.toString())
  }

  // Helper function to check if a navigation item is active
  const isActiveLink = (href: string) => {
    console.log('Checking active link:', { href, pathname, currentLocale })
    
    // Remove locale prefix from pathname for comparison
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '')
    
    // Special case for dashboard home
    if (href === "/dashboard") {
      return pathWithoutLocale === "/dashboard"
    }
    // For other routes, check if pathname starts with the href
    return pathWithoutLocale.startsWith(href)
  }

  // Helper function to get the current active section title
  const getCurrentSectionTitle = () => {
    // Remove locale prefix from pathname for comparison
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '')
    
    // Find the active navigation item
    const activeItem = navigationItems.find(item => isActiveLink(item.href))
    
    if (activeItem) {
      return activeItem.label
    }
    
    // Fallback for specific routes not in navigationItems
    const routeTitleMap: Record<string, string> = {
      '/dashboard/plan': t("nav.plan") || "Plan",
      '/dashboard/quotation-generator': t("nav.quotationGenerator") || "Quotation Generator",
      '/dashboard/select-business': t("nav.selectBusiness") || "Select Business",
    }
    
    return routeTitleMap[pathWithoutLocale] || t("nav.home") || "Home"
  }

  return (
    <>
      <NavigationInterceptor />
      <div className="min-h-screen lg:grid lg:grid-cols-[auto_1fr] lg:gap-6 lg:px-6 lg:py-4 bg-[var(--dashboard-bg-secondary)]">
        {/* Desktop Sidebar */}
        <aside className={`hidden lg:flex lg:flex-col rounded-xl transition-all duration-300 relative lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:max-h-[calc(100vh-2rem)] lg:will-change-transform ${
          isSidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
        }`} style={{ transform: 'translateZ(0)' }}>
          <div className={`flex flex-col h-full ${isSidebarCollapsed ? 'px-1.5 pt-2 pb-2' : 'px-3 py-2'}`}>
            {/* App Logo and Name Placeholder */}
            <div className="flex items-center mb-2">
                <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-600 to-gray-700 flex items-center justify-center">
                  <span className="text-white text-lg font-bold">Q</span>
                  </div>
                  {!isSidebarCollapsed && (
                    <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-base lg:text-lg text-[var(--dashboard-text-primary)]">Quevo</h2>
                    </div>
                  )}
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 overflow-y-auto min-h-0">
              <ul className="space-y-0.5">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center rounded-md p-1.5 text-xs md:text-sm leading-tight transition-all duration-200 ${
                          isSidebarCollapsed ? 'justify-center' : 'gap-x-3'
                        } ${
                          isActiveLink(item.href)
                            ? "bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-primary)] border border-[var(--dashboard-border-primary)]"
                            : "text-[var(--dashboard-text-secondary)] hover:bg-[var(--dashboard-bg-tertiary)] hover:text-[var(--dashboard-text-primary)]"
                        }`}
                        title={isSidebarCollapsed ? item.label : undefined}
                      >
                        <IconComponent className="h-5 w-5 flex-shrink-0" />
                        {!isSidebarCollapsed && (
                          <>
                            <span className="flex-1">{item.label}</span>
                            {item.comingSoon && (
                              <span className="text-[10px] px-1 py-0 rounded bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)]">
                                Coming Soon
                              </span>
                            )}
                          </>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* AI Credits, Theme Toggle, and Locale Switcher */}
            <div className="mt-auto flex-shrink-0 pt-2 pb-2">
              {!isSidebarCollapsed ? (
                <div className="flex flex-col gap-3">
                  {/* Quick Actions Links */}
                  <nav className="mb-2">
                    <ul className="space-y-0.5">
                      <li>
                        <button
                          onClick={handleSupportRequest}
                          className="flex items-center gap-x-3 rounded-md p-1 text-xs md:text-sm leading-tight transition-all duration-200 w-full text-left text-[var(--dashboard-text-secondary)] hover:bg-[var(--dashboard-bg-tertiary)] hover:text-[var(--dashboard-text-primary)]"
                        >
                          <ChatBubbleLeftRightIcon className="h-5 w-5 flex-shrink-0" />
                          <span>Support</span>
                        </button>
                      </li>
                      <li>
                    <button
                          onClick={() => setShowSettingsModal(true)}
                          className="flex items-center gap-x-3 rounded-md p-1 text-xs md:text-sm leading-tight transition-all duration-200 w-full text-left text-[var(--dashboard-text-secondary)] hover:bg-[var(--dashboard-bg-tertiary)] hover:text-[var(--dashboard-text-primary)]"
                        >
                          <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Settings</span>
                        </button>
                      </li>
                    </ul>
                  </nav>

                  {/* Business Plan and Credits Card */}
                  {currentBusiness && (
                    <div className="rounded-lg border bg-[var(--dashboard-bg-tertiary)] border-[var(--dashboard-border-primary)]">
                      {/* Header */}
                      <div className="flex items-center justify-between gap-3 px-4 py-3">
                        {/* Left - Profile Image, Business Name, Actions, and Plan Badge */}
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-zinc-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {(currentBusiness?.business_img_profile || currentBusiness?.business_public_uuid) ? (
                              <img
                                src={getProfileImageUrl(currentBusiness)}
                                alt={businessName}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = "none"
                                  target.nextElementSibling?.classList.remove("hidden")
                                }}
                              />
                            ) : null}
                            <span className={`text-white text-xs font-medium ${(currentBusiness?.business_img_profile || currentBusiness?.business_public_uuid) ? "hidden" : ""}`}>
                              {getBusinessInitial()}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-medium text-[var(--dashboard-text-primary)] truncate">{businessName}</span>
                            </div>
                            {/* Plan Badge, Manage Button, and Action Buttons under Business Name */}
                            <div className="flex items-center gap-2 mt-1">
                              {currentBusiness.plan ? (() => {
                                const planColors = getPlanColors(currentBusiness.plan.plan_name);
                                return (
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase whitespace-nowrap ${planColors.gradient} ${planColors.textColor}`}>
                                    {planColors.showStar && (
                                      <svg className="w-2 h-2 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    )}
                                    {capitalizePlanName(currentBusiness.plan.plan_name)}
                                  </span>
                                );
                              })() : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase whitespace-nowrap bg-black text-white">No Plan</span>
                              )}
                              <Link 
                                href="/dashboard/plan" 
                                className="px-2 py-0.5 rounded text-[10px] font-medium transition-colors border bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)] border-[var(--dashboard-border-primary)] hover:bg-[var(--dashboard-bg-secondary)] hover:text-[var(--dashboard-text-primary)]"
                              >
                                Manage
                              </Link>
                              {/* Action Buttons (Open, Share) */}
                              <div className="flex items-center gap-0">
                                <button
                                  onClick={handleOpen}
                                  className="p-1 text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] transition-colors"
                                  title="Open Public Profile"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => setShowShareModal(true)}
                                  className="p-1 text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] transition-colors"
                                  title="Share Link"
                                >
                                  <ShareIcon className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right - Toggle Button */}
                        <div className="flex items-center">
                          <button
                            onClick={() => setShowBusinessModal(true)}
                            className="p-2 text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:bg-[var(--dashboard-bg-secondary)] rounded-lg transition-colors"
                            title="Change Business"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-[var(--dashboard-border-primary)]">
                        {/* AI Credits Label Left */}
                        <div className="flex items-center gap-2">
                          <SparklesIcon className="w-4 h-4 text-blue-500" />
                          <span className="text-xs text-[var(--dashboard-text-secondary)]">AI Credits</span>
                        </div>
                        {/* AI Credits Value Right */}
                        <span className="text-sm font-medium text-[var(--dashboard-text-primary)] ml-auto">
                          {creditsLoading ? (
                            <span className="inline-block w-8 h-4 bg-gray-200 rounded animate-pulse"></span>
                          ) : (
                            creditsStatus?.creditsAvailable ?? 0
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* User Info - No Card Appearance */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative user-dropdown-container">
                        <button
                          onClick={() => setShowUserDropdown(!showUserDropdown)}
                          className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden flex-shrink-0 hover:bg-blue-700 transition-colors"
                          title="Account"
                        >
                          <span className="text-white text-sm font-medium">{getUserInitial()}</span>
                        </button>
                        {showUserDropdown && (
                          <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--dashboard-bg-card)] border border-[var(--dashboard-border-primary)] rounded-lg shadow-lg z-50">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  handleLogout()
                                  setShowUserDropdown(false)
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-[var(--dashboard-text-primary)] hover:bg-[var(--dashboard-bg-tertiary)] flex items-center gap-2"
                              >
                                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                                {t("nav.logout") || "Logout"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-base truncate text-[var(--dashboard-text-primary)]">{getManagerFullName()}</p>
                        {currentBusiness && currentBusiness.plan && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-[var(--dashboard-text-secondary)]">Plan:</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${(() => {
                              const planColors = getPlanColors(currentBusiness.plan.plan_name);
                              return `${planColors.gradient} ${planColors.textColor}`;
                            })()}`}>
                              {(() => {
                                const planColors = getPlanColors(currentBusiness.plan.plan_name);
                                return planColors.showStar && (
                                  <svg className="w-2 h-2 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                );
                              })()}
                              {capitalizePlanName(currentBusiness.plan.plan_name)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className="p-1 text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] transition-colors"
                      title="Account Menu"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  {/* Business Plan and Credits - Collapsed Compact Card */}
                  {currentBusiness && (
                    <div className="w-full px-2 py-2 rounded-lg border bg-[var(--dashboard-bg-tertiary)] border-[var(--dashboard-border-primary)]">
                      <div className="flex items-center justify-center">
                        <div className="h-6 w-6 rounded-full bg-zinc-600 flex items-center justify-center overflow-hidden">
                          {(currentBusiness?.business_img_profile || currentBusiness?.business_public_uuid) ? (
                            <img
                              src={getProfileImageUrl(currentBusiness)}
                              alt={businessName}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = "none"
                                target.nextElementSibling?.classList.remove("hidden")
                              }}
                            />
                          ) : null}
                          <span className={`text-white text-xs font-medium ${(currentBusiness?.business_img_profile || currentBusiness?.business_public_uuid) ? "hidden" : ""}`}>
                            {getBusinessInitial()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* User Info - Collapsed (moved below business plan card) */}
                  <div className="w-full flex justify-center">
                    <button
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden hover:bg-blue-700 transition-colors"
                      title={getManagerFullName()}
                    >
                      <span className="text-white text-sm font-medium">{getUserInitial()}</span>
                    </button>
                    {showUserDropdown && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--dashboard-bg-card)] border border-[var(--dashboard-border-primary)] rounded-lg shadow-lg z-50">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              handleLogout()
                              setShowUserDropdown(false)
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-[var(--dashboard-text-primary)] hover:bg-[var(--dashboard-bg-tertiary)] flex items-center gap-2"
                          >
                            <ArrowRightOnRectangleIcon className="h-4 w-4" />
                            {t("nav.logout") || "Logout"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Collapsed Utilities: Support and Settings */}
                  <div className="flex items-center justify-center gap-2 w-full">
                    <button 
                      onClick={handleSupportRequest}
                      className="p-2 rounded-lg transition-colors text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:bg-[var(--dashboard-bg-tertiary)]"
                      title="Support"
                    >
                      <ChatBubbleLeftRightIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setShowSettingsModal(true)}
                      className="p-2 rounded-lg transition-colors text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:bg-[var(--dashboard-bg-tertiary)]"
                      title="Settings"
                    >
                      <Cog6ToothIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Sidebar Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="absolute top-2 -right-2 z-20 w-6 h-12 bg-[var(--dashboard-bg-secondary)] dark:bg-[var(--dashboard-bg-tertiary)] border border-[var(--dashboard-border-primary)] dark:border-[var(--dashboard-border-secondary)] rounded-lg items-center justify-center transition-all duration-300 hover:bg-[var(--dashboard-bg-tertiary)] dark:hover:bg-[var(--dashboard-bg-secondary)] shadow-md flex text-[var(--dashboard-text-secondary)] dark:text-[var(--dashboard-text-primary)]"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg 
              className={`w-3 h-3 transition-transform duration-300 ${
                isSidebarCollapsed ? 'rotate-0' : 'rotate-180'
              }`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-70" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        {/* Mobile Sidebar */}
        <div 
          className="lg:hidden fixed inset-x-0 z-50 h-screen transition-all duration-300 ease-in-out"
          style={{ 
            bottom: isMobileMenuOpen ? '0' : '-100vh'
          }}
        >
          <div className="flex h-full flex-col px-6 py-6 bg-[var(--dashboard-bg-secondary)]">
            {/* Close Button */}
            <div className="flex justify-end mb-4 relative">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-0 right-0 p-2 rounded-lg transition-colors text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:bg-[var(--dashboard-bg-tertiary)]"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Business Info Card */}
            <div className="p-4 cursor-pointer transition-colors mb-4 hover:bg-[var(--dashboard-bg-tertiary)]" onClick={() => {
              setShowBusinessModal(true)
              setIsMobileMenuOpen(false)
            }}>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-zinc-600 flex items-center justify-center overflow-hidden">
                  {(currentBusiness?.business_img_profile || currentBusiness?.business_public_uuid) ? (
                    <img
                      src={getProfileImageUrl(currentBusiness)}
                      alt={businessName}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = "none"
                        target.nextElementSibling?.classList.remove("hidden")
                      }}
                    />
                  ) : null}
                  <span className={`text-white text-sm font-medium ${(currentBusiness?.business_img_profile || currentBusiness?.business_public_uuid) ? "hidden" : ""}`}>
                    {getBusinessInitial()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-sm truncate text-[var(--dashboard-text-primary)]">{businessName}</h2>
                </div>
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1">
              <ul className="space-y-0">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-x-3 rounded-md p-2 text-sm md:text-base leading-6 transition-all duration-200 ${
                          isActiveLink(item.href)
                            ? "bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-primary)] border border-[var(--dashboard-border-primary)]"
                            : "text-[var(--dashboard-text-secondary)] hover:bg-[var(--dashboard-bg-tertiary)] hover:text-[var(--dashboard-text-primary)]"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <IconComponent className="h-5 w-5" />
                        <span className="flex-1">{item.label}</span>
                        {item.comingSoon && (
                          <span className="text-[10px] px-1 py-0 rounded bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)]">
                            Coming Soon
                          </span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* AI Credits, Theme Toggle, and Locale Switcher */}
            <div className="mt-auto">
              <div className="flex flex-col gap-3">
                {/* AI Credits Block */}
                {currentBusiness && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-[var(--dashboard-bg-tertiary)] border-[var(--dashboard-border-primary)]">
                    <div className="flex items-center gap-2">
                      <SparklesIcon className="w-4 h-4 text-blue-500" />
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-[var(--dashboard-text-secondary)]">AI Credits</span>
                        <span className="text-sm font-medium text-[var(--dashboard-text-primary)]">
                          {creditsLoading ? (
                            <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
                          ) : (
                            creditsStatus?.creditsAvailable ?? 0
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              {/* Support, Locale Switcher and Theme Toggle - 3 Column Layout for Mobile */}
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => {
                    handleSupportRequest()
                    setIsMobileMenuOpen(false)
                  }}
                  className="p-2 rounded-lg transition-colors text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:bg-[var(--dashboard-bg-tertiary)] flex items-center justify-center"
                  title="Support"
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5" />
                </button>
                <LocaleSwitcherButton 
                  onClick={() => {
                    setIsModalOpen(true)
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full"
                />
                <div className="flex items-center gap-2">
                  <SunIcon className="h-4 w-4 text-[var(--dashboard-text-secondary)]" />
                  <button
                    onClick={() => {
                      toggleTheme()
                      setIsMobileMenuOpen(false)
                    }}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--dashboard-ring-primary)] focus:ring-offset-2 bg-[var(--dashboard-border-secondary)]"
                    title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                        theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                    <span className="sr-only">
                      {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    </span>
                  </button>
                  <MoonIcon className="h-4 w-4 text-[var(--dashboard-text-secondary)]" />
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Bar (Mobile) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 rounded-t-3xl shadow-lg border-t bg-[var(--dashboard-bg-secondary)] border-[var(--dashboard-border-primary)]">
          <div className="flex items-center justify-around px-4 py-2">
            {/* Essential Navigation Items */}
            <Link
              href="/dashboard/service-requests"
              className={`flex flex-col items-center p-1.5 rounded-lg transition-all duration-200 ${
                isActiveLink("/dashboard/service-requests")
                  ? "text-[var(--dashboard-text-primary)] bg-[var(--dashboard-bg-tertiary)] border border-[var(--dashboard-border-primary)]"
                  : "text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:bg-[var(--dashboard-bg-tertiary)]"
              }`}
            >
              <ClipboardDocumentListIcon className="h-5 w-5" />
              <span className="text-[10px] mt-0.5 font-normal">Requests</span>
            </Link>

            <Link
              href="/dashboard/appointments"
              className={`flex flex-col items-center p-1.5 rounded-lg transition-all duration-200 ${
                isActiveLink("/dashboard/appointments")
                  ? "text-[var(--dashboard-text-primary)] bg-[var(--dashboard-bg-tertiary)] border border-[var(--dashboard-border-primary)]"
                  : "text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:bg-[var(--dashboard-bg-tertiary)]"
              }`}
            >
              <CalendarIcon className="h-5 w-5" />
              <span className="text-[10px] mt-0.5 font-normal">Appointments</span>
            </Link>

            <Link
              href="/dashboard/services"
              className={`flex flex-col items-center p-1.5 rounded-lg transition-all duration-200 ${
                isActiveLink("/dashboard/services")
                  ? "text-[var(--dashboard-text-primary)] bg-[var(--dashboard-bg-tertiary)] border border-[var(--dashboard-border-primary)]"
                  : "text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:bg-[var(--dashboard-bg-tertiary)]"
              }`}
            >
              <WrenchScrewdriverIcon className="h-5 w-5" />
              <span className="text-[10px] mt-0.5 font-normal">Services</span>
            </Link>

            <Link
              href="/dashboard/service-boards"
              className={`flex flex-col items-center p-1.5 rounded-lg transition-all duration-200 ${
                isActiveLink("/dashboard/service-boards")
                  ? "text-[var(--dashboard-text-primary)] bg-[var(--dashboard-bg-tertiary)] border border-[var(--dashboard-border-primary)]"
                  : "text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:bg-[var(--dashboard-bg-tertiary)]"
              }`}
            >
              <ClipboardDocumentIcon className="h-5 w-5" />
              <span className="text-[10px] mt-0.5 font-normal">Boards</span>
            </Link>

            <Link
              href="/dashboard/profile"
              className={`flex flex-col items-center p-1.5 rounded-lg transition-all duration-200 ${
                isActiveLink("/dashboard/profile")
                  ? "text-[var(--dashboard-text-primary)] bg-[var(--dashboard-bg-tertiary)] border border-[var(--dashboard-border-primary)]"
                  : "text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:bg-[var(--dashboard-bg-tertiary)]"
              }`}
            >
              <UserIcon className="h-5 w-5" />
              <span className="text-[10px] mt-0.5 font-normal">Profile</span>
            </Link>


            {/* Sidebar Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex flex-col items-center p-1.5 rounded-lg transition-colors text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:bg-[var(--dashboard-bg-tertiary)]"
            >
              <Bars3Icon className="h-5 w-5" />
              <span className="text-[10px] mt-0.5 font-normal">Menu</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="min-w-0">
          <div className="rounded-2xl min-h-screen text-[var(--dashboard-text-primary)]">
            <CacheBusterWrapper>
              {children}
            </CacheBusterWrapper>
          </div>
        </main>

        {/* Business Selection Modal */}
        <BusinessSelectionModal 
          isOpen={showBusinessModal} 
          onClose={() => setShowBusinessModal(false)}
        />

        {/* Locale Selection Modal */}
        <LocaleSelectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentLocale={currentLocale}
          availableLocales={availableLocales}
          onLocaleSelect={switchLocale}
        />

        {/* Dashboard Support Modal */}
        <DashboardSupportModal
          isOpen={showSupportModal}
          onClose={() => setShowSupportModal(false)}
          businessId={currentBusiness?.business_id || ''}
        />

        {/* Settings Modal */}
        {showSettingsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="max-w-md w-full rounded-lg shadow-xl bg-[var(--dashboard-bg-card)] text-[var(--dashboard-text-primary)]">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Settings</h2>
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="p-2 hover:bg-[var(--dashboard-bg-tertiary)] rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Language Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-3">Language</label>
                    <LocaleSwitcherButton 
                      onClick={() => {
                        setIsModalOpen(true)
                        setShowSettingsModal(false)
                      }}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Theme Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-3">Theme</label>
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-[var(--dashboard-bg-tertiary)] border-[var(--dashboard-border-primary)]">
                      <div className="flex items-center gap-3">
                        <SunIcon className="h-5 w-5 text-[var(--dashboard-text-secondary)]" />
                        <span className="text-sm">Dark Mode</span>
                      </div>
                      <button
                        onClick={toggleTheme}
                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--dashboard-ring-primary)] focus:ring-offset-2 bg-[var(--dashboard-border-secondary)]"
                        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                            theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                        <span className="sr-only">
                          {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                <div className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 shadow-sm border mb-4 bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)] border-[var(--dashboard-border-primary)] transition-all duration-300 relative overflow-hidden ${
                  isAnimating ? 'animate-pill-shine' : ''
                }`}>
                  <GlobeAltIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
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
      </div>
    </>
  )
}

export default DashboardLayout

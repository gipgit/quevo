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
  ChatBubbleLeftRightIcon
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebarCollapsed') === 'true'
    }
    return false
  })
  const { currentBusiness, businesses, switchBusiness, loading, userPlan, userManager, businessSwitchKey } = useBusiness()
  const { isModalOpen, setIsModalOpen, currentLocale, availableLocales, switchLocale } = useLocaleSwitcher()
  const { theme, toggleTheme } = useTheme()
  
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

  return (
    <>
      <NavigationInterceptor />
      <div className="min-h-screen lg:grid lg:grid-cols-[auto_1fr] lg:gap-6 lg:px-6 lg:py-4 bg-[var(--dashboard-bg-secondary)]">
        {/* Desktop Sidebar */}
        <aside className={`hidden lg:flex lg:flex-col rounded-xl transition-all duration-300 relative lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:max-h-[calc(100vh-2rem)] lg:will-change-transform ${
          isSidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
        }`} style={{ transform: 'translateZ(0)' }}>
          {isSidebarCollapsed && (
            <button
              onClick={toggleSidebar}
              className="absolute top-2 right-2 z-10 p-2 rounded-lg transition-colors text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:bg-[var(--dashboard-bg-tertiary)]"
              title="Expand sidebar"
            >
              <Bars3Icon className="h-4 w-4" />
            </button>
          )}
          <div className={`flex flex-col h-full ${isSidebarCollapsed ? 'px-2 pt-9 pb-3' : 'px-4 py-3'}`}>
            {/* Business Info Card with Toggle Button */}
            <div className="flex items-center justify-between mb-2">
              <div className="rounded-lg p-1.5 cursor-pointer transition-colors hover:bg-[var(--dashboard-bg-tertiary)] flex-1" onClick={() => setShowBusinessModal(true)}>
                <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
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
                  {!isSidebarCollapsed && (
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-sm lg:text-base truncate text-[var(--dashboard-text-primary)]">{businessName}</h2>
                    </div>
                  )}
                </div>
              </div>
              {!isSidebarCollapsed && (
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-lg transition-colors text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:bg-[var(--dashboard-bg-tertiary)] ml-2"
                  title="Collapse sidebar"
                >
                  <Bars3Icon className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 overflow-y-auto min-h-0">
              <ul className="space-y-1">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center rounded-md p-1.5 text-sm md:text-base leading-6 transition-all duration-200 ${
                          isSidebarCollapsed ? 'justify-center' : 'gap-x-3'
                        } ${
                          isActiveLink(item.href)
                            ? "bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-primary)] shadow-md border border-[var(--dashboard-border-primary)]"
                            : "text-[var(--dashboard-text-secondary)] hover:bg-[var(--dashboard-bg-tertiary)] hover:text-[var(--dashboard-text-primary)]"
                        }`}
                        title={isSidebarCollapsed ? item.label : undefined}
                      >
                        <IconComponent className="h-5 w-5 flex-shrink-0" />
                        {!isSidebarCollapsed && (
                          <>
                            <span className="flex-1">{item.label}</span>
                            {item.comingSoon && (
                              <span className="text-xs px-1.5 py-0.5 rounded-full bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)]">
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

            {/* Theme Toggle, Locale Switcher and Support Buttons */}
            <div className="mt-auto flex-shrink-0 pt-2 pb-2">
              {!isSidebarCollapsed ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                    <LocaleSwitcherButton 
                      onClick={() => setIsModalOpen(true)}
                      className=""
                    />
                    <SupportButton 
                      onClick={handleSupportRequest}
                      className=""
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <SunIcon className="h-4 w-4 text-[var(--dashboard-text-secondary)]" />
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
                    <MoonIcon className="h-4 w-4 text-[var(--dashboard-text-secondary)]" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={toggleTheme}
                    className="relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--dashboard-ring-primary)] focus:ring-offset-2 bg-[var(--dashboard-border-secondary)] mx-auto"
                    title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                        theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                    <span className="sr-only">
                      {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    </span>
                  </button>
                  <div className="flex flex-col gap-3 w-full">
                    <div className="w-full flex justify-center">
                      <LocaleSwitcherButton 
                        onClick={() => setIsModalOpen(true)}
                        className=""
                      />
                    </div>
                    <div className="w-full flex justify-center">
                      <SupportButton 
                        onClick={handleSupportRequest}
                        className=""
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
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
                            ? "bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-primary)] shadow-md border border-[var(--dashboard-border-primary)]"
                            : "text-[var(--dashboard-text-secondary)] hover:bg-[var(--dashboard-bg-tertiary)] hover:text-[var(--dashboard-text-primary)]"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <IconComponent className="h-5 w-5" />
                        <span className="flex-1">{item.label}</span>
                        {item.comingSoon && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)]">
                            Coming Soon
                          </span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* Theme Toggle, Locale Switcher and Support Buttons */}
            <div className="mt-auto">
              <div className="flex gap-2">
                <LocaleSwitcherButton 
                  onClick={() => {
                    setIsModalOpen(true)
                    setIsMobileMenuOpen(false)
                  }}
                  className="flex-1"
                />
                <SupportButton 
                  onClick={() => {
                    handleSupportRequest()
                    setIsMobileMenuOpen(false)
                  }}
                  className="flex-1"
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

        {/* Bottom Navigation Bar (Mobile) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 rounded-t-3xl shadow-lg border-t bg-[var(--dashboard-bg-secondary)] border-[var(--dashboard-border-primary)]">
          <div className="flex items-center justify-around px-4 py-2">
            {/* Essential Navigation Items */}
            <Link
              href="/dashboard"
              className={`flex flex-col items-center p-1.5 rounded-lg transition-all duration-200 ${
                isActiveLink("/dashboard")
                  ? "text-[var(--dashboard-text-primary)] bg-[var(--dashboard-bg-tertiary)] shadow-md border border-[var(--dashboard-border-primary)]"
                  : "text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:bg-[var(--dashboard-bg-tertiary)]"
              }`}
            >
              <HomeIcon className="h-5 w-5" />
              <span className="text-[10px] mt-0.5 font-normal">Home</span>
            </Link>

            <Link
              href="/dashboard/appointments"
              className={`flex flex-col items-center p-1.5 rounded-lg transition-all duration-200 ${
                isActiveLink("/dashboard/appointments")
                  ? "text-[var(--dashboard-text-primary)] bg-[var(--dashboard-bg-tertiary)] shadow-md border border-[var(--dashboard-border-primary)]"
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
                  ? "text-[var(--dashboard-text-primary)] bg-[var(--dashboard-bg-tertiary)] shadow-md border border-[var(--dashboard-border-primary)]"
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
                  ? "text-[var(--dashboard-text-primary)] bg-[var(--dashboard-bg-tertiary)] shadow-md border border-[var(--dashboard-border-primary)]"
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
                  ? "text-[var(--dashboard-text-primary)] bg-[var(--dashboard-bg-tertiary)] shadow-md border border-[var(--dashboard-border-primary)]"
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
          <div className="px-6 py-4 lg:py-2 rounded-2xl lg:sticky top-0 z-10 mb-2 bg-[var(--dashboard-bg-primary)]">
            {/* Top Navbar Dashboard*/}
            <div className="flex flex-row justify-between gap-4">
              {/* Left Column - Public Link (Desktop only) */}
              <div className="flex items-center">
                {currentBusiness && (
                  <div className="flex items-center gap-2">
                    {/* Collapsed pill for xs to md, full pill for lg+ */}
                    <div className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm border transition-all duration-300 relative overflow-hidden ${
                      isAnimating ? 'animate-pill-shine' : ''} ${
                      // Collapsed on xs to md, full on lg+
                      'max-w-[40px] md:max-w-[40px] lg:max-w-[250px] bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)] border-[var(--dashboard-border-primary)]'
                    }`}>
                      <GlobeAltIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="text-xs truncate hidden lg:block">{publicUrl}</span>
                    </div>
                    <button
                      onClick={handleCopy}
                      className={`px-2 py-2 rounded-lg border transition-all duration-300 flex items-center justify-center bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)] border-[var(--dashboard-border-primary)] hover:bg-[var(--dashboard-bg-secondary)] hover:text-[var(--dashboard-text-primary)] ${
                        copied ? 'text-green-600 border-green-200 bg-green-50' : ''
                      }`}
                      title={copied ? t("publicLink.copied") : t("publicLink.copy")}
                    >
                      {copied ? (
                        <svg className="w-3 h-3 animate-checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={handleOpen}
                      className="px-2 py-2 rounded-lg border transition-colors flex items-center gap-1 bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)] border-[var(--dashboard-border-primary)] hover:bg-[var(--dashboard-bg-secondary)] hover:text-[var(--dashboard-text-primary)]"
                      title={t("publicLink.open")}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      <span className="text-xs hidden sm:block">Open</span>
                    </button>
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="px-2 py-2 rounded-lg border transition-colors flex items-center justify-center bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)] border-[var(--dashboard-border-primary)] hover:bg-[var(--dashboard-bg-secondary)] hover:text-[var(--dashboard-text-primary)]"
                      title="Share Link"
                    >
                      <ShareIcon className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Right Column - Aligned to the right */}
              <div className="flex justify-end items-center gap-x-6">
                {/* User Plan Card */}
                {userPlan && (
                  <div className="hidden lg:flex items-center gap-4">
                    {/* Plan Management Buttons */}
                    <div className="flex items-center gap-2">
                      <Link 
                        href="/dashboard/plan" 
                        className="px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-2 border bg-transparent text-[var(--dashboard-text-secondary)] border-[var(--dashboard-border-primary)] hover:bg-[var(--dashboard-bg-secondary)] hover:text-[var(--dashboard-text-primary)]"
                      >
                        Manage your plan
                        {(() => {
                          const planColors = getPlanColors(userPlan.plan_name);
                          return (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${planColors.gradient} ${planColors.textColor}`}>
                              {planColors.showStar && (
                                <svg className="w-2 h-2 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              )}
                              {capitalizePlanName(userPlan.plan_name)}
                            </span>
                          );
                        })()}
                      </Link>
                      <button
                        onClick={handleSupportRequest}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors border bg-transparent text-[var(--dashboard-text-secondary)] border-[var(--dashboard-border-primary)] hover:bg-[var(--dashboard-bg-secondary)] hover:text-[var(--dashboard-text-primary)]"
                      >
                        Support
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Bell Notification Button */}
                <Link 
                  href="/dashboard/notifications" 
                  className="p-2 rounded-lg transition-colors text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:bg-[var(--dashboard-bg-tertiary)]"
                  title="Notifications"
                >
                  <BellIcon className="h-5 w-5" />
                </Link>
                
                {/* User Info */}
                <div className="flex flex-row items-center gap-x-2">
                  <div className="text-right hidden lg:block">
                    <p className="font-medium text-sm lg:text-base truncate text-[var(--dashboard-text-primary)]">{getManagerFullName()}</p>
                    <button
                      onClick={handleLogout}
                      className="ml-auto flex items-center gap-x-1 rounded-md border px-2 py-1 text-xs transition-all border-[var(--dashboard-border-primary)] bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)] hover:bg-[var(--dashboard-bg-secondary)]"
                    >
                      <ArrowRightOnRectangleIcon className="h-3 w-3" />
                      {t("nav.logout") || "Logout"}
                    </button>
                  </div>
                  <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <span className="text-white text-sm lg:text-base font-medium">
                      {getUserInitial()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t-[1px] lg:border-[1px] px-4 py-8 sm:px-6 md:px-10 lg:px-12 pb-20 lg:pb-6 rounded-2xl min-h-screen bg-[var(--dashboard-bg-primary)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]">
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
                <div className="px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 shadow-sm border mb-4 bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)] border-[var(--dashboard-border-primary)]">
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
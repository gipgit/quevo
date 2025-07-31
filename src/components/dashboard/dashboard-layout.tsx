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
  Cog6ToothIcon
} from "@heroicons/react/24/outline"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations("dashboard")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showBusinessModal, setShowBusinessModal] = useState(false)
  const { currentBusiness, businesses, switchBusiness, loading, userPlan, userManager } = useBusiness()

  useEffect(() => {
    // If we have userManager but no businesses, redirect to onboarding
    if (!loading && userManager && (!businesses || businesses.length === 0)) {
      router.push("/dashboard/onboarding")
    }
  }, [loading, userManager, businesses, router])

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t("noBusiness")}</h2>
          <Link
            href="/dashboard/onboarding"
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
    { href: "/dashboard/products", label: t("nav.products") || "Prodotti", icon: CubeIcon },
    { href: "/dashboard/service-requests", label: t("nav.serviceRequests") || "Richieste Servizi", icon: ClipboardDocumentListIcon },
    { href: "/dashboard/service-boards", label: t("nav.serviceBoards") || "Bacheche Servizi", icon: ClipboardDocumentIcon },
    { href: "/dashboard/appointments", label: t("nav.appointments") || "Appuntamenti", icon: CalendarIcon },
  ]

  const reportItems = [
    { href: "/dashboard/reports/surveys", label: t("nav.surveyReports") || "Report Sondaggi", icon: ChartBarIcon },
  ]

  const accountItems = [
    { href: "/dashboard/account", label: t("nav.manageAccount") || "Manage Account", icon: UserIcon },
  ]

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col">
        <div className="flex grow flex-col gap-y-3 overflow-y-auto bg-gray-200 px-6 py-6">
          {/* User Plan Card */}
          {userPlan && (
            <div className="bg-gray-50 rounded-lg p-4">
              <Link href="/dashboard/plan" className="block">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden">
                      <span className="text-white text-sm font-medium">
                        {getUserInitial()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 font-medium text-sm truncate">{getManagerFullName()}</p>
                      <p className="text-xs text-gray-600">Manage your plan</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-3">
                    {(() => {
                      const planColors = getPlanColors(userPlan.plan_name);
                      return (
                        <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${planColors.gradient} ${planColors.textColor}`}>
                          {planColors.showStar && (
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          )}
                          {capitalizePlanName(userPlan.plan_name)}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Business Info Card */}
          <div className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors mb-2" onClick={() => setShowBusinessModal(true)}>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                {(currentBusiness?.business_img_profile || currentBusiness?.business_public_uuid) ? (
                  <img
                    src={currentBusiness?.business_img_profile || `/uploads/business/${currentBusiness.business_public_uuid}/profile.webp`}
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
                <h2 className="text-gray-900 font-semibold text-sm truncate">{businessName}</h2>
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
                    className={`flex items-center gap-x-3 rounded-md p-2 text-sm md:text-base leading-6 transition-all ${
                      pathname === item.href
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                        <IconComponent className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
                  )
                })}
            </ul>
          </nav>
          {/* Reports Section */}
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase">{t("nav.reports")}</p>
            <ul className="mt-2 space-y-2">
                {reportItems.map((item) => {
                  const IconComponent = item.icon
                  return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 transition-all ${
                      pathname === item.href
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                        <IconComponent className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
                  )
                })}
            </ul>
          </div>

          {/* Account Section */}
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase">Account</p>
            <ul className="mt-2 space-y-2">
                {accountItems.map((item) => {
                  const IconComponent = item.icon
                  return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 transition-all ${
                      pathname === item.href
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                        <IconComponent className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
                  )
                })}
            </ul>
          </div>
          {/* Logout Button */}
          <div className="mt-auto">
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-x-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold leading-6 text-gray-700 transition-all hover:bg-gray-50"
            >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              {t("nav.logout") || "Logout"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-full flex-col bg-gray-200 px-6 py-6">
          {/* Close Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* User Plan Card */}
          {userPlan && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <Link href="/dashboard/plan" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden">
                      <span className="text-white text-sm font-medium">
                        {getUserInitial()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 font-medium text-sm truncate">{getManagerFullName()}</p>
                      <p className="text-xs text-gray-600">Manage your plan</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-3">
                    {(() => {
                      const planColors = getPlanColors(userPlan.plan_name);
                      return (
                        <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${planColors.gradient} ${planColors.textColor}`}>
                          {planColors.showStar && (
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          )}
                          {capitalizePlanName(userPlan.plan_name)}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Business Info Card */}
          <div className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors mb-4" onClick={() => {
            setShowBusinessModal(true)
            setIsMobileMenuOpen(false)
          }}>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                {(currentBusiness?.business_img_profile || currentBusiness?.business_public_uuid) ? (
                  <img
                    src={currentBusiness?.business_img_profile || `/uploads/business/${currentBusiness.business_public_uuid}/profile.webp`}
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
                <h2 className="text-gray-900 font-semibold text-sm truncate">{businessName}</h2>
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
                    className={`flex items-center gap-x-3 rounded-md p-2 text-sm md:text-base leading-6 transition-all ${
                      pathname === item.href
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                        <IconComponent className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
                  )
                })}
            </ul>
          </nav>

          {/* Reports Section */}
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase">{t("nav.reports")}</p>
            <ul className="mt-2 space-y-2">
                {reportItems.map((item) => {
                  const IconComponent = item.icon
                  return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 transition-all ${
                      pathname === item.href
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                        <IconComponent className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
                  )
                })}
            </ul>
          </div>

          {/* Account Section */}
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase">Account</p>
            <ul className="mt-2 space-y-2">
                {accountItems.map((item) => {
                  const IconComponent = item.icon
                  return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 transition-all ${
                      pathname === item.href
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                        <IconComponent className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
                  )
                })}
            </ul>
          </div>

          {/* Logout Button */}
          <div className="mt-auto">
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-x-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold leading-6 text-gray-700 transition-all hover:bg-gray-50"
            >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              {t("nav.logout") || "Logout"}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar (Mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-gray-100 to-gray-200 border-t border-gray-300 rounded-t-3xl shadow-lg">
        <div className="flex items-center justify-around px-4 py-3">
          {/* Essential Navigation Items */}
          <Link
            href="/dashboard"
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              pathname === "/dashboard"
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <HomeIcon className="h-6 w-6" />
            <span className="text-xs mt-1 font-medium">Home</span>
          </Link>

          <Link
            href="/dashboard/appointments"
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              pathname === "/dashboard/appointments"
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <CalendarIcon className="h-6 w-6" />
            <span className="text-xs mt-1 font-medium">Appointments</span>
          </Link>

          <Link
            href="/dashboard/services"
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              pathname === "/dashboard/services"
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <WrenchScrewdriverIcon className="h-6 w-6" />
            <span className="text-xs mt-1 font-medium">Services</span>
          </Link>

          <Link
            href="/dashboard/service-boards"
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              pathname === "/dashboard/service-boards"
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <ClipboardDocumentIcon className="h-6 w-6" />
            <span className="text-xs mt-1 font-medium">Boards</span>
          </Link>

          <Link
            href="/dashboard/profile"
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              pathname === "/dashboard/profile"
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <UserIcon className="h-6 w-6" />
            <span className="text-xs mt-1 font-medium">Profile</span>
          </Link>

          {/* Sidebar Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <Bars3Icon className="h-6 w-6" />
            <span className="text-xs mt-1 font-medium">Menu</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-80">
        <div className="px-4 py-6 sm:px-6 md:px-10 lg:px-12 pb-20 lg:pb-6">
          {children}
        </div>
      </div>

      {/* Business Selection Modal */}
      <BusinessSelectionModal 
        isOpen={showBusinessModal} 
        onClose={() => setShowBusinessModal(false)}
      />
    </div>
  )
}

export default DashboardLayout

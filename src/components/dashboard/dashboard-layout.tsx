import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useBusiness } from "@/lib/business-context"
import { signOut } from "next-auth/react"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import BusinessSelectionModal from "@/components/modals/BusinessSelectionModal"

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
  ClipboardDocumentIcon
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="xl" color="blue" />
      </div>
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-200 px-6 py-6">
          {/* Business Info Card */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowBusinessModal(true)}>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                {businessImage ? (
                  <img
                    src={businessImage || "/placeholder.svg"}
                    alt={businessName}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = "none"
                      target.nextElementSibling?.classList.remove("hidden")
                    }}
                  />
                ) : null}
                <span className={`text-white text-sm font-medium ${businessImage ? "hidden" : ""}`}>
                  {getBusinessInitial()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-gray-900 font-semibold text-sm truncate">{businessName}</h2>
                <p className="text-gray-600 text-xs truncate">{getManagerFullName()}</p>
              </div>
            </div>
          </div>

          {/* User Plan Card */}
          {userPlan && (
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <Link href="/dashboard/plan" className="block">
                <div className="flex items-center justify-between">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {userPlan.plan_name}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Manage your plan</p>
                  </div>
                </div>
              </Link>
            </div>
          )}
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
      {/* Mobile Menu */}
      <div className={`lg:hidden ${isMobileMenuOpen ? "fixed inset-0 z-50" : "hidden"}`}>
        <div className="flex h-full flex-col bg-gray-900 p-4">
          {/* Close Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-400 hover:text-white"
            >
                <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          {/* Navigation Items */}
          <nav className="mt-4 flex-1">
            <ul className="space-y-2">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon
                  return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 transition-all ${
                      pathname === item.href
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:bg-gray-700"
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
          {/* Logout Button */}
          <div className="mt-auto">
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-x-3 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold leading-6 text-white transition-all hover:bg-red-700"
            >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              {t("nav.logout") || "Logout"}
            </button>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="lg:pl-80">
        <div className="px-4 py-6 sm:px-6 md:px-10 lg:px-12">
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

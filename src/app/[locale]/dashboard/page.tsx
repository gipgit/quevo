"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useBusiness } from "@/lib/business-context"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import BusinessSelectionModal from "@/components/modals/BusinessSelectionModal"
import { 
  LinkIcon, 
  UserIcon, 
  Cog6ToothIcon, 
  SwatchIcon, 
  CubeIcon, 
  CalendarIcon, 
  MegaphoneIcon,
  XMarkIcon
} from "@heroicons/react/24/outline"

// Domain constant for public link
const DOMAIN = typeof window !== "undefined" && window.location.hostname.includes("localhost")
  ? "http://localhost:3000"
  : "your-production-domain.com" // <-- Replace with your actual domain

export default function DashboardPage() {
  const t = useTranslations("dashboard")
  const { currentBusiness, businesses, userManager, userPlan, usage, planLimits, switchBusiness, loading, error } = useBusiness()
  const [copied, setCopied] = useState(false)
  const [showBusinessModal, setShowBusinessModal] = useState(false)

  // Add debugging
  console.log("DashboardPage render:", {
    loading,
    error,
    currentBusiness: !!currentBusiness,
    businessesCount: businesses.length,
    userManager: !!userManager
  })

  // The layout already handles loading states, so we don't need to duplicate here

  // Show error state if there's an error
  if (error) {
    return (
      <DashboardLayout>
        <div className="w-full h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong className="font-bold">Errore:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Ricarica pagina
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Show message if no current business (this should be handled by redirects, but just in case)
  if (!currentBusiness) {
    return (
      <DashboardLayout>
        <div className="w-full h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Nessun business selezionato</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Ricarica pagina
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Public link format: DOMAIN/business_urlname
  const publicUrl = `${DOMAIN}/${currentBusiness?.business_urlname || ""}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  const handleOpen = () => {
    window.open(`${publicUrl}`, "_blank")
  }

  const getManagerFullName = () => {
    if (!userManager) return ""
    return `${userManager.name_first} ${userManager.name_last}`
  }

  const managementCards = [
    {
      title: t("cards.qrLink.title"),
      description: t("cards.qrLink.description"),
      icon: LinkIcon,
      href: "/dashboard/qr-link",
    },
    {
      title: t("cards.profile.title"),
      description: t("cards.profile.description"),
      icon: UserIcon,
      href: "/dashboard/profile",
    },
    {
      title: t("cards.links.title"),
      description: t("cards.links.description"),
      icon: LinkIcon,
      href: "/dashboard/profile/links",
    },
    {
      title: t("cards.settings.title"),
      description: t("cards.settings.description"),
      icon: Cog6ToothIcon,
      href: "/dashboard/profile/settings",
    },
    {
      title: t("cards.appearance.title"),
      description: t("cards.appearance.description"),
      icon: SwatchIcon,
      href: "/dashboard/profile/appearance",
    },
    {
      title: t("cards.products.title"),
      description: t("cards.products.description"),
      icon: CubeIcon,
      href: "/dashboard/products",
    },
    {
      title: t("cards.bookings.title"),
      description: t("cards.bookings.description"),
      icon: CalendarIcon,
      href: "/dashboard/bookings",
    },
    {
      title: t("cards.promotions.title"),
      description: t("cards.promotions.description"),
      icon: MegaphoneIcon,
      href: "/dashboard/promotions",
    },
  ]

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
      {/* Business Selection Modal */}
      <BusinessSelectionModal 
        isOpen={showBusinessModal} 
        onClose={() => setShowBusinessModal(false)} 
      />
        {/* Current Business Section */}
        <div className="b-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">{t("currentBusiness.label")}</div>
              <div className="font-semibold text-3xl md:text-4xl text-gray-900">{currentBusiness?.business_name}</div>
              <button
                onClick={() => setShowBusinessModal(true)}
                className="px-4 py-2 bg-white border text-black text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
              >
                {t("currentBusiness.change")}
              </button>
            </div>
           
             {/* Plan Section */}
            <div className="mb-8">
              <div className="flex items-end justify-end">
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-600 mb-1">{t("plan.label")}</div>
                  <div className="font-semibold text-lg text-gray-900">{userPlan?.plan_name || t("plan.noPlan")}</div>
                </div>
                <a
                  href="/dashboard/plan"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  {t("plan.manage")}
                </a>
              </div>
            </div>
          </div>
          
          {/* Usage Summary */}
          {usage && planLimits && (
            <div className="mb-8">
              <h3 className="text-sm text-gray-600 mb-2">{t("usage.title")}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-500">{t("usage.services")}</div>
                  <div className="font-semibold text-lg mb-2">
                    {usage.services} / {planLimits.maxServices === -1 ? "∞" : planLimits.maxServices}
                  </div>
                  {planLimits.maxServices !== -1 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min((usage.services / planLimits.maxServices) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-500">{t("usage.products")}</div>
                  <div className="font-semibold text-lg mb-2">
                    {usage.products} / {planLimits.maxProducts === -1 ? "∞" : planLimits.maxProducts}
                  </div>
                  {planLimits.maxProducts !== -1 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min((usage.products / planLimits.maxProducts) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-500">{t("usage.promos")}</div>
                  <div className="font-semibold text-lg mb-2">
                    {usage.promos} / {planLimits.maxPromos === -1 ? "∞" : planLimits.maxPromos}
                  </div>
                  {planLimits.maxPromos !== -1 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min((usage.promos / planLimits.maxPromos) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-500">{t("usage.bookings")}</div>
                  <div className="font-semibold text-lg mb-2">
                    {usage.bookings} / {planLimits.maxBookings === -1 ? "∞" : planLimits.maxBookings}
                  </div>
                  {planLimits.maxBookings !== -1 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min((usage.bookings / planLimits.maxBookings) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
       
        {/* Public Link Section */}
        <div className="mb-8">
          <div className="bg-gray-800 text-gray-300 px-6 py-4 rounded-full text-base font-medium flex items-center justify-between gap-4 shadow-lg border border-gray-700">
            <span className="text-sm">{publicUrl}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="text-gray-400 hover:text-white transition-colors"
                title={copied ? t("publicLink.copied") : t("publicLink.copy")}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={handleOpen}
                className="text-gray-400 hover:text-white transition-colors"
                title={t("publicLink.open")}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Management Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
          {managementCards.map((card, index) => {
            const IconComponent = card.icon
            return (
              <a
                key={index}
                href={card.href}
                className={`bg-white rounded-xl p-6 border border-gray-200 transition-all duration-200 group`}
              >
                <div className="flex flex-col space-y-4">
                  <div className="transition-transform duration-200">
                    <IconComponent className="h-12 w-12 text-gray-600 group-hover:text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-2">{card.title}</h3>
                    <p className="text-sm text-gray-600">{card.description}</p>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}

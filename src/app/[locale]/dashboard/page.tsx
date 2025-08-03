"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useBusiness } from "@/lib/business-context"
import { useTheme } from "@/contexts/ThemeContext"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import BusinessSelectionModal from "@/components/modals/BusinessSelectionModal"
import Link from "next/link"
import { 
  UserIcon, 
  CubeIcon, 
  CalendarIcon, 
  MegaphoneIcon,
  ClipboardDocumentListIcon, 
  Squares2X2Icon, 
  Cog6ToothIcon,
  GlobeAltIcon
} from "@heroicons/react/24/outline"
import { formatUsageDisplay } from "@/lib/usage-utils"
import { getPlanColors, capitalizePlanName } from "@/lib/plan-colors"

// Domain constant for public link
const DOMAIN = typeof window !== "undefined" && window.location.hostname.includes("localhost")
  ? "http://localhost:3000"
  : "your-production-domain.com" // <-- Replace with your actual domain

export default function DashboardPage() {
  const t = useTranslations("dashboard")
  const { currentBusiness, businesses, userManager, userPlan, usage, planLimits, switchBusiness, loading, error } = useBusiness()
  const { theme } = useTheme()
  const [copied, setCopied] = useState(false)
  const [showBusinessModal, setShowBusinessModal] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Add debugging
  console.log("DashboardPage render:", {
    loading,
    error,
    currentBusiness: !!currentBusiness,
    businessesCount: businesses.length,
    userManager: !!userManager
  })

  // Add debug logs for planLimits and usage
  console.log("DashboardPage planLimits:", planLimits)
  console.log("DashboardPage usage:", usage)

  // Helper to get plan limit value for a feature
  const getPlanLimitValue = (feature: string) => {
    // Map feature to correct scope
    const scopeMap: Record<string, string> = {
      services: 'global',
      service_requests: 'per_month',
      appointments: 'per_month',
      active_boards: 'global',
      products: 'global',
    }
    const scope = scopeMap[feature] || 'global'
    const limit = planLimits?.find(l => l.feature === feature && l.limit_type === 'count' && l.scope === scope)
    return limit?.value ?? null
  }

  // Helper to get the suffix for monthly limits
  const getLimitSuffix = (feature: string) => {
    const scopeMap: Record<string, string> = {
      services: 'global',
      service_requests: 'per_month',
      appointments: 'per_month',
      active_boards: 'global',
      products: 'global',
    }
    const scope = scopeMap[feature] || 'global'
    if (scope === 'per_month') {
      return t('usage.per_month')
    }
    return ''
  }

  // Helper to get usage for a feature
  const getUsageValue = (feature: string) => usage?.[feature] ?? 0

  // Usage cards config
  const usageCards = [
    {
      feature: 'services',
      label: t("usage.services"),
    },
    {
      feature: 'service_requests',
      label: t("usage.service_requests"),
    },
    {
      feature: 'appointments',
      label: t("usage.appointments"),
    },
    {
      feature: 'active_boards',
      label: t("usage.active_boards"),
    },
    {
      feature: 'products',
      label: t("usage.products"),
    },
  ]

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
            <p className="text-gray-600 mb-4">{t('currentBusiness.selectBusiness')}</p>
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
    return `${userManager.name_first} ${userManager.name_last}`
  }

  const managementCards = [
    {
      title: t("cards.profile.title"),
      description: t("cards.profile.description"),
      icon: UserIcon,
      href: "/dashboard/profile",
    },
    {
      title: t("cards.services.title"),
      description: t("cards.services.description"),
      icon: Squares2X2Icon,
      href: "/dashboard/services",
    },
    {
      title: t("cards.products.title"),
      description: t("cards.products.description"),
      icon: CubeIcon,
      href: "/dashboard/products",
    },
    {
      title: t("cards.serviceRequests.title"),
      description: t("cards.serviceRequests.description"),
      icon: ClipboardDocumentListIcon,
      href: "/dashboard/service-requests",
    },
    {
      title: t("cards.serviceBoards.title"),
      description: t("cards.serviceBoards.description"),
      icon: Squares2X2Icon,
      href: "/dashboard/service-boards",
    },
    {
      title: t("cards.appointments.title"),
      description: t("cards.appointments.description"),
      icon: CalendarIcon,
      href: "/dashboard/appointments",
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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
                         <div className="md:flex md:flex-row md:items-center gap-2 md:gap-4">
               <div>
                 <div className={`font-semibold text-3xl md:text-4xl ${
                   theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                 }`}>{currentBusiness?.business_name}</div>
               </div>
             </div>
            
              {/* Plan Section */}
             <div className="flex items-center gap-3">
               <div className="flex gap-2">
                 <button
                   onClick={() => setShowBusinessModal(true)}
                   className={`px-2 py-1 w-auto border rounded-lg text-xs font-medium transition-colors ${
                     theme === 'dark'
                       ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                       : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                   }`}
                 >
                   {t("currentBusiness.change")}
                 </button>
                 <Link
                   href="/dashboard/onboarding"
                   className={`px-2 py-1 w-auto border rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                     theme === 'dark'
                       ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                       : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                   }`}
                 >
                   Add Business
                 </Link>
               </div>
             </div>
          </div>
          
          {/* Usage Summary */}
          {usage && planLimits && (
            <div className="mb-8">
              <p className={`text-xs mb-2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>{t("usage.title")}</p>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-1 md:gap-4 items-end">
                {usageCards.map(card => {
                  const max = getPlanLimitValue(card.feature)
                  const current = getUsageValue(card.feature)
                  const suffix = getLimitSuffix(card.feature)
                  return (
                    <div key={card.feature}>
                      <div className="font-medium text-md md:text-lg lg:text-xl mb-1">
                        {formatUsageDisplay(current, { value: max })} {suffix}
                      </div>
                      <div className={`text-xs md:text-sm mb-2 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>{card.label}</div>
                      {max !== -1 && max !== null && (
                        <div className={`w-full rounded-full h-2 ${
                          theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                        }`}>
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min((current / max) * 100, 100)}%`
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
       
        {/* Public Link Section */}
        <div className="mb-8">
                      <div className={`px-4 py-2 md:px-6 md:py-4 rounded-full text-base font-medium flex items-center justify-between gap-4 shadow-sm border transition-all duration-300 relative overflow-hidden ${
                        theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 border-gray-600'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      } ${isAnimating ? 'animate-pill-shine' : ''}`}>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <GlobeAltIcon className="w-6 h-6 md:w-7 md:h-7 text-blue-600 flex-shrink-0" />
              <span className="text-sm md:text-lg truncate">{publicUrl}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className={`transition-all duration-300 flex items-center gap-2 ${
                  theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                } ${copied ? 'text-green-600' : ''}`}
                title={copied ? t("publicLink.copied") : t("publicLink.copy")}
              >
                {copied ? (
                  <svg className="w-4 h-4 animate-checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
                <span className="hidden md:inline text-sm">{copied ? t("publicLink.copied") : t("publicLink.copy")}</span>
              </button>
              <button
                onClick={handleOpen}
                className={`transition-colors flex items-center gap-2 ${
                  theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                }`}
                title={t("publicLink.open")}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="hidden md:inline text-sm">{t("publicLink.open")}</span>
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
                className={`rounded-xl p-4 md:p-6 border transition-all duration-200 group ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 hover:bg-gray-700'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col space-y-4">
                  <div className="transition-transform duration-200">
                    <IconComponent className="h-12 w-12 text-gray-600 group-hover:text-blue-600" />
                  </div>
                  <div>
                    <h3 className={`text-md font-semibold mb-2 ${
                      theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                    }`}>{card.title}</h3>
                    <p className={`text-xs md:text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>{card.description}</p>
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

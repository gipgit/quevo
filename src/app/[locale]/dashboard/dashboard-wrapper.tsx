'use client'

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useBusiness } from "@/lib/business-context"
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
  GlobeAltIcon,
  UsersIcon,
  LifebuoyIcon
} from "@heroicons/react/24/outline"
import { formatUsageDisplay } from "@/lib/usage-utils"
import { getPlanColors, capitalizePlanName } from "@/lib/plan-colors"

// Domain constant for public link - will be set after component mounts to avoid hydration mismatch

interface Business {
  business_id: string
  business_name: string
  business_descr: string | null
  business_urlname: string | null
}

interface UserManager {
  user_id: string
  name_first: string | null
  name_last: string | null
  email: string | null
}

interface Plan {
  plan_id: number
  plan_name: string
  display_price: string | null
  display_frequency: string | null
}

interface Usage {
  services: number
  service_requests: number
  boards: number
  appointments: number
  active_boards: number
  products: number
}

interface PlanLimit {
  feature: string
  limit_type: string
  scope: string
  value: number | null
}

interface DashboardWrapperProps {
  usage: {
    services: number
    service_requests: number
    boards: number
    appointments: number
    active_boards: number
    products: number
  }
  planLimits: any[]
  autoSelectBusinessId?: string
}

export default function DashboardWrapper({ usage, planLimits, autoSelectBusinessId }: DashboardWrapperProps) {
  const { businesses, currentBusiness, userManager } = useBusiness()
  const t = useTranslations("dashboard")
  const [copied, setCopied] = useState(false)
  const [showBusinessModal, setShowBusinessModal] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [progressAnimation, setProgressAnimation] = useState<Record<string, number>>({})
  
  // Domain state to avoid hydration mismatch
  const [DOMAIN, setDOMAIN] = useState("https://quevo.vercel.app")
  
  // Set the correct domain after component mounts
  useEffect(() => {
    const isLocalhost = window.location.hostname.includes("localhost")
    setDOMAIN(isLocalhost ? "http://localhost:3000" : "https://quevo.vercel.app")
  }, [])

  // Handle auto-selection of single business
  useEffect(() => {
    if (autoSelectBusinessId && businesses.length > 0 && !currentBusiness) {
      console.log(`[DashboardWrapper] Auto-selecting business: ${autoSelectBusinessId}`)
      
      // Find the business to auto-select
      const businessToSelect = businesses.find(b => b.business_id === autoSelectBusinessId)
      
      if (businessToSelect) {
        // Set the business in session storage and trigger business context update
        sessionStorage.setItem("currentBusinessId", businessToSelect.business_id)
        
        // Force a page reload to ensure the business context picks up the new selection
        window.location.reload()
      }
    }
  }, [autoSelectBusinessId, businesses, currentBusiness])

  // Client-side check for business synchronization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionBusinessId = sessionStorage.getItem("currentBusinessId")
      const cookieBusinessId = document.cookie
        .split(';')
        .find(cookie => cookie.trim().startsWith('current-business-id='))
        ?.split('=')[1]
      
      // Only redirect to select-business if we have businesses but no current business
      // Don't redirect if user has no businesses (server-side provider handles this)
      if (businesses.length > 0 && !currentBusiness) {
        console.log("Business context mismatch detected, redirecting to select-business")
        window.location.href = "/dashboard/select-business"
        return
      }
      
      // If there's a mismatch between session storage and current business
      if (sessionBusinessId && currentBusiness && sessionBusinessId !== currentBusiness.business_id) {
        console.log("Session storage mismatch detected, updating...")
        sessionStorage.setItem("currentBusinessId", currentBusiness.business_id)
      }
    }
  }, [businesses, currentBusiness])

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
  const getUsageValue = (feature: string) => usage?.[feature as keyof Usage] ?? 0

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

  // Animate progress bars on load
  useEffect(() => {
    if (usage && planLimits) {
      const animationDelays: Record<string, number> = {}
      usageCards.forEach((card, index) => {
        animationDelays[card.feature] = index * 150 // Stagger animations by 150ms each
      })
      
      // Start all animations after a short delay
      const timer = setTimeout(() => {
        usageCards.forEach(card => {
          const max = getPlanLimitValue(card.feature)
          const current = getUsageValue(card.feature)
          const targetPercentage = max !== -1 && max !== null ? Math.min((current / max) * 100, 100) : 0
          
          setTimeout(() => {
            setProgressAnimation(prev => ({
              ...prev,
              [card.feature]: targetPercentage
            }))
          }, animationDelays[card.feature])
        })
      }, 300) // Initial delay before starting animations
      
      return () => clearTimeout(timer)
    }
  }, [usage, planLimits])

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
      title: t("cards.serviceRequests.title"),
      description: t("cards.serviceRequests.description"),
      icon: ClipboardDocumentListIcon,
      href: "/dashboard/service-requests",
    },
    {
      title: t("cards.supportRequests.title"),
      description: t("cards.supportRequests.description"),
      icon: LifebuoyIcon,
      href: "/dashboard/support-requests",
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
      title: t("cards.clients.title"),
      description: t("cards.clients.description"),
      icon: UsersIcon,
      href: "/dashboard/clients",
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
      <div className="max-w-[1600px] mx-auto">
        {/* Business Selection Modal */}
        <BusinessSelectionModal 
          isOpen={showBusinessModal} 
          onClose={() => setShowBusinessModal(false)}
        />

        {/* Top Navbar (business + actions) */}
        <div className="sticky top-0 z-10 p-4 lg:p-6 rounded-t-none lg:rounded-2xl mb-2 md:mb-3 bg-[var(--dashboard-bg-primary)] lg:border lg:border-[var(--dashboard-border-primary)]">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-medium text-[var(--dashboard-text-primary)]">{currentBusiness?.business_name}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowBusinessModal(true)}
                className="px-3 py-1.5 rounded-md text-sm text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] transition-colors"
                title={t("currentBusiness.change")}
              >
                {t("currentBusiness.change")}
              </button>
              <Link
                href="/onboarding"
                className="px-3 py-1.5 rounded-md text-sm text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] transition-colors"
              >
                Add Business
              </Link>
            </div>
          </div>
        </div>

        {/* Content Wrapper */}
        <div className="bg-[var(--dashboard-bg-primary)] rounded-2xl lg:border lg:border-[var(--dashboard-border-primary)] p-4 lg:p-6">
          {/* Usage Summary */}
          {usage && planLimits && (
            <div className="mb-8">
              <div className="flex overflow-x-auto lg:grid lg:grid-cols-5 gap-1 md:gap-4 items-end pb-2 lg:pb-0">
                {usageCards.map(card => {
                  const max = getPlanLimitValue(card.feature)
                  const current = getUsageValue(card.feature)
                  const suffix = getLimitSuffix(card.feature)
                  return (
                    <div key={card.feature} className="min-w-[120px] lg:min-w-0 flex-shrink-0 lg:flex-shrink">
                      <div className="text-xs md:text-sm mb-2 text-[var(--dashboard-text-secondary)]">{card.label}</div>
                      <div className="font-medium text-lg md:text-xl lg:text-2xl mb-1">
                        <span className="text-lg md:text-2xl lg:text-3xl">{formatUsageDisplay(current, { value: max }).split(' ')[0]}</span>
                        {formatUsageDisplay(current, { value: max }).includes(' ') && (
                          <span className="text-sm md:text-base lg:text-base text-[var(--dashboard-text-secondary)] ml-2">
                            {formatUsageDisplay(current, { value: max }).split(' ').slice(1).join(' ')} {suffix}
                          </span>
                        )}
                        {!formatUsageDisplay(current, { value: max }).includes(' ') && suffix && (
                          <span className="text-sm md:text-base lg:text-base text-[var(--dashboard-text-secondary)] ml-2">{suffix}</span>
                        )}
                      </div>
                      {max !== -1 && max !== null && (
                        <div className="w-full rounded-full h-2" style={{ background: 'var(--progress-bg)' }}>
                          <div
                            className="h-2 rounded-full transition-all duration-1000 ease-out"
                            style={{
                              width: `${progressAnimation[card.feature] || 0}%`,
                              background: 'var(--progress-fill)'
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

          {/* Public Link Section */}
          <div className="mb-8">
            <div className={`px-4 py-2 md:px-6 md:py-4 rounded-full text-base font-medium flex items-center justify-between gap-4 shadow-sm border transition-all duration-300 relative overflow-hidden bg-[var(--dashboard-bg-secondary)] text-[var(--dashboard-text-primary)] border-[var(--dashboard-border-primary)] ${isAnimating ? 'animate-pill-shine' : ''}`}>
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <GlobeAltIcon className="w-6 h-6 md:w-7 md:h-7 text-blue-600 flex-shrink-0" />
                <span className="text-sm md:text-lg truncate">{publicUrl}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className={`transition-all duration-300 flex items-center gap-2 text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] ${copied ? 'text-green-600' : ''}`}
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
                  className="transition-colors flex items-center gap-2 text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)]"
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
                  className="rounded-xl p-4 md:p-6 border transition-all duration-200 group bg-[var(--dashboard-bg-card)] border-[var(--dashboard-border-primary)] hover:bg-[var(--dashboard-bg-secondary)]"
                >
                  <div className="flex flex-col space-y-4">
                    <div className="transition-transform duration-200">
                      <IconComponent className="h-12 w-12 text-gray-600 group-hover:text-blue-600 stroke-[1]" />
                    </div>
                    <div>
                      <h3 className="text-sm md:text-base font-medium mb-2 leading-tight text-[var(--dashboard-text-primary)]">{card.title}</h3>
                      <p className="text-xs md:text-sm leading-none text-[var(--dashboard-text-secondary)]">{card.description}</p>
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

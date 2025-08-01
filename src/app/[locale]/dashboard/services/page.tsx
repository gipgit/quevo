"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useBusiness } from "@/lib/business-context"
import { canCreateMore, formatUsageDisplay } from "@/lib/usage-utils"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import Link from "next/link"
import { UsageLimitBar } from "@/components/dashboard/UsageLimitBar"
import { useToaster } from "@/components/ui/ToasterProvider"
import EmptyState from "@/components/EmptyState"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

interface ServiceQuestion {
  question_id: number
  question_text: string
  question_type: string
  is_required: boolean
}

interface ServiceRequirement {
  requirement_block_id: number
  title: string | null
  requirements_text: string
}

interface ServiceItem {
  service_item_id: number
  item_name: string
  item_description: string | null
  price_base: number
  price_type: string
  price_unit: string | null
}

interface Service {
  service_id: number
  service_name: string
  description: string | null
  duration_minutes: number | null
  buffer_minutes: number | null
  price_base: number | null
  has_items: boolean | null
  date_selection: boolean | null
  is_active: boolean | null
  display_order: number | null
  servicecategory: {
    category_name: string
  } | null
  servicequestion: ServiceQuestion[]
  servicerequirementblock: ServiceRequirement[]
  serviceitem: ServiceItem[]
}

export default function ServicesPage() {
  const t = useTranslations("services")
  const tCommon = useTranslations("Common")
  const { currentBusiness, usage, planLimits, refreshUsageForFeature } = useBusiness()
  const { showToast } = useToaster()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Add debug logs for planLimits and usage
  useEffect(() => {
    console.log("ServicesPage planLimits:", planLimits)
    console.log("ServicesPage usage:", usage)
    if (planLimits) {
      const found = planLimits.find(l => l.feature === 'services' && l.limit_type === 'count' && l.scope === 'global')
      console.log("ServicesPage planLimitServices:", found)
    }
  }, [planLimits, usage])

  useEffect(() => {
    if (currentBusiness) {
      fetchServices()
    }
  }, [currentBusiness])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/businesses/${currentBusiness?.business_id}/services`)
      if (!response.ok) throw new Error("Failed to fetch services")

      const data = await response.json()
      setServices(data.services)
    } catch (error) {
      console.error("Error fetching services:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (serviceId: number) => {
    window.location.href = `/dashboard/services/${serviceId}/edit`
  }

  const handleDeleteClick = (service: Service) => {
    setServiceToDelete(service)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/businesses/${currentBusiness?.business_id}/services/${serviceToDelete.service_id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setServices(services.filter((s) => s.service_id !== serviceToDelete.service_id))
        // Refresh usage data after successful deletion
        await refreshUsageForFeature("services")
        setDeleteModalOpen(false)
        setServiceToDelete(null)
        showToast({
          type: "success",
          title: t("serviceDeleted"),
          message: t("serviceDeletedDescription", { serviceName: serviceToDelete.service_name }),
          duration: 4000
        })
      } else {
        const errorData = await response.json()
        console.error("Error deleting service:", errorData.error)
        showToast({
          type: "error",
          title: t("deleteFailed"),
          message: errorData.error,
          duration: 5000
        })
      }
    } catch (error) {
      console.error("Error deleting service:", error)
      showToast({
        type: "error",
        title: t("deleteFailed"),
        message: t("deleteFailedDescription"),
        duration: 5000
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false)
    setServiceToDelete(null)
  }

  const formatPrice = (price: number | null) => {
    if (price === null) return t("priceOnRequest")
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(price)
  }

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return t("noDuration")
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ""}`
    }
    return `${mins}m`
  }

  const planLimitServices = planLimits?.find(l => l.feature === 'services' && l.limit_type === 'count' && l.scope === 'global')
  const currentUsage = usage?.services ?? 0
  const canCreateService = () => {
    if (!planLimitServices) return false
    return canCreateMore(currentUsage, planLimitServices)
  }

  if (!currentBusiness) return null

  // Group services by category
  const servicesByCategory = services.reduce(
    (acc, service) => {
      const categoryName = service.servicecategory?.category_name || t("uncategorized")
      if (!acc[categoryName]) {
        acc[categoryName] = []
      }
      acc[categoryName].push(service)
      return acc
    },
    {} as Record<string, Service[]>,
  )

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl lg:text-3xl font-bold text-gray-900">{t("title")}</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end gap-2">
              {planLimitServices && (
                <UsageLimitBar
                  current={currentUsage}
                  max={planLimitServices.value}
                  label={formatUsageDisplay(currentUsage, planLimitServices)}
                  showUpgrade={true}
                  onUpgrade={() => (window.location.href = "/dashboard/plan")}
                  upgradeText={t("upgradePlan")}
                  unlimitedText={t("unlimited")}
                />
              )}
            </div>
            <div>
              <Link
                href="/dashboard/services/create"
                className={`px-4 py-2 md:px-6 md:py-3 text-sm md:text-lg font-semibold rounded-lg transition-colors inline-flex items-center gap-2 ${
                  canCreateService()
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t("createService")}
              </Link>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" color="blue" />
          </div>
        ) : (
          <>
            {/* Services by Category */}
            {Object.entries(servicesByCategory).map(([categoryName, categoryServices]) => (
          <div key={categoryName} className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{categoryName}</h2>

            <div className="space-y-6">
              {categoryServices.map((service) => (
                <div
                  key={service.service_id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 lg:justify-end">
                      {/* Unified Service Details & Elements Column */}
                      <div>
                        <div className="mb-4">
                          <div className="flex flex-wrap items-center gap-4 mb-2">
                            <span className="text-2xl font-bold text-gray-900 mr-2">{service.service_name}</span>
                            <span className="text-xl font-semibold text-blue-700 mr-2">{formatPrice(service.price_base)}</span>
                            <span className="text-sm text-gray-700 mr-2">{formatDuration(service.duration_minutes)}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${service.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{service.is_active ? t('active') : t('inactive')}</span>
                          </div>
                          {/* Service Description */}
                          {service.description && (
                            <p className="text-gray-600 mb-3">{service.description}</p>
                          )}
                        </div>
                        {/* Service Elements (no wrapper, no label) */}
                        <div className="space-y-3">
                            {/* Service Items as pills */}
                            {service.serviceitem.length > 0 && (
                              <div>
                                <div className="flex flex-wrap gap-2">
                                  {service.serviceitem.map(item => (
                                    <span key={item.service_item_id} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                      {item.item_name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {(service.servicequestion.length > 0 || service.servicerequirementblock.length > 0) && (
                              <div className="flex flex-row gap-4">
                                {/* Service Questions as list */}
                                <div className="flex-1 min-w-[180px] max-w-[320px]">
                                  {service.servicequestion.length > 0 && (
                                    <>
                                      <div className="text-xs text-gray-500 mb-1">Domande</div>
                                      <ul className="list-disc list-inside text-xs text-gray-700 break-words">
                                        {service.servicequestion.map(q => (
                                          <li key={q.question_id}>{q.question_text}</li>
                                        ))}
                                      </ul>
                                    </>
                                  )}
                                </div>
                                {/* Service Requirements as list */}
                                <div className="flex-1 min-w-[180px] max-w-[320px]">
                                  {service.servicerequirementblock.length > 0 && (
                                    <>
                                      <div className="text-xs text-gray-500 mb-1">Requisiti</div>
                                      <ul className="list-disc list-inside text-xs text-gray-700 break-words">
                                        {service.servicerequirementblock.map(r => (
                                          <li key={r.requirement_block_id}>{r.title || r.requirements_text}</li>
                                        ))}
                                      </ul>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                            {service.serviceitem.length === 0 && service.servicequestion.length === 0 && service.servicerequirementblock.length === 0 && (
                              <div className="text-sm text-gray-500 py-2">
                                {t("noElementsConfigured")}
                              </div>
                            )}
                          </div>
                        </div>

                      {/* Action Buttons - Right Column */}
                      <div className="lg:col-span-1 max-w-[110px] w-full lg:w-auto lg:ml-auto flex">
                        <div className="flex flex-row gap-2 lg:flex-col lg:gap-3">
                          <button
                            onClick={() => handleEdit(service.service_id)}
                            className="w-full px-2 py-2 md:px-4 md:py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm font-medium"
                          >
                            <span className="hidden sm:inline">{tCommon("edit")}</span>
                            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(service)}
                            className="w-full px-2 py-2 md:px-4 md:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm font-medium"
                          >
                            <span className="hidden sm:inline">{tCommon("delete")}</span>
                            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

            {/* Empty State */}
            {services.length === 0 && (
              <EmptyState
                title={t("noServices")}
                description={t("noServicesDescription")}
                buttonText={t("createService")}
                onButtonClick={() => window.location.href = "/dashboard/services/create"}
                icon={<svg className="mx-auto w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
              />
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && serviceToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative p-8 border w-96 shadow-lg rounded-md bg-white">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {t("confirmDeleteTitle")}
              </h3>
              <p className="text-gray-600 mb-6">
                {t("confirmDeleteMessage", { serviceName: serviceToDelete.service_name })}
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  disabled={deleting}
                >
                  {deleting ? t("deleting") : t("confirm")}
                </button>
                <button
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  {t("cancel")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

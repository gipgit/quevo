'use client'

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useBusiness } from "@/lib/business-context"
import { useTheme } from "@/contexts/ThemeContext"
import { canCreateMore, formatUsageDisplay } from "@/lib/usage-utils"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import Link from "next/link"
import { UsageLimitBar } from "@/components/dashboard/UsageLimitBar"
import { useToaster } from "@/components/ui/ToasterProvider"
import EmptyState from "@/components/EmptyState"
import RichTextDisplay from "@/components/ui/RichTextDisplay"

interface ServiceQuestion {
  question_id: number
  question_text: string
  question_type: string
  is_required: boolean | null
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
  available_booking: boolean | null
  is_active: boolean | null
  display_order: number | null
  servicecategory: {
    category_name: string
  } | null
  servicequestion: ServiceQuestion[]
  servicerequirementblock: ServiceRequirement[]
  serviceitem: ServiceItem[]
}

interface ServicesWrapperProps {
  services: Service[]
}

export default function ServicesWrapper({ services: initialServices }: ServicesWrapperProps) {
  const t = useTranslations("services")
  const tCommon = useTranslations("Common")
  const { currentBusiness, refreshUsageForFeature, businessSwitchKey } = useBusiness()
  const [services, setServices] = useState<Service[]>(initialServices)
  const [loading, setLoading] = useState(false)
  const { showToast } = useToaster()
  const { theme } = useTheme()
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set())
  const [expandedRequirements, setExpandedRequirements] = useState<Set<number>>(new Set())

  // Refetch services when business changes
  useEffect(() => {
    const fetchServices = async () => {
      if (!currentBusiness?.business_id) return
      
      setLoading(true)
      try {
        const response = await fetch(`/api/businesses/${currentBusiness.business_id}/services`)
        if (response.ok) {
          const data = await response.json()
          setServices(data.services || [])
        }
      } catch (error) {
        console.error('Error fetching services:', error)
      } finally {
        setLoading(false)
      }
    }

    // Only refetch if business has changed (not on initial load)
    if (businessSwitchKey > 0) {
      fetchServices()
    }
  }, [currentBusiness?.business_id, businessSwitchKey])

  const handleDeleteService = async (service: Service) => {
    setServiceToDelete(service)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!serviceToDelete) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/businesses/${currentBusiness?.business_id}/services/${serviceToDelete.service_id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error("Failed to delete service")

      showToast({
        type: "success",
        title: t("deleteSuccess"),
        message: t("deleteSuccessMessage"),
        duration: 3000
      })

      // Refresh usage data
      if (refreshUsageForFeature) {
        await refreshUsageForFeature('services')
      }
      
      // Reload the page to refresh the services list
      window.location.reload()
    } catch (error) {
      console.error("Error deleting service:", error)
      showToast({
        type: "error",
        title: t("deleteError"),
        message: t("deleteErrorMessage"),
        duration: 5000
      })
    } finally {
      setDeleting(false)
      setDeleteModalOpen(false)
      setServiceToDelete(null)
    }
  }

  const toggleExpanded = (serviceId: number, type: 'items' | 'questions' | 'requirements') => {
    const setter = type === 'items' ? setExpandedItems : type === 'questions' ? setExpandedQuestions : setExpandedRequirements
    setter(prev => {
      const newSet = new Set(prev)
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId)
      } else {
        newSet.add(serviceId)
      }
      return newSet
    })
  }

  // Note: Usage and plan limits are not needed for services page
  // They are only needed for the dashboard overview
  const canCreateServices = true // Simplified for now

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>{t("title")}</h1>
            <p className={`text-sm mt-1 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>{t("subtitle")}</p>
          </div>
          <Link
            href="/dashboard/services/create"
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              canCreateServices
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {t("createService")}
          </Link>
        </div>

        {/* Usage Limit Bar - Removed from services page as it's not needed */}

        {/* Services List */}
        {services.length === 0 ? (
          <EmptyState
            icon={<svg className="mx-auto w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
            title={t("noServices")}
            description={t("noServicesDescription")}
            buttonText={t("createFirstService")}
            onButtonClick={() => window.location.href = "/dashboard/services/create"}
          />
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <div
                key={service.service_id}
                className={`rounded-xl shadow-sm border p-6 ${
                  theme === 'dark' 
                    ? 'bg-zinc-800 border-gray-600' 
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${
                      theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                    }`}>{service.service_name}</h3>
                    {service.servicecategory?.category_name && (
                      <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                        theme === 'dark' 
                          ? 'bg-zinc-700 text-gray-300' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {service.servicecategory.category_name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/services/${service.service_id}/edit`}
                      className={`p-2 rounded-lg transition-colors ${
                        theme === 'dark' 
                          ? 'text-gray-400 hover:text-gray-300 hover:bg-zinc-700' 
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDeleteService(service)}
                      className={`p-2 rounded-lg transition-colors ${
                        theme === 'dark' 
                          ? 'text-red-400 hover:text-red-300 hover:bg-zinc-700' 
                          : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {service.description && (
                  <div className="mb-4">
                    <RichTextDisplay content={service.description} />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {service.price_base !== null && (
                    <div className={`p-3 rounded-lg ${
                      theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-50'
                    }`}>
                      <div className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>{t("price")}</div>
                      <div className={`text-lg font-semibold ${
                        theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                      }`}>€{service.price_base}</div>
                    </div>
                  )}
                  {service.duration_minutes && (
                    <div className={`p-3 rounded-lg ${
                      theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-50'
                    }`}>
                      <div className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>{t("duration")}</div>
                      <div className={`text-lg font-semibold ${
                        theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                      }`}>{service.duration_minutes} {t("minutes")}</div>
                    </div>
                  )}
                  <div className={`p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-50'
                  }`}>
                    <div className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>{t("status")}</div>
                    <div className={`text-lg font-semibold ${
                      service.is_active 
                        ? (theme === 'dark' ? 'text-green-400' : 'text-green-600')
                        : (theme === 'dark' ? 'text-red-400' : 'text-red-600')
                    }`}>
                      {service.is_active ? t("active") : t("inactive")}
                    </div>
                  </div>
                </div>

                {/* Service Items */}
                {service.serviceitem.length > 0 && (
                  <div className="mb-4">
                    <button
                      onClick={() => toggleExpanded(service.service_id, 'items')}
                      className={`flex items-center gap-2 text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <svg className={`w-4 h-4 transition-transform ${
                        expandedItems.has(service.service_id) ? 'rotate-90' : ''
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {t("serviceItems")} ({service.serviceitem.length})
                    </button>
                    {expandedItems.has(service.service_id) && (
                      <div className="mt-2 space-y-2">
                        {service.serviceitem.map((item) => (
                          <div key={item.service_item_id} className={`p-3 rounded-lg ${
                            theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-50'
                          }`}>
                            <div className="flex justify-between items-start">
                              <div>
                                <div className={`font-medium ${
                                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                                }`}>{item.item_name}</div>
                                {item.item_description && (
                                  <div className={`text-sm mt-1 ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                  }`}>{item.item_description}</div>
                                )}
                              </div>
                              <div className={`font-semibold ${
                                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                              }`}>€{item.price_base}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Service Questions */}
                {service.servicequestion.length > 0 && (
                  <div className="mb-4">
                    <button
                      onClick={() => toggleExpanded(service.service_id, 'questions')}
                      className={`flex items-center gap-2 text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <svg className={`w-4 h-4 transition-transform ${
                        expandedQuestions.has(service.service_id) ? 'rotate-90' : ''
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {t("questions")} ({service.servicequestion.length})
                    </button>
                    {expandedQuestions.has(service.service_id) && (
                      <div className="mt-2 space-y-2">
                        {service.servicequestion.map((question) => (
                          <div key={question.question_id} className={`p-3 rounded-lg ${
                            theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-50'
                          }`}>
                            <div className={`font-medium ${
                              theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                            }`}>{question.question_text}</div>
                            <div className={`text-sm mt-1 ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {t("type")}: {question.question_type} • {question.is_required ? t("required") : t("optional")}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Service Requirements */}
                {service.servicerequirementblock.length > 0 && (
                  <div className="mb-4">
                    <button
                      onClick={() => toggleExpanded(service.service_id, 'requirements')}
                      className={`flex items-center gap-2 text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <svg className={`w-4 h-4 transition-transform ${
                        expandedRequirements.has(service.service_id) ? 'rotate-90' : ''
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {t("requirements")} ({service.servicerequirementblock.length})
                    </button>
                    {expandedRequirements.has(service.service_id) && (
                      <div className="mt-2 space-y-2">
                        {service.servicerequirementblock.map((req) => (
                          <div key={req.requirement_block_id} className={`p-3 rounded-lg ${
                            theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-50'
                          }`}>
                            {req.title && (
                              <div className={`font-medium ${
                                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                              }`}>{req.title}</div>
                            )}
                            <div className={`text-sm mt-1 ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>{req.requirements_text}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`p-6 rounded-lg max-w-md w-full mx-4 ${
              theme === 'dark' ? 'bg-zinc-800' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>{t("confirmDelete")}</h3>
              <p className={`mb-6 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>{t("confirmDeleteMessage")}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={deleting}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'bg-zinc-700 text-gray-300 hover:bg-zinc-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tCommon("cancel")}
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    deleting
                      ? "bg-red-400 text-white cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  {deleting ? t("deleting") : t("delete")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

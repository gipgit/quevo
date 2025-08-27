'use client'

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useBusiness } from "@/lib/business-context"
import { useTheme } from "@/contexts/ThemeContext"
import { canCreateMore, formatUsageDisplay } from "@/lib/usage-utils"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { useForceRefreshOnBusinessChange } from "@/hooks/useForceRefreshOnBusinessChange"
import Link from "next/link"
import { UsageLimitBar } from "@/components/dashboard/UsageLimitBar"
import { useToaster } from "@/components/ui/ToasterProvider"
import EmptyState from "@/components/EmptyState"
import RichTextDisplay from "@/components/ui/RichTextDisplay"
import ServiceEditModal from "./ServiceEditModal"
import ServiceImageDisplay from "@/components/service/ServiceImageDisplay"

interface ServiceQuestion {
  question_id: number
  question_text: string
  question_type: string
  question_options?: any
  max_length?: number
  is_required: boolean | null
}

interface ServiceRequirement {
  requirement_block_id: number
  title: string | null
  requirements_text: string
  is_required: boolean | null
}

interface ServiceItem {
  service_item_id: number
  item_name: string
  item_description: string | null
  price_base: number
  price_type: string
  price_unit: string | null
}

interface ServiceExtra {
  service_extra_id: number
  extra_name: string
  extra_description: string | null
  price_base: number
  price_type: string
  price_unit: string | null
}

interface ServiceEventAvailability {
  availability_id: number
  day_of_week: number
  time_start: string
  time_end: string
  is_recurring: boolean
  date_effective_from: string | null
  date_effective_to: string | null
}

interface ServiceEvent {
  event_id: number
  event_name: string
  event_description: string | null
  event_type: string
  duration_minutes: number
  buffer_minutes: number
  is_required: boolean
  display_order: number
  is_active: boolean
  serviceeventavailability?: ServiceEventAvailability[]
}

interface Service {
  service_id: string
  service_name: string
  description: string | null
  duration_minutes: number | null
  buffer_minutes: number | null
  price_base: number | null
  price_type: string | null
  price_unit: string | null
  has_items: boolean | null
  has_extras: boolean | null
  available_booking: boolean | null
  require_consent_newsletter: boolean | null
  require_consent_newsletter_text: string | null
  require_phone: boolean | null
  available_quotation: boolean | null
  is_active: boolean | null
  display_order: number | null
  demo: boolean | null
  has_image: boolean | null
  servicecategory: {
    category_name: string
  } | null
  servicequestion: ServiceQuestion[]
  servicerequirementblock: ServiceRequirement[]
  serviceitem: ServiceItem[]
  serviceextra: ServiceExtra[]
  serviceevent: ServiceEvent[]
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
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null)

  // Force refresh on business change
  useForceRefreshOnBusinessChange()



  // Group services by category
  const groupedServices = services.reduce((acc, service) => {
    const categoryName = service.servicecategory?.category_name || 'Uncategorized'
    if (!acc[categoryName]) {
      acc[categoryName] = []
    }
    acc[categoryName].push(service)
    return acc
  }, {} as Record<string, Service[]>)

  // Sort categories alphabetically
  const sortedCategories = Object.keys(groupedServices).sort()

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

  const handleEditService = (service: Service) => {
    setServiceToEdit(service)
    setEditModalOpen(true)
  }

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
          <div className="space-y-8">
            {sortedCategories.map((categoryName) => (
              <div key={categoryName}>
                {/* Category Header */}
                <div className="mb-4">
                  <h2 className={`text-xl font-semibold ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                    {categoryName}
                  </h2>
                  <div className={`w-16 h-1 mt-2 rounded ${
                    theme === 'dark' ? 'bg-blue-500' : 'bg-blue-600'
                  }`}></div>
                </div>

                {/* Services in this category */}
                <div className="space-y-4">
                  {groupedServices[categoryName].map((service) => (
                    <div
                      key={service.service_id}
                      className={`rounded-xl shadow-sm border p-6 ${
                        theme === 'dark' 
                          ? 'bg-zinc-800 border-gray-600' 
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Column 1: Service image - made slightly smaller */}
                        <div className="lg:w-1/4">
                          <ServiceImageDisplay
                            serviceId={service.service_id}
                            serviceName={service.service_name}
                            demo={service.demo}
                            hasImage={service.has_image}
                            businessPublicUuid={currentBusiness?.business_public_uuid || ''}
                            className="w-full h-40"
                            showDemoBadge={true}
                          />
                        </div>

                        {/* Column 2: Service title, status pill, description, price - given more width */}
                        <div className="lg:w-2/4">
                          <h3 className={`text-lg font-semibold mb-2 ${
                            theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                          }`}>{service.service_name}</h3>
                          
                          {/* Status pill moved here from column 3 */}
                          <div className="mb-3">
                            <span className={`px-3 py-1 text-sm rounded-full ${
                              service.is_active 
                                ? (theme === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800')
                                : (theme === 'dark' ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800')
                            }`}>
                              {service.is_active ? t("active") : t("inactive")}
                            </span>
                          </div>

                          {service.description && (
                            <div className="mb-3">
                              <RichTextDisplay content={service.description} />
                            </div>
                          )}
                          {service.price_base !== null && (
                            <div className={`text-lg font-semibold ${
                              theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                            }`}>€{service.price_base}</div>
                          )}
                        </div>

                        {/* Column 3: Duration pills + questions, requirements, items, extras counters - reduced width */}
                        <div className="lg:w-1/4">
                          <div className="flex flex-wrap gap-2 mb-4">
                            {service.duration_minutes && (
                              <span className={`px-3 py-1 text-sm rounded-full ${
                                theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {service.duration_minutes} {t("minutes")}
                              </span>
                            )}
                            {service.buffer_minutes && service.buffer_minutes > 0 && (
                              <span className={`px-3 py-1 text-sm rounded-full ${
                                theme === 'dark' ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-800'
                              }`}>
                                +{service.buffer_minutes} {t("buffer")}
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <div className={`flex items-center gap-2 text-sm ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                              {t("serviceItems")}: {service.serviceitem.length}
                            </div>
                            <div className={`flex items-center gap-2 text-sm ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              {t("serviceExtras")}: {service.serviceextra?.length || 0}
                            </div>
                            <div className={`flex items-center gap-2 text-sm ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {t("questions")}: {service.servicequestion.length}
                            </div>
                            <div className={`flex items-center gap-2 text-sm ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {t("requirements")}: {service.servicerequirementblock.length}
                            </div>
                          </div>
                        </div>

                        {/* Column 4: Edit/delete buttons */}
                        <div className="lg:w-1/4 flex justify-end items-start">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditService(service)}
                              className={`p-2 rounded-lg transition-colors ${
                                theme === 'dark' 
                                  ? 'text-gray-400 hover:text-gray-300 hover:bg-zinc-700' 
                                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                              }`}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
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
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Service Modal */}
        {editModalOpen && serviceToEdit && (
          <ServiceEditModal
            isOpen={editModalOpen}
            onClose={() => {
              setEditModalOpen(false)
              setServiceToEdit(null)
            }}
            service={serviceToEdit}
            businessId={currentBusiness?.business_id || ''}
            businessPublicUuid={currentBusiness?.business_public_uuid || ''}
            onServiceUpdated={() => {
              // Refresh the services list
              window.location.reload()
            }}
          />
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

'use client'

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useTheme } from "@/contexts/ThemeContext"
import { useBusiness } from "@/lib/business-context"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import EmptyState from "@/components/EmptyState"
import { EnvelopeIcon, DocumentArrowUpIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline'
import Link from "next/link"

interface ServiceRequestsWrapperProps {
  serviceRequests: any[]
}

export default function ServiceRequestsWrapper({ serviceRequests: initialServiceRequests }: ServiceRequestsWrapperProps) {
  const t = useTranslations("serviceRequests")
  const { theme } = useTheme()
  const { currentBusiness, businessSwitchKey } = useBusiness()
  const [serviceRequests, setServiceRequests] = useState(initialServiceRequests)

  // Refetch service requests when business changes
  useEffect(() => {
    const fetchServiceRequests = async () => {
      if (!currentBusiness?.business_id) return
      
      try {
        const response = await fetch(`/api/businesses/${currentBusiness.business_id}/service-requests`)
        if (response.ok) {
          const data = await response.json()
          setServiceRequests(data.serviceRequests || [])
        }
      } catch (error) {
        console.error('Error fetching service requests:', error)
      }
    }

    // Only refetch if business has changed (not on initial load)
    if (businessSwitchKey > 0) {
      fetchServiceRequests()
    }
  }, [currentBusiness?.business_id, businessSwitchKey])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.toLocaleDateString("it-IT", { month: "long" })
    const year = date.getFullYear()
    return { day, month: month.charAt(0).toUpperCase() + month.slice(1), year }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'rescheduled':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-zinc-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return t("statusPending")
      case 'confirmed':
        return t("statusConfirmed")
      case 'completed':
        return t("statusCompleted")
      case 'cancelled':
        return t("statusCancelled")
      case 'rescheduled':
        return t("statusRescheduled")
      default:
        return status
    }
  }

  // Note: Usage and plan limits are not needed for service requests page

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
        </div>

        {/* Usage Limit Bar - Removed from service requests page as it's not needed */}

        {/* Service Requests List */}
        {serviceRequests.length === 0 ? (
          <EmptyState
            icon={<svg className="mx-auto w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>}
            title={t("noServiceRequests")}
            description={t("noServiceRequestsDescription")}
            buttonText={t("createFirstServiceRequest")}
            onButtonClick={() => window.location.href = "/dashboard/services"}
          />
        ) : (
          <div className="space-y-4">
            {serviceRequests.map((request) => {
              const { day, month, year } = formatDate(request.date_created)
              return (
                <div
                  key={request.request_id}
                  className={`rounded-xl shadow-sm border p-6 ${
                    theme === 'dark' 
                      ? 'bg-zinc-800 border-gray-600' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Column 1: Date request */}
                    <div className="lg:col-span-2">
                      <div className={`p-2 rounded-lg text-center ${
                        theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-50'
                      }`}>
                        <div className={`text-xl font-bold ${
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                        }`}>{day}</div>
                        <div className={`text-xs font-medium ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>{month}</div>
                        <div className={`text-xs ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>{year}</div>
                      </div>
                    </div>

                    {/* Column 2: Request reference, service category, service name, price */}
                    <div className="lg:col-span-4">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`text-lg font-semibold ${
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                        }`}>{request.request_reference}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                      </div>
                      <div className="mb-2">
                        <div className={`font-medium ${
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                        }`}>
                          {request.service.service_name}
                        </div>
                        {request.service.servicecategory?.category_name && (
                          <div className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {request.service.servicecategory.category_name}
                          </div>
                        )}
                      </div>
                      <div className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {request.price_subtotal ? `€${request.price_subtotal}` : t("notSpecified")}
                      </div>
                    </div>

                    {/* Column 3: Customer information */}
                    <div className="lg:col-span-3">
                      <div className={`text-xs font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>{t("customer")}</div>
                      <div className={`font-medium ${
                        theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                      }`}>
                        {request.customer_name}
                      </div>
                      <div className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {request.customer_email}
                        {request.customer_phone && ` • ${request.customer_phone}`}
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <button
                          onClick={() => navigator.clipboard.writeText(request.customer_name)}
                          className={`p-1.5 rounded transition-colors ${
                            theme === 'dark' 
                              ? 'text-gray-400 hover:text-gray-300 hover:bg-zinc-700' 
                              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                          }`}
                          title="Copy name"
                        >
                          <ClipboardDocumentIcon className="w-4 h-4" />
                        </button>
                        {request.customer_email && (
                          <a
                            href={`mailto:${request.customer_email}`}
                            className={`p-1.5 rounded transition-colors ${
                              theme === 'dark' 
                                ? 'text-blue-400 hover:text-blue-300 hover:bg-zinc-700' 
                                : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                            }`}
                            title="Send email"
                          >
                            <EnvelopeIcon className="w-4 h-4" />
                          </a>
                        )}
                        {request.customer_phone && (
                          <a
                            href={`https://wa.me/${request.customer_phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-1.5 rounded transition-colors ${
                              theme === 'dark' 
                                ? 'text-green-400 hover:text-green-300 hover:bg-zinc-700' 
                                : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                            }`}
                            title="WhatsApp"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Column 4: Buttons */}
                    <div className="lg:col-span-3 flex justify-end items-start">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/service-requests/${request.request_id}`}
                          className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                            theme === 'dark' 
                              ? 'bg-zinc-700 text-gray-300 hover:bg-zinc-600' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {t("viewDetails")}
                        </Link>
                        <Link
                          href={`/dashboard/quotation-generator?requestId=${request.request_id}`}
                          className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                            theme === 'dark' 
                              ? 'bg-green-600 text-white hover:bg-green-700' 
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          <DocumentArrowUpIcon className="w-4 h-4" />
                          Generate Quotation
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

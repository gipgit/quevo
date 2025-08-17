'use client'

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useTheme } from "@/contexts/ThemeContext"
import { useBusiness } from "@/lib/business-context"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import EmptyState from "@/components/EmptyState"
import { EnvelopeIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline'
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
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`text-lg font-semibold ${
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                        }`}>{request.request_reference}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                      </div>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {request.service.service_name}
                        {request.service.servicecategory?.category_name && (
                          <span className="ml-2">• {request.service.servicecategory.category_name}</span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>{t("created")}</div>
                      <div className={`font-medium ${
                        theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                      }`}>{day} {month} {year}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className={`text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>{t("customer")}</div>
                      <div className={`${
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
                    </div>
                    <div>
                      <div className={`text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>{t("price")}</div>
                      <div className={`text-lg font-semibold ${
                        theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                      }`}>
                        {request.price_subtotal ? `€${request.price_subtotal}` : t("notSpecified")}
                      </div>
                    </div>
                  </div>

                  {request.customer_notes && (
                    <div className="mb-4">
                      <div className={`text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>{t("notes")}</div>
                      <div className={`p-3 rounded-lg ${
                        theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-50'
                      }`}>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>{request.customer_notes}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/service-requests/${request.request_id}`}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
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
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        theme === 'dark' 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      <DocumentArrowUpIcon className="w-4 h-4" />
                      Generate Quotation
                    </Link>
                    <Link
                      href={`/dashboard/service-requests/${request.request_id}/messages`}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        theme === 'dark' 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      <EnvelopeIcon className="w-4 h-4" />
                      {t("messages")}
                    </Link>
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

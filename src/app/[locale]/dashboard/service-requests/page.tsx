"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useBusiness } from "@/lib/business-context"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { UsageLimitBar } from "@/components/dashboard/UsageLimitBar"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import EmptyState from "@/components/EmptyState"

interface ServiceRequest {
  request_id: string
  request_reference: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  request_date: string | null
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rescheduled'
  price_subtotal: number | null
  customer_notes: string | null
  date_created: string
  service: {
    service_name: string
    servicecategory: {
      category_name: string
    } | null
  }
  usercustomer: {
    name_first: string | null
    name_last: string | null
    email: string
    phone: string | null
  } | null
  servicerequeststatushistory: Array<{
    new_status: string
    changed_at: string
  }>
  servicerequestmessage: Array<{
    message_text: string
    sent_at: string
    sender_type: string
  }>
}

export default function ServiceRequestsPage() {
  const t = useTranslations("serviceRequests")
  const { currentBusiness, usage, planLimits, refreshUsageForFeature } = useBusiness()
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [planLimitsData, setPlanLimitsData] = useState<any>(null)

  useEffect(() => {
    if (currentBusiness && currentBusiness.business_id) {
      fetchServiceRequests()
    }
  }, [currentBusiness])

  const fetchServiceRequests = async () => {
    try {
      setLoading(true)
      if (!currentBusiness?.business_id) throw new Error("No business selected")
      const response = await fetch(`/api/businesses/${currentBusiness.business_id}/service-requests`)
      if (!response.ok) throw new Error("Failed to fetch service requests")
      const data = await response.json()
      setServiceRequests(data.serviceRequests)
      setPlanLimitsData(data.planLimits)
    } catch (error) {
      console.error("Error fetching service requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number | null) => {
    if (price === null) return t("priceOnRequest")
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(price)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("it-IT")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'rescheduled':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return t("pending")
      case 'confirmed':
        return t("confirmed")
      case 'cancelled':
        return t("cancelled")
      case 'completed':
        return t("completed")
      case 'rescheduled':
        return t("rescheduled")
      default:
        return status
    }
  }

  const handleViewDetails = (requestId: string) => {
    // Navigate to service request details page
    window.location.href = `/dashboard/service-requests/${requestId}`
  }

  const handleOpenBoard = (requestId: string) => {
    // Navigate to service board for this request
    window.location.href = `/dashboard/service-boards?request=${requestId}`
  }

  if (!currentBusiness) return null

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t("title")}</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end gap-2">
              {planLimitsData && (
                <UsageLimitBar
                  current={serviceRequests.length}
                  max={planLimitsData.maxServiceRequests}
                  label={t("planInfo", { current: "{current}", max: "{max}" })}
                  showUpgrade={true}
                  onUpgrade={() => (window.location.href = "/dashboard/plan")}
                  upgradeText={t("upgradePlan")}
                  unlimitedText={t("unlimited")}
                />
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" color="blue" />
          </div>
        ) : (
          <>
            {/* Service Requests List */}
            <div className="space-y-6">
              {serviceRequests.map((request) => (
                <div
                  key={request.request_id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {/* Request Details - Left Column */}
                      <div className="lg:col-span-2">
                        <div className="mb-4">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {request.request_reference}
                          </h3>
                          {/* Status, Date, and Price */}
                          <div className="flex items-center gap-4 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">{t("status")}:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                {getStatusText(request.status)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">{t("date")}:</span>
                              <span className="text-sm font-medium text-gray-700">{formatDate(request.request_date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">{t("price")}:</span>
                              <span className="text-sm font-medium text-gray-700">{formatPrice(request.price_subtotal)}</span>
                            </div>
                          </div>
                          {/* Service Info */}
                          <p className="text-gray-600 mb-2">
                            {request.service.service_name}
                            {request.service.servicecategory && (
                              <span className="text-gray-400 ml-2">
                                • {request.service.servicecategory.category_name}
                              </span>
                            )}
                          </p>
                        </div>

                        {/* Customer Notes */}
                        {request.customer_notes && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <span className="text-sm text-gray-500">{t("notes")}:</span>
                            <p className="text-gray-700 mt-1">{request.customer_notes}</p>
                          </div>
                        )}

                        {/* Recent Messages Timeline */}
                        {request.servicerequestmessage.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <span className="text-sm text-gray-500 mb-3 block">
                              {request.servicerequestmessage.length} total messages, recent ones are:
                            </span>
                            <div className="flex items-center space-x-4 overflow-x-auto pb-2">
                              {request.servicerequestmessage.slice(0, 5).map((message, index) => (
                                <div key={index} className="flex items-center flex-shrink-0">
                                  {/* Timeline dot */}
                                  <div className="w-3 h-3 rounded-full bg-blue-300 mr-2"></div>
                                  {/* Message content */}
                                  <div className="bg-gray-50 rounded-lg px-3 py-2 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 truncate">
                                      {message.sender_type}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1 truncate max-w-32">
                                      {message.message_text}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {new Date(message.sent_at).toLocaleDateString('it-IT', { 
                                        month: 'short', 
                                        day: 'numeric' 
                                      })}
                                    </div>
                                  </div>
                                  {/* Timeline connector (except for last item) */}
                                  {index < Math.min(4, request.servicerequestmessage.length - 1) && (
                                    <div className="w-8 h-0.5 bg-gray-200 mx-2"></div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Customer Details - Right Column */}
                      <div className="lg:col-span-1">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">{t("customer")}</h4>
                          <div className="space-y-3">
                            <div>
                              <div className="font-semibold text-gray-900 mb-2">
                                {request.usercustomer 
                                  ? `${request.usercustomer.name_first || ''} ${request.usercustomer.name_last || ''}`.trim() || request.usercustomer.email
                                  : request.customer_name || request.customer_email
                                }
                              </div>
                            </div>
                            
                            {/* Customer Contact Info */}
                            {(request.usercustomer?.email || request.customer_email) && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 truncate">
                                  {request.usercustomer?.email || request.customer_email}
                                </span>
                                <button
                                  onClick={() => navigator.clipboard.writeText(request.usercustomer?.email || request.customer_email)}
                                  className="text-blue-600 hover:text-blue-800 transition-colors flex-shrink-0 ml-2"
                                  title="Copy email"
                                >
                                  📋
                                </button>
                              </div>
                            )}
                            {(request.usercustomer?.phone || request.customer_phone) && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 truncate">
                                  {request.usercustomer?.phone || request.customer_phone}
                                </span>
                                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                  <a
                                    href={`tel:${request.usercustomer?.phone || request.customer_phone}`}
                                    className="text-green-600 hover:text-green-800 transition-colors"
                                    title="Call phone"
                                  >
                                    📞
                                  </a>
                                  <a
                                    href={`https://wa.me/${(request.usercustomer?.phone || request.customer_phone)?.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-green-600 hover:text-green-800 transition-colors"
                                    title="WhatsApp"
                                  >
                                    💬
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Open Board Button - Third Column */}
                      <div className="lg:col-span-1">
                        <div className="flex items-center justify-center h-full">
                          <button
                            onClick={() => handleOpenBoard(request.request_id)}
                            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
                          >
                            {t("openBoard")}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {serviceRequests.length === 0 && (
              <EmptyState
                title={t("noServiceRequests")}
                description={t("noServiceRequestsDescription")}
                buttonText={t("viewDetails")}
                onButtonClick={() => window.location.href = "/dashboard/services"}
                icon={<svg className="mx-auto w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
              />
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
} 
"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useBusiness } from "@/lib/business-context"
import { useTheme } from "@/contexts/ThemeContext"
import { canCreateMore, formatUsageDisplay } from "@/lib/usage-utils"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { UsageLimitBar } from "@/components/dashboard/UsageLimitBar"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import EmptyState from "@/components/EmptyState"
import { EnvelopeIcon } from '@heroicons/react/24/outline'
import Link from "next/link"

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
    phone?: string | null
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
  selected_service_items_snapshot?: Array<{
    service_item_id: number
    item_name: string
    quantity: number
    price_at_request: number
  }>
  question_responses_snapshot?: Array<{
    question_id: number
    question_text: string
    question_type: string
    response_text?: string
    selected_options?: Array<{
      option_id: number
      option_text: string
    }>
  }>
  requirement_responses_snapshot?: Array<{
    requirement_block_id: number
    title: string
    requirements_text: string
    customer_confirmed: boolean
  }>
}

export default function ServiceRequestsPage() {
  const t = useTranslations("serviceRequests")
  const { currentBusiness, usage, planLimits } = useBusiness()
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [planLimitsData, setPlanLimitsData] = useState<any>(null)
  const { theme } = useTheme()

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
    if (!dateString) return null
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.toLocaleDateString("it-IT", { month: "long" })
    const year = date.getFullYear()
    return { day, month: month.charAt(0).toUpperCase() + month.slice(1), year }
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
        return 'bg-zinc-100 text-gray-800'
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

  const planLimitRequests = planLimits?.find(l => l.feature === 'service_requests' && l.limit_type === 'count' && l.scope === 'per_month')
  const currentUsage = usage?.service_requests ?? 0
  const canCreateRequest = () => {
    if (!planLimitRequests) return false
    return canCreateMore(currentUsage, planLimitRequests)
  }

  const businessUrlName = currentBusiness?.business_urlname;

  if (!currentBusiness) return null

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-full min-w-0 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-xl lg:text-2xl font-bold ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>{t("title")}</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end gap-2">
              {planLimitRequests && (
                <UsageLimitBar
                  current={currentUsage}
                  max={planLimitRequests.value}
                  label={formatUsageDisplay(currentUsage, planLimitRequests)}
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
            <div className="grid grid-cols-1 gap-y-6">
              {serviceRequests.map((request) => (
                <div key={request.request_id}>
                  <div className={`rounded-xl shadow-sm border overflow-hidden grid grid-cols-1 lg:grid-cols-[12%_45%_28%_15%] ${
                    theme === 'dark' 
                      ? 'bg-zinc-800 border-gray-600' 
                      : 'bg-white border-gray-200'
                  }`}>
                    {/* Status, Creation Date, and Request Reference - First Column */}
                    <div className="col-span-1 p-6">
                      <div className="flex flex-col gap-4">
                        {/* Status */}
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                            {getStatusText(request.status)}
                          </span>
                        </div>
                        {/* Creation Date */}
                        <div className="flex flex-col items-start gap-1">
                          {formatDate(request.request_date) ? (
                            <>
                              <div className="flex items-center gap-1">
                                <span className={`text-xl font-semibold ${
                                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                }`}>{formatDate(request.request_date)?.day}</span>
                                <span className={`text-xl font-semibold ${
                                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                }`}>{formatDate(request.request_date)?.month}</span>
                              </div>
                              <span className={`text-sm ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                              }`}>{formatDate(request.request_date)?.year}</span>
                            </>
                          ) : (
                            <span className={`text-sm ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>N/A</span>
                          )}
                        </div>
                        {/* Request Reference */}
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 border-2 rounded-md text-sm ${
                            theme === 'dark' 
                              ? 'border-gray-400 bg-zinc-700 text-gray-300' 
                              : 'border-gray-500 bg-zinc-100 text-gray-700'
                          }`}>{request.request_reference}</span>
                        </div>
                      </div>
                    </div>

                                         {/* Request Details + Customer - Middle Column */}
                     <div className="col-span-1 p-6 max-w-lg min-w-[320px]">
                       <div className="mb-4">
                         <h3 className={`text-lg lg:text-xl font-bold mb-2 ${
                           theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                         }`}>
                           {request.service.service_name}
                         </h3>
                         {/* Service Category */}
                         {request.service.servicecategory && (
                           <p className={`mb-2 ${
                             theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                           }`}>
                             {request.service.servicecategory.category_name}
                           </p>
                         )}
                       </div>
                      
                      {/* Customer Details Row */}
                      <div className="self-start flex-shrink-0 w-full">
                        <div className={`border-2 rounded-xl p-3 w-full h-full flex flex-col justify-center ${
                          theme === 'dark' 
                            ? 'border-gray-600 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-700' 
                            : 'border-gray-200 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50'
                        }`}>
                          <div className="space-y-1">
                            <div>
                              <div className={`text-sm font-bold mb-1 ${
                                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                              }`}>
                                {request.usercustomer 
                                  ? `${request.usercustomer.name_first || ''} ${request.usercustomer.name_last || ''}`.trim() || request.usercustomer.email
                                  : request.customer_name || request.customer_email
                                }
                              </div>
                            </div>
                            {/* Email Row */}
                            {(request.usercustomer?.email || request.customer_email) && (
                              <div className="flex items-center justify-between">
                                <span className={`text-sm truncate flex items-center gap-1 ${
                                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                  <EnvelopeIcon className="w-4 h-4 text-gray-400 inline-block" />
                                  {request.usercustomer?.email || request.customer_email}
                                </span>
                                <div className="flex items-center gap-1 ml-2">
                                  <a
                                    href={`mailto:${request.usercustomer?.email || request.customer_email}`}
                                    className="p-0.5 hover:bg-blue-100 rounded transition-colors"
                                    title="Send email"
                                  >
                                    <EnvelopeIcon className="w-4 h-4 text-blue-600" />
                                  </a>
                                  <button
                                    onClick={() => navigator.clipboard.writeText(request.usercustomer?.email || request.customer_email || '')}
                                    className="p-0.5 hover:bg-zinc-200 rounded transition-colors"
                                    title="Copy email"
                                  >
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            )}
                            {/* Phone Row */}
                            {(request.usercustomer?.phone || request.customer_phone) && (
                              <div className="flex items-center justify-between mt-1">
                                <span className={`text-sm truncate flex items-center gap-1 ${
                                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                  <svg className="w-4 h-4 inline-block text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  {request.usercustomer?.phone || request.customer_phone}
                                </span>
                                <div className="flex items-center gap-1 ml-2">
                                  <button
                                    onClick={() => navigator.clipboard.writeText(request.usercustomer?.phone || request.customer_phone || '')}
                                    className="p-0.5 hover:bg-zinc-200 rounded transition-colors"
                                    title="Copy phone number"
                                  >
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                  </button>
                                  <a
                                    href={`tel:${request.usercustomer?.phone || request.customer_phone}`}
                                    className="p-0.5 hover:bg-green-200 rounded transition-colors"
                                    title="Call phone number"
                                  >
                                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                  </a>
                                  <a
                                    href={`https://wa.me/${(request.usercustomer?.phone || request.customer_phone)?.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-0.5 hover:bg-green-200 rounded transition-colors"
                                    title="Open WhatsApp chat"
                                  >
                                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                    </svg>
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                                         {/* Price and Details - Third Column */}
                     <div className="col-span-1 p-6 flex flex-col gap-1 items-start">
                       {/* Price */}
                       <div className="mb-4">
                         <p className={`text-lg font-semibold ${
                           theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                         }`}>
                           {formatPrice(request.price_subtotal)}
                         </p>
                       </div>
                       
                       {/* Notes and Details */}
                       <div className="flex flex-col gap-2 flex-grow min-w-0 w-full break-words break-all">
                         {/* Customer Notes - Small card with light blue background */}
                         {request.customer_notes && (
                           <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 w-full min-w-0 mb-2 break-all">
                             <span className="text-xs text-blue-600 font-medium whitespace-nowrap">{t("notes")}:</span>
                             <span className="text-sm text-blue-800 ml-1">{request.customer_notes}</span>
                           </div>
                         )}
                         {/* Selected Service Items */}
                         {request.selected_service_items_snapshot && request.selected_service_items_snapshot.length > 0 && (
                           <div className="mt-2 w-full break-words break-all min-w-0">
                             <span className="text-xs text-gray-400 font-medium block mb-1">Selected Items:</span>
                             <ul className="list-disc list-inside text-sm text-gray-700 w-full break-words break-all min-w-0">
                               {request.selected_service_items_snapshot.map((item) => (
                                 <li key={item.service_item_id}>
                                   {item.item_name} x{item.quantity} ({item.price_at_request}€)
                                 </li>
                               ))}
                             </ul>
                           </div>
                         )}
                         {/* Question Responses */}
                         {request.question_responses_snapshot && request.question_responses_snapshot.length > 0 && (
                           <div className="mt-2 w-full break-words break-all min-w-0">
                             <span className="text-xs text-gray-400 font-medium block mb-1">Question Responses:</span>
                             <ul className="list-disc list-inside text-sm text-gray-700 w-full break-words break-all min-w-0">
                               {request.question_responses_snapshot.map((q) => (
                                 <li key={q.question_id}>
                                   <span className="font-semibold">{q.question_text}:</span> {q.response_text || (q.selected_options ? q.selected_options.map(opt => opt.option_text).join(', ') : '')}
                                 </li>
                               ))}
                             </ul>
                           </div>
                         )}
                         {/* Requirement Responses */}
                         {request.requirement_responses_snapshot && request.requirement_responses_snapshot.length > 0 && (
                           <div className="mt-2 w-full break-words break-all min-w-0">
                             <span className="text-xs text-gray-400 font-medium block mb-1">Requirements Confirmed:</span>
                             <ul className="list-disc list-inside text-sm text-gray-700 w-full break-words break-all min-w-0">
                               {request.requirement_responses_snapshot.map((r) => (
                                 <li key={r.requirement_block_id}>
                                   <span className="font-semibold">{r.title}:</span> {r.customer_confirmed ? 'Confirmed' : 'Not confirmed'}
                                 </li>
                               ))}
                             </ul>
                           </div>
                         )}
                         {/* Placeholder if no items/responses (notes are independent) */}
                         {!(request.selected_service_items_snapshot && request.selected_service_items_snapshot.length > 0)
                           && !(request.question_responses_snapshot && request.question_responses_snapshot.length > 0)
                           && !(request.requirement_responses_snapshot && request.requirement_responses_snapshot.length > 0)
                           && (
                           <div className="border border-dashed border-gray-200 rounded-lg p-3 text-xs text-gray-400 text-center bg-zinc-50 min-w-0 w-full break-all">
                             No details available
                           </div>
                         )}
                       </div>
                     </div>

                    {/* Open Board Button - Fourth Column */}
                    <div className="col-span-1 p-6 flex items-center justify-center">
                      {businessUrlName && request.request_id && request.request_reference && (
                        <a
                          href={`/${businessUrlName}/s/${request.request_reference}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-3 bg-zinc-600 hover:bg-zinc-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                        >
                          {t("openBoard")}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </a>
                      )}
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
'use client'

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { useTheme } from "@/contexts/ThemeContext"
import { useBusiness } from "@/lib/business-context"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import EmptyState from "@/components/EmptyState"
import { 
  EnvelopeIcon, 
  DocumentArrowUpIcon, 
  ClipboardDocumentIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  ChatBubbleLeftRightIcon,
  ShareIcon,
  FlagIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'
import { 
  CheckCircleIcon as CheckCircleSolidIcon,
  ExclamationTriangleIcon as ExclamationTriangleSolidIcon
} from '@heroicons/react/24/solid'

interface ServiceRequestsWrapperProps {
  serviceRequests: any[]
}

export default function ServiceRequestsWrapper({ serviceRequests: initialServiceRequests }: ServiceRequestsWrapperProps) {
  const t = useTranslations("serviceRequests")
  const { theme } = useTheme()
  const { currentBusiness, businessSwitchKey } = useBusiness()
  const [serviceRequests, setServiceRequests] = useState(initialServiceRequests)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

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

  // Set initial selected request
  useEffect(() => {
    if (serviceRequests.length > 0 && !selectedRequest) {
      setSelectedRequest(serviceRequests[0])
      setSelectedIndex(0)
    }
  }, [serviceRequests, selectedRequest])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!serviceRequests.length) return

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault()
          navigateRequest(-1)
          break
        case 'ArrowDown':
          event.preventDefault()
          navigateRequest(1)
          break
        case 'Enter':
          event.preventDefault()
          if (selectedRequest) {
            markAsHandled(selectedRequest.request_id)
          }
          break
        case 'h':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            if (selectedRequest) {
              markAsHandled(selectedRequest.request_id)
            }
          }
          break
        case 'q':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            if (selectedRequest) {
              generateQuotation(selectedRequest.request_id)
            }
          }
          break
        case 'f':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            if (selectedRequest) {
              toggleUrgencyFlag(selectedRequest.request_id)
            }
          }
          break
        case 'w':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            if (selectedRequest) {
              shareOnWhatsApp(selectedRequest)
            }
          }
          break
        case 'e':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            if (selectedRequest) {
              shareViaEmail(selectedRequest)
            }
          }
          break
        case 'c':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            if (selectedRequest) {
              copyCustomerContacts(selectedRequest)
            }
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedRequest, serviceRequests])

  const navigateRequest = useCallback((direction: number) => {
    if (!serviceRequests.length) return
    
    const newIndex = Math.max(0, Math.min(serviceRequests.length - 1, selectedIndex + direction))
    setSelectedIndex(newIndex)
    setSelectedRequest(serviceRequests[newIndex])
  }, [selectedIndex, serviceRequests])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.toLocaleDateString("it-IT", { month: "short" })
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

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'text-red-600'
      case 'high':
        return 'text-orange-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return <ExclamationTriangleSolidIcon className="w-4 h-4 text-red-600" />
      case 'high':
        return <ExclamationTriangleIcon className="w-4 h-4 text-orange-600" />
      case 'medium':
        return <ClockIcon className="w-4 h-4 text-yellow-600" />
      case 'low':
        return <CheckCircleIcon className="w-4 h-4 text-green-600" />
      default:
        return <ClockIcon className="w-4 h-4 text-gray-600" />
    }
  }

  // Helper function to check if request is handled (fallback for when new fields aren't available)
  const isRequestHandled = (request: any) => {
    return request.is_handled || request.status === 'completed'
  }

  // Action functions
  const markAsHandled = async (requestId: string) => {
    try {
      const response = await fetch(`/api/service-requests/${requestId}/mark-handled`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_handled: true })
      })
      
      if (response.ok) {
        setServiceRequests((prev: any[]) => prev.map(req => 
          req.request_id === requestId 
            ? { ...req, is_handled: true, handled_at: new Date().toISOString() }
            : req
        ))
        setSelectedRequest((prev: any) => prev?.request_id === requestId 
          ? { ...prev, is_handled: true, handled_at: new Date().toISOString() }
          : prev
        )
      }
    } catch (error) {
      console.error('Error marking request as handled:', error)
    }
  }

  const generateQuotation = (requestId: string) => {
    window.open(`/dashboard/quotation-generator?requestId=${requestId}`, '_blank')
  }

  const toggleUrgencyFlag = async (requestId: string) => {
    try {
      const currentRequest = serviceRequests.find(req => req.request_id === requestId)
      const newUrgencyFlag = !currentRequest?.urgency_flag
      
      const response = await fetch(`/api/service-requests/${requestId}/toggle-urgency`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urgency_flag: newUrgencyFlag })
      })
      
      if (response.ok) {
        setServiceRequests((prev: any[]) => prev.map(req => 
          req.request_id === requestId 
            ? { ...req, urgency_flag: newUrgencyFlag }
            : req
        ))
        setSelectedRequest((prev: any) => prev?.request_id === requestId 
          ? { ...prev, urgency_flag: newUrgencyFlag }
          : prev
        )
      }
    } catch (error) {
      console.error('Error toggling urgency flag:', error)
    }
  }

  const shareOnWhatsApp = (request: any) => {
    if (request.customer_phone) {
      const message = `Hi ${request.customer_name}, regarding your service request ${request.request_reference}...`
      const whatsappUrl = `https://wa.me/${request.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, '_blank')
    }
  }

  const shareViaEmail = (request: any) => {
    if (request.customer_email) {
      const subject = `Service Request ${request.request_reference} - Update`
      const body = `Hi ${request.customer_name},\n\nRegarding your service request ${request.request_reference}...`
      const mailtoUrl = `mailto:${request.customer_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      window.open(mailtoUrl)
    }
  }

  const copyCustomerContacts = async (request: any) => {
    const contacts = `${request.customer_name}\nEmail: ${request.customer_email}\nPhone: ${request.customer_phone}`
    try {
      await navigator.clipboard.writeText(contacts)
      // You could add a toast notification here
    } catch (error) {
      console.error('Error copying contacts:', error)
    }
  }

  // Calculate progress
  const totalRequests = serviceRequests.length
  const handledRequests = serviceRequests.filter(req => isRequestHandled(req)).length
  const unhandledRequests = totalRequests - handledRequests
  const progressPercentage = totalRequests > 0 ? (handledRequests / totalRequests) * 100 : 0

  if (serviceRequests.length === 0) {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>{t("title")}</h1>
          </div>
        </div>

          <EmptyState
            icon={<svg className="mx-auto w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>}
            title={t("noServiceRequests")}
            description={t("noServiceRequestsDescription")}
            buttonText={t("createFirstServiceRequest")}
            onButtonClick={() => window.location.href = "/dashboard/services"}
          />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <div>
            <h1 className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>{t("title")}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Keyboard Shortcuts Button with Tooltip */}
            <div className="relative group">
              <button
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
                title="Keyboard shortcuts"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
              
              {/* Tooltip */}
              <div className={`absolute right-0 top-full mt-2 p-3 rounded-lg shadow-lg border z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700 text-gray-300' 
                  : 'bg-white border-gray-200 text-gray-700'
              }`}>
                <div className="text-xs whitespace-nowrap">
                  <div className="font-medium mb-2">Keyboard Shortcuts:</div>
                  <div>↑↓ Navigate requests</div>
                  <div>Enter/Ctrl+H Mark handled</div>
                  <div>Ctrl+Q Generate quotation</div>
                  <div>Ctrl+F Toggle urgency</div>
                  <div>Ctrl+C Copy contacts</div>
                </div>
                {/* Arrow pointing up */}
                <div className={`absolute -top-1 right-4 w-2 h-2 rotate-45 ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-l border-t border-gray-700' 
                    : 'bg-white border-l border-t border-gray-200'
                }`}></div>
              </div>
            </div>
            
            {/* Navigation Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateRequest(-1)}
                disabled={selectedIndex === 0}
                className={`p-2 rounded-lg transition-colors ${
                  selectedIndex === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : theme === 'dark'
                      ? 'hover:bg-gray-700'
                      : 'hover:bg-gray-100'
                }`}
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <span className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {selectedIndex + 1} of {serviceRequests.length}
              </span>
              <button
                onClick={() => navigateRequest(1)}
                disabled={selectedIndex === serviceRequests.length - 1}
                className={`p-2 rounded-lg transition-colors ${
                  selectedIndex === serviceRequests.length - 1
                    ? 'opacity-50 cursor-not-allowed'
                    : theme === 'dark'
                      ? 'hover:bg-gray-700'
                      : 'hover:bg-gray-100'
                }`}
              >
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>



        {/* Main Content - Outlook-like Layout */}
        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Left Panel - Request List */}
          <div className={`w-80 border-r ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          } flex flex-col`}>
            {/* Progress Bar */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Progress: {handledRequests} of {totalRequests} handled
                </span>
                <span className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {unhandledRequests} remaining
                </span>
              </div>
              <div className={`w-full h-2 rounded-full ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <div 
                  className="h-2 bg-green-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            
            {/* Request List */}
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-1 p-2">
              {serviceRequests.map((request, index) => {
                const { day, month } = formatDate(request.date_created)
                const isSelected = selectedRequest?.request_id === request.request_id
                
              return (
                <div
                  key={request.request_id}
                    onClick={() => {
                      setSelectedRequest(request)
                      setSelectedIndex(index)
                    }}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? theme === 'dark'
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-50 border-blue-200 border'
                        : theme === 'dark'
                          ? 'hover:bg-gray-700 text-gray-300'
                          : 'hover:bg-gray-50 text-gray-900'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                                          <div className="flex items-center gap-2">
                      {isRequestHandled(request) ? (
                        <CheckCircleSolidIcon className="w-4 h-4 text-green-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-blue-500" />
                      )}
                        <span className="font-medium text-sm">{request.request_reference}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {getPriorityIcon(request.priority || 'medium')}
                        {request.urgency_flag && (
                          <FlagIcon className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>
                    
                    <div className="text-sm mb-2">
                      <div className="font-medium">{request.customer_name}</div>
                      <div className="text-xs opacity-75">{request.service?.service_name}</div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <span>{day} {month}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </div>
                  </div>
                )
              })}
              </div>
            </div>
          </div>

          {/* Right Panel - Request Details */}
          <div className="flex-1 flex flex-col min-h-0">
            {selectedRequest ? (
              <>
                {/* Request Header */}
                <div className={`p-6 border-b ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <h2 className={`text-xl font-bold ${
                        theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                      }`}>
                        {selectedRequest.request_reference}
                      </h2>
                      <span>{selectedRequest.service?.service_name || 'N/A'}</span>
                      <span>€{selectedRequest.price_subtotal || 0}</span>
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedRequest.status)}`}>
                        {getStatusText(selectedRequest.status)}
                      </span>
                      {selectedRequest.urgency_flag && (
                        <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
                          Urgent
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className={`p-6 border-b ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => markAsHandled(selectedRequest.request_id)}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        isRequestHandled(selectedRequest)
                          ? 'bg-green-100 text-green-800'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                      title="Mark as handled (Ctrl+H)"
                    >
                      {isRequestHandled(selectedRequest) ? (
                        <CheckCircleSolidIcon className="w-4 h-4" />
                      ) : (
                        <CheckCircleIcon className="w-4 h-4" />
                      )}
                      {isRequestHandled(selectedRequest) ? 'Handled' : 'Mark Handled'}
                    </button>
                    
                    <button
                      onClick={() => generateQuotation(selectedRequest.request_id)}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
                      title="Generate quotation (Ctrl+Q)"
                    >
                      <DocumentArrowUpIcon className="w-4 h-4" />
                      Generate Quotation
                    </button>
                    
                    <button
                      onClick={() => toggleUrgencyFlag(selectedRequest.request_id)}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        selectedRequest.urgency_flag
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title="Toggle urgency flag (Ctrl+F)"
                    >
                      <FlagIcon className="w-4 h-4" />
                      {selectedRequest.urgency_flag ? 'Urgent' : 'Flag Urgent'}
                    </button>
                    
                    {selectedRequest.serviceboard && selectedRequest.serviceboard[0] && (
                      <button
                        onClick={() => window.open(`/${currentBusiness?.business_urlname}/s/${selectedRequest.serviceboard[0].board_ref}`, '_blank')}
                        className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center gap-2"
                        title="Open service board"
                      >
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                        Open Board
                      </button>
                    )}
                  </div>
                </div>

                {/* Customer Details */}
                <div className={`p-6 border-b ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <h3 className={`text-lg font-semibold mb-3 ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>Customer Details</h3>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <span>{selectedRequest.customer_name}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(selectedRequest.customer_name)}
                        className={`p-1 rounded transition-colors ${
                          theme === 'dark' 
                            ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                        }`}
                        title="Copy name"
                      >
                        <ClipboardDocumentIcon className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{selectedRequest.customer_email}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(selectedRequest.customer_email)}
                        className={`p-1 rounded transition-colors ${
                          theme === 'dark' 
                            ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                        }`}
                        title="Copy email"
                      >
                        <ClipboardDocumentIcon className="w-3 h-3" />
                      </button>
                      {selectedRequest.customer_email && (
                        <a
                          href={`mailto:${selectedRequest.customer_email}`}
                          className={`p-1 rounded transition-colors ${
                            theme === 'dark' 
                              ? 'text-blue-400 hover:text-blue-300 hover:bg-gray-700' 
                              : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                          }`}
                          title="Send email"
                        >
                          <EnvelopeIcon className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    {selectedRequest.customer_phone && (
                      <div className="flex items-center gap-2">
                        <span>{selectedRequest.customer_phone}</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(selectedRequest.customer_phone)}
                          className={`p-1 rounded transition-colors ${
                            theme === 'dark' 
                              ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                          }`}
                          title="Copy phone"
                        >
                          <ClipboardDocumentIcon className="w-3 h-3" />
                        </button>
                        <a
                          href={`https://wa.me/${selectedRequest.customer_phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-1 rounded transition-colors ${
                            theme === 'dark' 
                              ? 'text-green-400 hover:text-green-300 hover:bg-gray-700' 
                              : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                          }`}
                          title="WhatsApp"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Request Content - Flexible without overflow scroll */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="space-y-6">

                    {/* Event and Datetime Information */}
                    {(selectedRequest.serviceevent || selectedRequest.request_datetimes) && (
                      <div>
                        <h3 className={`text-lg font-semibold mb-2 ${
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                        }`}>Event & Scheduling</h3>
                        
                        <div className={`p-4 rounded-lg border ${
                          theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                        }`}>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {selectedRequest.serviceevent?.event_name || 'Event'}
                              </span>
                            </div>
                                                         <div className="text-right">
                               {selectedRequest.request_datetimes && (
                                 <div>
                                   {Array.isArray(selectedRequest.request_datetimes) ? (
                                     <div className="space-y-1">
                                       {selectedRequest.request_datetimes.map((datetime: string, index: number) => {
                                         try {
                                           const dateToUse = new Date(datetime);
                                           if (isNaN(dateToUse.getTime())) {
                                             return null; // Skip invalid dates
                                           }
                                           
                                           return (
                                             <div key={index} className="text-xs">
                                               {dateToUse.toLocaleString('it-IT', {
                                                 weekday: 'short',
                                                 day: 'numeric',
                                                 month: 'short',
                                                 hour: '2-digit',
                                                 minute: '2-digit'
                                               })}
                                             </div>
                                           );
                                         } catch (error) {
                                           return null; // Skip invalid dates
                                         }
                                       })}
                                     </div>
                                   ) : (
                                     <div className="text-xs">
                                       {(() => {
                                         try {
                                           const dateToUse = new Date(selectedRequest.request_datetimes);
                                           if (isNaN(dateToUse.getTime())) {
                                             return null; // Skip invalid dates
                                           }
                                           
                                           return dateToUse.toLocaleString('it-IT', {
                                             weekday: 'short',
                                             day: 'numeric',
                                             month: 'short',
                                             hour: '2-digit',
                                             minute: '2-digit'
                                           });
                                         } catch (error) {
                                           return null; // Skip invalid dates
                                         }
                                       })()}
                                     </div>
                                   )}
                                 </div>
                               )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Selected Service Items */}
                    <div>
                      <h3 className={`text-lg font-semibold mb-2 ${
                        theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                      }`}>Selected Items</h3>
                      {selectedRequest.selected_service_items_snapshot && Array.isArray(selectedRequest.selected_service_items_snapshot) && selectedRequest.selected_service_items_snapshot.length > 0 ? (
                        <div className="space-y-2">
                          {selectedRequest.selected_service_items_snapshot.map((item: any, index: number) => (
                            <div key={index} className={`p-2 rounded-lg border ${
                              theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                            }`}>
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-4">
                                  <span className="font-medium">{item.name || item.item_name}</span>
                                  <span className="opacity-75">{item.qty || item.quantity} x €{item.price_at_req || item.price_at_request}</span>
                                  {item.description && (
                                    <span className="opacity-60 text-xs">({item.description})</span>
                                  )}
                                </div>
                                <div className="font-medium">
                                  €{((item.qty || item.quantity) * (item.price_at_req || item.price_at_request)).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className={`p-3 rounded-lg border ${
                          theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                        }`}>
                          <div className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            No items selected for this request.
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Question Responses */}
                    <div>
                      <h3 className={`text-lg font-semibold mb-2 ${
                        theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                      }`}>Question Responses</h3>
                      {selectedRequest.question_responses_snapshot && Array.isArray(selectedRequest.question_responses_snapshot) && selectedRequest.question_responses_snapshot.length > 0 ? (
                        <div className="space-y-2">
                          {selectedRequest.question_responses_snapshot.map((question: any, index: number) => (
                            <div key={index} className={`p-2 rounded-lg border ${
                              theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                            }`}>
                              <div className="flex items-start justify-between text-sm">
                                <div className="flex-1">
                                  <div className="mb-1">
                                    <span className={`text-xs opacity-60 ${
                                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                    }`}>{question.question_text}</span>
                                  </div>
                                  {question.response_text && (
                                    <div className="font-medium">{question.response_text}</div>
                                  )}
                                  {question.selected_options && question.selected_options.length > 0 && (
                                    <div>
                                      {question.selected_options.map((option: any, optIndex: number) => (
                                        <span key={optIndex} className="inline-block bg-gray-100 px-2 py-1 rounded text-xs mr-1 mb-1">
                                          {option.option_text}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className={`p-3 rounded-lg border ${
                          theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                        }`}>
                          <div className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            No question responses for this request.
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Requirement Responses */}
                    <div>
                      <h3 className={`text-lg font-semibold mb-2 ${
                        theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                      }`}>Requirements</h3>
                      {selectedRequest.requirement_responses_snapshot && Array.isArray(selectedRequest.requirement_responses_snapshot) && selectedRequest.requirement_responses_snapshot.length > 0 ? (
                        <div className="space-y-2">
                          {selectedRequest.requirement_responses_snapshot.map((requirement: any, index: number) => (
                            <div key={index} className={`p-2 rounded-lg border ${
                              theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                            }`}>
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    {requirement.title && (
                                      <span className="font-medium text-xs">{requirement.title}:</span>
                                    )}
                                    <span className="text-xs">{requirement.requirements_text}</span>
                                  </div>
                                </div>
                                <div className={`ml-4 px-2 py-1 rounded-full text-xs ${
                                  requirement.customer_confirmed 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {requirement.customer_confirmed ? 'Confirmed' : 'Pending'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className={`p-3 rounded-lg border ${
                          theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                        }`}>
                          <div className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            No requirements for this request.
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Customer Notes */}
                    {selectedRequest.customer_notes && (
                      <div>
                        <h3 className={`text-lg font-semibold mb-2 ${
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                        }`}>Customer Notes</h3>
                        <div className={`p-4 rounded-lg ${
                          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
                        }`}>
                          {selectedRequest.customer_notes}
                        </div>
                      </div>
                    )}

                    {/* Service Board Actions */}
                    {selectedRequest.serviceboard?.[0] && (
                      <div>
                        <h3 className={`text-lg font-semibold mb-2 ${
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                        }`}>Service Board Actions</h3>
                        <div className="space-y-2">
                          {selectedRequest.serviceboard[0].serviceboardaction?.map((action: any) => (
                            <div key={action.action_id} className={`p-3 rounded-lg border ${
                              theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{action.action_title}</div>
                                  <div className="text-sm opacity-75">{action.action_type}</div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  action.action_status === 'completed' 
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {action.action_status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Messages */}
                    {selectedRequest.servicerequestmessage?.length > 0 && (
                      <div>
                        <h3 className={`text-lg font-semibold mb-2 ${
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                        }`}>Messages</h3>
                        <div className="space-y-2">
                          {selectedRequest.servicerequestmessage.map((message: any) => (
                            <div key={message.message_id} className={`p-3 rounded-lg ${
                              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
                            }`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">{message.sender_type}</span>
                                <span className="text-xs opacity-75">
                                  {new Date(message.sent_at).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="text-sm">{message.message_text}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className={`text-center ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <EyeIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a request to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

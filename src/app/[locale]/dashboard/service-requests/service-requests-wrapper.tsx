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

  // Debug: Log initial service requests
  useEffect(() => {
    console.log('Initial service requests:', initialServiceRequests.map(req => ({
      request_id: req.request_id,
      request_reference: req.request_reference,
      is_handled: req.is_handled,
      urgency_flag: req.urgency_flag,
      is_closed: req.is_closed
    })))
  }, [initialServiceRequests])

  // Refetch service requests when business changes
  useEffect(() => {
    const fetchServiceRequests = async () => {
      if (!currentBusiness?.business_id) return
      
      try {
        const response = await fetch(`/api/businesses/${currentBusiness.business_id}/service-requests`)
        if (response.ok) {
          const data = await response.json()
          console.log('Refetched service requests:', data.serviceRequests?.map((req: any) => ({
            request_id: req.request_id,
            request_reference: req.request_reference,
            is_handled: req.is_handled,
            urgency_flag: req.urgency_flag,
            is_closed: req.is_closed
          })))
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
      console.log('Marking request as handled:', requestId)
      
      const response = await fetch(`/api/service-requests/${requestId}/mark-handled`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // No need to send is_handled, server will toggle it
      })
      
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('Response data:', result)
        
        setServiceRequests((prev: any[]) => prev.map(req => 
          req.request_id === requestId 
            ? { ...req, is_handled: result.request.is_handled, handled_at: result.request.handled_at, handled_by: result.request.handled_by }
            : req
        ))
        setSelectedRequest((prev: any) => prev?.request_id === requestId 
          ? { ...prev, is_handled: result.request.is_handled, handled_at: result.request.handled_at, handled_by: result.request.handled_by }
          : prev
        )
      } else {
        const errorData = await response.json()
        console.error('API error:', errorData)
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
      
      console.log('Toggling urgency flag:', { requestId, currentUrgency: currentRequest?.urgency_flag, newUrgencyFlag })
      
      const response = await fetch(`/api/service-requests/${requestId}/toggle-urgency`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urgency_flag: newUrgencyFlag })
      })
      
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('Response data:', result)
        
        setServiceRequests((prev: any[]) => prev.map(req => 
          req.request_id === requestId 
            ? { ...req, urgency_flag: result.request.urgency_flag }
            : req
        ))
        setSelectedRequest((prev: any) => prev?.request_id === requestId 
          ? { ...prev, urgency_flag: result.request.urgency_flag }
          : prev
        )
      } else {
        const errorData = await response.json()
        console.error('API error:', errorData)
      }
    } catch (error) {
      console.error('Error toggling urgency flag:', error)
    }
  }

  const toggleClosedStatus = async (requestId: string) => {
    try {
      const currentRequest = serviceRequests.find(req => req.request_id === requestId)
      const newClosedStatus = !currentRequest?.is_closed
      
      console.log('Toggling closed status:', { requestId, currentClosed: currentRequest?.is_closed, newClosedStatus })
      
      const response = await fetch(`/api/service-requests/${requestId}/toggle-closed`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_closed: newClosedStatus })
      })
      
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('Response data:', result)
        
        setServiceRequests((prev: any[]) => prev.map(req => 
          req.request_id === requestId 
            ? { ...req, is_closed: result.request.is_closed }
            : req
        ))
        setSelectedRequest((prev: any) => prev?.request_id === requestId 
          ? { ...prev, is_closed: result.request.is_closed }
          : prev
        )
      } else {
        const errorData = await response.json()
        console.error('API error:', errorData)
      }
    } catch (error) {
      console.error('Error toggling closed status:', error)
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
        <div className="flex justify-between items-center mb-1 lg:mb-6 flex-shrink-0">
          <div>
            <h1 className={`text-xl lg:text-2xl font-bold ${
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
        <div className="flex-1 flex flex-col lg:flex-row gap-2 lg:gap-6 overflow-hidden">
          {/* Left Panel - Request List */}
          <div className={`w-full lg:w-72 border-b lg:border-b-0 lg:border-r ${
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
            <div className="flex-1 overflow-y-auto lg:overflow-y-auto overflow-x-auto lg:overflow-x-visible">
              <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-1 p-2 min-w-max lg:min-w-0">
              {serviceRequests.map((request, index) => {
                const { day, month } = formatDate(request.date_created)
                const time = new Date(request.date_created).toLocaleTimeString('it-IT', {
                  hour: '2-digit',
                  minute: '2-digit'
                })
                const isSelected = selectedRequest?.request_id === request.request_id
                
              return (
                                  <div
                    key={request.request_id}
                      onClick={() => {
                        setSelectedRequest(request)
                        setSelectedIndex(index)
                      }}
                      className={`p-3 rounded-lg cursor-pointer transition-all flex-shrink-0 w-64 lg:w-auto ${
                        isSelected
                          ? theme === 'dark'
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-50 border-blue-200 border'
                          : theme === 'dark'
                            ? 'hover:bg-gray-700 text-gray-300'
                            : 'hover:bg-gray-50 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-1">
                          <span className="opacity-75">{day} {month} {time}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                      </div>
                      
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {isRequestHandled(request) ? (
                            <CheckCircleSolidIcon className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full bg-blue-500" />
                          )}
                          <span className="font-medium text-xs">{request.request_reference}</span>
                          <span className="text-xs opacity-75">• {request.customer_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {getPriorityIcon(request.priority || 'medium')}
                          {request.urgency_flag && (
                            <FlagIcon className="w-3.5 h-3.5 text-red-500" />
                          )}
                        </div>
                      </div>
                      
                      <div className="text-xs">
                        <div className="text-xs opacity-75">{request.service?.service_name}</div>
                      </div>
                    </div>
                )
              })}
              </div>
            </div>
          </div>

          {/* Right Panel - Request Details */}
          <div className="flex-1 flex flex-col min-h-0 lg:min-h-0 h-96 lg:h-auto p-2 lg:p-6 space-y-4 lg:space-y-5">
            {selectedRequest ? (
              <>
                {/* Request Header with Action Buttons */}
                <div className={`border-b ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="flex flex-col lg:flex-row items-start justify-between gap-2 lg:gap-4">
                    <div className="flex-1 min-w-0 w-full lg:w-auto">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className={`text-2xl font-bold ${
                            theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                          }`}>
                            {selectedRequest.request_reference}
                          </h2>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(selectedRequest.status)}`}>
                            {getStatusText(selectedRequest.status)}
                          </span>
                          {selectedRequest.urgency_flag && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800">
                              Urgent
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{selectedRequest.customer_name}</span>
                          <span>•</span>
                          <span>{selectedRequest.service?.service_name || 'N/A'}</span>
                          <span>•</span>
                          <span>€{selectedRequest.price_subtotal || 0}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto lg:max-w-sm">
                      <button
                        onClick={() => markAsHandled(selectedRequest.request_id)}
                        className={`px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg transition-colors flex items-center gap-1 lg:gap-1.5 text-xs lg:text-sm ${
                          isRequestHandled(selectedRequest)
                            ? 'bg-green-100 text-green-800'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                        title="Mark as handled (Ctrl+H)"
                      >
                        {isRequestHandled(selectedRequest) ? (
                          <CheckCircleSolidIcon className="w-3.5 h-3.5" />
                        ) : (
                          <CheckCircleIcon className="w-3.5 h-3.5" />
                        )}
                        {isRequestHandled(selectedRequest) ? 'Handled' : 'Mark Handled'}
                      </button>
                      
                      <button
                        onClick={() => toggleUrgencyFlag(selectedRequest.request_id)}
                        className={`px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg transition-colors flex items-center gap-1 lg:gap-1.5 text-xs lg:text-sm ${
                          selectedRequest.urgency_flag
                            ? 'bg-red-100 text-red-800'
                            : 'bg-black text-white hover:bg-gray-800'
                        }`}
                        title="Toggle urgency flag (Ctrl+F)"
                      >
                        <FlagIcon className="w-3.5 h-3.5" />
                        {selectedRequest.urgency_flag ? 'Urgent' : 'Flag Urgent'}
                      </button>
                      
                      <button
                        onClick={() => toggleClosedStatus(selectedRequest.request_id)}
                        className={`px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg transition-colors flex items-center gap-1 lg:gap-1.5 text-xs lg:text-sm ${
                          selectedRequest.is_closed
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-orange-600 text-white hover:bg-orange-700'
                        }`}
                        title="Toggle closed status"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {selectedRequest.is_closed ? 'Closed' : 'Mark Closed'}
                      </button>
                      

                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedRequest.serviceboard?.[0] && (
                    <div>
                    <h3 className={`text-xs font-medium mb-3 pt-1 border-t uppercase tracking-wide ${
                      theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'
                    }`}>Quick Actions</h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => window.open(`/${currentBusiness?.business_urlname}/s/${selectedRequest.serviceboard[0].board_ref}`, '_blank')}
                        className="px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors flex items-center gap-1 lg:gap-1.5 text-xs lg:text-sm"
                        title="Open service board"
                      >
                        <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                        Open Board
                      </button>
                      
                      <button
                        onClick={() => generateQuotation(selectedRequest.request_id)}
                        className="px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1 lg:gap-1.5 text-xs lg:text-sm"
                        title="Generate quotation (Ctrl+Q)"
                      >
                        <DocumentArrowUpIcon className="w-3.5 h-3.5" />
                        Generate Quotation
                      </button>
                      
                      <button
                        onClick={() => window.open(`/${currentBusiness?.business_urlname}/s/${selectedRequest.serviceboard[0].board_ref}?openAddAction=true&actionType=appointment_scheduling`, '_blank')}
                        className="px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-1 lg:gap-1.5 text-xs lg:text-sm"
                        title="Create appointment on service board"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Create Appointment
                      </button>
                      
                      <button
                        onClick={() => window.open(`/${currentBusiness?.business_urlname}/s/${selectedRequest.serviceboard[0].board_ref}?openAddAction=true&actionType=information_request`, '_blank')}
                        className="px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center gap-1 lg:gap-1.5 text-xs lg:text-sm"
                        title="Add information request"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Info Request
                      </button>
                      
                      <button
                        onClick={() => window.open(`/${currentBusiness?.business_urlname}/s/${selectedRequest.serviceboard[0].board_ref}?openAddAction=true&actionType=checklist`, '_blank')}
                        className="px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors flex items-center gap-1 lg:gap-1.5 text-xs lg:text-sm"
                        title="Add checklist"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        Checklist
                      </button>
                    </div>
                  </div>
                )}

                {/* Service Board Actions */}
                {selectedRequest.serviceboard?.[0] && selectedRequest.serviceboard[0].serviceboardaction && selectedRequest.serviceboard[0].serviceboardaction.length > 0 && (
                    <div>
                    <h3 className={`text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide ${
                      theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'
                    }`}>Service Board Actions</h3>
                    <div className="space-y-2">
                      {selectedRequest.serviceboard[0].serviceboardaction.map((action: any) => (
                        <div key={action.action_id} className={`p-3 rounded-lg border ${
                          theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                        }`}>
                          <div className="grid grid-cols-[120px_1fr_auto] lg:grid-cols-[120px_1fr_auto] gap-4 items-center">
                            {/* Column 1: Date and Time */}
                            <div className="text-xs text-gray-500">
                              {action.created_at ? (
                                <>
                                  <div>{new Date(action.created_at).toLocaleDateString()}</div>
                                  <div>{new Date(action.created_at).toLocaleTimeString()}</div>
                                </>
                              ) : (
                                <span className="text-gray-400">No date</span>
                              )}
                              {/* Mobile: Action details in same column */}
                              <div className="lg:hidden mt-2">
                                <div className="font-medium text-xs">{action.action_title}</div>
                                <div className="text-xs opacity-75">{action.action_type}</div>
                              </div>
                            </div>
                            
                            {/* Column 2: Action Title and Type (Desktop only) */}
                            <div className="hidden lg:block col-span-1">
                              <div className="font-medium text-sm">{action.action_title}</div>
                              <div className="text-xs opacity-75">{action.action_type}</div>
                            </div>
                            
                            {/* Column 3: Status Pill */}
                            <div className="flex justify-end">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                action.action_status === 'completed' 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {action.action_status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Customer Details */}
                    <div>
                  <h3 className={`text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide ${
                    theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'
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

                {/* Customer Notes */}
                {selectedRequest.customer_notes && (
                    <div>
                    <h3 className={`text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide ${
                      theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'
                    }`}>Customer Notes</h3>
                    <div className={`p-3 rounded-lg border ${
                      theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
                    }`}>
                      <div className={`text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {selectedRequest.customer_notes}
                      </div>
                    </div>
                  </div>
                )}

                {/* Request Content - Flexible without overflow scroll */}
                <div className="flex-1 overflow-y-auto">

                    {/* Event and Datetime Information */}
                    {(selectedRequest.serviceevent || selectedRequest.request_datetimes) && (
                      <div>
                        <h3 className={`text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide ${
                          theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'
                        }`}>Event & Scheduling</h3>
                        
                        <div className={`p-3 rounded-lg border ${
                          theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                        }`}>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-sm">
                                  {selectedRequest.serviceevent?.event_name || 'Event'}
                                </div>
                                {selectedRequest.request_datetimes && (
                                  <div className="mt-1">
                                    {Array.isArray(selectedRequest.request_datetimes) ? (
                                      <div className="space-y-1">
                                        {selectedRequest.request_datetimes.map((datetime: string, index: number) => {
                                          try {
                                            const dateToUse = new Date(datetime);
                                            if (isNaN(dateToUse.getTime())) {
                                              return null; // Skip invalid dates
                                            }
                                            
                                            return (
                                              <div key={index} className="text-xs text-gray-500">
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
                                      <div className="text-xs text-gray-500">
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
                      </div>
                    )}

                    {/* Selected Service Items */}
                    <div>
                      <h3 className={`text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide ${
                        theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'
                      }`}>Selected Items</h3>
                      {selectedRequest.selected_service_items_snapshot && Array.isArray(selectedRequest.selected_service_items_snapshot) && selectedRequest.selected_service_items_snapshot.length > 0 ? (
                        <div className="space-y-2">
                          {selectedRequest.selected_service_items_snapshot.map((item: any, index: number) => (
                            <div key={index} className={`p-3 rounded-lg border ${
                              theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                            }`}>
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-4">
                                  <span className="font-medium">{item.name || item.item_name}</span>
                                  {item.description && (
                                    <span className="opacity-60 text-xs">({item.description})</span>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-2">
                                    <span className="opacity-75 text-xs">{item.qty || item.quantity} x €{item.price_at_req || item.price_at_request}</span>
                                    <span className="font-medium">
                                      €{((item.qty || item.quantity) * (item.price_at_req || item.price_at_request)).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className={`text-xs ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          No items selected for this request.
                        </div>
                      )}
                    </div>

                    {/* Question Responses */}
                    <div>
                      <h3 className={`text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide ${
                        theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'
                      }`}>Question Responses</h3>
                      {selectedRequest.question_responses_snapshot && Array.isArray(selectedRequest.question_responses_snapshot) && selectedRequest.question_responses_snapshot.length > 0 ? (
                        <div className="space-y-2">
                          {selectedRequest.question_responses_snapshot.map((question: any, index: number) => (
                            <div key={index} className="text-sm pb-2 border-b border-gray-200 last:border-b-0">
                              <div className={`text-xs font-medium flex items-center gap-1 ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                <svg className="w-1.5 h-1.5" fill="currentColor" viewBox="0 0 20 20">
                                  <circle cx="10" cy="10" r="3" />
                                </svg>
                                {question.question_text}
                              </div>
                              {question.response_text && (
                                <div className="font-medium text-base pl-3">{question.response_text}</div>
                              )}
                              {question.selected_options && question.selected_options.length > 0 && (
                                <div className="mt-1 pl-3">
                                  <div className="flex flex-wrap gap-2">
                                    {question.selected_options.map((option: any, optIndex: number) => (
                                      <div key={optIndex} className="flex items-center gap-1 text-sm">
                                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span>{option.option_text}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className={`text-xs ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          No question responses for this request.
                        </div>
                      )}
                    </div>

                    {/* Requirement Responses */}
                    <div>
                      <h3 className={`text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide ${
                        theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'
                      }`}>Requirements</h3>
                      {selectedRequest.requirement_responses_snapshot && Array.isArray(selectedRequest.requirement_responses_snapshot) && selectedRequest.requirement_responses_snapshot.length > 0 ? (
                        <div className="space-y-1">
                          {selectedRequest.requirement_responses_snapshot.map((requirement: any, index: number) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <div className={`px-2 py-1 rounded-full text-xs ${
                                requirement.customer_confirmed 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {requirement.customer_confirmed ? 'Confirmed' : 'Pending'}
                              </div>
                              <div className="flex-1">
                                <span className={`text-xs ${
                                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  {requirement.title && (
                                    <span className="font-medium">{requirement.title}: </span>
                                  )}
                                  {requirement.requirements_text}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className={`text-xs ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          No requirements for this request.
                        </div>
                      )}
                    </div>





                    {/* Messages */}
                    {selectedRequest.servicerequestmessage?.length > 0 && (
                      <div>
                        <h3 className={`text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide ${
                          theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'
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

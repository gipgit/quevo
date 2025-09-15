'use client'

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { useTheme } from "@/contexts/ThemeProvider"
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
            <h1 className="text-2xl font-bold text-[var(--dashboard-text-primary)]">{t("title")}</h1>
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
          </div>
        </div>



        {/* Main Content - Outlook-like Layout */}
        <div className="flex-1 flex flex-col lg:flex-row gap-2 lg:gap-6 overflow-hidden">
          {/* Left Panel - Request List */}
          <div className="w-full lg:w-1/5 border-b lg:border-b-0 lg:border-r border-[var(--dashboard-border-primary)] flex flex-col">
            {/* Progress Bar */}
            <div className="p-4 border-b border-[var(--dashboard-border-primary)]">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-xs font-medium text-[var(--dashboard-text-secondary)]">
                    Progress
                  </div>
                  <div className="text-lg font-bold text-[var(--dashboard-text-primary)]">
                    {handledRequests} of {totalRequests} handled
                  </div>
                </div>
                <span className="text-xs text-[var(--dashboard-text-tertiary)]">
                  {unhandledRequests} remaining
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--dashboard-bg-tertiary)]">
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
                          ? 'bg-[var(--dashboard-active-bg)] text-[var(--dashboard-active-text)] border-[var(--dashboard-active-border)] border'
                          : 'hover:bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-primary)]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-1">
                          <span className="opacity-75">{day} {month} {time}</span>
                          <span className="font-medium text-xs" style={{ fontSize: '0.6rem' }}>{request.request_reference}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`px-1 py-0.5 rounded-full ${getStatusColor(request.status)} whitespace-nowrap`} style={{ fontSize: '0.6rem' }}>
                            {getStatusText(request.status)}
                          </span>
                          {getPriorityIcon(request.priority || 'medium')}
                          {request.urgency_flag && (
                            <FlagIcon className="w-3.5 h-3.5 text-red-500" />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {isRequestHandled(request) ? (
                            <CheckCircleSolidIcon className="w-3 h-3 text-green-500" />
                          ) : (
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                          )}
                          <span className="text-xs opacity-75">{request.customer_name}</span>
                          <span className="text-xs opacity-75">•</span>
                          <span className="text-xs opacity-75">{request.service?.service_name}</span>
                        </div>
                      </div>
                    </div>
                )
              })}
              </div>
            </div>
          </div>

          {/* Middle Panel - Request Details */}
          <div className="flex-1 lg:w-3/5 flex flex-col min-h-0 lg:min-h-0 h-96 lg:h-auto p-2 lg:p-6 space-y-4 lg:space-y-5">
            {selectedRequest ? (
              <>
                {/* Request Header with Action Buttons */}
                <div className="border-b border-[var(--dashboard-border-primary)] pb-4">
                  <div className="flex flex-col lg:flex-row items-start justify-between gap-2 lg:gap-4">
                    <div className="flex-1 min-w-0 w-full lg:w-auto">
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-2 lg:gap-4">
                        {/* Left Column: Request Info */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-2xl font-bold text-[var(--dashboard-text-primary)]">
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
                          <div className="flex items-center gap-3 text-xs lg:text-base text-[var(--dashboard-text-tertiary)]">
                            <span className="font-medium lg:font-semibold">{selectedRequest.customer_name}</span>
                            <span>•</span>
                            <span className="font-medium lg:font-semibold">{selectedRequest.service?.service_name || 'N/A'}</span>
                            <span>•</span>
                            <span className="font-medium lg:font-semibold">€{selectedRequest.price_subtotal || 0}</span>
                          </div>
                        </div>
                        
                        {/* Right Column: Time Passed Indicator */}
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-[var(--dashboard-text-secondary)]">Time passed</span>
                          <span className="text-sm lg:text-base font-bold text-[var(--dashboard-text-primary)]">
                            {(() => {
                              try {
                                const dateField = selectedRequest.created_at || selectedRequest.date_created || selectedRequest.request_date
                                if (!dateField) return 'N/A'
                                
                                const requestDate = new Date(dateField)
                                if (isNaN(requestDate.getTime())) return 'N/A'
                                
                                const now = new Date()
                                const diffMs = now.getTime() - requestDate.getTime()
                                
                                if (diffMs < 0) return 'N/A'
                                
                                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
                                const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                                const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
                                
                                if (diffDays > 0) {
                                  return `${diffDays}d ${diffHours}h`
                                } else if (diffHours > 0) {
                                  return `${diffHours}h ${diffMinutes}m`
                                } else {
                                  return `${diffMinutes}m`
                                }
                              } catch (error) {
                                return 'N/A'
                              }
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>


                {/* Service Board Actions */}
                {selectedRequest.serviceboard?.[0] && selectedRequest.serviceboard[0].serviceboardaction && selectedRequest.serviceboard[0].serviceboardaction.length > 0 && (
                    <div>
                    <h3 className="text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide text-[var(--dashboard-text-tertiary)] border-[var(--dashboard-border-primary)]">Service Board Actions</h3>
                    <div className="space-y-1.5">
                      {selectedRequest.serviceboard[0].serviceboardaction.map((action: any) => (
                        <div key={action.action_id} className="p-2 rounded-lg border border-[var(--dashboard-border-primary)] bg-[var(--dashboard-bg-card)]">
                          {/* Mobile Layout */}
                          <div className="lg:hidden space-y-2">
                            {/* Row 1: Date/Time, Action Type, Status */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-xs text-[var(--dashboard-text-tertiary)]" style={{ fontSize: '0.7rem' }}>
                                {action.created_at ? (
                                  <>
                                    <div>{new Date(action.created_at).toLocaleDateString()}</div>
                                    <div>{new Date(action.created_at).toLocaleTimeString()}</div>
                                  </>
                                ) : (
                                  <span className="text-[var(--dashboard-text-muted)]">No date</span>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <span className="px-1.5 py-0.5 rounded-full text-xs bg-gray-50 text-gray-500 truncate opacity-60" style={{ fontSize: '0.7rem', maxWidth: '80px' }}>
                                  {action.action_type}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                                  action.action_status === 'completed' 
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`} style={{ fontSize: '0.7rem' }}>
                                  {action.action_status}
                                </span>
                              </div>
                            </div>
                            
                            {/* Row 2: Action Title */}
                            <div className="font-medium text-xs text-[var(--dashboard-text-primary)]">
                              {action.action_title}
                            </div>
                          </div>

                          {/* Desktop Layout */}
                          <div className="hidden lg:grid lg:grid-cols-[70px_120px_1fr_80px] gap-2 items-center">
                            {/* Column 1: Date and Time */}
                            <div className="text-xs text-[var(--dashboard-text-tertiary)]" style={{ fontSize: '0.7rem' }}>
                              {action.created_at ? (
                                <>
                                  <div>{new Date(action.created_at).toLocaleDateString()}</div>
                                  <div>{new Date(action.created_at).toLocaleTimeString()}</div>
                                </>
                              ) : (
                                <span className="text-[var(--dashboard-text-muted)]">No date</span>
                              )}
                            </div>
                            
                            {/* Column 2: Action Type */}
                            <div className="flex justify-start">
                              <span className="px-1.5 py-0.5 rounded-full text-xs bg-gray-50 text-gray-500 truncate opacity-60" style={{ fontSize: '0.7rem', maxWidth: '110px' }}>
                                {action.action_type}
                              </span>
                            </div>
                            
                            {/* Column 3: Action Title */}
                            <div className="font-medium text-xs text-[var(--dashboard-text-primary)] truncate">
                              {action.action_title}
                            </div>
                            
                            {/* Column 4: Status Pill */}
                            <div className="flex justify-center">
                              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                                action.action_status === 'completed' 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`} style={{ fontSize: '0.7rem' }}>
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
                  <h3 className="text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide text-[var(--dashboard-text-tertiary)] border-[var(--dashboard-border-primary)]">Customer Details</h3>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <span>{selectedRequest.customer_name}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(selectedRequest.customer_name)}
                        className="p-1 rounded transition-colors text-[var(--dashboard-text-tertiary)] hover:text-[var(--dashboard-text-secondary)] hover:bg-[var(--dashboard-bg-tertiary)]"
                        title="Copy name"
                      >
                        <ClipboardDocumentIcon className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{selectedRequest.customer_email}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(selectedRequest.customer_email)}
                        className="p-1 rounded transition-colors text-[var(--dashboard-text-tertiary)] hover:text-[var(--dashboard-text-secondary)] hover:bg-[var(--dashboard-bg-tertiary)]"
                        title="Copy email"
                      >
                        <ClipboardDocumentIcon className="w-3 h-3" />
                      </button>
                      {selectedRequest.customer_email && (
                        <a
                          href={`mailto:${selectedRequest.customer_email}`}
                          className="p-1 rounded transition-colors text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
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
                          className="p-1 rounded transition-colors text-[var(--dashboard-text-tertiary)] hover:text-[var(--dashboard-text-secondary)] hover:bg-[var(--dashboard-bg-tertiary)]"
                          title="Copy phone"
                        >
                          <ClipboardDocumentIcon className="w-3 h-3" />
                        </button>
                        <a
                          href={`https://wa.me/${selectedRequest.customer_phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded transition-colors text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
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
                    <h3 className="text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide text-[var(--dashboard-text-tertiary)] border-[var(--dashboard-border-primary)]">Customer Notes</h3>
                    <div className="p-3 rounded-lg border border-[var(--dashboard-border-primary)] bg-[var(--dashboard-bg-card)]">
                      <div className="text-sm text-[var(--dashboard-text-secondary)]">
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
                        <h3 className="text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide text-[var(--dashboard-text-tertiary)] border-[var(--dashboard-border-primary)]">Event & Scheduling</h3>
                        
                        <div className="p-3 rounded-lg border border-[var(--dashboard-border-primary)] bg-[var(--dashboard-bg-card)]">
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
                                              <div key={index} className="text-xs text-[var(--dashboard-text-tertiary)]">
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
                                      <div className="text-xs text-[var(--dashboard-text-tertiary)]">
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
                      <h3 className="text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide text-[var(--dashboard-text-tertiary)] border-[var(--dashboard-border-primary)]">Selected Items</h3>
                      {selectedRequest.selected_service_items_snapshot && Array.isArray(selectedRequest.selected_service_items_snapshot) && selectedRequest.selected_service_items_snapshot.length > 0 ? (
                        <div className="space-y-2">
                          {selectedRequest.selected_service_items_snapshot.map((item: any, index: number) => (
                            <div key={index} className="p-3 rounded-lg border border-[var(--dashboard-border-primary)] bg-[var(--dashboard-bg-card)]">
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
                        <div className="text-xs text-[var(--dashboard-text-tertiary)]">
                          No items selected for this request.
                        </div>
                      )}
                    </div>

                    {/* Question Responses */}
                    <div>
                      <h3 className="text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide text-[var(--dashboard-text-tertiary)] border-[var(--dashboard-border-primary)]">Question Responses</h3>
                      {selectedRequest.question_responses_snapshot && Array.isArray(selectedRequest.question_responses_snapshot) && selectedRequest.question_responses_snapshot.length > 0 ? (
                        <div className="space-y-2">
                          {selectedRequest.question_responses_snapshot.map((question: any, index: number) => (
                            <div key={index} className="text-sm pb-2 border-b border-[var(--dashboard-border-primary)] last:border-b-0">
                              <div className="text-xs font-medium flex items-center gap-1 text-[var(--dashboard-text-tertiary)]">
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
                        <div className="text-xs text-[var(--dashboard-text-tertiary)]">
                          No question responses for this request.
                        </div>
                      )}
                    </div>

                    {/* Requirement Responses */}
                    <div>
                      <h3 className="text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide text-[var(--dashboard-text-tertiary)] border-[var(--dashboard-border-primary)]">Requirements</h3>
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
                                <span className="text-xs text-[var(--dashboard-text-tertiary)]">
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
                        <div className="text-xs text-[var(--dashboard-text-tertiary)]">
                          No requirements for this request.
                        </div>
                      )}
                    </div>





                    {/* Messages */}
                    {selectedRequest.servicerequestmessage?.length > 0 && (
                      <div>
                        <h3 className="text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide text-[var(--dashboard-text-tertiary)] border-[var(--dashboard-border-primary)]">Messages</h3>
                        <div className="space-y-2">
                          {selectedRequest.servicerequestmessage.map((message: any) => (
                            <div key={message.message_id} className="p-3 rounded-lg bg-[var(--dashboard-bg-tertiary)]">
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
                <div className="text-center text-[var(--dashboard-text-tertiary)]">
                  <EyeIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a request to view details</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Actions */}
          <div className="w-full lg:w-1/4 border-t lg:border-t-0 lg:border-l border-[var(--dashboard-border-primary)] bg-[var(--dashboard-bg-secondary)] flex flex-col">
            <div className="p-4 lg:p-6">
              {selectedRequest ? (
                <>
                  {/* Navigation Controls */}
                  <div className="mb-6">
                    <h4 className="text-xs font-medium mb-3 text-[var(--dashboard-text-tertiary)] uppercase tracking-wide">Navigation</h4>
                    
                    {/* Navigation Arrows */}
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => navigateRequest(-1)}
                        disabled={selectedIndex === 0}
                        className={`p-2 rounded-lg transition-colors ${
                          selectedIndex === 0
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-[var(--dashboard-bg-tertiary)]'
                        }`}
                      >
                        <ArrowLeftIcon className="w-4 h-4" />
                      </button>
                      <span className="text-xs text-[var(--dashboard-text-tertiary)]">
                        {selectedIndex + 1} of {serviceRequests.length}
                      </span>
                      <button
                        onClick={() => navigateRequest(1)}
                        disabled={selectedIndex === serviceRequests.length - 1}
                        className={`p-2 rounded-lg transition-colors ${
                          selectedIndex === serviceRequests.length - 1
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-[var(--dashboard-bg-tertiary)]'
                        }`}
                      >
                        <ArrowRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>


                  {/* Handle/Flag Buttons */}
                  <div className="mb-6">
                    <h4 className="text-xs font-medium mb-3 text-[var(--dashboard-text-tertiary)] uppercase tracking-wide">Status Actions</h4>
                    
                    {/* Row 1: Handled and Closed */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <button
                        onClick={() => markAsHandled(selectedRequest.request_id)}
                        className={`px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm ${
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
                        onClick={() => toggleClosedStatus(selectedRequest.request_id)}
                        className={`px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm ${
                          selectedRequest.is_closed
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-orange-600 text-white hover:bg-orange-700'
                        }`}
                        title="Toggle closed status"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {selectedRequest.is_closed ? 'Closed' : 'Mark Closed'}
                      </button>
                    </div>
                    
                    {/* Row 2: Urgency Flag (full width) */}
                    <button
                      onClick={() => toggleUrgencyFlag(selectedRequest.request_id)}
                      className={`w-full px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm ${
                        selectedRequest.urgency_flag
                          ? 'bg-red-100 text-red-800'
                          : 'bg-black text-white hover:bg-gray-800'
                      }`}
                      title="Toggle urgency flag (Ctrl+F)"
                    >
                      <FlagIcon className="w-4 h-4" />
                      {selectedRequest.urgency_flag ? 'Urgent' : 'Flag Urgent'}
                    </button>
                  </div>

                  {/* Contact Actions */}
                  <div className="mb-6">
                    <h4 className="text-xs font-medium mb-2 text-[var(--dashboard-text-tertiary)] uppercase tracking-wide">Contact Customer</h4>
                    
                    {selectedRequest.customer_phone || selectedRequest.customer_email ? (
                      <div className="grid grid-cols-2 gap-2">
                        {selectedRequest.customer_phone && (
                          <a
                            href={`tel:${selectedRequest.customer_phone}`}
                            className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm"
                            title={`Call ${selectedRequest.customer_phone}`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            Call
                          </a>
                        )}
                        
                        {selectedRequest.customer_email && (
                          <a
                            href={`mailto:${selectedRequest.customer_email}`}
                            className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                            title={`Email ${selectedRequest.customer_email}`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Email
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-[var(--dashboard-text-secondary)] text-center py-2">
                        No contact info available
                      </div>
                    )}
                  </div>

                  {/* Generate Actions */}
                  <div className="mb-6">
                    <h4 className="text-xs font-medium mb-3 text-[var(--dashboard-text-tertiary)] uppercase tracking-wide">Generate</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          console.log('Generate Response clicked - placeholder functionality')
                          // TODO: Implement AI response generation based on request details and customer notes
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-sm"
                        title="Generate AI response based on request details and customer notes"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Generate Response
                      </button>
                      
                      <button
                        onClick={() => generateQuotation(selectedRequest.request_id)}
                        className="w-full px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                        title="Generate quotation (Ctrl+Q)"
                      >
                        <DocumentArrowUpIcon className="w-4 h-4" />
                        Generate Quotation
                      </button>
                    </div>
                    <div className="text-xs text-[var(--dashboard-text-secondary)] text-center mt-1">
                      AI-powered generation tools
                    </div>
                  </div>

                  <h3 className="text-sm font-medium mb-4 text-[var(--dashboard-text-secondary)]">Actions</h3>
                  
                  {/* Action Buttons */}
                  {selectedRequest.serviceboard?.[0] && (
                    <div className="space-y-2">
                      <button
                        onClick={() => window.open(`/${currentBusiness?.business_urlname}/s/${selectedRequest.serviceboard[0].board_ref}`, '_blank')}
                        className="w-full px-3 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm"
                        title="Open service board"
                      >
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                        Open Board
                      </button>
                      
                      <button
                        onClick={() => window.open(`/${currentBusiness?.business_urlname}/s/${selectedRequest.serviceboard[0].board_ref}?openAddAction=true&actionType=appointment_scheduling`, '_blank')}
                        className="w-full px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm"
                        title="Create appointment on service board"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Create Appointment
                      </button>
                      
                      <button
                        onClick={() => window.open(`/${currentBusiness?.business_urlname}/s/${selectedRequest.serviceboard[0].board_ref}?openAddAction=true&actionType=information_request`, '_blank')}
                        className="w-full px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-sm"
                        title="Add information request"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Info Request
                      </button>
                      
                      <button
                        onClick={() => window.open(`/${currentBusiness?.business_urlname}/s/${selectedRequest.serviceboard[0].board_ref}?openAddAction=true&actionType=checklist`, '_blank')}
                        className="w-full px-3 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 text-sm"
                        title="Add checklist"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        Checklist
                      </button>
                    </div>
                  )}
                  {/* Keyboard Shortcuts Button - At Bottom */}
                  <div className="mt-6 pt-4 border-t border-[var(--dashboard-border-primary)]">
                    <div className="relative group">
                      <button
                        className="w-full p-2 rounded-lg transition-colors text-[var(--dashboard-text-tertiary)] hover:text-[var(--dashboard-text-secondary)] hover:bg-[var(--dashboard-bg-tertiary)]"
                        title="Keyboard shortcuts"
                      >
                        <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </button>
                      
                      {/* Tooltip */}
                      <div className="absolute right-0 top-full mt-2 p-3 rounded-lg shadow-lg border z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto bg-[var(--dashboard-bg-card)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-secondary)]">
                        <div className="text-xs whitespace-nowrap">
                          <div className="font-medium mb-2">Keyboard Shortcuts:</div>
                          <div>↑↓ Navigate requests</div>
                          <div>Enter/Ctrl+H Mark handled</div>
                          <div>Ctrl+Q Generate quotation</div>
                          <div>Ctrl+F Toggle urgency</div>
                          <div>Ctrl+C Copy contacts</div>
                        </div>
                        {/* Arrow pointing up */}
                        <div className="absolute -top-1 right-4 w-2 h-2 rotate-45 bg-[var(--dashboard-bg-card)] border-l border-t border-[var(--dashboard-border-primary)]"></div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-[var(--dashboard-text-tertiary)]">
                  <p className="text-sm">Select a request to see available actions</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

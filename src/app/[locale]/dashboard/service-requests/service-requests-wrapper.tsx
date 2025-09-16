'use client'

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { useTheme } from "@/contexts/ThemeProvider"
import { useBusiness } from "@/lib/business-context"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import EmptyState from "@/components/EmptyState"
import { generateServiceResponse } from './generate-service-response'
import { useAICredits } from '@/hooks/useAICredits'
import { LoadingAIGeneration } from '@/components/ui/loading-ai-generation'
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
  EyeSlashIcon,
  SparklesIcon
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
  const [selectedRequest, setSelectedRequest] = useState<any>(initialServiceRequests.length > 0 ? initialServiceRequests[0] : null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  // AI Generation state
  const [showAIGenerationModal, setShowAIGenerationModal] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [generatedResponse, setGeneratedResponse] = useState<string | null>(null)
  const [selectedQuestionsForClarification, setSelectedQuestionsForClarification] = useState<number[]>([])
  const [manualQuestions, setManualQuestions] = useState<string>('')
  const [customerNotesClarification, setCustomerNotesClarification] = useState<string>('')
  
  // AI Credits hook
  const { creditsStatus, featureCosts, loading: creditsLoading, refetch: refetchCredits } = useAICredits(currentBusiness?.business_id || null)

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

  // Update selected request when service requests change
  useEffect(() => {
    if (serviceRequests.length > 0 && !selectedRequest) {
      setSelectedRequest(serviceRequests[0])
      setSelectedIndex(0)
    } else if (serviceRequests.length === 0) {
      setSelectedRequest(null)
      setSelectedIndex(0)
    }
  }, [serviceRequests])

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

  // AI Generation functions
  const handleGenerateResponse = () => {
    if (!selectedRequest) return
    setGenerationError(null)
    setGeneratedResponse(null)
    setShowAIGenerationModal(true)
  }

  const handleConfirmAIGeneration = async () => {
    if (!selectedRequest) return
    
    setIsGenerating(true)
    setGenerationError(null)
    
    try {
      const result = await generateServiceResponse({
        requestId: selectedRequest.request_id,
        customerNotes: selectedRequest.customer_notes,
        requestDetails: {
          customerName: selectedRequest.customer_name,
          serviceName: selectedRequest.service?.service_name || 'Service',
          requestReference: selectedRequest.request_reference,
          questionResponses: selectedRequest.question_responses_snapshot,
          requirements: selectedRequest.requirement_responses_snapshot,
          eventInfo: selectedRequest.serviceevent,
          schedulingDates: selectedRequest.request_datetimes
        },
        clarificationRequests: {
          selectedQuestionIndices: selectedQuestionsForClarification,
          manualQuestions: manualQuestions.trim(),
          customerNotesClarification: customerNotesClarification.trim()
        }
      })
      
      if (result.success && result.data) {
        setGeneratedResponse(result.data.response)
        // Refresh credits after successful generation
        refetchCredits()
        // Keep modal open to show the generated response
      } else {
        setGenerationError(result.errorMessage || 'Failed to generate response')
      }
    } catch (error) {
      setGenerationError('Error generating response')
      console.error('Error generating response:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyGeneratedResponse = async () => {
    if (generatedResponse) {
      try {
        await navigator.clipboard.writeText(generatedResponse)
        // You could add a toast notification here
      } catch (error) {
        console.error('Error copying response:', error)
      }
    }
  }

  const toggleQuestionForClarification = (questionIndex: number) => {
    setSelectedQuestionsForClarification(prev => 
      prev.includes(questionIndex) 
        ? prev.filter(index => index !== questionIndex)
        : [...prev, questionIndex]
    )
  }

  const resetGenerationState = () => {
    setSelectedQuestionsForClarification([])
    setManualQuestions('')
    setCustomerNotesClarification('')
    setGeneratedResponse(null)
    setGenerationError(null)
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
                        onClick={handleGenerateResponse}
                        className="w-full px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-sm"
                        title="Generate AI response based on request details and customer notes"
                      >
                        <SparklesIcon className="w-4 h-4" />
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

        {/* AI Generation Confirmation Modal */}
        {showAIGenerationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <SparklesIcon className="w-4 h-4 text-purple-600" />
                    <h2 className="text-lg font-medium text-gray-900">Confirm AI Response Generation</h2>
                  </div>
                  <button
                    onClick={() => {
                      setShowAIGenerationModal(false)
                      resetGenerationState()
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Close modal"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* 3-Column Layout */}
                  <div className="grid grid-cols-12 gap-6">
                    {/* Request Summary - Column 1 */}
                    <div className="col-span-4">
                      <h3 className="text-xs font-medium text-gray-600 mb-2">Request Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <div className="text-[10px] text-gray-500 mb-0.5">Customer</div>
                          <div className="font-medium text-gray-900">{selectedRequest?.customer_name}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-500 mb-0.5">Service</div>
                          <div className="font-medium text-gray-900">{selectedRequest?.service?.service_name || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-500 mb-0.5">Reference</div>
                          <div className="font-medium text-gray-900">{selectedRequest?.request_reference}</div>
                        </div>
                        {selectedRequest?.customer_notes && (
                          <div>
                            <div className="text-[10px] text-gray-500 mb-0.5">Customer Notes</div>
                            <div className="font-medium text-gray-900">{selectedRequest.customer_notes}</div>
                          </div>
                        )}
                      </div>

                      {/* Customer Notes Clarification */}
                      {selectedRequest?.customer_notes && (
                        <div className="mt-3">
                          <h4 className="text-xs font-medium text-gray-600 mb-2">What's unclear about the customer notes?</h4>
                          <textarea
                            value={customerNotesClarification}
                            onChange={(e) => setCustomerNotesClarification(e.target.value)}
                            placeholder="Write informally what's not clear or what additional information you need from the customer notes..."
                            className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={2}
                          />
                          {customerNotesClarification.trim() && (
                            <div className="mt-1 text-xs text-blue-600">
                              This will help the AI ask for specific clarifications
                            </div>
                          )}
                        </div>
                      )}

                      {/* Interactive Question Cards */}
                      {selectedRequest?.question_responses_snapshot && selectedRequest.question_responses_snapshot.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-xs font-medium text-gray-600 mb-3">Question Responses</h4>
                          <div className="space-y-2">
                            {selectedRequest.question_responses_snapshot.map((question: any, index: number) => {
                              const isSelected = selectedQuestionsForClarification.includes(index)
                              let responseText = 'No response'
                              
                              // Handle text responses
                              if (question.response_text) {
                                responseText = question.response_text
                              }
                              // Handle checkbox/multiple choice responses
                              else if (question.selected_options && question.selected_options.length > 0) {
                                responseText = question.selected_options.map((option: any) => option.option_text || option.text || option).join(', ')
                              }

                              return (
                                <div
                                  key={index}
                                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                    isSelected 
                                      ? 'border-orange-300 bg-orange-50' 
                                      : 'border-gray-200 bg-white hover:border-gray-300'
                                  }`}
                                  onClick={() => toggleQuestionForClarification(index)}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="text-xs font-medium text-gray-700 mb-1">
                                        {question.question_text}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        {responseText}
                                      </div>
                                    </div>
                                    <div className={`ml-2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                      isSelected 
                                        ? 'border-orange-500 bg-orange-500' 
                                        : 'border-gray-300'
                                    }`}>
                                      {isSelected && (
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                          {selectedQuestionsForClarification.length > 0 && (
                            <div className="mt-2 text-xs text-orange-600">
                              {selectedQuestionsForClarification.length} question(s) selected for clarification
                            </div>
                          )}
                        </div>
                      )}

                      {/* Manual Questions Textarea */}
                      <div className="mt-4">
                        <h4 className="text-xs font-medium text-gray-600 mb-2">Additional Questions</h4>
                        <textarea
                          value={manualQuestions}
                          onChange={(e) => setManualQuestions(e.target.value)}
                          placeholder="Add any additional questions you'd like the AI to ask the customer..."
                          className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={3}
                        />
                        {manualQuestions.trim() && (
                          <div className="mt-1 text-xs text-blue-600">
                            Custom questions will be integrated into the AI response
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Credit Cost - Column 2 */}
                    <div className="col-span-3">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 text-center mb-4">AI Generation Cost</h4>
                        <div className="space-y-3">
                          {/* Remaining Credits */}
                          <div className="text-left">
                            <div className="text-xs text-gray-500 mb-1">Remaining Credits</div>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                                </svg>
                              </div>
                              <div className="text-lg font-bold text-gray-900">
                                {creditsLoading ? "..." : creditsStatus?.creditsAvailable ?? 0}
                              </div>
                            </div>
                          </div>
                          {/* Cost for Generation */}
                          <div className="text-left">
                            <div className="text-xs text-gray-500 mb-1">Generation Cost</div>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                                </svg>
                              </div>
                              <div className="text-lg font-bold text-gray-900">1</div>
                            </div>
                          </div>
                          {/* Expected After Generation */}
                          <div className="text-left">
                            <div className="text-xs text-gray-500 mb-1">After Generation</div>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                                </svg>
                              </div>
                              <div className="text-lg font-bold text-gray-900">
                                {creditsLoading ? "..." : Math.max(0, (creditsStatus?.creditsAvailable ?? 0) - 1)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Response Generation - Column 3 */}
                    <div className="col-span-5 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 rounded-2xl p-4 relative overflow-hidden">
                      {/* Animated background elements */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-0 right-0 w-24 h-24 bg-purple-500 rounded-full blur-2xl animate-pulse delay-1000"></div>
                        <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-indigo-500 rounded-full blur-xl animate-pulse delay-500"></div>
                      </div>
                      
                      {isGenerating ? (
                        <div className="relative z-10 h-64 flex items-center justify-center">
                          <LoadingAIGeneration size="md" text="Generating response..." />
                        </div>
                      ) : generatedResponse ? (
                        <div className="relative z-10 h-64 flex flex-col">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-white flex items-center gap-2">
                              <CheckCircleIcon className="w-4 h-4" />
                              Generated Response
                            </h4>
                            <button
                              onClick={copyGeneratedResponse}
                              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md"
                            >
                              Copy
                            </button>
                          </div>
                          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex-1 overflow-y-auto border border-white/20">
                            <div className="text-sm text-white leading-relaxed">
                              {generatedResponse}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="relative z-10 h-64 flex items-center justify-center">
                          <div className="text-center text-gray-300">
                            <SparklesIcon className="w-8 h-8 mx-auto mb-2 opacity-60" />
                            <p className="text-sm">Response will appear here</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Debug: Raw Prompt Text */}
                  <div className="bg-gray-100 rounded-lg p-3 border border-gray-200">
                    <div className="text-[10px] text-gray-500 mb-1 font-mono">Debug: Raw Prompt Text</div>
                    <div className="text-[9px] text-gray-600 font-mono leading-tight max-h-32 overflow-y-auto bg-white p-2 rounded border">
                      {selectedRequest && (() => {
                        const prompt = `Generate a professional response for the following service request:

**Customer:** ${selectedRequest.customer_name}
**Service:** ${selectedRequest.service?.service_name || 'Service'}
**Request Reference:** ${selectedRequest.request_reference}

**Business:** ${selectedRequest.business?.business_name || 'Business'}
${selectedRequest.business?.business_descr ? `**Business Description:** ${selectedRequest.business.business_descr}` : ''}

**Request Details:**

${selectedRequest.question_responses_snapshot && selectedRequest.question_responses_snapshot.length > 0 ? `**Customer Responses:**
${selectedRequest.question_responses_snapshot.map((response: any, index: number) => {
  let responseText = 'No response'
  
  // Handle text responses
  if (response.response_text) {
    responseText = response.response_text
  }
  // Handle checkbox/multiple choice responses
  else if (response.selected_options && response.selected_options.length > 0) {
    responseText = response.selected_options.map((option: any) => option.option_text || option.text || option).join(', ')
  }
  
  return `${index + 1}. ${response.question_text}: ${responseText}`
}).join('\n')}` : ''}

${selectedRequest.requirement_responses_snapshot && selectedRequest.requirement_responses_snapshot.length > 0 ? `**Requirements:**
${selectedRequest.requirement_responses_snapshot.map((req: any, index: number) => `${index + 1}. ${req.requirements_text} (Status: ${req.customer_confirmed ? 'Confirmed' : 'Pending'})`).join('\n')}` : ''}

${selectedRequest.serviceevent ? `**Event Information:**
Event Name: ${selectedRequest.serviceevent.event_name || 'N/A'}
${selectedRequest.serviceevent.event_description ? `Event Description: ${selectedRequest.serviceevent.event_description}` : ''}` : ''}

${selectedRequest.request_datetimes && selectedRequest.request_datetimes.length > 0 ? `**Scheduling Dates Selected:**
${selectedRequest.request_datetimes.map((date: string, index: number) => `${index + 1}. ${date}`).join('\n')}` : ''}

${selectedRequest.customer_notes ? `**Customer Notes:**
${selectedRequest.customer_notes}` : ''}

${(selectedQuestionsForClarification.length > 0 || manualQuestions.trim() || customerNotesClarification.trim()) ? `**CLARIFICATION REQUESTS:**
${customerNotesClarification.trim() ? `**Customer Notes Clarification Needed:**
${customerNotesClarification.trim()}

Please address these specific concerns about the customer notes and ask for clarification where needed in Italian.` : ''}${selectedQuestionsForClarification.length > 0 ? `${customerNotesClarification.trim() ? '\n\n' : ''}The following question responses need clarification or additional information:
${selectedQuestionsForClarification.map((index: number) => {
  const question = selectedRequest.question_responses_snapshot[index]
  if (question) {
    let responseText = 'No response'
    if (question.response_text) {
      responseText = question.response_text
    } else if (question.selected_options && question.selected_options.length > 0) {
      responseText = question.selected_options.map((option: any) => option.option_text || option.text || option).join(', ')
    }
    return `- "${question.question_text}": ${responseText}`
  }
  return ''
}).filter(Boolean).join('\n')}

Please ask for more specific details or clarification for these responses in Italian.` : ''}${manualQuestions.trim() ? `${selectedQuestionsForClarification.length > 0 ? '\n\n' : ''}**Additional Questions to Ask:**
${manualQuestions.trim()}

Please integrate these questions naturally into your response in Italian.` : ''}` : ''}

Please generate a professional, helpful response in Italian that:
1. Acknowledges the customer's request
2. Shows understanding of their needs
3. Provides next steps or solutions
4. Maintains a professional and empathetic tone
5. Is concise but comprehensive

**IMPORTANT:** If any of the following information is missing, unclear, or incomplete, please request clarification from the customer:
- Customer notes that are unclear or incomplete
- Question responses that don't provide sufficient detail
- Requirements that are not confirmed or are vague
- Any other information needed to properly fulfill the service request

The response should be ready to send directly to the customer in Italian. If any information is missing or unclear, politely request clarification for that specific information in Italian.`
                        return prompt
                      })()}
                    </div>
                  </div>

                  {/* Warning if low credits */}
                  {creditsStatus && creditsStatus.creditsAvailable <= 2 && (
                    <div className="bg-yellow-50 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                          <span className="text-yellow-800 text-xs font-bold">!</span>
                        </div>
                        <p className="text-sm text-yellow-800">
                          Low AI generation credits remaining. Consider upgrading your plan.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Error Display */}
                  {generationError && (
                    <div className="bg-red-50 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 bg-red-400 rounded-full flex items-center justify-center">
                          <span className="text-red-800 text-xs font-bold">!</span>
                        </div>
                        <p className="text-sm text-red-800">
                          {generationError}
                        </p>
                      </div>
                    </div>
                  )}

                </div>

                {/* Footer */}
                <div className="flex flex-col space-y-2 pt-6">
                  {!generatedResponse && !isGenerating && (
                    <button
                      onClick={handleConfirmAIGeneration}
                      disabled={(creditsStatus?.creditsAvailable ?? 0) <= 0}
                      className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white border-0 h-12 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <SparklesIcon className="w-5 h-5" />
                        <span>Generate Response</span>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

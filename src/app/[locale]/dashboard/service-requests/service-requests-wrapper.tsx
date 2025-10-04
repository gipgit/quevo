'use client'

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { useTheme } from "@/contexts/ThemeProvider"
import { useBusiness } from "@/lib/business-context"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import EmptyState from "@/components/ui/EmptyState"
import { generateServiceResponse } from './generate-service-response'
import { useAICredits } from '@/hooks/useAICredits'
import { LoadingAIGeneration } from '@/components/ui/loading-ai-generation'
import { AIAssistantIcon } from '@/components/ui/ai-assistant-icon'
import { AICostCard } from '@/components/ui/ai-cost-card'
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  
  // AI Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [generatedResponse, setGeneratedResponse] = useState<string | null>(null) // Current working response
  const [isSavingResponse, setIsSavingResponse] = useState(false)
  const [saveResponseError, setSaveResponseError] = useState<string | null>(null)
  const [responseIsSaved, setResponseIsSaved] = useState(false)
  const [selectedQuestionsForClarification, setSelectedQuestionsForClarification] = useState<number[]>([])
  const [selectedRequirementsForClarification, setSelectedRequirementsForClarification] = useState<number[]>([])
  const [manualQuestions, setManualQuestions] = useState<string>('')
  const [customerNotesClarification, setCustomerNotesClarification] = useState<string>('')
  
  // Modal state
  const [showGenerationModal, setShowGenerationModal] = useState(false)
  const [showAddActionDropdown, setShowAddActionDropdown] = useState(false)
  
  // AI Credits hook
  const { creditsStatus, featureCosts, loading: creditsLoading, refetch: refetchCredits } = useAICredits(currentBusiness?.business_id || null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showAddActionDropdown) {
        setShowAddActionDropdown(false)
      }
    }

    if (showAddActionDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showAddActionDropdown])

  // Debug: Log initial service requests
  useEffect(() => {
    console.log('Initial service requests:', initialServiceRequests.map(req => ({
      request_id: req.request_id,
      request_reference: req.request_reference,
      is_handled: req.is_handled,
      urgency_flag: req.urgency_flag,
      is_closed: req.is_closed,
      generated_response: req.generated_response,
      generated_response_saved_at: req.generated_response_saved_at
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
            is_closed: req.is_closed,
            generated_response: req.generated_response,
            generated_response_saved_at: req.generated_response_saved_at
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

  // Reset generation state when selected request changes
  useEffect(() => {
    // Don't auto-load saved response into working area - keep generate section clean
    setGeneratedResponse(null)
    setResponseIsSaved(false)
    setGenerationError(null)
    setSaveResponseError(null)
    setSelectedQuestionsForClarification([])
    setSelectedRequirementsForClarification([])
    setManualQuestions('')
    setCustomerNotesClarification('')
  }, [selectedRequest])

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
    setShowGenerationModal(true)
  }

  const handleConfirmGeneration = async () => {
    if (!selectedRequest) return

    // Reset previous state
    setGenerationError(null)
    setGeneratedResponse(null)
    
    // Set generating state immediately for modal UI
    setIsGenerating(true)

    // Small delay to ensure UI updates
    await new Promise(resolve => setTimeout(resolve, 100))

    // Keep modal open and start generation
    await handleConfirmAIGeneration()
  }

  const handleConfirmAIGeneration = async () => {
    if (!selectedRequest) return
    
    setGenerationError(null)
    
    try {
      const result = await generateServiceResponse({
        requestId: selectedRequest.request_id,
        customerNotes: selectedRequest.customer_notes,
        requestDetails: {
          customerName: selectedRequest.customer_name ? 
            selectedRequest.customer_name.trim().split(' ')[0] : 'Customer',
          serviceName: selectedRequest.service?.service_name || 'Service',
          requestReference: selectedRequest.request_reference,
          questionResponses: selectedRequest.question_responses_snapshot,
          requirements: selectedRequest.requirement_responses_snapshot,
          eventInfo: selectedRequest.serviceevent,
          schedulingDates: selectedRequest.request_datetimes
        },
        clarificationRequests: {
          selectedQuestionIndices: selectedQuestionsForClarification,
          selectedRequirementIndices: selectedRequirementsForClarification,
          manualQuestions: manualQuestions.trim(),
          customerNotesClarification: customerNotesClarification.trim()
        }
      })
      
      if (result.success && result.data) {
        setGeneratedResponse(result.data.response)
        // Reset save state for new response
        setResponseIsSaved(false)
        setSaveResponseError(null)
        // Refresh credits after successful generation
        refetchCredits()
        // Close modal after successful generation
        setShowGenerationModal(false)
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

  const saveGeneratedResponse = async () => {
    if (!generatedResponse || !selectedRequest) return

    setIsSavingResponse(true)
    setSaveResponseError(null)

    try {
      const response = await fetch(`/api/service-requests/${selectedRequest.request_id}/save-response`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generated_response: generatedResponse })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Response saved successfully:', result)
        
        // Update the selected request with the saved response data
        setSelectedRequest((prev: any) => prev?.request_id === selectedRequest.request_id 
          ? { ...prev, generated_response: result.request.generated_response, generated_response_saved_at: result.request.generated_response_saved_at }
          : prev
        )
        
        // Update the service requests array
        setServiceRequests((prev: any[]) => prev.map(req => 
          req.request_id === selectedRequest.request_id 
            ? { ...req, generated_response: result.request.generated_response, generated_response_saved_at: result.request.generated_response_saved_at }
            : req
        ))
        
        setResponseIsSaved(true)
        
        // Reset saved status after 3 seconds
        setTimeout(() => setResponseIsSaved(false), 3000)
      } else {
        const errorData = await response.json()
        setSaveResponseError(errorData.error || 'Failed to save response')
        console.error('API error:', errorData)
      }
    } catch (error) {
      setSaveResponseError('Error saving response')
      console.error('Error saving response:', error)
    } finally {
      setIsSavingResponse(false)
    }
  }

  const loadSavedResponseForEditing = () => {
    if (selectedRequest?.generated_response) {
      setGeneratedResponse(selectedRequest.generated_response)
      setResponseIsSaved(true)
    }
  }

  const toggleQuestionForClarification = (questionIndex: number) => {
    setSelectedQuestionsForClarification(prev => 
      prev.includes(questionIndex) 
        ? prev.filter(index => index !== questionIndex)
        : [...prev, questionIndex]
    )
  }

  const toggleRequirementForClarification = (requirementIndex: number) => {
    setSelectedRequirementsForClarification(prev => 
      prev.includes(requirementIndex) 
        ? prev.filter(index => index !== requirementIndex)
        : [...prev, requirementIndex]
    )
  }

  const resetGenerationState = () => {
    setSelectedQuestionsForClarification([])
    setSelectedRequirementsForClarification([])
    setManualQuestions('')
    setCustomerNotesClarification('')
    // Only reset generated response if it's not saved in database
    if (!selectedRequest?.generated_response) {
      setGeneratedResponse(null)
      setResponseIsSaved(false)
    }
    setGenerationError(null)
    setSaveResponseError(null)
  }

  // Calculate progress
  const totalRequests = serviceRequests.length
  const handledRequests = serviceRequests.filter(req => isRequestHandled(req)).length
  const unhandledRequests = totalRequests - handledRequests
  const progressPercentage = totalRequests > 0 ? (handledRequests / totalRequests) * 100 : 0

  if (serviceRequests.length === 0) {
  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto">
        {/* Top Navbar (simulated) */}
        <div className="sticky top-0 z-10 px-6 py-4 lg:py-2 rounded-2xl mb-3 bg-[var(--dashboard-bg-primary)] border border-[var(--dashboard-border-primary)]">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-medium text-[var(--dashboard-text-primary)]">{t("title")}</p>
            </div>
          </div>
        </div>

        {/* Content Wrapper with Background */}
        <div className="bg-[var(--dashboard-bg-primary)] rounded-2xl border border-[var(--dashboard-border-primary)] p-6">

          <EmptyState
            icon={<svg className="mx-auto w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>}
            title={t("noServiceRequests")}
            description={t("noServiceRequestsDescription")}
          />
        </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto">
        {/* Top Navbar (simulated) */}
        <div className="sticky top-0 z-10 px-6 py-4 lg:py-2 rounded-2xl mb-3 bg-[var(--dashboard-bg-primary)] border border-[var(--dashboard-border-primary)]">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-medium text-[var(--dashboard-text-primary)]">{t("title")}</p>
            </div>
          </div>
        </div>

        {/* Content Wrapper with Background */}
        <div className="bg-[var(--dashboard-bg-primary)] rounded-2xl border border-[var(--dashboard-border-primary)] p-6">
          <div className="flex flex-col h-full">
            {/* Header */}
            {/* Mobile Sidebar Toggle Button */}
        <div className="lg:hidden fixed top-4 left-4 z-30">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-lg bg-[var(--dashboard-bg-primary)] border border-[var(--dashboard-border-primary)] shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Main Content - Outlook-like Layout */}
        <div className="flex-1 flex flex-col lg:flex-row gap-2 lg:gap-6 overflow-hidden relative">
          {/* Mobile Sidebar Overlay */}
          {isMobileSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}
          
          {/* Left Panel - Request List */}
          <div className={`
            w-full lg:w-1/6 border-b lg:border-b-0 lg:border-r border-[var(--dashboard-border-primary)] flex flex-col
            fixed lg:static top-0 left-0 h-full z-50 lg:z-auto
            transform transition-transform duration-300 ease-in-out
            ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            bg-[var(--dashboard-bg-primary)] lg:bg-transparent
            shadow-xl lg:shadow-none
          `}>
            {/* Navigation & Progress */}
            <div className="p-4 border-b border-[var(--dashboard-border-primary)]">
              {/* Mobile Close Button */}
              <div className="lg:hidden flex justify-end mb-4">
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-[var(--dashboard-bg-tertiary)]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Navigation Controls */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <button
                  onClick={() => navigateRequest(-1)}
                  disabled={selectedIndex === 0}
                  className={`p-1.5 rounded-lg transition-colors ${
                    selectedIndex === 0
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-[var(--dashboard-bg-tertiary)]'
                  }`}
                  title="Previous request"
                >
                  <ArrowLeftIcon className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs text-[var(--dashboard-text-tertiary)] px-2">
                  {selectedIndex + 1} of {serviceRequests.length}
                </span>
                <button
                  onClick={() => navigateRequest(1)}
                  disabled={selectedIndex === serviceRequests.length - 1}
                  className={`p-1.5 rounded-lg transition-colors ${
                    selectedIndex === serviceRequests.length - 1
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-[var(--dashboard-bg-tertiary)]'
                  }`}
                  title="Next request"
                >
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </button>
              </div>
              
              {/* Progress Bar */}
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs md:text-sm text-[var(--dashboard-text-primary)]">
                  {handledRequests} of {totalRequests} handled
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
                        setIsMobileSidebarOpen(false)
                      }}
                      className={`p-3 rounded-lg cursor-pointer transition-all flex-shrink-0 w-64 lg:w-auto ${
                        isSelected
                          ? 'bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-primary)] border-l-4 border-[var(--dashboard-active-border)]'
                          : 'hover:bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-primary)]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-1">
                          <span className="opacity-75">{day} {month} {time}</span>
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
                      
                      {/* Row 1: Customer Name + Request Reference */}
                      <div className="flex items-center gap-2 mb-1">
                        {isRequestHandled(request) ? (
                          <CheckCircleSolidIcon className="w-3 h-3 text-green-500" />
                        ) : (
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                        )}
                        <span className="text-xs opacity-75">{request.customer_name}</span>
                        <span className="font-medium text-xs" style={{ fontSize: '0.4rem' }}>{request.request_reference}</span>
                      </div>
                      
                      {/* Row 2: Service Name */}
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3"></div> {/* Spacer to align with icon above */}
                        <span className="text-xs opacity-75">{request.service?.service_name}</span>
                      </div>
                    </div>
                )
              })}
              </div>
            </div>
          </div>

          {/* Middle Panel - Request Details */}
          <div className="flex-1 lg:w-2/5 flex flex-col min-h-0 lg:min-h-0 h-96 lg:h-auto p-2 lg:p-6 space-y-4 lg:space-y-5">
            {selectedRequest ? (
              <>
                {/* Request Header */}
                <div className="border-b border-[var(--dashboard-border-primary)] pb-4">
                  <div className="space-y-3">
                    {/* Service Title + Request Reference + Status + Time Passed Block */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[var(--dashboard-text-primary)] text-sm md:text-base">
                        {selectedRequest.service?.service_name || 'N/A'}
                      </span>
                      <span className="text-[var(--dashboard-text-secondary)]">•</span>
                      <p className="text-xs text-[var(--dashboard-text-primary)]">
                        {selectedRequest.request_reference}
                      </p>
                      <span className={`px-1.5 py-0.5 rounded-full text-xs md:text-xs ${getStatusColor(selectedRequest.status)}`} style={{ fontSize: 'clamp(0.65rem, 2vw, 0.75rem)' }}>
                        {getStatusText(selectedRequest.status)}
                      </span>
                      {selectedRequest.urgency_flag && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800">
                          Urgent
                        </span>
                      )}
                      <span className="text-[var(--dashboard-text-secondary)]">•</span>
                      <span className="text-xs text-[var(--dashboard-text-secondary)]" style={{ fontSize: '0.6rem' }}>Time passed</span>
                      <span className="text-xs text-[var(--dashboard-text-primary)]">
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
                    
                    {/* Customer Name + Contact Details - 2 Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4 items-center">
                      {/* Left Column - Customer Name */}
                      <div className="flex flex-col">
                        <span className="font-medium text-[var(--dashboard-text-primary)] text-lg lg:text-2xl">{selectedRequest.customer_name}</span>
                        {selectedRequest.consent_newsletter !== null && (
                          <span className="text-xs text-[var(--dashboard-text-secondary)] mt-1">
                            Newsletter consent: {selectedRequest.consent_newsletter ? 'Yes' : 'No'}
                          </span>
                        )}
                      </div>
                      
                      {/* Right Column - Contact Details */}
                      <div className="space-y-0 text-left lg:text-right">
                        {/* Email Row */}
                        <div className="flex items-center justify-start lg:justify-end gap-1 text-sm">
                          <span>{selectedRequest.customer_email}</span>
                          <button
                            onClick={() => navigator.clipboard.writeText(selectedRequest.customer_email)}
                            className="p-1.5 rounded transition-colors text-[var(--dashboard-text-tertiary)] hover:text-[var(--dashboard-text-secondary)] hover:bg-[var(--dashboard-bg-tertiary)]"
                            title="Copy email"
                          >
                            <ClipboardDocumentIcon className="w-4 h-4" />
                          </button>
                          {selectedRequest.customer_email && (
                            <a
                              href={`mailto:${selectedRequest.customer_email}`}
                              className="p-1.5 rounded transition-colors text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              title="Send email"
                            >
                              <EnvelopeIcon className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                        
                        {/* Phone Row */}
                        {selectedRequest.customer_phone && (
                          <div className="flex items-center justify-start lg:justify-end gap-1 text-sm">
                            <span>{selectedRequest.customer_phone}</span>
                            <button
                              onClick={() => navigator.clipboard.writeText(selectedRequest.customer_phone)}
                              className="p-1.5 rounded transition-colors text-[var(--dashboard-text-tertiary)] hover:text-[var(--dashboard-text-secondary)] hover:bg-[var(--dashboard-bg-tertiary)]"
                              title="Copy phone"
                            >
                              <ClipboardDocumentIcon className="w-4 h-4" />
                            </button>
                            <a
                              href={`https://wa.me/${selectedRequest.customer_phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded transition-colors text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                              title="WhatsApp"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.533 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.451h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.463.703z"/>
                              </svg>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>


                {/* Service Board Actions */}
                {selectedRequest.serviceboard?.[0] && selectedRequest.serviceboard[0].serviceboardaction && selectedRequest.serviceboard[0].serviceboardaction.length > 0 && (
                    <div className="mt-6">
                    <h3 className="text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide text-[var(--dashboard-text-tertiary)] border-[var(--dashboard-border-primary)]">Service Board Actions</h3>
                    <div className="relative">
                      {selectedRequest.serviceboard[0].serviceboardaction.map((action: any, index: number) => (
                        <div key={action.action_id} className="relative flex items-start pb-4 last:pb-0">
                          {/* Timeline line */}
                          {index < selectedRequest.serviceboard[0].serviceboardaction.length - 1 && (
                            <div className="absolute left-2.5 top-6 w-0.5 h-full bg-[var(--dashboard-border-primary)]"></div>
                          )}
                          
                          {/* Timeline dot */}
                          <div className="relative z-10 w-5 h-5 rounded-full border-2 border-[var(--dashboard-border-primary)] bg-[var(--dashboard-bg-primary)] flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--dashboard-text-secondary)]"></div>
                          </div>
                            
                          {/* Content */}
                          <div className="ml-2 lg:ml-4 flex-1 min-w-0">
                            {/* Mobile Layout (xs-md): Two rows */}
                            <div className="block lg:hidden">
                              {/* Row 1: Date/Time */}
                              <div className="text-[var(--dashboard-text-tertiary)] mb-1" style={{ fontSize: '0.6rem' }}>
                                {action.created_at ? (
                                  <span>
                                    {new Date(action.created_at).toLocaleDateString()} {new Date(action.created_at).toLocaleTimeString()}
                                  </span>
                                ) : (
                                  <span className="text-[var(--dashboard-text-muted)]">No date</span>
                                )}
                              </div>
                              
                              {/* Row 2: Status + Action Type + Title */}
                              <div className="flex items-center gap-2">
                                {action.action_status === 'completed' ? (
                                  <CheckCircleSolidIcon className="w-3 h-3 text-green-500 flex-shrink-0" />
                                ) : (
                                  <ClockIcon className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                                )}
                                <div className="font-medium text-xs text-[var(--dashboard-text-primary)] flex-1">
                                  <span className="text-[var(--dashboard-text-tertiary)]">{action.action_type}</span> • {action.action_title}
                                </div>
                              </div>
                            </div>

                            {/* Desktop Layout (lg+): Single row */}
                            <div className="hidden lg:block">
                              {/* Date/Time */}
                              <div className="text-xs text-[var(--dashboard-text-tertiary)] mb-1" style={{ fontSize: '0.7rem' }}>
                                {action.created_at ? (
                                  <span>
                                    {new Date(action.created_at).toLocaleDateString()} {new Date(action.created_at).toLocaleTimeString()}
                                  </span>
                                ) : (
                                  <span className="text-[var(--dashboard-text-muted)]">No date</span>
                                )}
                              </div>
                              
                              {/* Status, Action Type, and Title in one row */}
                              <div className="flex items-center gap-2">
                                {action.action_status === 'completed' ? (
                                  <CheckCircleSolidIcon className="w-3 h-3 text-green-500 flex-shrink-0" />
                                ) : (
                                  <ClockIcon className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                                )}
                                <div className="font-medium text-xs text-[var(--dashboard-text-primary)] flex-1">
                                  <span className="text-[var(--dashboard-text-tertiary)]">{action.action_type}</span> • {action.action_title}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Customer Notes */}
                {selectedRequest.customer_notes && (
                    <div className="mt-6">
                    <h3 className="text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide text-[var(--dashboard-text-tertiary)] border-[var(--dashboard-border-primary)]">Customer Notes</h3>
                    <div className="p-3 rounded-lg border border-[var(--dashboard-border-primary)] bg-[var(--dashboard-bg-card)]">
                      <div className="text-xs text-[var(--dashboard-text-secondary)]">
                        {selectedRequest.customer_notes}
                      </div>
                    </div>
                  </div>
                )}

                    {/* Event and Datetime Information */}
                    {(selectedRequest.serviceevent || selectedRequest.request_datetimes) && (
                      <div className="mt-6">
                        <h3 className="text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide text-[var(--dashboard-text-tertiary)] border-[var(--dashboard-border-primary)]">Event & Scheduling</h3>
                        
                        <div className="p-3 rounded-lg border border-[var(--dashboard-border-primary)] bg-[var(--dashboard-bg-card)]">
                          <div className="flex items-start justify-between gap-4">
                            {/* Left Column - Event Name */}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-[var(--dashboard-text-primary)]">
                                {selectedRequest.serviceevent?.event_name || 'Event'}
                              </div>
                            </div>

                            {/* Right Column - Date/Time */}
                            <div className="flex-shrink-0 text-right">
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
                                            <div key={index} className="text-xs text-[var(--dashboard-text-secondary)]">
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
                                    <div className="text-xs text-[var(--dashboard-text-secondary)]">
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
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-2 pt-1 border-t border-[var(--dashboard-border-primary)]">
                          <h3 className="text-xs font-medium uppercase tracking-wide text-[var(--dashboard-text-tertiary)]">Selected Items</h3>
                          {selectedRequest.price_subtotal !== null && selectedRequest.price_subtotal !== undefined && selectedRequest.price_subtotal > 0 && (
                            <span className="text-xs font-medium text-[var(--dashboard-text-primary)]">Total: €{selectedRequest.price_subtotal}</span>
                          )}
                        </div>
                      {selectedRequest.selected_service_items_snapshot && Array.isArray(selectedRequest.selected_service_items_snapshot) && selectedRequest.selected_service_items_snapshot.length > 0 ? (
                        <div className="space-y-0">
                          {selectedRequest.selected_service_items_snapshot.map((item: any, index: number) => (
                            <div key={index} className={`flex items-start gap-3 text-xs py-2 ${index > 0 ? 'border-t border-[var(--dashboard-border-primary)]' : ''}`}>
                              <div className="flex-shrink-0 mt-0.5">
                                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-[var(--dashboard-text-primary)]">{item.name || item.item_name}</div>
                                    {item.description && (
                                      <div className="text-[var(--dashboard-text-tertiary)] mt-0.5">{item.description}</div>
                                    )}
                                  </div>
                                  <div className="flex-shrink-0 text-right">
                                    {(() => {
                                      const price = item.price_at_req || item.price_at_request;
                                      return price !== null && price !== undefined && price > 0;
                                    })() && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-[var(--dashboard-text-secondary)]">{item.qty || item.quantity} x €{item.price_at_req || item.price_at_request}</span>
                                        <span className="font-medium text-[var(--dashboard-text-primary)]">
                                          €{((item.qty || item.quantity) * (item.price_at_req || item.price_at_request)).toFixed(2)}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-[var(--dashboard-text-muted)]">
                          No items selected for this request.
                        </div>
                      )}
                    </div>

                    {/* Question Responses */}
                    <div className="mt-6">
                      <h3 className="text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide text-[var(--dashboard-text-tertiary)] border-[var(--dashboard-border-primary)]">Question Responses</h3>
                      {selectedRequest.question_responses_snapshot && Array.isArray(selectedRequest.question_responses_snapshot) && selectedRequest.question_responses_snapshot.length > 0 ? (
                        <div className="space-y-2">
                          {selectedRequest.question_responses_snapshot.map((question: any, index: number) => (
                            <div key={index} className="text-xs pb-2 border-b border-[var(--dashboard-border-primary)] last:border-b-0">
                              <div className="text-xs md:text-xs font-medium flex items-center gap-1 text-[var(--dashboard-text-tertiary)]" style={{ fontSize: 'clamp(0.65rem, 2vw, 0.75rem)' }}>
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
                                      <div key={optIndex} className="flex items-center gap-1 text-xs">
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
                        <div className="text-xs text-[var(--dashboard-text-muted)]">
                          No question responses for this request.
                        </div>
                      )}
                    </div>

                    {/* Requirement Responses */}
                    <div className="mt-6">
                      <h3 className="text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide text-[var(--dashboard-text-tertiary)] border-[var(--dashboard-border-primary)]">Requirements</h3>
                      {selectedRequest.requirement_responses_snapshot && Array.isArray(selectedRequest.requirement_responses_snapshot) && selectedRequest.requirement_responses_snapshot.length > 0 ? (
                        <div className="space-y-0">
                          {selectedRequest.requirement_responses_snapshot.map((requirement: any, index: number) => (
                            <div key={index} className={`text-xs py-2 ${index > 0 ? 'border-t border-[var(--dashboard-border-primary)]' : ''}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <div className={`px-1.5 py-0.5 rounded-full text-xs ${
                                  requirement.customer_confirmed 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {requirement.customer_confirmed ? 'Confirmed' : 'Pending'}
                                </div>
                                {requirement.title && (
                                  <span className="font-medium text-xs text-[var(--dashboard-text-secondary)]">{requirement.title}</span>
                                )}
                              </div>
                              <div className="pl-0">
                                <span className="text-[var(--dashboard-text-tertiary)]" style={{ fontSize: 'clamp(0.65rem, 2vw, 0.75rem)', lineHeight: '1.3' }}>
                                  {requirement.requirements_text}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-[var(--dashboard-text-muted)]">
                          No requirements for this request.
                        </div>
                      )}
                    </div>

                    {/* Saved Generated Response */}
                    {selectedRequest.generated_response && (
                      <div className="mt-6">
                        <h3 className="text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide text-[var(--dashboard-text-tertiary)] border-[var(--dashboard-border-primary)]">
                          AI Generated Response
                        </h3>
                        <div className="p-3 rounded-lg border border-[var(--dashboard-border-primary)] bg-[var(--dashboard-bg-card)]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-[var(--dashboard-text-tertiary)]">
                              Saved: {selectedRequest.generated_response_saved_at 
                                ? new Date(selectedRequest.generated_response_saved_at).toLocaleDateString() + ' ' + 
                                  new Date(selectedRequest.generated_response_saved_at).toLocaleTimeString()
                                : 'Unknown'}
                            </span>
                            <div className="flex gap-1">
                              <button
                                onClick={loadSavedResponseForEditing}
                                className="p-1 rounded transition-colors text-[var(--dashboard-text-tertiary)] hover:text-[var(--dashboard-text-secondary)] hover:bg-[var(--dashboard-bg-tertiary)]"
                                title="Load saved response for editing"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => navigator.clipboard.writeText(selectedRequest.generated_response)}
                                className="p-1 rounded transition-colors text-[var(--dashboard-text-tertiary)] hover:text-[var(--dashboard-text-secondary)] hover:bg-[var(--dashboard-bg-tertiary)]"
                                title="Copy saved response"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="text-xs text-[var(--dashboard-text-secondary)] leading-relaxed">
                            {selectedRequest.generated_response}
                          </div>
                        </div>
                      </div>
                    )}




                    {/* Messages */}
                    {selectedRequest.servicerequestmessage?.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide text-[var(--dashboard-text-tertiary)] border-[var(--dashboard-border-primary)]">Messages</h3>
                        <div className="space-y-2">
                          {selectedRequest.servicerequestmessage.map((message: any) => (
                            <div key={message.message_id} className="p-3 rounded-lg bg-[var(--dashboard-bg-tertiary)]">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium">{message.sender_type}</span>
                                <span className="text-xs opacity-75">
                                  {new Date(message.sent_at).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="text-xs">{message.message_text}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
          <div className="w-full lg:w-2/5 border-t lg:border-t-0 lg:border-l border-[var(--dashboard-border-primary)] flex flex-col">
              {selectedRequest ? (
                <>
                {/* Generate Section - Independent Container */}
                <div className="">
                  <div className="shadow-lg relative overflow-hidden p-2 lg:p-7">
                    {/* Bottom Color Layer 1 */}
                    <div 
                      className="absolute z-1"
                      style={{
                        background: 'var(--ai-panel-accent-1)',
                        filter: 'blur(40px)',
                        opacity: 0.3,
                        height: '90px',
                        bottom: '-45px',
                        left: '0',
                        width: '33.33%',
                        borderRadius: '100%'
                      }}
                    ></div>
                    
                    {/* Bottom Color Layer 2 */}
                    <div 
                      className="absolute z-1"
                      style={{
                        background: 'var(--ai-panel-accent-2)',
                        filter: 'blur(40px)',
                        opacity: 0.3,
                        height: '90px',
                        bottom: '-45px',
                        left: '33.33%',
                        width: '33.33%',
                        borderRadius: '100%'
                      }}
                    ></div>
                    
                    {/* Bottom Color Layer 3 */}
                    <div 
                      className="absolute z-1"
                      style={{
                        background: 'var(--ai-panel-accent-3)',
                        filter: 'blur(40px)',
                        opacity: 0.3,
                        height: '90px',
                        bottom: '-45px',
                        left: '66.66%',
                        width: '33.33%',
                        borderRadius: '100%'
                      }}
                    ></div>
                    <div className="relative z-10">
                  {/* Request Reference */}
                  <div className="mb-4 text-left">
                    <span className="text-lg md:text-2xl font-bold ai-panel-text">Manage #{selectedRequest.request_reference}</span>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="mb-4">
                    <div className="space-y-2">
                      {/* Status Actions Group */}
                      <div className="grid grid-cols-3 gap-2">
                        {/* Mark Handled */}
                        <button
                          onClick={() => markAsHandled(selectedRequest.request_id)}
                          className="p-3 rounded-lg bg-black/10 hover:bg-black/20 transition-colors flex flex-col items-start justify-start gap-2 border border-white/20"
                          title="Mark as handled (Ctrl+H)"
                        >
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: isRequestHandled(selectedRequest) ? '#10b981' : '#059669',
                              minWidth: '24px',
                              minHeight: '24px'
                            }}
                          >
                            {isRequestHandled(selectedRequest) ? (
                              <CheckCircleSolidIcon className="w-4 h-4 text-white" />
                            ) : (
                              <CheckCircleIcon className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <span className="text-xs ai-panel-text-secondary text-left leading-tight">{isRequestHandled(selectedRequest) ? 'Handled' : 'Mark Handled'}</span>
                        </button>
                        
                        {/* Toggle Closed */}
                        <button
                          onClick={() => toggleClosedStatus(selectedRequest.request_id)}
                          className="p-3 rounded-lg bg-black/10 hover:bg-black/20 transition-colors flex flex-col items-start justify-start gap-2 border border-white/20"
                          title="Toggle closed status"
                        >
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: selectedRequest.is_closed ? '#6b7280' : '#f97316',
                              minWidth: '24px',
                              minHeight: '24px'
                            }}
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                          <span className="text-xs ai-panel-text-secondary text-left leading-tight">{selectedRequest.is_closed ? 'Closed' : 'Mark Closed'}</span>
                        </button>
                        
                        {/* Toggle Urgency */}
                        <button
                          onClick={() => toggleUrgencyFlag(selectedRequest.request_id)}
                          className="p-3 rounded-lg bg-black/10 hover:bg-black/20 transition-colors flex flex-col items-start justify-start gap-2 border border-white/20"
                          title="Toggle urgency flag (Ctrl+F)"
                        >
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: selectedRequest.urgency_flag ? '#ef4444' : '#374151',
                              minWidth: '24px',
                              minHeight: '24px'
                            }}
                          >
                            <FlagIcon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-xs ai-panel-text-secondary text-left leading-tight">{selectedRequest.urgency_flag ? 'Urgent' : 'Flag Urgent'}</span>
                        </button>
                      </div>

                      {/* Contact Actions Group */}
                      {(selectedRequest.customer_phone || selectedRequest.customer_email) && (
                        <div className="grid grid-cols-2 gap-2">
                          {selectedRequest.customer_phone && (
                            <a
                              href={`tel:${selectedRequest.customer_phone}`}
                              className="p-3 rounded-lg bg-black/10 hover:bg-black/20 transition-colors flex flex-col items-start justify-start gap-2 border border-white/20"
                              title={`Call ${selectedRequest.customer_phone}`}
                            >
                              <div 
                                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ 
                                  backgroundColor: '#10b981',
                                  minWidth: '24px',
                                  minHeight: '24px'
                                }}
                              >
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                              </div>
                              <span className="text-xs ai-panel-text-secondary text-left leading-tight">Call</span>
                            </a>
                          )}
                          
                          {selectedRequest.customer_email && (
                            <a
                              href={`mailto:${selectedRequest.customer_email}`}
                              className="p-3 rounded-lg bg-black/10 hover:bg-black/20 transition-colors flex flex-col items-start justify-start gap-2 border border-white/20"
                              title={`Email ${selectedRequest.customer_email}`}
                            >
                              <div 
                                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ 
                                  backgroundColor: '#3b82f6',
                                  minWidth: '24px',
                                  minHeight: '24px'
                                }}
                              >
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <span className="text-xs ai-panel-text-secondary text-left leading-tight">Email</span>
                            </a>
                          )}
                        </div>
                      )}

                      {/* Service Board Actions Group */}
                      {selectedRequest.serviceboard?.[0] && (
                        <div className="grid grid-cols-3 gap-2">
                          {/* Open Board */}
                          <button
                            onClick={() => window.open(`/${currentBusiness?.business_urlname}/s/${selectedRequest.serviceboard[0].board_ref}`, '_blank')}
                            className="p-3 rounded-lg bg-black/10 hover:bg-black/20 transition-colors flex flex-col items-start justify-start gap-2 border border-white/20"
                            title="Open service board"
                          >
                            <div 
                              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ 
                                backgroundColor: '#6b7280',
                                minWidth: '24px',
                                minHeight: '24px'
                              }}
                            >
                              <ArrowTopRightOnSquareIcon className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xs ai-panel-text-secondary text-left leading-tight">Open Board</span>
                          </button>
                          
                          {/* Schedule Appointment */}
                          <button
                            onClick={() => window.open(`/${currentBusiness?.business_urlname}/s/${selectedRequest.serviceboard[0].board_ref}?openAddAction=true&actionType=appointment_scheduling`, '_blank')}
                            className="p-3 rounded-lg bg-black/10 hover:bg-black/20 transition-colors flex flex-col items-start justify-start gap-2 border border-white/20"
                            title="Schedule appointment"
                          >
                            <div 
                              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ 
                                backgroundColor: '#10b981',
                                minWidth: '24px',
                                minHeight: '24px'
                              }}
                            >
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <span className="text-xs ai-panel-text-secondary text-left leading-tight">Schedule</span>
                          </button>
                          
                          {/* Generate Quotation */}
                          <button
                            onClick={() => generateQuotation(selectedRequest.request_id)}
                            className="p-3 rounded-lg bg-black/10 hover:bg-black/20 transition-colors flex flex-col items-start justify-start gap-2 border border-white/20"
                            title="Generate quotation (Ctrl+Q)"
                          >
                            <div 
                              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ 
                                backgroundColor: '#3b82f6',
                                minWidth: '24px',
                                minHeight: '24px'
                              }}
                            >
                              <DocumentArrowUpIcon className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xs ai-panel-text-secondary text-left leading-tight">Generate Quotation</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Generate Actions */}
                  <div className="mb-6 pt-4 border-t border-white/10">
                      <h4 className="text-xs font-medium mb-3 ai-panel-text-secondary uppercase tracking-wide flex items-center gap-2">
                        <AIAssistantIcon size="xs" />
                        <SparklesIcon className="w-4 h-4" />
                        Generate Response
                      </h4>

                      {/* Inline AI Generation Content */}
                      <div className="space-y-4">

                      {/* Show Generated Response or Input Forms */}
                      {generatedResponse ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-medium ai-panel-text-secondary">Generated Response</h5>
                            <button
                              onClick={() => {
                                setGeneratedResponse(null)
                                setResponseIsSaved(false)
                                setSaveResponseError(null)
                              }}
                              className="px-2 py-1 text-xs ai-panel-text-secondary hover:ai-panel-text transition-colors"
                              title="Clear and create new response"
                            >
                              New Response
                            </button>
                          </div>
                          <div className="ai-response rounded-lg p-3 border">
                            <div className="text-xs ai-panel-text leading-relaxed">
                              {generatedResponse}
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={copyGeneratedResponse}
                              className="ai-button-copy px-3 py-1 rounded text-xs transition-colors"
                            >
                              Copy
                            </button>
                            <button
                              onClick={saveGeneratedResponse}
                              disabled={isSavingResponse || responseIsSaved}
                              className={`px-3 py-1 rounded text-xs transition-colors ${
                                responseIsSaved 
                                  ? 'bg-green-500 text-white' 
                                  : 'ai-button-copy'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                              title={responseIsSaved ? "Response saved!" : "Save response to database"}
                            >
                              {isSavingResponse ? "Saving..." : responseIsSaved ? "Saved!" : "Save"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                            {/* Question Selection */}
                          {selectedRequest?.question_responses_snapshot && selectedRequest.question_responses_snapshot.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium ai-panel-text-secondary mb-2">Questions Needing Clarification</h5>
                            <div className="space-y-2">
                            {selectedRequest.question_responses_snapshot.map((question: any, index: number) => {
                              const isSelected = selectedQuestionsForClarification.includes(index)
                              let responseText = 'No response'
                              
                              if (question.response_text) {
                                responseText = question.response_text
                                } else if (question.selected_options && question.selected_options.length > 0) {
                                responseText = question.selected_options.map((option: any) => option.option_text || option.text || option).join(', ')
                              }

                              return (
                                <div
                                  key={index}
                                    className={`p-2 rounded border cursor-pointer ${
                                    isSelected 
                                        ? 'ai-panel-card-selected' 
                                        : 'ai-panel-card'
                                  }`}
                                  onClick={() => toggleQuestionForClarification(index)}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="text-xs ai-panel-text-secondary opacity-70 mb-1" style={{ fontSize: '0.7rem' }}>
                                        {question.question_text}
                                      </div>
                                        <div className="text-xs font-medium ai-panel-text">
                                        {responseText}
                                      </div>
                                    </div>
                                      <div className={`ml-2 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                      isSelected 
                                          ? 'border-gray-400 bg-gray-400' 
                                          : 'border-white/50'
                                    }`}>
                                      {isSelected && (
                                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                            {/* Requirements Selection */}
                          {selectedRequest?.requirement_responses_snapshot && selectedRequest.requirement_responses_snapshot.length > 0 && (() => {
                            // Filter to only show pending/unconfirmed requirements
                            const pendingRequirements = selectedRequest.requirement_responses_snapshot.filter((req: any) => !req.customer_confirmed)
                            if (pendingRequirements.length === 0) return null
                            
                            return (
                              <div>
                                <h5 className="text-sm font-medium ai-panel-text-secondary mb-2">Requirements Needing Clarification</h5>
                                <div className="space-y-2">
                                  {selectedRequest.requirement_responses_snapshot.map((requirement: any, index: number) => {
                                    // Only show pending/unconfirmed requirements
                                    if (requirement.customer_confirmed) return null
                                    
                                    const isSelected = selectedRequirementsForClarification.includes(index)

                                    return (
                                      <div
                                        key={index}
                                        className={`p-2 rounded border cursor-pointer ${
                                          isSelected 
                                            ? 'ai-panel-card-selected' 
                                            : 'ai-panel-card'
                                        }`}
                                        onClick={() => toggleRequirementForClarification(index)}
                                      >
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <div className="text-xs ai-panel-text-secondary opacity-70 mb-1" style={{ fontSize: '0.7rem' }}>
                                              {requirement.title ? `${requirement.title}: ` : ''}Requirement
                                            </div>
                                            <div className="text-xs font-medium ai-panel-text">
                                              {requirement.requirements_text}
                                            </div>
                                          </div>
                                          <div className={`ml-2 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                            isSelected 
                                              ? 'border-gray-400 bg-gray-400' 
                                              : 'border-white/50'
                                          }`}>
                                            {isSelected && (
                                              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                              </svg>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })()}

                          {/* Customer Notes Clarification */}
                          {selectedRequest?.customer_notes && (
                              <div>
                              <label className="block text-sm font-medium ai-panel-text-secondary mb-2">
                                What's unclear about the customer notes?
                              </label>
                              <textarea
                                value={customerNotesClarification}
                                onChange={(e) => setCustomerNotesClarification(e.target.value)}
                                  placeholder="What's unclear about the customer notes?"
                                  className="ai-input w-full p-2 text-xs border rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
                                rows={2}
                              />
                            </div>
                          )}

                        {/* Manual Questions */}
                        <div>
                        <label className="block text-sm font-medium ai-panel-text-secondary mb-2">
                          Add any additional questions...
                        </label>
                        <textarea
                          value={manualQuestions}
                          onChange={(e) => setManualQuestions(e.target.value)}
                            placeholder="Add any additional questions..."
                            className="ai-input w-full p-2 text-xs border rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
                            rows={2}
                          />
                          </div>

                        {/* Generate Button - always visible; shows loading style when generating */}
                        <button
                          onClick={handleGenerateResponse}
                          disabled={isGenerating || (creditsStatus?.creditsAvailable ?? 0) <= 0}
                          className={`ai-button-generate-gradient w-full py-2 px-4 text-xs font-medium rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden ${isGenerating ? 'loading' : ''}`}
                        >
                          {/* Gradient Layer */}
                          <div 
                            className="ai-button-glow absolute z-1"
                            style={{
                              filter: 'blur(15px)',
                              opacity: 0.3,
                              borderRadius: '0.5rem',
                              height: '60%',
                              width: '80%',
                              bottom: '0',
                              left: '50%',
                              transform: 'translateX(-50%)'
                            }}
                          ></div>

                          <div className="relative z-10 flex items-center justify-center gap-1">
                            <SparklesIcon className="w-4 h-4" />
                            <span className="text-sm">Generate Response</span>
                          </div>
                        </button>
                        </>
                      )}

                        {/* Loading State: removed inline AI loader to keep button context */}
                        {isGenerating && null}

                        {/* Error Display */}
                        {generationError && (
                          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <div className="w-4 h-4 bg-red-400 rounded-full flex items-center justify-center">
                                <span className="text-red-800 text-xs font-bold">!</span>
                              </div>
                              <p className="text-xs text-red-800 dark:text-red-200">
                                {generationError}
                              </p>
                            </div>
                          </div>
                        )}

                              </div>
                              </div>

                            </div>
                          </div>
                        </div>

                </>
              ) : (
              <div className="text-center text-[var(--dashboard-text-tertiary)] p-4 lg:p-6">
                  <p className="text-xs">Select a request to see available actions</p>
                        </div>
                      )}
                      </div>
                    </div>

                      </div>
                      
      {/* Generation Confirmation Modal */}
      {showGenerationModal && (
        <div className={`fixed inset-0 ${theme === 'dark' ? 'bg-black/50' : 'bg-black/30'} backdrop-blur-sm flex items-center justify-center z-50 p-4`}>
          <div className={`rounded-2xl w-full max-w-md relative overflow-visible p-0`} style={{ background: 'var(--ai-modal-bg-base)', backgroundImage: 'var(--ai-modal-bg-gradient)' }}>
              {/* Accent Color Layers */}
              <div 
                className="absolute z-0"
                style={{
                  background: 'var(--ai-panel-accent-1)',
                  filter: 'blur(40px)',
                  opacity: 0.2,
                  height: '80px',
                  bottom: '-40px',
                  left: '0',
                  width: '50%',
                  borderRadius: '100%'
                }}
              ></div>
              <div 
                className="absolute z-0"
                style={{
                  background: 'var(--ai-panel-accent-2)',
                  filter: 'blur(40px)',
                  opacity: 0.2,
                  height: '80px',
                  bottom: '-40px',
                  right: '0',
                  width: '50%',
                  borderRadius: '100%'
                }}
              ></div>
              
              <div className="p-6 text-center relative z-10">
              {!isGenerating && (
                <>
                  <h3 className="text-lg font-medium ai-panel-text mb-4">Confirm AI Generation</h3>
                  <div className="flex justify-center mb-6">
                    <AIAssistantIcon size="md" />
                  </div>
                </>
              )}
              
              {/* Show loading state or confirmation content */}
              {isGenerating ? (
                <div className="relative z-30 mb-2">
                  <div className="w-full h-48 relative rounded-lg overflow-hidden">
                    <LoadingAIGeneration size="lg" text="Generating your AI response..." />
                  </div>
                </div>
              ) : (
                <>
                  {/* Scrollable Content Container */}
                  <div className="max-h-64 overflow-y-auto mb-2">
                    {/* Request Summary */}
                    <div className="mb-4 pb-4 border-b border-white/10">
                      <h4 className="text-sm font-medium ai-panel-text-secondary mb-2">Request Summary</h4>
                      <div className="space-y-1 text-xs">
                              <div>
                          <span className="ai-panel-text-secondary">Customer:</span> 
                          <span className="ai-panel-text ml-2">{selectedRequest?.customer_name}</span>
                              </div>
                              <div>
                          <span className="ai-panel-text-secondary">Service:</span> 
                          <span className="ai-panel-text ml-2">{selectedRequest?.service?.service_name || 'N/A'}</span>
                                </div>
                              <div>
                          <span className="ai-panel-text-secondary">Reference:</span> 
                          <span className="ai-panel-text ml-2">{selectedRequest?.request_reference}</span>
                                  </div>
                                </div>
                              </div>

                    {/* Customer Notes Clarification */}
                    {customerNotesClarification && (
                      <div className="mb-4 pb-4 border-b border-white/10">
                        <h4 className="text-xs font-medium ai-panel-text-secondary mb-2">Customer Notes Clarification</h4>
                        <p className="text-sm ai-panel-text">{customerNotesClarification}</p>
                      </div>
                    )}

                    {/* Selected Questions for Clarification */}
                    {selectedQuestionsForClarification.length > 0 && (
                      <div className="mb-4 pb-4 border-b border-white/10">
                        <h4 className="text-xs font-medium ai-panel-text-secondary mb-2">Selected Questions Needing Clarification</h4>
                        <div className="space-y-2">
                          {selectedQuestionsForClarification.map((questionIndex) => {
                            const question = selectedRequest?.question_responses_snapshot[questionIndex]
                            if (!question) return null
                            
                            let responseText = 'No response'
                            if (question.response_text) {
                              responseText = question.response_text
                            } else if (question.selected_options && question.selected_options.length > 0) {
                              responseText = question.selected_options.map((option: any) => option.option_text || option.text || option).join(', ')
                            }
                            
                            return (
                              <div key={questionIndex} className="mb-2">
                                <div className="text-xs ai-panel-text-secondary opacity-70" style={{ fontSize: '0.7rem' }}>{question.question_text}</div>
                                <div className="text-sm font-medium ai-panel-text">{responseText}</div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Selected Requirements for Clarification */}
                    {selectedRequirementsForClarification.length > 0 && (
                      <div className="mb-4 pb-4 border-b border-white/10">
                        <h4 className="text-xs font-medium ai-panel-text-secondary mb-2">Selected Requirements Needing Clarification</h4>
                        <div className="space-y-2">
                          {selectedRequirementsForClarification.map((requirementIndex) => {
                            const requirement = selectedRequest?.requirement_responses_snapshot[requirementIndex]
                            if (!requirement) return null
                            
                            return (
                              <div key={requirementIndex} className="mb-2">
                                <div className="text-xs ai-panel-text-secondary opacity-70" style={{ fontSize: '0.7rem' }}>
                                  {requirement.title ? `${requirement.title}: ` : ''}Requirement
                                </div>
                                <div className="text-sm font-medium ai-panel-text">{requirement.requirements_text}</div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Additional Questions */}
                    {manualQuestions && (
                      <div className="mb-4 pb-4 border-b border-white/10">
                        <h4 className="text-xs font-medium ai-panel-text-secondary mb-2">Additional Questions</h4>
                        <p className="text-sm ai-panel-text">{manualQuestions}</p>
                      </div>
                    )}
                  </div>

                  {/* Generation Cost */}
                  <div className="mb-1">
                    <AICostCard 
                      creditsRequired={1}
                      creditsRemaining={creditsLoading ? '...' : (creditsStatus?.creditsAvailable ?? 0)}
                    />
                  </div>
                </>
              )}

              {/* Action Buttons */}
              {!isGenerating && (
                <div className="flex flex-col gap-3 mt-2">
                  <button
                    onClick={handleConfirmGeneration}
                        disabled={(creditsStatus?.creditsAvailable ?? 0) <= 0}
                    className="ai-button-generate-gradient w-full px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                      >
                        {/* Gradient Layer */}
                        <div 
                          className="ai-button-glow absolute z-1"
                          style={{
                            filter: 'blur(15px)',
                            opacity: 0.3,
                            borderRadius: '0.5rem',
                            height: '60%',
                            width: '80%',
                            bottom: '0',
                            left: '50%',
                            transform: 'translateX(-50%)'
                          }}
                        ></div>
                        <div className="relative z-10 flex items-center justify-center gap-1">
                          <span>Generate Response</span>
                        </div>
                      </button>
                  
                  <button
                    onClick={() => setShowGenerationModal(false)}
                    className="text-sm ai-panel-text-secondary hover:ai-panel-text transition-colors underline text-center"
                  >
                    Cancel
                  </button>
                  </div>
              )}
              </div>
            </div>
          </div>
        )}
          </div>
        </div>
    </DashboardLayout>
  )
}

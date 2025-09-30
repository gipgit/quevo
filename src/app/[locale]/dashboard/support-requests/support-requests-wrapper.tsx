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
  EyeSlashIcon,
  SparklesIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'
import { 
  CheckCircleIcon as CheckCircleSolidIcon,
  ExclamationTriangleIcon as ExclamationTriangleSolidIcon
} from '@heroicons/react/24/solid'
import { AIAssistantIcon } from '@/components/ui/ai-assistant-icon'
import { AIActionButton } from '@/components/ui/ai-action-button'
import { AICostCard } from '@/components/ui/ai-cost-card'
import { LoadingAIGeneration } from '@/components/ui/loading-ai-generation'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { LoadingSparkles } from '@/components/ui/loading-sparkles'

interface SupportRequestsWrapperProps {
  supportRequests: any[]
}

export default function SupportRequestsWrapper({ supportRequests: initialSupportRequests }: SupportRequestsWrapperProps) {
  const t = useTranslations("supportRequests")
  const { theme } = useTheme()
  const { currentBusiness, businessSwitchKey } = useBusiness()
  const [supportRequests, setSupportRequests] = useState(initialSupportRequests)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  // Modal states
  const [showGenerateResponseModal, setShowGenerateResponseModal] = useState(false)
  const [showTextEnhancementModal, setShowTextEnhancementModal] = useState(false)
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false)
  const [isEnhancingText, setIsEnhancingText] = useState(false)
  const [responseError, setResponseError] = useState<string | null>(null)
  const [enhancementError, setEnhancementError] = useState<string | null>(null)
  const [generatedResponse, setGeneratedResponse] = useState('')
  const [enhancedText, setEnhancedText] = useState('')

  // Debug: Log initial support requests
  useEffect(() => {
    console.log('Initial support requests:', initialSupportRequests.map(req => ({
      support_request_id: req.support_request_id,
      board_ref: req.board_ref,
      status: req.status,
      priority: req.priority
    })))
  }, [initialSupportRequests])

  // Refetch support requests when business changes
  useEffect(() => {
    const fetchSupportRequests = async () => {
      if (!currentBusiness?.business_id) return
      
      try {
        const response = await fetch(`/api/businesses/${currentBusiness.business_id}/support-requests`)
        if (response.ok) {
          const data = await response.json()
          console.log('Refetched support requests:', data.supportRequests?.map((req: any) => ({
            support_request_id: req.support_request_id,
            board_ref: req.board_ref,
            status: req.status,
            priority: req.priority
          })))
          setSupportRequests(data.supportRequests || [])
        }
      } catch (error) {
        console.error('Error fetching support requests:', error)
      }
    }

    // Only refetch if business has changed (not on initial load)
    if (businessSwitchKey > 0) {
      fetchSupportRequests()
    }
  }, [currentBusiness?.business_id, businessSwitchKey])

  // Set initial selected request
  useEffect(() => {
    if (supportRequests.length > 0 && !selectedRequest) {
      setSelectedRequest(supportRequests[0])
      setSelectedIndex(0)
    }
  }, [supportRequests, selectedRequest])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!supportRequests.length) return

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
            markAsResolved(selectedRequest.support_request_id)
          }
          break
        case 'r':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            if (selectedRequest) {
              setShowGenerateResponseModal(true)
            }
          }
          break
        case 'e':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            if (selectedRequest) {
              setShowTextEnhancementModal(true)
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
  }, [selectedRequest, supportRequests])

  const navigateRequest = useCallback((direction: number) => {
    if (!supportRequests.length) return
    
    const newIndex = Math.max(0, Math.min(supportRequests.length - 1, selectedIndex + direction))
    setSelectedIndex(newIndex)
    setSelectedRequest(supportRequests[newIndex])
  }, [selectedIndex, supportRequests])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.toLocaleDateString("it-IT", { month: "short" })
    const year = date.getFullYear()
    return { day, month: month.charAt(0).toUpperCase() + month.slice(1), year }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-zinc-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'Open'
      case 'in_progress':
        return 'In Progress'
      case 'resolved':
        return 'Resolved'
      case 'closed':
        return 'Closed'
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

  const getPriorityPillClasses = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'technical':
        return 'bg-blue-100 text-blue-800'
      case 'account':
        return 'bg-purple-100 text-purple-800'
      case 'general':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Action functions
  const markAsResolved = async (requestId: string) => {
    try {
      console.log('Marking support request as resolved:', requestId)
      
      const response = await fetch(`/api/support-requests/${requestId}/mark-resolved`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' })
      })
      
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('Response data:', result)
        
        setSupportRequests((prev: any[]) => prev.map(req => 
          req.support_request_id === requestId 
            ? { ...req, status: result.request.status, updated_at: result.request.updated_at }
            : req
        ))
        setSelectedRequest((prev: any) => prev?.support_request_id === requestId 
          ? { ...prev, status: result.request.status, updated_at: result.request.updated_at }
          : prev
        )
      } else {
        const errorData = await response.json()
        console.error('API error:', errorData)
      }
    } catch (error) {
      console.error('Error marking support request as resolved:', error)
    }
  }

  const generateResponse = async () => {
    if (!selectedRequest) return
    
    setIsGeneratingResponse(true)
    setResponseError(null)
    
    try {
      const response = await fetch('/api/ai/generate-support-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supportRequestId: selectedRequest.support_request_id,
          message: selectedRequest.message,
          category: selectedRequest.category,
          priority: selectedRequest.priority
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        setGeneratedResponse(result.response)
      } else {
        const errorData = await response.json()
        setResponseError(errorData.error || 'Failed to generate response')
      }
    } catch (error) {
      setResponseError('Error generating response')
      console.error('Error generating response:', error)
    } finally {
      setIsGeneratingResponse(false)
    }
  }

  const enhanceText = async () => {
    if (!selectedRequest) return
    
    setIsEnhancingText(true)
    setEnhancementError(null)
    
    try {
      const response = await fetch('/api/ai/enhance-support-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supportRequestId: selectedRequest.support_request_id,
          message: selectedRequest.message,
          category: selectedRequest.category
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        setEnhancedText(result.enhancedText)
      } else {
        const errorData = await response.json()
        setEnhancementError(errorData.error || 'Failed to enhance text')
      }
    } catch (error) {
      setEnhancementError('Error enhancing text')
      console.error('Error enhancing text:', error)
    } finally {
      setIsEnhancingText(false)
    }
  }

  const copyCustomerContacts = async (request: any) => {
    const customer = request.usercustomer
    if (!customer) return
    
    const contacts = `${customer.name_first} ${customer.name_last}\nEmail: ${customer.email}\nPhone: ${customer.phone}`
    try {
      await navigator.clipboard.writeText(contacts)
      // You could add a toast notification here
    } catch (error) {
      console.error('Error copying contacts:', error)
    }
  }

  // Calculate progress
  const totalRequests = supportRequests.length
  const resolvedRequests = supportRequests.filter(req => req.status === 'resolved' || req.status === 'closed').length
  const openRequests = totalRequests - resolvedRequests
  const progressPercentage = totalRequests > 0 ? (resolvedRequests / totalRequests) * 100 : 0

  if (supportRequests.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-[1400px] mx-auto">
          {/* Top Navbar (simulated) */}
          <div className="sticky top-0 z-10 px-6 py-4 lg:py-2 rounded-2xl mb-3 bg-[var(--dashboard-bg-primary)] border border-[var(--dashboard-border-primary)]">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-medium text-[var(--dashboard-text-primary)]">Support Requests</p>
              </div>
            </div>
          </div>

          {/* Content Wrapper with Background */}
          <div className="bg-[var(--dashboard-bg-primary)] rounded-2xl border border-[var(--dashboard-border-primary)] p-6">
            <EmptyState
              icon={<ChatBubbleLeftRightIcon className="mx-auto w-12 h-12" />}
              title="No Support Requests"
              description="No support requests have been submitted yet."
              buttonText="View Service Boards"
              onButtonClick={() => window.location.href = "/dashboard/service-boards"}
            />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        {/* Top Navbar (simulated) */}
        <div className="sticky top-0 z-10 px-6 py-4 lg:py-2 rounded-2xl mb-3 bg-[var(--dashboard-bg-primary)] border border-[var(--dashboard-border-primary)]">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-medium text-[var(--dashboard-text-primary)]">Support Requests</p>
            </div>
          </div>
        </div>

        {/* Content Wrapper with Background */}
        <div className="bg-[var(--dashboard-bg-primary)] rounded-2xl border border-[var(--dashboard-border-primary)] p-6">
          <div className="flex flex-col h-full">
            {/* Main Content - 3 Column Layout */}
        <div className="flex-1 flex flex-col lg:flex-row gap-2 lg:gap-6 overflow-hidden relative">
          {/* Left Panel - Request List */}
          <div className={`w-full lg:w-1/6 border-b lg:border-b-0 lg:border-r border-[var(--dashboard-border-primary)] flex flex-col`}>
            {/* Navigation & Progress */}
            <div className="p-4 border-b border-[var(--dashboard-border-primary)]">
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
                  {selectedIndex + 1} of {supportRequests.length}
                </span>
                <button
                  onClick={() => navigateRequest(1)}
                  disabled={selectedIndex === supportRequests.length - 1}
                  className={`p-1.5 rounded-lg transition-colors ${
                    selectedIndex === supportRequests.length - 1
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
                  {resolvedRequests} of {totalRequests} resolved
                </div>
                <span className="text-xs text-[var(--dashboard-text-tertiary)]">
                  {openRequests} open
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
                {supportRequests.map((request, index) => {
                  const { day, month } = formatDate(request.created_at)
                  const time = new Date(request.created_at).toLocaleTimeString('it-IT', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                  const isSelected = selectedRequest?.support_request_id === request.support_request_id
                  
                  return (
                    <div
                      key={request.support_request_id}
                      onClick={() => {
                        setSelectedRequest(request)
                        setSelectedIndex(index)
                      }}
                      className={`p-2 lg:p-3 rounded-lg cursor-pointer transition-all flex-shrink-0 w-60 lg:w-auto ${
                        isSelected
                          ? 'bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-primary)] border-l-4 border-[var(--dashboard-active-border)]'
                          : 'hover:bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-primary)]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <div className="flex items-center gap-1">
                          <span className="opacity-75">{day} {month} {time}</span>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${getStatusColor(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                      </div>
                      
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                          <span className="font-medium text-[10px]">{request.board_ref}</span>
                          <span className="text-[10px] opacity-75">• {request.usercustomer?.name_first} {request.usercustomer?.name_last}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {getPriorityIcon(request.priority || 'medium')}
                        </div>
                      </div>
                      
                      <div className="text-[10px]">
                        <div className="opacity-75">{request.category}</div>
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
                {/* Request Header with Action Buttons */}
                <div className={`p-2 lg:p-0 pb-2`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className={`text-base lg:text-lg font-bold ${
                            theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                          }`}>
                            {selectedRequest.board_ref}
                          </h2>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(selectedRequest.status)}`}>
                            {getStatusText(selectedRequest.status)}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${getCategoryColor(selectedRequest.category)}`}>
                            {selectedRequest.category}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${getPriorityPillClasses(selectedRequest.priority)}`}>
                            {selectedRequest.priority || 'priority'}
                          </span>
                        </div>
                        <div className="hidden"></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap max-w-sm"></div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pt-0 overflow-y-auto">
                  <div className="space-y-5">
                    {/* Customer Details - two-column layout, match sizes/paddings */}
                    <div>
                      <h3 className="text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide text-[var(--dashboard-text-tertiary)] border-[var(--dashboard-border-primary)]">Customer Details</h3>
                      <div>
                        {selectedRequest.usercustomer && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                            {/* Left: Name big */}
                            <div>
                              <div className="text-base lg:text-lg font-normal text-[var(--dashboard-text-primary)]">
                                {selectedRequest.usercustomer.name_first} {selectedRequest.usercustomer.name_last}
                              </div>
                            </div>
                            {/* Right: Contacts with copy/actions */}
                            <div className="flex flex-col gap-2 text-sm">
                              {/* Email Row */}
                              <div className="flex items-center justify-start lg:justify-end gap-1">
                                <span>{selectedRequest.usercustomer.email || selectedRequest.email || '-'}</span>
                                <button
                                  onClick={() => navigator.clipboard.writeText(selectedRequest.usercustomer.email || selectedRequest.email || '')}
                                  className="p-1.5 rounded transition-colors text-[var(--dashboard-text-tertiary)] hover:text-[var(--dashboard-text-secondary)] hover:bg-[var(--dashboard-bg-tertiary)]"
                                  title="Copy email"
                                >
                                  <ClipboardDocumentIcon className="w-4 h-4" />
                                </button>
                                {(selectedRequest.usercustomer.email || selectedRequest.email) && (
                                  <a
                                    href={`mailto:${selectedRequest.usercustomer.email || selectedRequest.email}`}
                                    className="p-1.5 rounded transition-colors text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    title="Send email"
                                  >
                                    <EnvelopeIcon className="w-4 h-4" />
                                  </a>
                                )}
                              </div>
                              {/* Phone Row */}
                              {selectedRequest.usercustomer.phone && (
                                <div className="flex items-center justify-start lg:justify-end gap-1">
                                  <span>{selectedRequest.usercustomer.phone}</span>
                                  <button
                                    onClick={() => navigator.clipboard.writeText(selectedRequest.usercustomer.phone)}
                                    className="p-1.5 rounded transition-colors text-[var(--dashboard-text-tertiary)] hover:text-[var(--dashboard-text-secondary)] hover:bg-[var(--dashboard-bg-tertiary)]"
                                    title="Copy phone"
                                  >
                                    <ClipboardDocumentIcon className="w-4 h-4" />
                                  </button>
                                  <a
                                    href={`https://wa.me/${selectedRequest.usercustomer.phone.replace(/\D/g, '')}`}
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
                        )}
                      </div>
                    </div>

                    {/* Support Message */}
                    <div>
                      <h3 className={`text-xs font-medium mb-3 pt-1 border-t uppercase tracking-wide text-[var(--dashboard-text-tertiary)] border-[var(--dashboard-border-primary)]`}>Support Message</h3>
                      <div className={`relative p-4 rounded-lg border bg-[var(--dashboard-bg-card)] border-[var(--dashboard-border-primary)] shadow-sm`}>
                        <div className={`text-sm leading-relaxed mb-0 text-[var(--dashboard-text-primary)] relative z-10`}>
                          {selectedRequest.message}
                        </div>
                        {/* Subtle bottom gradient overlay */}
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 rounded-b-lg bg-gradient-to-b from-transparent to-blue-100/40"></div>
                      </div>
                    </div>

                    {/* Open Board section removed; button moved to right panel */}

                    {/* Related Action - timeline style */}
                    {selectedRequest.serviceboardaction && (
                      <div>
                        <h3 className="text-xs font-medium mb-3 pt-1 border-t uppercase tracking-wide text-[var(--dashboard-text-tertiary)] border-[var(--dashboard-border-primary)]">Related Action</h3>
                        <div className="relative">
                          <div className="relative flex items-start pb-0">
                            {/* Timeline dot */}
                            <div className="relative z-10 w-5 h-5 rounded-full border-2 border-[var(--dashboard-border-primary)] bg-[var(--dashboard-bg-primary)] flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-[var(--dashboard-text-secondary)]"></div>
                            </div>
                            {/* Content */}
                            <div className="ml-2 lg:ml-4 flex-1 min-w-0">
                              {/* Date/Time */}
                              <div className="text-xs text-[var(--dashboard-text-tertiary)] mb-1" style={{ fontSize: '0.7rem' }}>
                                {selectedRequest.serviceboardaction.created_at ? (
                                  <span>
                                    {new Date(selectedRequest.serviceboardaction.created_at).toLocaleDateString()} {new Date(selectedRequest.serviceboardaction.created_at).toLocaleTimeString()}
                                  </span>
                                ) : (
                                  <span className="text-[var(--dashboard-text-muted)]">No date</span>
                                )}
                              </div>
                              {/* Status + Type + Title */}
                              <div className="flex items-center gap-2">
                                {selectedRequest.serviceboardaction.action_status === 'completed' ? (
                                  <CheckCircleSolidIcon className="w-3 h-3 text-green-500 flex-shrink-0" />
                                ) : (
                                  <ClockIcon className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                                )}
                                <div className="font-medium text-xs text-[var(--dashboard-text-primary)] flex-1">
                                  <span className="text-[var(--dashboard-text-tertiary)]">{selectedRequest.serviceboardaction.action_type}</span> • {selectedRequest.serviceboardaction.action_title}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Customer Details - old duplicate removed */}

                    {/* Resolution Notes */}
                    {selectedRequest.resolution_notes && (
                      <div>
                        <h3 className={`text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide ${
                          theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'
                        }`}>Resolution Notes</h3>
                        <div className={`p-4 rounded-lg border ${
                          theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
                        }`}>
                          <div className={`text-sm ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {selectedRequest.resolution_notes}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Attachments */}
                    {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
                      <div>
                        <h3 className={`text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide ${
                          theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'
                        }`}>Attachments</h3>
                        <div className="space-y-2">
                          {selectedRequest.attachments.map((attachment: any) => (
                            <div key={attachment.id} className={`p-3 rounded-lg border ${
                              theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-sm">{attachment.file_name}</div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(attachment.created_at).toLocaleDateString()}
                                  </div>
                                </div>
                                <a
                                  href={attachment.file_path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-700 text-sm"
                                >
                                  Download
                                </a>
                              </div>
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
                  <p>Select a support request to view details</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Actions */}
          <div className="w-full lg:w-2/5 border-t lg:border-t-0 lg:border-l border-[var(--dashboard-border-primary)] flex flex-col">
            {selectedRequest ? (
              <div className="p-2 lg:p-7 space-y-4">
                <div>
                  {/* Manage Request Section */}
                  <div className="mb-6">
                    <h4 className="text-xs font-medium mb-3 ai-panel-text-secondary uppercase tracking-wide">Manage Request</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => markAsResolved(selectedRequest.support_request_id)}
                        className="p-3 rounded-lg bg-black/10 hover:bg-black/20 transition-colors flex flex-col items-start justify-start gap-2 border border-white/20"
                        title="Mark as resolved (Enter)"
                      >
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: (selectedRequest.status === 'resolved' || selectedRequest.status === 'closed') ? '#10b981' : '#059669', minWidth: '24px', minHeight: '24px' }}
                        >
                          {(selectedRequest.status === 'resolved' || selectedRequest.status === 'closed') ? (
                            <CheckCircleSolidIcon className="w-4 h-4 text-white" />
                          ) : (
                            <CheckCircleIcon className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <span className="text-xs ai-panel-text-secondary text-left leading-tight">{selectedRequest.status === 'resolved' || selectedRequest.status === 'closed' ? 'Resolved' : 'Mark Resolved'}</span>
                      </button>
                      {selectedRequest.board_ref && (
                        <a
                          href={`/${currentBusiness?.business_urlname}/s/${selectedRequest.board_ref}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-lg bg-black/10 hover:bg-black/20 transition-colors flex flex-col items-start justify-start gap-2 border border-white/20"
                          title="Open board"
                        >
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: '#10b981', minWidth: '24px', minHeight: '24px' }}
                          >
                            <ArrowTopRightOnSquareIcon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-xs ai-panel-text-secondary text-left leading-tight">Open Board</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* AI Tools Section (moved below Manage Request) */}
                  <div className="mb-2 pt-4 border-t border-white/10">
                    <h4 className="text-xs font-medium mb-3 ai-panel-text-secondary uppercase tracking-wide flex items-center gap-2">
                      <AIAssistantIcon size="xs" />
                      <SparklesIcon className="w-4 h-4" />
                      AI Tools
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setShowGenerateResponseModal(true)}
                        className="p-3 rounded-lg bg-black/10 hover:bg-black/20 transition-colors flex flex-col items-start justify-start gap-2 border border-white/20"
                        title="Generate AI response (Ctrl+R)"
                      >
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: '#3b82f6', minWidth: '24px', minHeight: '24px' }}
                        >
                          <SparklesIcon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs ai-panel-text-secondary text-left leading-tight">Generate Response</span>
                      </button>
                      {/* Open Board moved to Manage Request section above */}
                      <button
                        onClick={() => setShowTextEnhancementModal(true)}
                        className="p-3 rounded-lg bg-black/10 hover:bg-black/20 transition-colors flex flex-col items-start justify-start gap-2 border border-white/20"
                        title="Enhance text (Ctrl+E)"
                      >
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: '#a855f7', minWidth: '24px', minHeight: '24px' }}
                        >
                          <WrenchScrewdriverIcon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs ai-panel-text-secondary text-left leading-tight">Enhance Text</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-[var(--dashboard-text-tertiary)] text-sm">Select a request to use AI tools</div>
            )}
          </div>
        </div>

        {/* Generate Response Modal */}
        <Dialog open={showGenerateResponseModal} onOpenChange={setShowGenerateResponseModal}>
          <div className="no-scroll max-w-xl min-w-[520px] relative overflow-visible p-0 rounded-2xl mx-0">
            <div className="relative rounded-2xl overflow-hidden" style={{ background: 'var(--ai-modal-bg-base)', backgroundImage: 'var(--ai-modal-bg-gradient)' }}>
            {/* Accent Blur Layers */}
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

            <div className="relative z-10 text-center space-y-4 p-6">
              <div className="flex justify-center">
                {!isGeneratingResponse && <AIAssistantIcon size="md" />}
              </div>
              <h3 className="text-lg font-medium ai-panel-text">Generate AI Response</h3>

              {isGeneratingResponse ? (
                <div className="py-6">
                  <LoadingAIGeneration size="lg" text="Generating response..." />
                </div>
              ) : (
                <div className="space-y-3 text-left">
                  <div className="ai-panel-card p-3 rounded-lg">
                    <div className="text-xs ai-panel-text-secondary mb-1">Request Summary</div>
                    <div className="text-xs ai-panel-text space-y-0.5">
                      <div><span className="ai-panel-text-secondary">Category:</span> {selectedRequest?.category}</div>
                      <div><span className="ai-panel-text-secondary">Priority:</span> {selectedRequest?.priority}</div>
                      <div><span className="ai-panel-text-secondary">Message:</span> {selectedRequest?.message}</div>
                    </div>
                  </div>

                  {/* Customer Message Card - matches middle panel card */}
                  <div>
                    <div className={`text-xs font-medium mb-2 ai-panel-text-secondary uppercase tracking-wide`}>Customer Message</div>
                    <div className={`relative p-4 rounded-lg border bg-[var(--dashboard-bg-card)] border-[var(--dashboard-border-primary)] shadow-sm`}>
                      <div className={`text-sm leading-relaxed mb-0 text-[var(--dashboard-text-primary)] relative z-10`}>
                        {selectedRequest?.message}
                      </div>
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 rounded-b-lg bg-gradient-to-b from-transparent to-blue-100/40"></div>
                    </div>
                  </div>

                  {/* Cost Card (always visible) */}
                  <AICostCard creditsRequired={1} creditsRemaining={'—'} />

                  {responseError && (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 bg-red-400 rounded-full flex items-center justify-center">
                          <span className="text-red-800 text-xs font-bold">!</span>
                        </div>
                        <p className="text-xs text-red-800 dark:text-red-200">{responseError}</p>
                      </div>
                    </div>
                  )}

                  {generatedResponse && (
                    <div>
                      <Label htmlFor="generated-response" className="text-xs ai-panel-text-secondary">Generated Response</Label>
                      <Textarea
                        id="generated-response"
                        value={generatedResponse}
                        onChange={(e) => setGeneratedResponse(e.target.value)}
                        rows={8}
                        className="mt-2"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2">
                <AIActionButton
                  onClick={generateResponse}
                  isLoading={isGeneratingResponse}
                  text="Generate Response"
                  loadingText="Generating..."
                />
              </div>
            </div>
            </div>
          </div>
        </Dialog>

        {/* Text Enhancement Modal */}
        <Dialog open={showTextEnhancementModal} onOpenChange={setShowTextEnhancementModal}>
          <div className="no-scroll max-w-xl min-w-[520px] relative overflow-visible p-0 rounded-2xl mx-0">
            <div className="relative rounded-2xl overflow-hidden" style={{ background: 'var(--ai-modal-bg-base)', backgroundImage: 'var(--ai-modal-bg-gradient)' }}>
            {/* Accent Blur Layers */}
            <div 
              className="absolute z-0"
              style={{
                background: 'var(--ai-panel-accent-2)',
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
                background: 'var(--ai-panel-accent-3)',
                filter: 'blur(40px)',
                opacity: 0.2,
                height: '80px',
                bottom: '-40px',
                right: '0',
                width: '50%',
                borderRadius: '100%'
              }}
            ></div>

            <div className="relative z-10 text-center space-y-4 p-6">
              <div className="flex justify-center">
                {!isEnhancingText && <AIAssistantIcon size="md" />}
              </div>
              <h3 className="text-lg font-medium ai-panel-text">Apply Text Enhancement</h3>

              {isEnhancingText ? (
                <div className="py-6">
                  <LoadingAIGeneration size="lg" text="Enhancing text..." />
                </div>
              ) : (
                <div className="space-y-3 text-left">
                  {/* Customer Message Card - matches middle panel card */}
                  <div>
                    <div className={`text-xs font-medium mb-2 ai-panel-text-secondary uppercase tracking-wide`}>Customer Message</div>
                    <div className={`relative p-4 rounded-lg border bg-[var(--dashboard-bg-card)] border-[var(--dashboard-border-primary)] shadow-sm`}>
                      <div className={`text-sm leading-relaxed mb-0 text-[var(--dashboard-text-primary)] relative z-10`}>
                        {selectedRequest?.message}
                      </div>
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 rounded-b-lg bg-gradient-to-b from-transparent to-blue-100/40"></div>
                    </div>
                  </div>

                  {/* Cost Card (always visible) */}
                  <AICostCard creditsRequired={1} creditsRemaining={'—'} />

                  {enhancementError && (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 bg-red-400 rounded-full flex items-center justify-center">
                          <span className="text-red-800 text-xs font-bold">!</span>
                        </div>
                        <p className="text-xs text-red-800 dark:text-red-200">{enhancementError}</p>
                      </div>
                    </div>
                  )}

                  {enhancedText && (
                    <div>
                      <Label htmlFor="enhanced-text" className="text-xs ai-panel-text-secondary">Enhanced Message</Label>
                      <Textarea
                        id="enhanced-text"
                        value={enhancedText}
                        onChange={(e) => setEnhancedText(e.target.value)}
                        rows={8}
                        className="mt-2 ai-input"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2">
                <AIActionButton
                  onClick={enhanceText}
                  isLoading={isEnhancingText}
                  text="Enhance Text"
                  loadingText="Enhancing..."
                />
              </div>
            </div>
            </div>
          </div>
        </Dialog>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

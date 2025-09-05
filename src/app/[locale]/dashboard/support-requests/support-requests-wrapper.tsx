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
  EyeSlashIcon,
  SparklesIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'
import { 
  CheckCircleIcon as CheckCircleSolidIcon,
  ExclamationTriangleIcon as ExclamationTriangleSolidIcon
} from '@heroicons/react/24/solid'
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
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
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
    
    setIsGenerating(true)
    setGenerationError(null)
    
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
        setGenerationError(errorData.error || 'Failed to generate response')
      }
    } catch (error) {
      setGenerationError('Error generating response')
      console.error('Error generating response:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const enhanceText = async () => {
    if (!selectedRequest) return
    
    setIsGenerating(true)
    setGenerationError(null)
    
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
        setGenerationError(errorData.error || 'Failed to enhance text')
      }
    } catch (error) {
      setGenerationError('Error enhancing text')
      console.error('Error enhancing text:', error)
    } finally {
      setIsGenerating(false)
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
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>Support Requests</h1>
            </div>
          </div>

          <EmptyState
            icon={<ChatBubbleLeftRightIcon className="mx-auto w-12 h-12" />}
            title="No Support Requests"
            description="No support requests have been submitted yet."
            buttonText="View Service Boards"
            onButtonClick={() => window.location.href = "/dashboard/service-boards"}
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
            }`}>Support Requests</h1>
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
                  <div>Enter Mark resolved</div>
                  <div>Ctrl+R Generate response</div>
                  <div>Ctrl+E Enhance text</div>
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
                {selectedIndex + 1} of {supportRequests.length}
              </span>
              <button
                onClick={() => navigateRequest(1)}
                disabled={selectedIndex === supportRequests.length - 1}
                className={`p-2 rounded-lg transition-colors ${
                  selectedIndex === supportRequests.length - 1
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
          <div className={`w-72 border-r ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          } flex flex-col`}>
            {/* Progress Bar */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Progress: {resolvedRequests} of {totalRequests} resolved
                </span>
                <span className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {openRequests} open
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
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
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
                          {request.status === 'resolved' || request.status === 'closed' ? (
                            <CheckCircleSolidIcon className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full bg-blue-500" />
                          )}
                          <span className="font-medium text-xs">{request.board_ref}</span>
                          <span className="text-xs opacity-75">• {request.usercustomer?.name_first} {request.usercustomer?.name_last}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {getPriorityIcon(request.priority || 'medium')}
                        </div>
                      </div>
                      
                      <div className="text-xs">
                        <div className="text-xs opacity-75">{request.category}</div>
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
                {/* Request Header with Action Buttons */}
                <div className={`p-6 border-b ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className={`text-2xl font-bold ${
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
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{selectedRequest.usercustomer?.name_first} {selectedRequest.usercustomer?.name_last}</span>
                          <span>•</span>
                          <span>{selectedRequest.email || selectedRequest.usercustomer?.email}</span>
                          <span>•</span>
                          <span>{selectedRequest.priority} priority</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap max-w-sm">
                      <button
                        onClick={() => markAsResolved(selectedRequest.support_request_id)}
                        className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-sm ${
                          selectedRequest.status === 'resolved' || selectedRequest.status === 'closed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                        title="Mark as resolved (Enter)"
                      >
                        {selectedRequest.status === 'resolved' || selectedRequest.status === 'closed' ? (
                          <CheckCircleSolidIcon className="w-3.5 h-3.5" />
                        ) : (
                          <CheckCircleIcon className="w-3.5 h-3.5" />
                        )}
                        {selectedRequest.status === 'resolved' || selectedRequest.status === 'closed' ? 'Resolved' : 'Mark Resolved'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-6 pb-4">
                  <h3 className={`text-xs font-medium mb-3 pt-1 border-t uppercase tracking-wide ${
                    theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'
                  }`}>AI Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setShowGenerateResponseModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1.5 text-sm"
                      title="Generate AI response (Ctrl+R)"
                    >
                      <SparklesIcon className="w-3.5 h-3.5" />
                      Generate Response
                    </button>
                    
                    <button
                      onClick={() => setShowTextEnhancementModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center gap-1.5 text-sm"
                      title="Enhance text (Ctrl+E)"
                    >
                      <WrenchScrewdriverIcon className="w-3.5 h-3.5" />
                      Apply Text Enhancement
                    </button>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="p-6 pb-4">
                  <h3 className={`text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide ${
                    theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'
                  }`}>Customer Details</h3>
                  <div className="flex items-center gap-6 text-sm">
                    {selectedRequest.usercustomer && (
                      <>
                        <div className="flex items-center gap-2">
                          <span>{selectedRequest.usercustomer.name_first} {selectedRequest.usercustomer.name_last}</span>
                          <button
                            onClick={() => navigator.clipboard.writeText(`${selectedRequest.usercustomer.name_first} ${selectedRequest.usercustomer.name_last}`)}
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
                          <span>{selectedRequest.usercustomer.email}</span>
                          <button
                            onClick={() => navigator.clipboard.writeText(selectedRequest.usercustomer.email)}
                            className={`p-1 rounded transition-colors ${
                              theme === 'dark' 
                                ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                            }`}
                            title="Copy email"
                          >
                            <ClipboardDocumentIcon className="w-3 h-3" />
                          </button>
                          <a
                            href={`mailto:${selectedRequest.usercustomer.email}`}
                            className={`p-1 rounded transition-colors ${
                              theme === 'dark' 
                                ? 'text-blue-400 hover:text-blue-300 hover:bg-gray-700' 
                                : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                            }`}
                            title="Send email"
                          >
                            <EnvelopeIcon className="w-3 h-3" />
                          </a>
                        </div>
                        {selectedRequest.usercustomer.phone && (
                          <div className="flex items-center gap-2">
                            <span>{selectedRequest.usercustomer.phone}</span>
                            <button
                              onClick={() => navigator.clipboard.writeText(selectedRequest.usercustomer.phone)}
                              className={`p-1 rounded transition-colors ${
                                theme === 'dark' 
                                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                              }`}
                              title="Copy phone"
                            >
                              <ClipboardDocumentIcon className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Support Message */}
                <div className="flex-1 p-6 pt-0 overflow-y-auto">
                  <div className="space-y-5">
                    <div>
                      <h3 className={`text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide ${
                        theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'
                      }`}>Support Message</h3>
                      <div className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
                      }`}>
                        <div className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {selectedRequest.message}
                        </div>
                      </div>
                    </div>

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
        </div>

        {/* Generate Response Modal */}
        <Dialog open={showGenerateResponseModal} onOpenChange={setShowGenerateResponseModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <SparklesIcon className="w-5 h-5 text-blue-600" />
                <span>Generate AI Response</span>
              </DialogTitle>
              <DialogDescription>
                Generate an AI-powered response for this support request
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Request Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-sm mb-2">Request Summary:</h4>
                <div className="text-sm text-gray-600">
                  <p><strong>Category:</strong> {selectedRequest?.category}</p>
                  <p><strong>Priority:</strong> {selectedRequest?.priority}</p>
                  <p><strong>Message:</strong> {selectedRequest?.message}</p>
                </div>
              </div>

              {/* AI Generation Cost */}
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center space-x-4">
                  <div>
                    <h4 className="font-semibold text-blue-900">AI Generation Cost</h4>
                    <p className="text-sm text-blue-700">This will use 1 AI generation credit</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-900">1 Credit</p>
                    <p className="text-xs text-blue-600">Credits remaining: 10</p>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {generationError && (
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 bg-red-400 rounded-full flex items-center justify-center">
                      <span className="text-red-800 text-xs font-bold">!</span>
                    </div>
                    <p className="text-sm text-red-800">{generationError}</p>
                  </div>
                </div>
              )}

              {/* Generated Response */}
              {generatedResponse && (
                <div>
                  <Label htmlFor="generated-response">Generated Response:</Label>
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

            <DialogFooter>
              <Button
                onClick={generateResponse}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <LoadingSparkles className="w-4 h-4 mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    Generate Response
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Text Enhancement Modal */}
        <Dialog open={showTextEnhancementModal} onOpenChange={setShowTextEnhancementModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <WrenchScrewdriverIcon className="w-5 h-5 text-purple-600" />
                <span>Apply Text Enhancement</span>
              </DialogTitle>
              <DialogDescription>
                Enhance the support request message with AI-powered improvements
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Original Text */}
              <div>
                <Label htmlFor="original-text">Original Message:</Label>
                <Textarea
                  id="original-text"
                  value={selectedRequest?.message || ''}
                  readOnly
                  rows={4}
                  className="mt-2 bg-gray-50"
                />
              </div>

              {/* AI Enhancement Cost */}
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center space-x-4">
                  <div>
                    <h4 className="font-semibold text-purple-900">AI Enhancement Cost</h4>
                    <p className="text-sm text-purple-700">This will use 1 AI generation credit</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-purple-900">1 Credit</p>
                    <p className="text-xs text-purple-600">Credits remaining: 10</p>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {generationError && (
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 bg-red-400 rounded-full flex items-center justify-center">
                      <span className="text-red-800 text-xs font-bold">!</span>
                    </div>
                    <p className="text-sm text-red-800">{generationError}</p>
                  </div>
                </div>
              )}

              {/* Enhanced Text */}
              {enhancedText && (
                <div>
                  <Label htmlFor="enhanced-text">Enhanced Message:</Label>
                  <Textarea
                    id="enhanced-text"
                    value={enhancedText}
                    onChange={(e) => setEnhancedText(e.target.value)}
                    rows={8}
                    className="mt-2"
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                onClick={enhanceText}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <LoadingSparkles className="w-4 h-4 mr-2" />
                    Enhancing...
                  </>
                ) : (
                  <>
                    <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
                    Enhance Text
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

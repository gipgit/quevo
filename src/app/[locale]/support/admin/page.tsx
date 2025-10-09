'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertTriangle,
  Mail,
  User,
  Building2,
  MessageSquare,
  Send,
  X
} from 'lucide-react'

interface AppSupportRequest {
  support_request_id: string
  subject: string
  message: string
  section: string
  priority: string
  category: string
  status: string
  user_name: string | null
  user_email: string | null
  created_at: string
  updated_at: string
  business: {
    business_id: string
    business_name: string
    business_urlname: string
  }
  usermanager_appsupportrequest_manager_idTousermanager: {
    user_id: string
    name_first: string
    name_last: string
    email: string
  }
  appsupportresponse: Array<{
    response_id: string
    message: string
    created_at: string
    usermanager: {
      name_first: string
      name_last: string
      email: string
    }
  }>
}

export default function AdminAppSupportPage() {
  const [requests, setRequests] = useState<AppSupportRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<AppSupportRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [responseMessage, setResponseMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterPriority, setFilterPriority] = useState<string>('')

  useEffect(() => {
    fetchRequests()
  }, [filterStatus, filterPriority])

  const fetchRequests = async () => {
    try {
      const params = new URLSearchParams()
      if (filterStatus) params.append('status', filterStatus)
      if (filterPriority) params.append('priority', filterPriority)

      const response = await fetch(`/api/app-support-requests?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests)
        if (!selectedRequest && data.requests.length > 0) {
          setSelectedRequest(data.requests[0])
        }
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendResponse = async () => {
    if (!selectedRequest || !responseMessage.trim()) return

    setIsSending(true)
    try {
      const response = await fetch(`/api/app-support-requests/${selectedRequest.support_request_id}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: responseMessage })
      })

      if (response.ok) {
        const data = await response.json()
        setResponseMessage('')
        
        // Refresh the request data
        fetchRequests()
        
        // Update selected request responses
        if (selectedRequest) {
          const updatedResponses = [...selectedRequest.appsupportresponse, data.response]
          setSelectedRequest({
            ...selectedRequest,
            appsupportresponse: updatedResponses,
            status: 'in_progress'
          })
        }
      }
    } catch (error) {
      console.error('Error sending response:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleUpdateStatus = async (status: string) => {
    if (!selectedRequest) return

    try {
      const response = await fetch(`/api/app-support-requests/${selectedRequest.support_request_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        fetchRequests()
        setSelectedRequest({ ...selectedRequest, status })
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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
    switch (priority) {
      case 'urgent':
      case 'high':
        return <AlertTriangle className="w-4 h-4" />
      case 'medium':
        return <Clock className="w-4 h-4" />
      case 'low':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading support requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/support"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">App Support Admin</h1>
                <p className="text-sm text-gray-600">{requests.length} total requests</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 h-[calc(100vh-160px)]">
          {/* Left Panel - Request List */}
          <div className="w-1/3 bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-sm font-medium text-gray-900">Support Requests</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {requests.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No support requests found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {requests.map((request) => (
                    <div
                      key={request.support_request_id}
                      onClick={() => setSelectedRequest(request)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedRequest?.support_request_id === request.support_request_id
                          ? 'bg-blue-50 border-l-4 border-blue-600'
                          : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getPriorityIcon(request.priority)}
                          <span className={`px-2 py-0.5 rounded-full text-xs ${getPriorityColor(request.priority)}`}>
                            {request.priority}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      
                      <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-1">
                        {request.subject}
                      </h3>
                      
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {request.message}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3 h-3" />
                          <span className="truncate max-w-[120px]">{request.business.business_name}</span>
                        </div>
                        <span>{formatDate(request.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Request Details */}
          <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
            {selectedRequest ? (
              <>
                {/* Request Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {selectedRequest.subject}
                      </h2>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedRequest.status)}`}>
                          {selectedRequest.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(selectedRequest.priority)}`}>
                          {selectedRequest.priority}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                          {selectedRequest.category}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                          {selectedRequest.section}
                        </span>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2">
                      {selectedRequest.status !== 'resolved' && (
                        <button
                          onClick={() => handleUpdateStatus('resolved')}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                        >
                          Mark Resolved
                        </button>
                      )}
                      {selectedRequest.status !== 'closed' && (
                        <button
                          onClick={() => handleUpdateStatus('closed')}
                          className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                        >
                          Close
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Business & User Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Building2 className="w-4 h-4" />
                        <span className="font-medium">Business:</span>
                      </div>
                      <p className="text-gray-900">{selectedRequest.business.business_name}</p>
                      <p className="text-xs text-gray-500">/{selectedRequest.business.business_urlname}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <User className="w-4 h-4" />
                        <span className="font-medium">Manager:</span>
                      </div>
                      <p className="text-gray-900">
                        {selectedRequest.usermanager_appsupportrequest_manager_idTousermanager.name_first}{' '}
                        {selectedRequest.usermanager_appsupportrequest_manager_idTousermanager.name_last}
                      </p>
                      <a 
                        href={`mailto:${selectedRequest.usermanager_appsupportrequest_manager_idTousermanager.email}`}
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Mail className="w-3 h-3" />
                        {selectedRequest.usermanager_appsupportrequest_manager_idTousermanager.email}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Request Content & Responses */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Original Message */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Original Message</h3>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                        {selectedRequest.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-3">
                        Submitted: {formatDate(selectedRequest.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Responses */}
                  {selectedRequest.appsupportresponse.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Responses ({selectedRequest.appsupportresponse.length})
                      </h3>
                      <div className="space-y-3">
                        {selectedRequest.appsupportresponse.map((response) => (
                          <div key={response.response_id} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-gray-900">
                                  {response.usermanager.name_first} {response.usermanager.name_last}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatDate(response.created_at)}
                              </span>
                            </div>
                            <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                              {response.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Response Form */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Add Response</h3>
                  <div className="space-y-3">
                    <textarea
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      rows={4}
                      placeholder="Type your response here..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      disabled={isSending}
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">
                        Response will be saved and the request status will be updated to "In Progress"
                      </p>
                      <button
                        onClick={handleSendResponse}
                        disabled={isSending || !responseMessage.trim()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                      >
                        {isSending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send Response
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select a support request to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

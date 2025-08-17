'use client'

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import { useTheme } from "@/contexts/ThemeContext"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { 
  UsersIcon, 
  UserGroupIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  CalendarIcon,
  DocumentArrowDownIcon,
  PaperAirplaneIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from "@heroicons/react/24/outline"
import { formatUsageDisplay } from "@/lib/usage-utils"

interface Business {
  business_id: string
  business_name: string
  business_descr: string | null
}

interface Customer {
  id: string
  name_first: string | null
  name_last: string | null
  email: string | null
  phone: string | null
  date_created: Date | null
  active: any
  requests: {
    request_id: string
    request_reference: string
    date_created: Date | null
    status: string
  }[]
  boards: {
    board_id: string
    board_title: string
    status: string
    created_at: Date
    updated_at: Date
  }[]
  lastActivity: Date | null
}

interface Usage {
  services: number
  service_requests: number
  boards: number
  appointments: number
  active_boards: number
  products: number
}

interface PlanLimit {
  feature: string
  limit_type: string
  scope: string
  value: number | null
}

interface ClientsWrapperProps {
  currentBusiness: Business
  activeCustomers: Customer[]
  pastCustomers: Customer[]
  uncommittedCustomers: Customer[]
  usage: Usage
  planLimits: PlanLimit[]
  rateLimitStatus: {
    allowed: boolean
    tokensRemaining: number
    tokensCapacity: number
    nextRefillTime?: Date
  }
}

export default function ClientsWrapper({ 
  currentBusiness, 
  activeCustomers, 
  pastCustomers, 
  uncommittedCustomers, 
  usage, 
  planLimits,
  rateLimitStatus
}: ClientsWrapperProps) {
  const t = useTranslations("clients")
  const { theme } = useTheme()
  
  // State for UI interactions
  const [activeTab, setActiveTab] = useState<'active' | 'past' | 'uncommitted'>('active')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [campaignData, setCampaignData] = useState({
    subject: '',
    content: '',
    fromName: currentBusiness.business_name || '',
    fromEmail: '',
    replyTo: ''
  })

  // Filter customers based on search term
  const filteredActiveCustomers = useMemo(() => {
    return activeCustomers.filter(customer => 
      customer.name_first?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.name_last?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [activeCustomers, searchTerm])

  const filteredPastCustomers = useMemo(() => {
    return pastCustomers.filter(customer => 
      customer.name_first?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.name_last?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [pastCustomers, searchTerm])

  const filteredUncommittedCustomers = useMemo(() => {
    return uncommittedCustomers.filter(customer => 
      customer.name_first?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.name_last?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [uncommittedCustomers, searchTerm])

  const currentCustomers = activeTab === 'active' 
    ? filteredActiveCustomers 
    : activeTab === 'past' 
      ? filteredPastCustomers 
      : filteredUncommittedCustomers

  // Helper functions
  const getCustomerFullName = (customer: Customer) => {
    return `${customer.name_first || ''} ${customer.name_last || ''}`.trim() || 'Unknown Customer'
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString()
  }

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    )
  }

  const handleSelectAll = () => {
    if (selectedCustomers.length === currentCustomers.length) {
      setSelectedCustomers([])
    } else {
      setSelectedCustomers(currentCustomers.map(c => c.id))
    }
  }

  // Export functions
  const exportToCSV = (customers: Customer[]) => {
    const headers = ['Name', 'Email', 'Phone', 'Date Created', 'Last Activity', 'Status']
    const csvContent = [
      headers.join(','),
      ...customers.map(customer => [
        `"${getCustomerFullName(customer)}"`,
        `"${customer.email || ''}"`,
        `"${customer.phone || ''}"`,
        `"${formatDate(customer.date_created)}"`,
        `"${formatDate(customer.lastActivity)}"`,
        `"${activeTab === 'active' ? 'Active' : activeTab === 'past' ? 'Past' : 'Uncommitted'}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeTab}-customers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportToTXT = (customers: Customer[]) => {
    const content = customers.map(customer => 
      `${getCustomerFullName(customer)}\t${customer.email || ''}\t${customer.phone || ''}`
    ).join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeTab}-customers-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Campaign functions
  const handleSendCampaign = async () => {
    if (!campaignData.subject || !campaignData.content) {
      alert('Please fill in all required fields')
      return
    }

    if (selectedCustomers.length === 0) {
      alert('Please select at least one customer')
      return
    }

    if (!rateLimitStatus.allowed) {
      const nextRefill = rateLimitStatus.nextRefillTime 
        ? new Date(rateLimitStatus.nextRefillTime).toLocaleTimeString()
        : 'soon'
      alert(`Rate limit exceeded. You can send ${rateLimitStatus.tokensCapacity} emails per hour. Next refill at ${nextRefill}`)
      return
    }

    try {
      const { sendEmailCampaign } = await import('./actions')
      
      const result = await sendEmailCampaign({
        subject: campaignData.subject,
        content: campaignData.content,
        fromName: campaignData.fromName,
        fromEmail: campaignData.fromEmail,
        replyTo: campaignData.replyTo,
        recipientIds: selectedCustomers
      })

      if (result.success) {
        alert(result.message)
        setShowCampaignModal(false)
        setSelectedCustomers([])
        setCampaignData({
          subject: '',
          content: '',
          fromName: currentBusiness.business_name || '',
          fromEmail: '',
          replyTo: ''
        })
      } else {
        alert(`Error: ${result.message}`)
      }
    } catch (error) {
      console.error('Error sending campaign:', error)
      alert('Error sending campaign')
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {t("title")}
              </h1>
              <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                {t("subtitle")}
              </p>
            </div>
            
                         {/* Action Buttons */}
             <div className="flex items-center gap-3">
               <button
                 onClick={() => exportToCSV(currentCustomers)}
                 className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
               >
                 <DocumentArrowDownIcon className="w-4 h-4" />
                 Export CSV
               </button>
               <button
                 onClick={() => exportToTXT(currentCustomers)}
                 className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
               >
                 <DocumentArrowDownIcon className="w-4 h-4" />
                 Export TXT
               </button>
               <button
                 onClick={() => setShowCampaignModal(true)}
                 disabled={!rateLimitStatus.allowed}
                 className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                   rateLimitStatus.allowed 
                     ? 'bg-purple-600 text-white hover:bg-purple-700' 
                     : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                 }`}
               >
                 <PaperAirplaneIcon className="w-4 h-4" />
                 Send Campaign
                 {!rateLimitStatus.allowed && (
                   <span className="text-xs">(Rate Limited)</span>
                 )}
               </button>
             </div>
          </div>

                     {/* Stats */}
           <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
             <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
               <div className="flex items-center gap-3">
                 <UserGroupIcon className="w-8 h-8 text-green-600" />
                 <div>
                   <p className="text-sm text-gray-600 dark:text-gray-400">Active Clients</p>
                   <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                     {activeCustomers.length}
                   </p>
                 </div>
               </div>
             </div>
             <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
               <div className="flex items-center gap-3">
                 <UsersIcon className="w-8 h-8 text-blue-600" />
                 <div>
                   <p className="text-sm text-gray-600 dark:text-gray-400">Past Clients</p>
                   <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                     {pastCustomers.length}
                   </p>
                 </div>
               </div>
             </div>
             <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
               <div className="flex items-center gap-3">
                 <UsersIcon className="w-8 h-8 text-orange-600" />
                 <div>
                   <p className="text-sm text-gray-600 dark:text-gray-400">Uncommitted</p>
                   <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                     {uncommittedCustomers.length}
                   </p>
                 </div>
               </div>
             </div>
             <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
               <div className="flex items-center gap-3">
                 <EnvelopeIcon className="w-8 h-8 text-purple-600" />
                 <div>
                   <p className="text-sm text-gray-600 dark:text-gray-400">Total Clients</p>
                   <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                     {activeCustomers.length + pastCustomers.length + uncommittedCustomers.length}
                   </p>
                 </div>
               </div>
             </div>
             <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
               <div className="flex items-center gap-3">
                 <PaperAirplaneIcon className={`w-8 h-8 ${rateLimitStatus.allowed ? 'text-green-600' : 'text-red-600'}`} />
                 <div>
                   <p className="text-sm text-gray-600 dark:text-gray-400">Email Rate Limit</p>
                   <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                     {rateLimitStatus.tokensRemaining}/{rateLimitStatus.tokensCapacity}
                   </p>
                   <p className="text-xs text-gray-500 dark:text-gray-400">
                     {rateLimitStatus.allowed ? 'Available' : 'Rate Limited'}
                   </p>
                 </div>
               </div>
             </div>
           </div>
        </div>

                 {/* Tabs */}
         <div className="mb-6">
           <div className="border-b border-gray-200 dark:border-gray-700">
             <nav className="-mb-px flex space-x-8">
               <button
                 onClick={() => setActiveTab('active')}
                 className={`py-2 px-1 border-b-2 font-medium text-sm ${
                   activeTab === 'active'
                     ? 'border-green-500 text-green-600 dark:text-green-400'
                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                 }`}
               >
                 Active Clients ({activeCustomers.length})
               </button>
               <button
                 onClick={() => setActiveTab('past')}
                 className={`py-2 px-1 border-b-2 font-medium text-sm ${
                   activeTab === 'past'
                     ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                 }`}
               >
                 Past Clients ({pastCustomers.length})
               </button>
               <button
                 onClick={() => setActiveTab('uncommitted')}
                 className={`py-2 px-1 border-b-2 font-medium text-sm ${
                   activeTab === 'uncommitted'
                     ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                 }`}
               >
                 Uncommitted ({uncommittedCustomers.length})
               </button>
             </nav>
           </div>
         </div>

        {/* Search and Filters */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          {selectedCustomers.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>{selectedCustomers.length} selected</span>
              <button
                onClick={() => setSelectedCustomers([])}
                className="text-red-600 hover:text-red-700"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Customers List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
                             <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                 {activeTab === 'active' ? 'Active' : activeTab === 'past' ? 'Past' : 'Uncommitted'} Customers
               </h3>
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {selectedCustomers.length === currentCustomers.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {currentCustomers.map((customer) => (
              <div
                key={customer.id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  selectedCustomers.includes(customer.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.includes(customer.id)}
                    onChange={() => handleCustomerSelect(customer.id)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {getCustomerFullName(customer)}
                      </h4>
                                             <span className={`px-2 py-1 text-xs rounded-full ${
                         activeTab === 'active'
                           ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                           : activeTab === 'past'
                           ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                           : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                       }`}>
                         {activeTab === 'active' ? 'Active' : activeTab === 'past' ? 'Past' : 'Uncommitted'}
                       </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <EnvelopeIcon className="w-4 h-4" />
                        <span>{customer.email || 'No email'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="w-4 h-4" />
                        <span>{customer.phone || 'No phone'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        <span>Joined: {formatDate(customer.date_created)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {customer.requests.length} request{customer.requests.length !== 1 ? 's' : ''} • 
                      Last activity: {formatDate(customer.lastActivity)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

                     {currentCustomers.length === 0 && (
             <div className="p-8 text-center text-gray-500 dark:text-gray-400">
               No {activeTab === 'active' ? 'active' : activeTab === 'past' ? 'past' : 'uncommitted'} customers found.
             </div>
           )}
        </div>

        {/* Campaign Modal */}
        {showCampaignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Send Mass Email Campaign
                  </h2>
                  <button
                    onClick={() => setShowCampaignModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      From Name
                    </label>
                    <input
                      type="text"
                      value={campaignData.fromName}
                      onChange={(e) => setCampaignData(prev => ({ ...prev, fromName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      From Email
                    </label>
                    <input
                      type="email"
                      value={campaignData.fromEmail}
                      onChange={(e) => setCampaignData(prev => ({ ...prev, fromEmail: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="noreply@yourdomain.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Reply To
                    </label>
                    <input
                      type="email"
                      value={campaignData.replyTo}
                      onChange={(e) => setCampaignData(prev => ({ ...prev, replyTo: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="support@yourdomain.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Subject Line
                    </label>
                    <input
                      type="text"
                      value={campaignData.subject}
                      onChange={(e) => setCampaignData(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Your email subject..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Content
                    </label>
                    <textarea
                      value={campaignData.content}
                      onChange={(e) => setCampaignData(prev => ({ ...prev, content: e.target.value }))}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Write your email content here..."
                    />
                  </div>

                                     <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                     <p className="text-sm text-blue-800 dark:text-blue-200">
                       This campaign will be sent to {selectedCustomers.length} selected customer{selectedCustomers.length !== 1 ? 's' : ''}.
                     </p>
                   </div>

                   {!rateLimitStatus.allowed && (
                     <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                       <p className="text-sm text-red-800 dark:text-red-200">
                         ⚠️ Rate limit exceeded. You can send {rateLimitStatus.tokensCapacity} emails per hour. 
                         {rateLimitStatus.nextRefillTime && (
                           <span> Next refill at {new Date(rateLimitStatus.nextRefillTime).toLocaleTimeString()}</span>
                         )}
                       </p>
                     </div>
                   )}

                   {rateLimitStatus.allowed && rateLimitStatus.tokensRemaining < selectedCustomers.length && (
                     <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                       <p className="text-sm text-yellow-800 dark:text-yellow-200">
                         ⚠️ You have {rateLimitStatus.tokensRemaining} emails remaining this hour, but {selectedCustomers.length} customers selected. 
                         Only the first {rateLimitStatus.tokensRemaining} emails will be sent.
                       </p>
                     </div>
                   )}

                  <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                      onClick={() => setShowCampaignModal(false)}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendCampaign}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                    >
                      <PaperAirplaneIcon className="w-4 h-4" />
                      Send Campaign
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

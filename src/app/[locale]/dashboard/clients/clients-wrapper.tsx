'use client'

import { useState, useMemo } from "react"
import { useTheme } from "@/contexts/ThemeProvider"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { 
  UsersIcon, 
  UserGroupIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  CalendarIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon
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
  newsletterConsentCustomers: Customer[]
  usage: Usage
  planLimits: PlanLimit[]
  locale: string
}

export default function ClientsWrapper({ 
  currentBusiness, 
  activeCustomers, 
  pastCustomers, 
  uncommittedCustomers, 
  newsletterConsentCustomers,
  usage, 
  planLimits,
  locale
}: ClientsWrapperProps) {
  const { theme } = useTheme()
  
  // State for UI interactions
  const [activeTab, setActiveTab] = useState<'active' | 'past' | 'uncommitted' | 'newsletter'>('active')
  const [searchTerm, setSearchTerm] = useState('')

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

  const filteredNewsletterCustomers = useMemo(() => {
    return newsletterConsentCustomers.filter(customer => 
      customer.name_first?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.name_last?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [newsletterConsentCustomers, searchTerm])

  const currentCustomers = activeTab === 'active' 
    ? filteredActiveCustomers 
    : activeTab === 'past' 
      ? filteredPastCustomers 
      : activeTab === 'uncommitted'
        ? filteredUncommittedCustomers
        : filteredNewsletterCustomers

  // Helper functions
  const getCustomerFullName = (customer: Customer) => {
    return `${customer.name_first || ''} ${customer.name_last || ''}`.trim() || 'Unknown Customer'
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString()
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


  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Top Navbar (simulated) */}
        <div className="sticky top-0 z-10 px-6 py-4 lg:py-2 rounded-2xl mb-3 bg-[var(--dashboard-bg-primary)] border border-[var(--dashboard-border-primary)]">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-medium text-[var(--dashboard-text-primary)]">Clients</p>
            </div>
          </div>
        </div>

        {/* Content Wrapper with Background */}
        <div className="bg-[var(--dashboard-bg-primary)] rounded-2xl border border-[var(--dashboard-border-primary)] p-6">
          {/* Header */}
          <div className="mb-8">
          {/* Stats */}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4 mb-6">
             <div className="bg-[var(--dashboard-bg-card)] p-2 md:p-4 rounded-lg border border-[var(--dashboard-border-primary)]">
               <div className="flex items-center gap-2 md:gap-3">
                 <UserGroupIcon className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
                 <div>
                   <p className="text-xs md:text-sm text-[var(--dashboard-text-secondary)]">Active</p>
                   <p className="text-lg md:text-2xl font-bold text-[var(--dashboard-text-primary)]">
                     {activeCustomers.length}
                   </p>
                 </div>
               </div>
             </div>
             <div className="bg-[var(--dashboard-bg-card)] p-2 md:p-4 rounded-lg border border-[var(--dashboard-border-primary)]">
               <div className="flex items-center gap-2 md:gap-3">
                 <UsersIcon className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                 <div>
                   <p className="text-xs md:text-sm text-[var(--dashboard-text-secondary)]">Past</p>
                   <p className="text-lg md:text-2xl font-bold text-[var(--dashboard-text-primary)]">
                     {pastCustomers.length}
                   </p>
                 </div>
               </div>
             </div>
             <div className="bg-[var(--dashboard-bg-card)] p-2 md:p-4 rounded-lg border border-[var(--dashboard-border-primary)]">
               <div className="flex items-center gap-2 md:gap-3">
                 <UsersIcon className="w-6 h-6 md:w-8 md:h-8 text-orange-600" />
                 <div>
                   <p className="text-xs md:text-sm text-[var(--dashboard-text-secondary)]">Uncommitted</p>
                   <p className="text-lg md:text-2xl font-bold text-[var(--dashboard-text-primary)]">
                     {uncommittedCustomers.length}
                   </p>
                 </div>
               </div>
             </div>
             <div className="bg-[var(--dashboard-bg-card)] p-2 md:p-4 rounded-lg border border-[var(--dashboard-border-primary)] col-span-3 md:col-span-1">
               <div className="flex items-center gap-2 md:gap-3">
                 <EnvelopeIcon className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
                 <div>
                   <p className="text-xs md:text-sm text-[var(--dashboard-text-secondary)]">Newsletter</p>
                   <p className="text-lg md:text-2xl font-bold text-[var(--dashboard-text-primary)]">
                     {newsletterConsentCustomers.length}
                   </p>
                 </div>
               </div>
             </div>
           </div>
        </div>

                 {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-[var(--dashboard-border-primary)]">
             <nav className="-mb-px flex space-x-4 md:space-x-8">
               <button
                 onClick={() => setActiveTab('active')}
                 className={`py-2 px-1 border-b-2 font-medium text-xs md:text-sm ${
                   activeTab === 'active'
                     ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:border-[var(--dashboard-border-secondary)]'
                 }`}
               >
                 <span className="hidden sm:inline">Active Clients</span>
                 <span className="sm:hidden">Active</span> ({activeCustomers.length})
               </button>
               <button
                 onClick={() => setActiveTab('past')}
                 className={`py-2 px-1 border-b-2 font-medium text-xs md:text-sm ${
                   activeTab === 'past'
                     ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:border-[var(--dashboard-border-secondary)]'
                 }`}
               >
                 <span className="hidden sm:inline">Past Clients</span>
                 <span className="sm:hidden">Past</span> ({pastCustomers.length})
               </button>
               <button
                 onClick={() => setActiveTab('uncommitted')}
                 className={`py-2 px-1 border-b-2 font-medium text-xs md:text-sm ${
                   activeTab === 'uncommitted'
                     ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:border-[var(--dashboard-border-secondary)]'
                 }`}
               >
                 Uncommitted ({uncommittedCustomers.length})
               </button>
               <button
                 onClick={() => setActiveTab('newsletter')}
                 className={`py-2 px-1 border-b-2 font-medium text-xs md:text-sm ${
                   activeTab === 'newsletter'
                     ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:border-[var(--dashboard-border-secondary)]'
                 }`}
               >
                 <span className="hidden sm:inline">Newsletter Consent</span>
                 <span className="sm:hidden">Newsletter</span> ({newsletterConsentCustomers.length})
               </button>
             </nav>
           </div>
         </div>

        {/* Search */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[var(--dashboard-border-primary)] rounded-lg bg-[var(--dashboard-bg-input)] text-[var(--dashboard-text-primary)]"
            />
          </div>
        </div>

        {/* Customers List */}
        <div className="bg-[var(--dashboard-bg-card)] rounded-lg border border-[var(--dashboard-border-primary)]">
          <div className="p-4 border-b border-[var(--dashboard-border-primary)]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-[var(--dashboard-text-primary)]">
                {activeTab === 'active' ? 'Active' : 
                 activeTab === 'past' ? 'Past' : 
                 activeTab === 'uncommitted' ? 'Uncommitted' : 
                 'Newsletter Consent'} Customers
              </h3>
              <div className="flex items-center gap-2 md:gap-3">
                <button
                  onClick={() => exportToCSV(currentCustomers)}
                  className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm md:text-base"
                >
                  <DocumentArrowDownIcon className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Export CSV</span>
                  <span className="sm:hidden">CSV</span>
                </button>
                <button
                  onClick={() => exportToTXT(currentCustomers)}
                  className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
                >
                  <DocumentArrowDownIcon className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Export TXT</span>
                  <span className="sm:hidden">TXT</span>
                </button>
              </div>
            </div>
          </div>

          <div className="divide-y divide-[var(--dashboard-border-primary)]">
            {currentCustomers.map((customer) => (
              <div
                key={customer.id}
                className="p-4 hover:bg-[var(--dashboard-bg-tertiary)] transition-colors"
              >
                <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-3 md:gap-4">
                  <div className="flex items-center justify-between md:justify-start gap-2">
                    <h4 className="text-lg font-medium text-[var(--dashboard-text-primary)]">
                      {getCustomerFullName(customer)}
                    </h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      activeTab === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : activeTab === 'past'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : activeTab === 'uncommitted'
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                    }`}>
                      {activeTab === 'active' ? 'Active' : 
                       activeTab === 'past' ? 'Past' : 
                       activeTab === 'uncommitted' ? 'Uncommitted' : 
                       'Newsletter Consent'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-[var(--dashboard-text-secondary)]">
                    <EnvelopeIcon className="w-4 h-4" />
                    <span>{customer.email || 'No email'}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-[var(--dashboard-text-secondary)]">
                    <PhoneIcon className="w-4 h-4" />
                    <span>{customer.phone || 'No phone'}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-[var(--dashboard-text-secondary)]">
                    <CalendarIcon className="w-4 h-4" />
                    <span>Joined: {formatDate(customer.date_created)}</span>
                  </div>

                  <div className="text-xs md:text-sm text-[var(--dashboard-text-secondary)] md:text-right">
                    {customer.requests.length} request{customer.requests.length !== 1 ? 's' : ''} • Last activity: {formatDate(customer.lastActivity)}
                  </div>
                </div>
              </div>
            ))}
          </div>

            {currentCustomers.length === 0 && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No {activeTab === 'active' ? 'active' : 
                    activeTab === 'past' ? 'past' : 
                    activeTab === 'uncommitted' ? 'uncommitted' : 
                    'newsletter consent'} customers found.
              </div>
            )}

        </div>
        </div>

      </div>
    </DashboardLayout>
  )
}

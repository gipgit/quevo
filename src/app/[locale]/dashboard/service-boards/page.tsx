"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useBusiness } from "@/lib/business-context"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { UsageLimitBar } from "@/components/dashboard/UsageLimitBar"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import EmptyState from "@/components/EmptyState"
import CopyButton from "@/components/CopyButton"

interface ServiceBoard {
  board_id: string
  board_ref: string
  board_title: string
  board_description: string | null
  status: string
  created_at: string
  updated_at: string
  is_password_protected: boolean
  servicerequest: {
    request_reference: string
    service: {
      service_name: string
      servicecategory: {
        category_name: string
      } | null
    }
  } | null
  usercustomer: {
    name_first: string | null
    name_last: string | null
    email: string
    phone: string | null
  }
  serviceboardaction: Array<{
    action_id: string
    action_type: string
    action_title: string
    action_status: string
    created_at: string
    due_date: string | null
  }>
}

export default function ServiceBoardsPage() {
  const t = useTranslations("serviceBoards")
  const { currentBusiness, usage, planLimits, refreshUsageForFeature } = useBusiness()
  const [serviceBoards, setServiceBoards] = useState<ServiceBoard[]>([])
  const [loading, setLoading] = useState(true)
  const [planLimitsData, setPlanLimitsData] = useState<any>(null)

  useEffect(() => {
    if (currentBusiness && currentBusiness.business_id) {
      fetchServiceBoards()
    }
  }, [currentBusiness])

  const fetchServiceBoards = async () => {
    try {
      setLoading(true)
      if (!currentBusiness?.business_id) throw new Error("No business selected")
      const response = await fetch(`/api/businesses/${currentBusiness.business_id}/service-boards`)
      if (!response.ok) throw new Error("Failed to fetch service boards")
      const data = await response.json()
      setServiceBoards(data.serviceBoards)
      setPlanLimitsData(data.planLimits)
    } catch (error) {
      console.error("Error fetching service boards:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT")
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return t("pending")
      case 'active':
        return t("active")
      case 'completed':
        return t("completed")
      case 'archived':
        return t("archived")
      default:
        return status
    }
  }

  const handleOpenBoard = (boardRef: string) => {
    // Open service board in new tab using the public URL format
    const businessUrlName = currentBusiness?.business_urlname
    if (businessUrlName) {
      window.open(`/${businessUrlName}/s/${boardRef}`, '_blank')
    }
  }

  const handleViewDetails = (boardId: string) => {
    // Navigate to service board details
    window.location.href = `/dashboard/service-boards/${boardId}/details`
  }

  if (!currentBusiness) return null

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t("title")}</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end gap-2">
              {planLimitsData && (
                <UsageLimitBar
                  current={serviceBoards.length}
                  max={planLimitsData.maxBoards}
                  label={t("planInfo", { current: "{current}", max: "{max}" })}
                  showUpgrade={true}
                  onUpgrade={() => (window.location.href = "/dashboard/plan")}
                  upgradeText={t("upgradePlan")}
                  unlimitedText={t("unlimited")}
                />
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" color="blue" />
          </div>
        ) : (
          <>
            {/* Service Boards List */}
            <div className="space-y-6">
              {serviceBoards.map((board) => (
                <div
                  key={board.board_id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {/* Board Details - Left Column */}
                      <div className="lg:col-span-2">
                        <div className="mb-4">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {board.board_title}
                          </h3>
                          {/* Status, Creation Date, and Board Reference */}
                          <div className="flex items-center gap-4 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">{t("status")}:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(board.status)}`}>
                                {getStatusText(board.status)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">{t("created")}:</span>
                              <span className="text-sm font-medium text-gray-700">{formatDate(board.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">Ref:</span>
                              <span className="text-sm font-medium text-gray-700">{board.board_ref}</span>
                            </div>
                          </div>
                          {/* Service Info */}
                          {board.servicerequest && (
                            <p className="text-gray-600 mb-2">
                              {board.servicerequest.service.service_name}
                              {board.servicerequest.service.servicecategory && (
                                <span className="text-gray-400 ml-2">
                                  • {board.servicerequest.service.servicecategory.category_name}
                                </span>
                              )}
                            </p>
                          )}
                          {/* Board Description moved here */}
                          {board.board_description && (
                            <p className="text-gray-700 mt-2 text-sm">{board.board_description}</p>
                          )}
                        </div>

                        {/* Recent Actions Timeline */}
                        {board.serviceboardaction.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <span className="text-sm text-gray-500 mb-3 block">
                              {board.serviceboardaction.length} total actions, recent ones are:
                            </span>
                            <div className="flex items-center space-x-4 overflow-x-auto pb-2">
                              {board.serviceboardaction.slice(0, 5).map((action, index) => (
                                <div key={action.action_id} className="flex items-center flex-shrink-0">
                                  {/* Timeline dot */}
                                  <div className={`w-3 h-3 rounded-full ${getStatusColor(action.action_status).replace('text-', 'bg-').replace('bg-gray-100', 'bg-gray-300')} mr-2`}></div>
                                  {/* Action content */}
                                  <div className="bg-gray-50 rounded-lg px-3 py-2 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 truncate">
                                      {action.action_title}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(action.action_status)}`}>
                                        {getStatusText(action.action_status)}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {new Date(action.created_at).toLocaleDateString('it-IT', { 
                                          month: 'short', 
                                          day: 'numeric' 
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                  {/* Timeline connector (except for last item) */}
                                  {index < Math.min(4, board.serviceboardaction.length - 1) && (
                                    <div className="w-8 h-0.5 bg-gray-200 mx-2"></div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Password Protection Indicator */}
                        {board.is_password_protected && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <span className="text-sm text-gray-500 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              Password Protected
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Customer Details - Right Column */}
                      <div className="lg:col-span-1">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">{t("customer")}</h4>
                          <div className="space-y-3">
                            <div>
                              <div className="font-semibold text-gray-900 mb-2">
                                {`${board.usercustomer.name_first || ''} ${board.usercustomer.name_last || ''}`.trim() || board.usercustomer.email}
                              </div>
                            </div>
                            
                            {/* Customer Contact Info */}
                            {board.usercustomer.email && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 truncate">{board.usercustomer.email}</span>
                                <button
                                  onClick={() => navigator.clipboard.writeText(board.usercustomer.email)}
                                  className="text-blue-600 hover:text-blue-800 transition-colors flex-shrink-0 ml-2"
                                  title="Copy email"
                                >
                                  📋
                                </button>
                              </div>
                            )}
                            {board.usercustomer.phone && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 truncate">{board.usercustomer.phone}</span>
                                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                  <a
                                    href={`tel:${board.usercustomer.phone}`}
                                    className="text-green-600 hover:text-green-800 transition-colors"
                                    title="Call phone"
                                  >
                                    📞
                                  </a>
                                  <a
                                    href={`https://wa.me/${board.usercustomer.phone.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-green-600 hover:text-green-800 transition-colors"
                                    title="WhatsApp"
                                  >
                                    💬
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Open Board Button - Third Column */}
                      <div className="lg:col-span-1">
                        <div className="flex items-center justify-center h-full">
                          <button
                            onClick={() => handleOpenBoard(board.board_ref)}
                            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
                          >
                            {t("openBoard")}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {serviceBoards.length === 0 && (
              <EmptyState
                title={t("noServiceBoards")}
                description={t("noServiceBoardsDescription")}
                buttonText={t("viewDetails")}
                onButtonClick={() => window.location.href = "/dashboard/service-requests"}
                icon={<svg className="mx-auto w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
              />
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
} 
"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useBusiness } from "@/lib/business-context"
import { canCreateMore, formatUsageDisplay } from "@/lib/usage-utils"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { UsageLimitBar } from "@/components/dashboard/UsageLimitBar"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import EmptyState from "@/components/EmptyState"
import CopyButton from "@/components/CopyButton"
import { EnvelopeIcon } from '@heroicons/react/24/outline'
import Link from "next/link"

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
  const { currentBusiness, usage, planLimits } = useBusiness()
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

  const planLimitBoards = planLimits?.find(l => l.feature === 'boards' && l.limit_type === 'count' && l.scope === 'global')
  const currentUsage = usage?.boards ?? 0
  const canCreateBoard = () => {
    if (!planLimitBoards) return false
    return canCreateMore(currentUsage, planLimitBoards)
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
              {planLimitBoards && (
                <UsageLimitBar
                  current={currentUsage}
                  max={planLimitBoards.value}
                  label={formatUsageDisplay(currentUsage, planLimitBoards)}
                  showUpgrade={true}
                  onUpgrade={() => (window.location.href = "/dashboard/plan")}
                  upgradeText={t("upgradePlan")}
                  unlimitedText={t("unlimited")}
                />
              )}
            </div>
            <div>
              <Link
                href="/dashboard/service-boards/create"
                className={`px-6 py-3 text-lg font-semibold rounded-lg transition-colors inline-flex items-center gap-2 ${
                  canCreateBoard()
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t("createBoard")}
              </Link>
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
            <div className="grid grid-cols-1 gap-y-6">
              {serviceBoards.map((board) => {
                return (
                  <div key={board.board_id}>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden grid grid-cols-1 lg:grid-cols-[55%_45%]">
                      {/* Board Details - Left Column */}
                      <div className="col-span-1 p-6 max-w-lg min-w-[320px]">
                        <div className="mb-4">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {board.board_title}
                          </h3>
                          {/* Status, Creation Date, and Board Reference */}
                          <div className="flex items-center gap-4 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-semibold text-gray-700">{formatDate(board.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">{t("status")}:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(board.status)}`}>
                                {getStatusText(board.status)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 border border-gray-300 bg-gray-100 rounded-md text-xs text-gray-700">{board.board_ref}</span>
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
                        {/* Open Board Button - now in column 1 */}
                        <div className="mt-4">
                          <button
                            onClick={() => handleOpenBoard(board.board_ref)}
                            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
                          >
                            {t("openBoard")}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                        {/* Remove action timeline from here */}
                      </div>

                      {/* Unified Customer+Timeline Column */}
                      <div className="col-span-1 p-6 flex flex-col gap-1 items-start max-w-2xl min-w-[400px]">
                        {/* Customer Details Row */}
                        <div className="self-start flex-shrink-0 w-full">
                          <div className="border-2 border-gray-200 rounded-xl p-4 w-full h-full flex flex-col justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
                            <div className="space-y-1">
                              <div>
                                <div className="text-lg font-bold text-gray-900 mb-2">
                                  {`${board.usercustomer.name_first || ''} ${board.usercustomer.name_last || ''}`.trim() || board.usercustomer.email}
                                </div>
                              </div>
                              {/* Email Row */}
                              {board.usercustomer.email && (
                                <div className="flex items-center justify-between">
                                  <span className="text-base text-gray-600 truncate flex items-center gap-2">
                                    {/* Envelope icon: use Heroicons if plain SVG is not available */}
                                    <EnvelopeIcon className="w-5 h-5 text-gray-400 inline-block" />
                                    {board.usercustomer.email}
                                  </span>
                                  <div className="flex items-center gap-2 ml-2">
                                    <a
                                      href={`mailto:${board.usercustomer.email}`}
                                      className="p-1 hover:bg-blue-100 rounded transition-colors"
                                      title="Send email"
                                    >
                                      <EnvelopeIcon className="w-5 h-5 text-blue-600" />
                                    </a>
                                    <button
                                      onClick={() => navigator.clipboard.writeText(board.usercustomer.email)}
                                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                                      title="Copy email"
                                    >
                                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              )}
                              {/* Phone Row */}
                              {board.usercustomer.phone && (
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-base text-gray-600 truncate flex items-center gap-2">
                                    <svg className="w-5 h-5 inline-block text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    {board.usercustomer.phone}
                                  </span>
                                  <div className="flex items-center gap-2 ml-2">
                                    <button
                                      onClick={() => navigator.clipboard.writeText(board.usercustomer.phone || '')}
                                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                                      title="Copy phone number"
                                    >
                                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                      </svg>
                                    </button>
                                    <a
                                      href={`tel:${board.usercustomer.phone}`}
                                      className="p-1 hover:bg-green-200 rounded transition-colors"
                                      title="Call phone number"
                                    >
                                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                      </svg>
                                    </a>
                                    <a
                                      href={`https://wa.me/${(board.usercustomer.phone || '').replace(/\D/g, '')}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1 hover:bg-green-200 rounded transition-colors"
                                      title="Open WhatsApp chat"
                                    >
                                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                      </svg>
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Timeline Actions Row */}
                        <div className="w-full">
                          <div className="max-w-full w-full overflow-x-auto">
                            {board.serviceboardaction.length > 0 ? (
                              <div className="mt-4 max-w-full w-full overflow-x-auto flex flex-col justify-center">
                                <span className="text-xs text-gray-500 mb-1 block">
                              {board.serviceboardaction.length} {t("totalActions")}, {t("recentOnesAre")}:
                            </span>
                                <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                              {board.serviceboardaction.slice(0, 5).map((action, index) => (
                                <div key={action.action_id} className="flex items-center flex-shrink-0">
                                  {/* Timeline dot */}
                                  <div className={`w-3 h-3 rounded-full ${getStatusColor(action.action_status).replace('text-', 'bg-').replace('bg-gray-100', 'bg-gray-300')} mr-2`}></div>
                                  {/* Action content */}
                                  <div className="bg-gray-50 rounded-lg px-3 py-2 min-w-0">
                                        <div className="text-xs font-medium text-gray-900 truncate">
                                      {action.action_title}
                                    </div>
                                        <div className="flex items-center gap-1 mt-1">
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
                            ) : (
                              <div className="mt-4 text-gray-400 text-center text-sm bg-gray-50 rounded p-4 flex flex-col justify-center">
                                No linked actions found.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
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
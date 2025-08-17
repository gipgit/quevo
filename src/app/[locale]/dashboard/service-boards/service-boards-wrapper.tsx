'use client'

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useTheme } from "@/contexts/ThemeContext"
import { useBusiness } from "@/lib/business-context"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import EmptyState from "@/components/EmptyState"
import CopyButton from "@/components/CopyButton"
import Link from "next/link"

interface ServiceBoardsWrapperProps {
  serviceBoards: any[]
}

export default function ServiceBoardsWrapper({ serviceBoards: initialServiceBoards }: ServiceBoardsWrapperProps) {
  const { currentBusiness, businessSwitchKey } = useBusiness()
  const t = useTranslations("serviceBoards")
  const { theme } = useTheme()
  const [serviceBoards, setServiceBoards] = useState(initialServiceBoards)

  // Refetch service boards when business changes
  useEffect(() => {
    const fetchServiceBoards = async () => {
      if (!currentBusiness?.business_id) return
      
      try {
        const response = await fetch(`/api/businesses/${currentBusiness.business_id}/service-boards`)
        if (response.ok) {
          const data = await response.json()
          setServiceBoards(data.serviceBoards || [])
        }
      } catch (error) {
        console.error('Error fetching service boards:', error)
      }
    }

    // Only refetch if business has changed (not on initial load)
    if (businessSwitchKey > 0) {
      fetchServiceBoards()
    }
  }, [currentBusiness?.business_id, businessSwitchKey])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.toLocaleDateString("it-IT", { month: "long" })
    const year = date.getFullYear()
    return { day, month: month.charAt(0).toUpperCase() + month.slice(1), year }
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
        return 'bg-zinc-100 text-gray-800'
      default:
        return 'bg-zinc-100 text-gray-800'
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

  // Note: Usage and plan limits are not needed for service boards page
  // They are only needed for the dashboard overview
  const canCreateBoard = true // Simplified for now

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-xl lg:text-2xl font-bold ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>{t("title")}</h1>
          </div>
          <div className="flex items-center gap-6">
            {/* Usage Limit Bar - Removed from service boards page as it's not needed */}
            <div>
              <Link
                href="/dashboard/service-boards/create"
                className={`px-2 py-2 md:px-4 md:py-2 text-xs md:text-lg rounded-lg transition-colors inline-flex items-center gap-1 lg:gap-2 ${
                  canCreateBoard
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-zinc-300 text-gray-500 cursor-not-allowed"
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

        {/* Service Boards List */}
        {serviceBoards.length === 0 ? (
          <EmptyState
            icon={<svg className="mx-auto w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>}
            title={t("noServiceBoards")}
            description={t("noServiceBoardsDescription")}
            buttonText={t("createFirstServiceBoard")}
            onButtonClick={() => window.location.href = "/dashboard/service-boards/create"}
          />
        ) : (
          <div className="grid grid-cols-1">
            {serviceBoards.map((board) => {
              return (
                <div key={board.board_id}>
                  <div className={`rounded-xl shadow-sm border grid grid-cols-1 lg:grid-cols-[10%_42%_30%_18%] gap-x-4 gap-y-2 p-4 lg:p-6 ${
                    theme === 'dark' 
                      ? 'bg-zinc-800 border-gray-600' 
                      : 'bg-white border-gray-200'
                  }`}>
                    {/* Status, Creation Date, and Board Reference - First Column */}
                    <div className="col-span-1 p-1">
                      <div className="flex flex-row lg:flex-col gap-4">
                        <div className="flex flex-col gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(board.status)}`}>
                            {getStatusText(board.status)}
                          </span>
                          <div className="text-xs text-gray-500">
                            {formatDate(board.created_at).day} {formatDate(board.created_at).month}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Board Title and Description - Second Column */}
                    <div className="col-span-1 p-1">
                      <div className="flex flex-col gap-2">
                        <h3 className={`text-lg font-semibold ${
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                        }`}>{board.board_title}</h3>
                        {board.board_description && (
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>{board.board_description}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>{t("reference")}:</span>
                          <span className={`text-xs font-mono ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>{board.board_ref}</span>
                                                      <CopyButton boardRef={board.board_ref} businessUrlname={currentBusiness?.business_urlname || ''} />
                        </div>
                      </div>
                    </div>

                    {/* Customer and Service Information - Third Column */}
                    <div className="col-span-1 p-1">
                      <div className="flex flex-col gap-2">
                        <div>
                          <div className={`text-xs font-medium ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>{t("customer")}</div>
                          <div className={`text-sm ${
                            theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                          }`}>
                            {board.usercustomer.name_first} {board.usercustomer.name_last}
                          </div>
                          <div className={`text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>{board.usercustomer.email}</div>
                        </div>
                        {board.servicerequest && (
                          <div>
                            <div className={`text-xs font-medium ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>{t("service")}</div>
                            <div className={`text-sm ${
                              theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                            }`}>{board.servicerequest.service.service_name}</div>
                            {board.servicerequest.service.servicecategory?.category_name && (
                              <div className={`text-xs ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                              }`}>{board.servicerequest.service.servicecategory.category_name}</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions - Fourth Column */}
                    <div className="col-span-1 p-1">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleOpenBoard(board.board_ref)}
                          className={`px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                            theme === 'dark' 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          {t("openBoard")}
                        </button>
                        <button
                          onClick={() => handleViewDetails(board.board_id)}
                          className={`px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                            theme === 'dark' 
                              ? 'bg-zinc-700 text-gray-300 hover:bg-zinc-600' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {t("viewDetails")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

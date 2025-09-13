'use client'

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { useTheme } from "@/contexts/ThemeContext"
import { useBusiness } from "@/lib/business-context"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import EmptyState from "@/components/EmptyState"
import CopyButton from "@/components/CopyButton"
import Link from "next/link"
import { 
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  EyeIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { 
  CheckCircleIcon as CheckCircleSolidIcon
} from '@heroicons/react/24/solid'

interface ServiceBoardsWrapperProps {
  serviceBoards: any[]
}

export default function ServiceBoardsWrapper({ serviceBoards: initialServiceBoards }: ServiceBoardsWrapperProps) {
  const { currentBusiness, businessSwitchKey } = useBusiness()
  const t = useTranslations("serviceBoards")
  const { theme } = useTheme()
  const [serviceBoards, setServiceBoards] = useState(initialServiceBoards)
  const [selectedBoard, setSelectedBoard] = useState<any>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

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

  // Set initial selected board
  useEffect(() => {
    if (serviceBoards.length > 0 && !selectedBoard) {
      setSelectedBoard(serviceBoards[0])
      setSelectedIndex(0)
    }
  }, [serviceBoards, selectedBoard])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!serviceBoards.length) return

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault()
          navigateBoard(-1)
          break
        case 'ArrowDown':
          event.preventDefault()
          navigateBoard(1)
          break
        case 'Enter':
          event.preventDefault()
          if (selectedBoard) {
            handleOpenBoard(selectedBoard.board_ref)
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [serviceBoards, selectedBoard])

  const navigateBoard = useCallback((direction: number) => {
    if (!serviceBoards.length) return
    
    const newIndex = Math.max(0, Math.min(serviceBoards.length - 1, selectedIndex + direction))
    setSelectedIndex(newIndex)
    setSelectedBoard(serviceBoards[newIndex])
  }, [serviceBoards, selectedIndex])

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

  const getActionStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getActionStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'Completed'
      case 'in_progress':
        return 'In Progress'
      case 'pending':
        return 'Pending'
      default:
        return status || 'Unknown'
    }
  }

  const handleOpenBoard = (boardRef: string) => {
    const businessUrlName = currentBusiness?.business_urlname
    if (businessUrlName) {
      window.open(`/${businessUrlName}/s/${boardRef}`, '_blank')
    }
  }

  const handleViewDetails = (boardId: string) => {
    window.location.href = `/dashboard/service-boards/${boardId}/details`
  }

  const copyBoardLink = async (boardRef: string) => {
    const businessUrlName = currentBusiness?.business_urlname
    if (businessUrlName) {
      const link = `${window.location.origin}/${businessUrlName}/s/${boardRef}`
      try {
        await navigator.clipboard.writeText(link)
        // You could add a toast notification here
      } catch (error) {
        console.error('Error copying link:', error)
      }
    }
  }

  // Calculate progress
  const totalBoards = serviceBoards.length
  const completedBoards = serviceBoards.filter(board => board.status === 'completed').length
  const activeBoards = serviceBoards.filter(board => board.status === 'active').length
  const progressPercentage = totalBoards > 0 ? ((completedBoards + activeBoards) / totalBoards) * 100 : 0

  if (serviceBoards.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>{t("title")}</h1>
            </div>
          </div>

          <EmptyState
            icon={<svg className="mx-auto w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>}
            title={t("noServiceBoards")}
            description={t("noServiceBoardsDescription")}
            buttonText={t("createFirstServiceBoard")}
            onButtonClick={() => window.location.href = "/dashboard/service-boards/create"}
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
            <h1 className={`text-xl lg:text-2xl font-bold ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>{t("title")}</h1>
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
                  <div>↑↓ Navigate boards</div>
                  <div>Enter Open board</div>
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
                onClick={() => navigateBoard(-1)}
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
                {selectedIndex + 1} of {serviceBoards.length}
              </span>
              <button
                onClick={() => navigateBoard(1)}
                disabled={selectedIndex === serviceBoards.length - 1}
                className={`p-2 rounded-lg transition-colors ${
                  selectedIndex === serviceBoards.length - 1
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
        <div className="flex-1 flex flex-col lg:flex-row gap-2 lg:gap-6 overflow-hidden">
          {/* Left Panel - Board List */}
          <div className={`w-full lg:w-80 border-b lg:border-b-0 lg:border-r ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          } flex flex-col`}>
            {/* Progress Bar */}
            <div className="p-2 lg:p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-2 gap-1 lg:gap-0">
                <span className={`text-xs lg:text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Progress: {completedBoards + activeBoards} of {totalBoards} active
                </span>
                <span className={`text-xs lg:text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {totalBoards - (completedBoards + activeBoards)} pending
                </span>
              </div>
              <div className={`w-full h-1.5 lg:h-2 rounded-full ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <div 
                  className="h-1.5 lg:h-2 bg-green-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            
            {/* Board List */}
            <div className="flex-1 overflow-y-auto lg:overflow-y-auto overflow-x-auto lg:overflow-x-visible">
              <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-1 p-2 min-w-max lg:min-w-0">
                {serviceBoards.map((board, index) => {
                  const { day, month } = formatDate(board.created_at)
                  const isSelected = selectedBoard?.board_id === board.board_id
                  
                  return (
                    <div
                      key={board.board_id}
                      onClick={() => {
                        setSelectedBoard(board)
                        setSelectedIndex(index)
                      }}
                      className={`p-3 lg:p-4 rounded-lg cursor-pointer transition-all flex-shrink-0 w-64 lg:w-auto ${
                        isSelected
                          ? theme === 'dark'
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-50 border-blue-200 border'
                          : theme === 'dark'
                            ? 'hover:bg-gray-700 text-gray-300'
                            : 'hover:bg-gray-50 text-gray-900'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{board.board_ref}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(board.status)}`}>
                            {getStatusText(board.status)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm mb-2">
                        <div className="font-medium">{board.board_title}</div>
                        <div className="text-xs opacity-75">
                          {board.usercustomer?.name_first} {board.usercustomer?.name_last}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <span>{day} {month}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>{board.serviceboardaction?.length || 0} actions</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Panel - Board Details */}
          <div className="flex-1 flex flex-col min-h-0 lg:min-h-0 h-96 lg:h-auto">
            {selectedBoard ? (
              <>
                {/* Board Header */}
                <div className={`p-2 lg:p-6 border-b ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="flex flex-col lg:flex-row items-start justify-between gap-2 lg:gap-4">
                    <div className="flex-1 min-w-0 w-full lg:w-auto">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className={`text-lg lg:text-xl font-bold ${
                            theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                          }`}>
                            {selectedBoard.board_ref}
                          </h2>
                          <span className={`px-2 lg:px-3 py-0.5 lg:py-1 rounded-full text-xs lg:text-sm ${getStatusColor(selectedBoard.status)}`}>
                            {getStatusText(selectedBoard.status)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <span>{selectedBoard.board_title}</span>
                          <span>•</span>
                          <span>{selectedBoard.usercustomer?.name_first} {selectedBoard.usercustomer?.name_last}</span>
                          <span>•</span>
                          <span>{selectedBoard.serviceboardaction?.length || 0} actions</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto lg:max-w-sm">
                      <button
                        onClick={() => handleOpenBoard(selectedBoard.board_ref)}
                        className="px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1 lg:gap-1.5 text-xs lg:text-sm"
                        title="Open board"
                      >
                        <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                        Open Board
                      </button>
                      
                      <button
                        onClick={() => handleViewDetails(selectedBoard.board_id)}
                        className="px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-1 lg:gap-1.5 text-xs lg:text-sm"
                        title="View details"
                      >
                        <EyeIcon className="w-3.5 h-3.5" />
                        View Details
                      </button>
                      
                      <button
                        onClick={() => copyBoardLink(selectedBoard.board_ref)}
                        className="px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-1 lg:gap-1.5 text-xs lg:text-sm"
                        title="Copy board link"
                      >
                        <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                        Copy Link
                      </button>
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="p-2 lg:p-6">
                  <h3 className={`text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide ${
                    theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'
                  }`}>Customer Details</h3>
                  <div className="flex flex-wrap items-center gap-3 lg:gap-6 text-xs lg:text-sm">
                    <div className="flex items-center gap-2">
                      <span>{selectedBoard.usercustomer?.name_first} {selectedBoard.usercustomer?.name_last}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{selectedBoard.usercustomer?.email}</span>
                    </div>
                    {selectedBoard.usercustomer?.phone && (
                      <div className="flex items-center gap-2">
                        <span>{selectedBoard.usercustomer.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Board Content */}
                <div className="flex-1 p-2 lg:p-6 space-y-4 lg:space-y-6">
                  <div className="space-y-4 lg:space-y-6">
                    {/* Board Actions */}
                    <div>
                      <h3 className={`text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide ${
                        theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'
                      }`}>Board Actions</h3>
                      {selectedBoard.serviceboardaction && selectedBoard.serviceboardaction.length > 0 ? (
                        <div className="space-y-2">
                          {selectedBoard.serviceboardaction.map((action: any) => (
                            <div key={action.action_id} className={`p-3 rounded-lg border ${
                              theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                            }`}>
                              <div className="grid grid-cols-[120px_1fr_auto] lg:grid-cols-[120px_1fr_auto] gap-4 items-center">
                                {/* Column 1: Date and Time */}
                                <div className="text-xs text-gray-500">
                                  {action.created_at ? (
                                    <>
                                      <div>{new Date(action.created_at).toLocaleDateString()}</div>
                                      {action.due_date && (
                                        <div className="text-xs opacity-75">
                                          Due: {new Date(action.due_date).toLocaleDateString()}
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-gray-400">No date</span>
                                  )}
                                  {/* Mobile: Action details in same column */}
                                  <div className="lg:hidden mt-2">
                                    <div className="font-medium text-xs">{action.action_title}</div>
                                    <div className="text-xs opacity-75">{action.action_type}</div>
                                  </div>
                                </div>
                                
                                {/* Column 2: Action Title and Type (Desktop only) */}
                                <div className="hidden lg:block col-span-1">
                                  <div className="font-medium text-sm">{action.action_title}</div>
                                  <div className="text-xs opacity-75">{action.action_type}</div>
                                </div>
                                
                                {/* Column 3: Status Pill */}
                                <div className="flex justify-end">
                                  <span className={`px-2 py-1 rounded-full text-xs ${getActionStatusColor(action.action_status)}`}>
                                    {getActionStatusText(action.action_status)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className={`p-3 rounded-lg border ${
                          theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                        }`}>
                          <div className={`text-xs lg:text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            No actions for this board.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className={`text-center ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <EyeIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a board to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}


'use client'

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { useTheme } from "@/contexts/ThemeProvider"
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
  ExclamationTriangleIcon,
  Bars3Icon,
  XMarkIcon
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
  const [isListOpenMobile, setIsListOpenMobile] = useState(false)

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
        <div className="max-w-[1400px] mx-auto">
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
              title={t("noServiceBoards")}
              description={t("noServiceBoardsDescription")}
              buttonText={t("createFirstServiceBoard")}
              onButtonClick={() => window.location.href = "/dashboard/service-boards/create"}
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
        <div className="sticky top-0 z-10 px-4 py-3 lg:py-2 rounded-2xl mb-6 bg-[var(--dashboard-bg-primary)] border border-[var(--dashboard-border-primary)]">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl font-medium text-[var(--dashboard-text-primary)]">{t("title")}</p>
            </div>
          </div>
        </div>

        {/* Content Wrapper with Background */}
        <div className="bg-[var(--dashboard-bg-primary)] rounded-2xl border border-[var(--dashboard-border-primary)] p-6">
          <div className="flex flex-col h-full">
            {/* Main Content - 3 Column Layout */}
        <div className="flex-1 flex flex-col lg:flex-row gap-2 lg:gap-6 overflow-hidden relative">
          {/* Left Panel - Board List */}
          <div className={`${isListOpenMobile ? 'block' : 'hidden'} lg:block w-full lg:w-1/6 border-b lg:border-b-0 lg:border-r border-[var(--dashboard-border-primary)] flex flex-col`}>
            {/* Navigation & Progress */}
            <div className="p-4 border-b border-[var(--dashboard-border-primary)]">
              {/* Navigation Controls */}
              <div className="flex items-center justify-center gap-2 mb-4">
              <button
                onClick={() => navigateBoard(-1)}
                disabled={selectedIndex === 0}
                  className={`p-1.5 rounded-lg transition-colors ${
                  selectedIndex === 0
                    ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-[var(--dashboard-bg-tertiary)]'
                }`}
                  title="Previous board"
              >
                  <ArrowLeftIcon className="w-3.5 h-3.5" />
              </button>
                <span className="text-xs text-[var(--dashboard-text-tertiary)] px-2">
                {selectedIndex + 1} of {serviceBoards.length}
              </span>
              <button
                onClick={() => navigateBoard(1)}
                disabled={selectedIndex === serviceBoards.length - 1}
                  className={`p-1.5 rounded-lg transition-colors ${
                  selectedIndex === serviceBoards.length - 1
                    ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-[var(--dashboard-bg-tertiary)]'
                }`}
                  title="Next board"
              >
                  <ArrowRightIcon className="w-3.5 h-3.5" />
              </button>

                {/* Keyboard Shortcuts Button moved from header */}
                <div className="relative group">
                  <button
                    className="p-1.5 rounded-lg hover:bg-[var(--dashboard-bg-tertiary)]"
                    title="Keyboard shortcuts"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </button>
                  <div className="absolute right-0 top-full mt-2 p-3 rounded-lg shadow-lg border z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto bg-[var(--dashboard-bg-primary)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-secondary)]">
                    <div className="text-xs whitespace-nowrap">
                      <div className="font-medium mb-2">Keyboard Shortcuts:</div>
                      <div>↑↓ Navigate boards</div>
                      <div>Enter Open board</div>
                    </div>
                  </div>
                </div>
            </div>
              {/* Progress Bar */}
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs md:text-sm text-[var(--dashboard-text-primary)]">
                  {completedBoards + activeBoards} of {totalBoards} active
          </div>
                <span className="text-xs text-[var(--dashboard-text-tertiary)]">
                  {totalBoards - (completedBoards + activeBoards)} pending
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--dashboard-bg-tertiary)]">
                <div 
                  className="h-2 bg-green-500 rounded-full transition-all duration-300"
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
                      className={`p-2 lg:p-3 rounded-lg cursor-pointer transition-all flex-shrink-0 w-60 lg:w-auto ${
                        isSelected
                          ? 'bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-primary)] border-l-4 border-[var(--dashboard-active-border)]'
                          : 'hover:bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-primary)]'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <span className="font-medium text-[10px]">{board.board_ref}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${getStatusColor(board.status)}`}>
                            {getStatusText(board.status)}
                          </span>
                      </div>
                      <div className="text-[11px] mb-1 text-[var(--dashboard-text-primary)]">
                        <div className="font-medium truncate">{board.board_title}</div>
                        <div className="text-[10px] text-[var(--dashboard-text-tertiary)] truncate">
                          {board.usercustomer?.name_first} {board.usercustomer?.name_last}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[var(--dashboard-text-tertiary)]">
                        <span>{day} {month}</span>
                        <span></span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Middle Panel - Board Details */}
          <div className="flex-1 lg:w-2/5 flex flex-col min-h-0 lg:min-h-0 h-96 lg:h-auto p-2 lg:p-6 space-y-4 lg:space-y-5">
            {selectedBoard ? (
              <>
                {/* Board Header */}
                <div className={`p-2 lg:p-0 pb-4 border-b border-[var(--dashboard-border-primary)]`}>
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
                        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--dashboard-text-tertiary)]">
                          <span>{selectedBoard.board_title}</span>
                          <span>•</span>
                          <span>{selectedBoard.usercustomer?.name_first} {selectedBoard.usercustomer?.name_last}</span>
                          <span>•</span>
                          <span>{selectedBoard.serviceboardaction?.length || 0} actions</span>
                        </div>
                      </div>
                    </div>
                    {/* On mobile, keep quick actions inline */}
                    <div className="flex lg:hidden items-center gap-2 flex-wrap w-full">
                      <button
                        onClick={() => handleOpenBoard(selectedBoard.board_ref)}
                        className="px-2 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1 text-xs"
                        title="Open board"
                      >
                        <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                        Open
                      </button>
                      <button
                        onClick={() => handleViewDetails(selectedBoard.board_id)}
                        className="px-2 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-1 text-xs"
                        title="View details"
                      >
                        <EyeIcon className="w-3.5 h-3.5" />
                        Details
                      </button>
                      <button
                        onClick={() => copyBoardLink(selectedBoard.board_ref)}
                        className="px-2 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-1 text-xs"
                        title="Copy board link"
                      >
                        <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                        Copy
                      </button>
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="p-0">
                  <h3 className="text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide text-[var(--dashboard-text-tertiary)] border-[var(--dashboard-border-primary)]">Customer Details</h3>
                  <div className="p-3 rounded-lg border border-[var(--dashboard-border-primary)] bg-[var(--dashboard-bg-card)]">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-wide text-[var(--dashboard-text-tertiary)] mb-1">Name</div>
                        <div className="text-xs text-[var(--dashboard-text-primary)]">
                          {selectedBoard.usercustomer?.name_first} {selectedBoard.usercustomer?.name_last}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wide text-[var(--dashboard-text-tertiary)] mb-1">Email</div>
                        <div className="text-xs text-[var(--dashboard-text-primary)] break-all">
                          {selectedBoard.usercustomer?.email || '-'}
                        </div>
                      </div>
                      {selectedBoard.usercustomer?.phone && (
                        <div>
                          <div className="text-[10px] uppercase tracking-wide text-[var(--dashboard-text-tertiary)] mb-1">Phone</div>
                          <div className="text-xs text-[var(--dashboard-text-primary)]">
                            {selectedBoard.usercustomer.phone}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Board Content */}
                <div className="flex-1 space-y-4 lg:space-y-6">
                  <div className="space-y-4 lg:space-y-6">
                    {/* Board Actions */}
                    <div>
                      <h3 className="text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide text-[var(--dashboard-text-tertiary)] border-[var(--dashboard-border-primary)]">Service Board Actions</h3>
                      {selectedBoard.serviceboardaction && selectedBoard.serviceboardaction.length > 0 ? (
                        <div className="relative">
                          {selectedBoard.serviceboardaction.map((action: any, index: number) => (
                            <div key={action.action_id} className="relative flex items-start pb-4 last:pb-0">
                              {/* Timeline line */}
                              {index < (selectedBoard.serviceboardaction.length - 1) && (
                                <div className="absolute left-2.5 top-6 w-0.5 h-full bg-[var(--dashboard-border-primary)]"></div>
                              )}
                              {/* Timeline dot */}
                              <div className="relative z-10 w-5 h-5 rounded-full border-2 border-[var(--dashboard-border-primary)] bg-[var(--dashboard-bg-primary)] flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--dashboard-text-secondary)]"></div>
                              </div>
                              {/* Content */}
                              <div className="ml-2 lg:ml-4 flex-1 min-w-0">
                                {/* Mobile Layout */}
                                <div className="block lg:hidden">
                                  {/* Date/Time */}
                                  <div className="text-[var(--dashboard-text-tertiary)] mb-1" style={{ fontSize: '0.6rem' }}>
                                    {action.created_at ? (
                                      <span>
                                        {new Date(action.created_at).toLocaleDateString()} {new Date(action.created_at).toLocaleTimeString()}
                                      </span>
                                    ) : (
                                      <span className="text-[var(--dashboard-text-muted)]">No date</span>
                                    )}
                                  </div>
                                  {/* Status + Type + Title */}
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
                                {/* Desktop Layout */}
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
                                  {/* Status + Type + Title */}
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
                      ) : (
                        <div className="p-3 rounded-lg border border-[var(--dashboard-border-primary)] bg-[var(--dashboard-bg-primary)]">
                          <div className="text-xs lg:text-sm text-[var(--dashboard-text-tertiary)]">
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

          {/* Right Panel - Management Buttons */}
          <div className={`w-full lg:w-2/5 border-t lg:border-t-0 lg:border-l border-[var(--dashboard-border-primary)] flex flex-col`}>
            <div className="p-2 lg:p-7 h-full flex flex-col gap-3">
              {/* Navigation and counter removed (moved to left panel) */}

              {selectedBoard ? (
                <div className="space-y-4">
                  {/* Service Board Actions Group - match reference button style */}
                  <div className="relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="mb-3 text-left">
                        <span className="text-sm font-medium ai-panel-text">Board Quick Actions</span>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                        {/* Open Board */}
                        <button
                          onClick={() => handleOpenBoard(selectedBoard.board_ref)}
                          className="p-3 rounded-lg bg-black/10 hover:bg-black/20 transition-colors flex flex-col items-start justify-start gap-2 border border-white/20"
                          title="Open board"
                        >
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: '#6b7280', minWidth: '24px', minHeight: '24px' }}
                          >
                            <ArrowTopRightOnSquareIcon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-xs ai-panel-text-secondary text-left leading-tight">Open Board</span>
                        </button>
                        {/* View Details */}
                        <button
                          onClick={() => handleViewDetails(selectedBoard.board_id)}
                          className="p-3 rounded-lg bg-black/10 hover:bg-black/20 transition-colors flex flex-col items-start justify-start gap-2 border border-white/20"
                          title="View details"
                        >
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: '#3b82f6', minWidth: '24px', minHeight: '24px' }}
                          >
                            <EyeIcon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-xs ai-panel-text-secondary text-left leading-tight">View Details</span>
                        </button>
                        {/* Schedule Appointment */}
                        <button
                          onClick={() => window.open(`/${currentBusiness?.business_urlname}/s/${selectedBoard.board_ref}?openAddAction=true&actionType=appointment_scheduling`, '_blank')}
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
                        
                        {/* Copy Link */}
                        <button
                          onClick={() => copyBoardLink(selectedBoard.board_ref)}
                          className="p-3 rounded-lg bg-black/10 hover:bg-black/20 transition-colors flex flex-col items-start justify-start gap-2 border border-white/20"
                          title="Copy board link"
                        >
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: '#f59e0b', minWidth: '24px', minHeight: '24px' }}
                          >
                            <ClipboardDocumentIcon className="w-4 h-4 text-white" />
                        </div>
                          <span className="text-xs ai-panel-text-secondary text-left leading-tight">Copy Link</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Additional Actions Group */}
                  <div className="relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="mb-3 text-left">
                        <span className="text-sm font-medium ai-panel-text">Additional Actions</span>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                        {/* Payment Request */}
                        <button
                          onClick={() => window.open(`/${currentBusiness?.business_urlname}/s/${selectedBoard.board_ref}?openAddAction=true&actionType=payment_request`, '_blank')}
                          className="p-3 rounded-lg bg-black/10 hover:bg-black/20 transition-colors flex flex-col items-start justify-start gap-2 border border-white/20"
                          title="Request payment"
                        >
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: '#22c55e', minWidth: '24px', minHeight: '24px' }}
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                          </div>
                          <span className="text-xs ai-panel-text-secondary text-left leading-tight">Payment</span>
                        </button>

                        {/* Generic Message */}
                        <button
                          onClick={() => window.open(`/${currentBusiness?.business_urlname}/s/${selectedBoard.board_ref}?openAddAction=true&actionType=generic_message`, '_blank')}
                          className="p-3 rounded-lg bg-black/10 hover:bg-black/20 transition-colors flex flex-col items-start justify-start gap-2 border border-white/20"
                          title="Send message"
                        >
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: '#3b82f6', minWidth: '24px', minHeight: '24px' }}
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </div>
                          <span className="text-xs ai-panel-text-secondary text-left leading-tight">Message</span>
                        </button>

                        {/* Document Download */}
                        <button
                          onClick={() => window.open(`/${currentBusiness?.business_urlname}/s/${selectedBoard.board_ref}?openAddAction=true&actionType=document_download`, '_blank')}
                          className="p-3 rounded-lg bg-black/10 hover:bg-black/20 transition-colors flex flex-col items-start justify-start gap-2 border border-white/20"
                          title="Download document"
                        >
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: '#8b5cf6', minWidth: '24px', minHeight: '24px' }}
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <span className="text-xs ai-panel-text-secondary text-left leading-tight">Document</span>
                        </button>

                        {/* Signature Request */}
                        <button
                          onClick={() => window.open(`/${currentBusiness?.business_urlname}/s/${selectedBoard.board_ref}?openAddAction=true&actionType=signature_request`, '_blank')}
                          className="p-3 rounded-lg bg-black/10 hover:bg-black/20 transition-colors flex flex-col items-start justify-start gap-2 border border-white/20"
                          title="Request signature"
                        >
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: '#ef4444', minWidth: '24px', minHeight: '24px' }}
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </div>
                          <span className="text-xs ai-panel-text-secondary text-left leading-tight">Signature</span>
                        </button>

                        {/* Checklist */}
                        <button
                          onClick={() => window.open(`/${currentBusiness?.business_urlname}/s/${selectedBoard.board_ref}?openAddAction=true&actionType=checklist`, '_blank')}
                          className="p-3 rounded-lg bg-black/10 hover:bg-black/20 transition-colors flex flex-col items-start justify-start gap-2 border border-white/20"
                          title="Create checklist"
                        >
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: '#f59e0b', minWidth: '24px', minHeight: '24px' }}
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                          </div>
                          <span className="text-xs ai-panel-text-secondary text-left leading-tight">Checklist</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Select a board to manage</div>
              )}
            </div>
          </div>
        </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}


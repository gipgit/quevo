'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, startOfMonth, isSameDay, startOfDay } from 'date-fns'
import { enUS, it } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import Link from 'next/link'

import DashboardLayout from '@/components/dashboard/dashboard-layout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useToaster } from '@/components/ui/ToasterProvider'
import { useTheme } from '@/contexts/ThemeProvider'
import { useBusiness } from '@/lib/business-context'
import EmptyStateDashboard from '@/components/ui/EmptyStateDashboard'
import { 
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  ListBulletIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { 
  CheckCircleIcon as CheckCircleSolidIcon
} from '@heroicons/react/24/solid'

const locales = {
  'en-US': enUS,
  'it': it,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface Appointment {
  id: string
  title: string
  start: string | Date
  end: string | Date
  customerName: string
  customerEmail: string
  customerPhone?: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes?: string
  appointment_title?: string
  service_board_title?: string
  service_board_ref?: string
  platform_name?: string
  platform_link?: string
  appointment_location?: string
  createdAt: string | Date
  updatedAt: string | Date
}

interface AppointmentsWrapperProps {
  appointments: Appointment[]
}

export default function AppointmentsWrapper({ appointments: initialAppointments }: AppointmentsWrapperProps) {
  const { currentBusiness, businessSwitchKey } = useBusiness()
  const t = useTranslations('appointments')
  const { showToast } = useToaster()
  const { theme } = useTheme()
  const [appointments, setAppointments] = useState(initialAppointments)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list')
  const [currentDate, setCurrentDate] = useState<Date>(startOfDay(new Date()))
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showDetailsMobile, setShowDetailsMobile] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Refetch appointments when business changes
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!currentBusiness?.business_id) return
      
      try {
        const response = await fetch(`/api/businesses/${currentBusiness.business_id}/appointments`)
        if (response.ok) {
          const data = await response.json()
          setAppointments(data.appointments || [])
        }
      } catch (error) {
        console.error('Error fetching appointments:', error)
      }
    }

    // Only refetch if business has changed (not on initial load)
    if (businessSwitchKey > 0) {
      fetchAppointments()
    }
  }, [currentBusiness?.business_id, businessSwitchKey])

  // Set initial selected appointment
  useEffect(() => {
    if (appointments.length > 0 && !selectedAppointment) {
      setSelectedAppointment(appointments[0])
      setSelectedIndex(0)
    }
  }, [appointments, selectedAppointment])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!appointments.length) return

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault()
          navigateAppointment(-1)
          break
        case 'ArrowDown':
          event.preventDefault()
          navigateAppointment(1)
          break
        case 'Enter':
          event.preventDefault()
          if (selectedAppointment) {
            handleEventSelect(selectedAppointment)
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [appointments, selectedAppointment])

  const navigateAppointment = useCallback((direction: number) => {
    if (!appointments.length) return
    
    const newIndex = Math.max(0, Math.min(appointments.length - 1, selectedIndex + direction))
    setSelectedIndex(newIndex)
    setSelectedAppointment(appointments[newIndex])
  }, [appointments, selectedIndex])

  const handleEventSelect = (event: Appointment) => {
    setSelectedAppointment(event)
    const index = appointments.findIndex(apt => apt.id === event.id)
    if (index !== -1) {
      setSelectedIndex(index)
    }
  }

  const handleSlotSelect = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedDate(start)
    console.log('Selected slot:', { start, end })
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A'
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) return 'Invalid Date'
    
    return dateObj.toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (date: Date | string | undefined) => {
    if (!date) return 'N/A'
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (isNaN(dateObj.getTime())) return 'Invalid Time'
    
    return dateObj.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-zinc-100 text-gray-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-zinc-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed'
      case 'cancelled':
        return 'Cancelled'
      case 'completed':
        return 'Completed'
      case 'pending':
        return 'Pending'
      default:
        return status
    }
  }

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/businesses/${currentBusiness?.business_id}/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update appointment status')
      }

      showToast({
        title: t('success'),
        message: t('appointments.statusUpdated'),
        type: 'success',
      })
      
      // Update local state
      setAppointments(prev => prev.map(apt => 
        apt.id === appointmentId ? { ...apt, status: newStatus as any } : apt
      ))
      if (selectedAppointment?.id === appointmentId) {
        setSelectedAppointment(prev => prev ? { ...prev, status: newStatus as any } : null)
      }
    } catch (error) {
      console.error('Error updating appointment status:', error)
      showToast({
        title: t('error'),
        message: t('appointments.statusUpdateError'),
        type: 'error',
      })
    }
  }

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm(t('appointments.confirmDelete'))) return

    try {
      const response = await fetch(`/api/businesses/${currentBusiness?.business_id}/appointments/${appointmentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete appointment')
      }

      showToast({
        title: t('success'),
        message: t('appointments.deleted'),
        type: 'success',
      })
      
      // Update local state
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentId))
      if (selectedAppointment?.id === appointmentId) {
        setSelectedAppointment(null)
        setSelectedIndex(0)
      }
    } catch (error) {
      console.error('Error deleting appointment:', error)
      showToast({
        title: t('error'),
        message: t('appointments.deleteError'),
        type: 'error',
      })
    }
  }

  const eventStyleGetter = (event: Appointment) => {
    let style: React.CSSProperties = {
      backgroundColor: '#3b82f6',
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block',
    }

    switch (event.status) {
      case 'confirmed':
        style.backgroundColor = '#10b981'
        break
      case 'cancelled':
        style.backgroundColor = '#ef4444'
        break
      case 'completed':
        style.backgroundColor = '#6b7280'
        break
      case 'pending':
        style.backgroundColor = '#f59e0b'
        break
    }

    return { style }
  }

  // Convert appointments to proper Date objects for the calendar
  const calendarEvents = appointments.map(appointment => ({
    ...appointment,
    title: `${appointment.title} - ${appointment.customerName}`,
    start: typeof appointment.start === 'string' ? new Date(appointment.start) : appointment.start,
    end: typeof appointment.end === 'string' ? new Date(appointment.end) : appointment.end,
  }))

  const messages = {
    allDay: t('allDay'),
    previous: t('previous'),
    next: t('next'),
    today: t('today'),
    month: t('month'),
    week: t('week'),
    day: t('day'),
    agenda: t('agenda'),
    date: t('date'),
    time: t('time'),
    event: t('event'),
    noEventsInRange: t('noEventsInRange'),
    showMore: (total: number) => t('showMore', { total }),
  }

  // Calculate progress
  const totalAppointments = appointments.length
  const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed').length
  const completedAppointments = appointments.filter(apt => apt.status === 'completed').length
  const progressPercentage = totalAppointments > 0 ? ((confirmedAppointments + completedAppointments) / totalAppointments) * 100 : 0

  if (appointments.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-[1600px] mx-auto">
          {/* Top Navbar (simulated) */}
          <div className="sticky top-0 z-10 p-4 lg:p-6 rounded-t-none lg:rounded-2xl mb-2 md:mb-3 bg-[var(--dashboard-bg-primary)] lg:border lg:border-[var(--dashboard-border-primary)]">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-base md:text-lg font-medium text-[var(--dashboard-text-primary)]">{t('title')}</p>
              </div>
            </div>
          </div>

          {/* Content Wrapper with Background */}
          <div className="bg-[var(--dashboard-bg-primary)] rounded-2xl lg:border lg:border-[var(--dashboard-border-primary)] p-4 lg:p-6">
            <EmptyStateDashboard
              primaryTitle={t('empty.title')}
              secondaryTitle={t('empty.description')}
              buttonText={t('addFirst')}
              onButtonClick={() => setSelectedDate(new Date())}
              icon={
                <svg 
                  className="w-12 h-12 text-[var(--dashboard-text-secondary)]" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                  />
                </svg>
              }
            />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto">
        {/* Top Navbar (simulated) */}
        <div className="sticky top-0 z-10 p-4 lg:p-6 rounded-t-none lg:rounded-2xl mb-2 md:mb-3 bg-[var(--dashboard-bg-primary)] lg:border lg:border-[var(--dashboard-border-primary)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Mobile Sidebar Toggle Button */}
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-1.5 rounded-lg bg-[var(--dashboard-bg-secondary)] border border-[var(--dashboard-border-primary)] hover:bg-[var(--dashboard-bg-tertiary)] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <p className="text-base md:text-lg font-medium text-[var(--dashboard-text-primary)]">{t('title')}</p>
              </div>
            </div>
            
            {/* Navigation Controls and Shortcuts */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Navigation Controls */}
              <div className="flex items-center gap-0.5 md:gap-1">
                <button
                  onClick={() => navigateAppointment(-1)}
                  disabled={selectedIndex === 0}
                  className={`p-1 md:p-1.5 rounded-lg transition-colors ${
                    selectedIndex === 0
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-[var(--dashboard-bg-tertiary)]'
                  }`}
                  title="Previous appointment"
                >
                  <ArrowLeftIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
                <span className="text-xs md:text-xs text-[var(--dashboard-text-tertiary)] px-1 md:px-2">
                  {selectedIndex + 1} of {appointments.length}
                </span>
                <button
                  onClick={() => navigateAppointment(1)}
                  disabled={selectedIndex === appointments.length - 1}
                  className={`p-1 md:p-1.5 rounded-lg transition-colors ${
                    selectedIndex === appointments.length - 1
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-[var(--dashboard-bg-tertiary)]'
                  }`}
                  title="Next appointment"
                >
                  <ArrowRightIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
              </div>

              {/* Keyboard Shortcuts Button */}
              <div className="relative group hidden md:block">
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
                    <div>↑↓ Navigate appointments</div>
                    <div>Enter Open appointment</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Wrapper with Background */}
        <div className="bg-[var(--dashboard-bg-primary)] rounded-2xl lg:border lg:border-[var(--dashboard-border-primary)] p-4 lg:p-6">
          <div className="flex flex-col h-full">
          </div>

        {/* Main Content - 3 Column Layout */}
        <div className="flex-1 flex flex-col lg:flex-row gap-2 lg:gap-6 overflow-hidden">
          {/* Mobile Sidebar Overlay */}
          {isMobileSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}
          
          {/* Left Panel - Calendar/List View */}
          <div className={`
            w-full lg:w-64 border-b lg:border-b-0 lg:border-r flex flex-col
            fixed lg:static top-0 left-0 h-full z-50 lg:z-auto
            transform transition-transform duration-300 ease-in-out
            ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            bg-[var(--dashboard-bg-primary)] lg:bg-transparent
            shadow-lg lg:shadow-none
            ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
          `}>
            {/* Mobile Header with Progress Bar and Close Button */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                {/* Progress Bar */}
                <div className="flex-1">
                  {/* Page Title - Mobile Only */}
                  <div className="text-sm font-medium text-[var(--dashboard-text-primary)] mb-2 lg:hidden">
                    {t('title')}
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-xs md:text-sm text-[var(--dashboard-text-primary)]">
                      {appointments.length} appointments
                    </div>
                    <span className="text-xs text-[var(--dashboard-text-tertiary)]">
                      {appointments.length} total
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--dashboard-bg-tertiary)]">
                    <div 
                      className="h-2 bg-green-500 rounded-full transition-all duration-300"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
                
                {/* Mobile Close Button */}
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="lg:hidden ml-3 p-2 rounded-lg bg-[var(--dashboard-bg-secondary)] border border-[var(--dashboard-border-primary)] hover:bg-[var(--dashboard-bg-tertiary)] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* View Mode Tabs */}
            <div className="p-2 lg:p-4 border-b border-gray-200 dark:border-gray-700">
              <div className={`flex space-x-1 p-1 rounded-lg ${
                theme === 'dark' ? 'bg-zinc-700' : 'bg-zinc-100'
              }`}>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`flex-1 py-1 lg:py-1.5 px-2 lg:px-3 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1 lg:gap-1.5 ${
                    viewMode === 'calendar'
                      ? theme === 'dark' 
                        ? 'bg-zinc-600 text-gray-100 shadow-sm' 
                        : 'bg-white text-gray-900 shadow-sm'
                      : theme === 'dark'
                        ? 'text-gray-300 hover:text-gray-100'
                        : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <CalendarIcon className="w-3 lg:w-3.5 h-3 lg:h-3.5" />
                  <span className="hidden sm:inline">Calendar</span>
                  <span className="sm:hidden">Cal</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 py-1 lg:py-1.5 px-2 lg:px-3 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1 lg:gap-1.5 ${
                    viewMode === 'list'
                      ? theme === 'dark' 
                        ? 'bg-zinc-600 text-gray-100 shadow-sm' 
                        : 'bg-white text-gray-900 shadow-sm'
                      : theme === 'dark'
                        ? 'text-gray-300 hover:text-gray-100'
                        : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ListBulletIcon className="w-3 lg:w-3.5 h-3 lg:h-3.5" />
                  List
                </button>
              </div>
              {/* Shortcuts removed from here (moved to nav row above progress) */}
            </div>
            
            {/* Calendar/List Content */}
            <div className="flex-1 overflow-y-auto lg:overflow-y-auto overflow-x-auto lg:overflow-x-visible">
              {viewMode === 'calendar' ? (
                <div className="p-2">
                  <Calendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 300 }}
                    onSelectEvent={handleEventSelect}
                    onSelectSlot={handleSlotSelect}
                    selectable={true}
                    eventPropGetter={eventStyleGetter}
                    messages={messages}
                    views={['month']}
                    defaultView="month"
                    date={currentDate}
                    step={60}
                    timeslots={1}
                    className=""
                  />
                </div>
              ) : (
                <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-1 p-2 min-w-max lg:min-w-0">
                  {appointments.map((appointment, index) => {
                    const isSelected = selectedAppointment?.id === appointment.id
                    
                    return (
                      <div
                        key={appointment.id}
                        onClick={() => {
                          setSelectedAppointment(appointment)
                          setSelectedIndex(index)
                        }}
                        className={`p-4 lg:p-3 rounded-lg cursor-pointer transition-all flex-shrink-0 w-full lg:w-auto ${
                          isSelected
                            ? 'bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-primary)] border-l-4 border-[var(--dashboard-active-border)]'
                            : 'hover:bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-primary)]'
                        }`}
                      >
                        {/* Status pill moved to right, above title */}
                        
                        <div className="flex items-center gap-4">
                          {/* Left Column - Date and Time */}
                          <div className="flex-shrink-0 w-14 lg:w-16">
                            <div className="text-center">
                              <div className="text-xs opacity-75 mb-1">
                                {new Date(appointment.start).toLocaleDateString('it-IT', { 
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </div>
                              <div className="text-sm font-medium">
                                {formatTime(appointment.start)}
                              </div>
                            </div>
                          </div>
                          
                          {/* Right Column - Appointment and Customer */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-end mb-1">
                              <span className={`px-1.5 py-0 rounded text-[10px] ${getStatusColor(appointment.status)}`}>
                                {getStatusText(appointment.status)}
                              </span>
                            </div>
                            <div className="font-medium text-xs mb-0.5 truncate">
                              {appointment.title}
                            </div>
                            <div className="text-xs opacity-75 truncate">
                              {appointment.customerName}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Middle Panel - Appointment Details (toggle on mobile) */}
          <div className={`flex-1 flex flex-col min-h-0 lg:min-h-0 h-96 lg:h-auto ${selectedAppointment ? '' : ''}`}>
            {selectedAppointment ? (
              <>
                {/* Appointment Header */}
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
                            {selectedAppointment.title}
                          </h2>
                          <span className={`px-2 lg:px-3 py-0.5 lg:py-1 rounded-full text-xs lg:text-sm ${getStatusColor(selectedAppointment.status)}`}>
                            {getStatusText(selectedAppointment.status)}
                          </span>
                        </div>
                        {/* Subtitle removed to avoid duplication with details below */}
                      </div>
                    </div>
                  </div>
                  
                  {/* Appointment Details - Each on its own row */}
                  <div className="space-y-2 lg:space-y-3 mt-3">
                    <div className="flex items-center gap-2 lg:gap-3">
                      <CalendarIcon className="w-4 lg:w-5 h-4 lg:h-5" />
                      <span className="text-sm lg:text-base font-medium">{formatDate(selectedAppointment.start)}</span>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-3">
                      <ClockIcon className="w-4 lg:w-5 h-4 lg:h-5" />
                      <span className="text-sm lg:text-base font-medium">{formatTime(selectedAppointment.start)} - {formatTime(selectedAppointment.end)}</span>
                    </div>
                    {selectedAppointment.appointment_location && (
                      <div className="flex items-center gap-2 lg:gap-3">
                        <MapPinIcon className="w-4 lg:w-5 h-4 lg:h-5" />
                        <span className="text-sm lg:text-base font-medium">{selectedAppointment.appointment_location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Details */}
                <div className="p-2 lg:p-6">
                  <h3 className={`text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide ${
                    theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'
                  }`}>Customer Details</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4 items-center">
                    {/* Left Column - Customer Name */}
                    <div className="flex flex-col">
                      <span className="font-medium text-[var(--dashboard-text-primary)] text-lg lg:text-2xl">
                        {selectedAppointment.customerName}
                      </span>
                    </div>
                    
                    {/* Right Column - Contact Details */}
                    <div className="space-y-0 text-left lg:text-right">
                      {/* Email Row */}
                      <div className="flex items-center justify-start lg:justify-end gap-1 text-sm">
                        <span>{selectedAppointment.customerEmail || 'No email'}</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(selectedAppointment.customerEmail || '')}
                          className="p-1.5 rounded transition-colors text-[var(--dashboard-text-tertiary)] hover:text-[var(--dashboard-text-secondary)] hover:bg-[var(--dashboard-bg-tertiary)]"
                          title="Copy email"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                        {selectedAppointment.customerEmail && (
                          <a
                            href={`mailto:${selectedAppointment.customerEmail}`}
                            className="p-1.5 rounded transition-colors text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="Send email"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </a>
                        )}
                      </div>
                      
                      {/* Phone Row */}
                      {selectedAppointment.customerPhone && (
                        <div className="flex items-center justify-start lg:justify-end gap-1 text-sm">
                          <span>{selectedAppointment.customerPhone}</span>
                          <button
                            onClick={() => navigator.clipboard.writeText(selectedAppointment.customerPhone || '')}
                            className="p-1.5 rounded transition-colors text-[var(--dashboard-text-tertiary)] hover:text-[var(--dashboard-text-secondary)] hover:bg-[var(--dashboard-bg-tertiary)]"
                            title="Copy phone"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                          </button>
                          <a
                            href={`https://wa.me/${selectedAppointment.customerPhone.replace(/\D/g, '')}`}
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
                </div>

                {/* Appointment Content */}
                <div className="flex-1 p-2 lg:p-6 space-y-4 lg:space-y-6">
                  <div className="space-y-4 lg:space-y-6">
                    {/* Service Board Information */}
                    {selectedAppointment.service_board_title && (
                      <div>
                        <h3 className={`text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide ${
                          theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'
                        }`}>Service Board</h3>
                        <div className={`p-3 lg:p-4 rounded-lg border ${
                          theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                        }`}>
                          <div className="flex flex-wrap items-center gap-3 lg:gap-6 text-xs lg:text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Board:</span>
                              <span>{selectedAppointment.service_board_title}</span>
                            </div>
                            {selectedAppointment.service_board_ref && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Reference:</span>
                                <span>{selectedAppointment.service_board_ref}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {selectedAppointment.notes && (
                      <div>
                        <h3 className={`text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide ${
                          theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'
                        }`}>Notes</h3>
                        <div className={`p-3 lg:p-4 rounded-lg ${
                          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
                        }`}>
                          <div className={`text-xs lg:text-sm ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {selectedAppointment.notes}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Platform Information */}
                    {selectedAppointment.platform_name && (
                      <div>
                        <h3 className={`text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide ${
                          theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'
                        }`}>Meeting Platform</h3>
                        <div className={`p-3 lg:p-4 rounded-lg border ${
                          theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                        }`}>
                          <div className="flex flex-wrap items-center gap-3 lg:gap-6 text-xs lg:text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Platform:</span>
                              <span>{selectedAppointment.platform_name}</span>
                            </div>
                            {selectedAppointment.platform_link && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Link:</span>
                                <a 
                                  href={selectedAppointment.platform_link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-700 underline"
                                >
                                  Join Meeting
                                </a>
                              </div>
                            )}
                          </div>
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
                  <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select an appointment to view details</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Actions/Manage */}
          <div className={`w-full lg:w-1/3 border-t lg:border-t-0 lg:border-l border-[var(--dashboard-border-primary)] flex flex-col`}>
            <div className="p-2 lg:p-6 h-full flex flex-col gap-3">
              {selectedAppointment ? (
                <>
                  <h4 className="text-xs font-medium mb-2 ai-panel-text-secondary uppercase tracking-wide">Manage Appointment</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleStatusChange(selectedAppointment.id, 'confirmed')}
                      className={`p-3 rounded-lg bg-black/10 hover:bg-black/20 transition-colors flex flex-col items-start justify-start gap-1.5 border border-white/20 ${
                        selectedAppointment.status === 'confirmed' ? '' : ''
                      }`}
                      title="Confirm appointment"
                    >
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      <span className="text-xs lg:text-sm text-left">{selectedAppointment.status === 'confirmed' ? 'Confirmed' : 'Confirm'}</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedAppointment.id, 'cancelled')}
                      className={`p-3 rounded-lg bg-black/10 hover:bg-black/20 transition-colors flex flex-col items-start justify-start gap-1.5 border border-white/20 ${
                        selectedAppointment.status === 'cancelled' ? '' : ''
                      }`}
                      title="Cancel appointment"
                    >
                      <XCircleIcon className="w-5 h-5 text-red-500" />
                      <span className="text-xs lg:text-sm text-left">{selectedAppointment.status === 'cancelled' ? 'Cancelled' : 'Cancel'}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                      className="p-3 rounded-lg bg-black/10 hover:bg-black/20 transition-colors flex flex-col items-start justify-start gap-1.5 border border-white/20 col-span-2"
                      title="Delete appointment"
                    >
                      <TrashIcon className="w-5 h-5 text-gray-500" />
                      <span className="text-xs lg:text-sm text-left">Delete</span>
                    </button>
                  </div>

                  {/* Contact Actions Group */}
                  {(selectedAppointment.customerPhone || selectedAppointment.customerEmail) && (
                    <>
                      <h4 className="text-xs font-medium mt-4 ai-panel-text-secondary uppercase tracking-wide">Contact</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedAppointment.customerPhone && (
                          <a
                            href={`tel:${selectedAppointment.customerPhone}`}
                            className="p-3 rounded-lg bg-black/10 hover:bg-black/20 transition-colors flex flex-col items-start justify-start gap-1.5 border border-white/20"
                            title={`Call ${selectedAppointment.customerPhone}`}
                          >
                            <PhoneIcon className="w-5 h-5 text-blue-500" />
                            <span className="text-xs lg:text-sm text-left">Call</span>
                          </a>
                        )}
                        {selectedAppointment.customerEmail && (
                          <a
                            href={`mailto:${selectedAppointment.customerEmail}`}
                            className="p-3 rounded-lg bg-black/10 hover:bg-black/20 transition-colors flex flex-col items-start justify-start gap-1.5 border border-white/20"
                            title={`Email ${selectedAppointment.customerEmail}`}
                          >
                            <EnvelopeIcon className="w-5 h-5 text-purple-500" />
                            <span className="text-xs lg:text-sm text-left">Email</span>
                          </a>
                        )}
                        {selectedAppointment.customerPhone && (
                          <a
                            href={`https://wa.me/${selectedAppointment.customerPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-lg bg-black/10 hover:bg-black/20 transition-colors flex flex-col items-start justify-start gap-1.5 border border-white/20 col-span-2"
                            title="WhatsApp"
                          >
                            <svg className="w-5 h-5 text-green-500" viewBox="0 0 32 32" fill="currentColor"><path d="M19.11 17.21c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.98-.94 1.18-.17.2-.35.22-.65.07-.3-.15-1.26-.47-2.4-1.49-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.11 3.22 5.1 4.52.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z"/><path d="M26.64 5.36C23.9 2.61 20.12 1 16.09 1 8.24 1 1.93 7.31 1.93 15.16c0 2.48.65 4.86 1.88 6.97L1 31l9.08-2.77a14.13 14.13 0 006.01 1.31h.01c7.84 0 14.16-6.31 14.16-14.16 0-3.78-1.47-7.34-4.16-10.02zM16.09 28.3h-.01a12.2 12.2 0 01-5.88-1.58l-.42-.25-5.39 1.64 1.65-5.25-.28-.43a12.2 12.2 0 01-1.87-6.67c0-6.74 5.49-12.23 12.23-12.23 3.27 0 6.35 1.27 8.66 3.58a12.17 12.17 0 013.58 8.66c0 6.74-5.49 12.23-12.23 12.23z"/></svg>
                            <span className="text-xs lg:text-sm text-left">WhatsApp</span>
                          </a>
                        )}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Select an appointment to manage</div>
              )}

              {/* Mobile Details Toggle */}
              <div className="lg:hidden mt-auto">
                <button
                  onClick={() => setShowDetailsMobile(!showDetailsMobile)}
                  className="w-full px-3 py-2 rounded-lg border bg-[var(--dashboard-bg-tertiary)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-secondary)] hover:bg-[var(--dashboard-bg-secondary)] hover:text-[var(--dashboard-text-primary)]"
                >
                  {showDetailsMobile ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

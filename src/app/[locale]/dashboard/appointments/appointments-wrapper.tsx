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
import EmptyState from '@/components/EmptyState'
import { 
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  ListBulletIcon,
  ClockIcon,
  UserIcon,
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
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>{t('title')}</h1>
            </div>
          </div>

          <EmptyState
            title={t('empty.title')}
            description={t('empty.description')}
            buttonText={t('addFirst')}
            onButtonClick={() => setSelectedDate(new Date())}
            icon={<svg className="mx-auto w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
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
            }`}>{t('title')}</h1>
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
                  <div>↑↓ Navigate appointments</div>
                  <div>Enter Open appointment</div>
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
                onClick={() => navigateAppointment(-1)}
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
                {selectedIndex + 1} of {appointments.length}
              </span>
              <button
                onClick={() => navigateAppointment(1)}
                disabled={selectedIndex === appointments.length - 1}
                className={`p-2 rounded-lg transition-colors ${
                  selectedIndex === appointments.length - 1
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
          {/* Left Panel - Calendar/List View */}
          <div className={`w-full lg:w-80 border-b lg:border-b-0 lg:border-r ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          } flex flex-col`}>
            {/* Progress Bar */}
            <div className="p-2 lg:p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-2 gap-1 lg:gap-0">
                <span className={`text-xs lg:text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Progress: {confirmedAppointments + completedAppointments} of {totalAppointments} confirmed
                </span>
                <span className={`text-xs lg:text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {totalAppointments - (confirmedAppointments + completedAppointments)} pending
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

            {/* View Mode Tabs */}
            <div className="p-2 lg:p-4 border-b border-gray-200 dark:border-gray-700">
              <div className={`flex space-x-1 p-1 rounded-lg ${
                theme === 'dark' ? 'bg-zinc-700' : 'bg-zinc-100'
              }`}>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`py-1 lg:py-1.5 px-2 lg:px-3 text-xs font-medium rounded-md transition-colors flex items-center gap-1 lg:gap-1.5 ${
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
                  className={`py-1 lg:py-1.5 px-2 lg:px-3 text-xs font-medium rounded-md transition-colors flex items-center gap-1 lg:gap-1.5 ${
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
                        className={`p-3 rounded-lg cursor-pointer transition-all flex-shrink-0 w-64 lg:w-auto ${
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
                          <div className="flex items-center gap-1">
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(appointment.status)}`}>
                              {getStatusText(appointment.status)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-4">
                          {/* Left Column - Date and Time */}
                          <div className="flex-shrink-0 w-16 lg:w-20">
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
                            <div className="font-medium text-sm mb-1 truncate">
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

          {/* Right Panel - Appointment Details */}
          <div className="flex-1 flex flex-col min-h-0 lg:min-h-0 h-96 lg:h-auto">
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
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <span>{selectedAppointment.customerName}</span>
                          <span>•</span>
                          <span>{formatTime(selectedAppointment.start)} - {formatTime(selectedAppointment.end)}</span>
                          <span>•</span>
                          <span>{formatDate(selectedAppointment.start)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto lg:max-w-sm">
                      <button
                        onClick={() => handleStatusChange(selectedAppointment.id, 'confirmed')}
                        className={`px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg transition-colors flex items-center gap-1 lg:gap-1.5 text-xs lg:text-sm ${
                          selectedAppointment.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                        title="Confirm appointment"
                      >
                        <CheckCircleIcon className="w-3.5 h-3.5" />
                        {selectedAppointment.status === 'confirmed' ? 'Confirmed' : 'Confirm'}
                      </button>
                      
                      <button
                        onClick={() => handleStatusChange(selectedAppointment.id, 'cancelled')}
                        className={`px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg transition-colors flex items-center gap-1 lg:gap-1.5 text-xs lg:text-sm ${
                          selectedAppointment.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                        title="Cancel appointment"
                      >
                        <XCircleIcon className="w-3.5 h-3.5" />
                        {selectedAppointment.status === 'cancelled' ? 'Cancelled' : 'Cancel'}
                      </button>
                      
                      <button
                        onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                        className="px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-1 lg:gap-1.5 text-xs lg:text-sm"
                        title="Delete appointment"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  {/* Appointment Details - Each on its own row */}
                  <div className="space-y-2 lg:space-y-3 mt-3">
                    <div className="flex items-center gap-2 lg:gap-3">
                      <ClockIcon className="w-4 lg:w-5 h-4 lg:h-5" />
                      <span className="text-sm lg:text-base font-medium">{formatTime(selectedAppointment.start)} - {formatTime(selectedAppointment.end)}</span>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-3">
                      <CalendarIcon className="w-4 lg:w-5 h-4 lg:h-5" />
                      <span className="text-sm lg:text-base font-medium">{formatDate(selectedAppointment.start)}</span>
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
                  <div className="flex flex-wrap items-center gap-3 lg:gap-6 text-xs lg:text-sm">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-3.5 lg:w-4 h-3.5 lg:h-4" />
                      <span>{selectedAppointment.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="w-3.5 lg:w-4 h-3.5 lg:h-4" />
                      <span>{selectedAppointment.customerEmail}</span>
                    </div>
                    {selectedAppointment.customerPhone && (
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="w-3.5 lg:w-4 h-3.5 lg:h-4" />
                        <span>{selectedAppointment.customerPhone}</span>
                      </div>
                    )}
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
        </div>
      </div>
    </DashboardLayout>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, startOfMonth, isSameDay, startOfDay } from 'date-fns'
import { enUS, it } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import Link from 'next/link'

import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { UsageLimitBar } from '@/components/dashboard/UsageLimitBar'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useToaster } from '@/components/ui/ToasterProvider'
import { useTheme } from '@/contexts/ThemeContext'
import { useBusiness } from '@/lib/business-context'
import EmptyState from '@/components/EmptyState'

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
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [currentDate, setCurrentDate] = useState<Date>(startOfDay(new Date()))

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

  const handleEventSelect = (event: Appointment) => {
    console.log('Selected appointment:', event)
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
      
      // Reload the page to refresh the appointments list
      window.location.reload()
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
      
      // Reload the page to refresh the appointments list
      window.location.reload()
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

  // Note: Usage and plan limits are not needed for appointments page
  // They are only needed for the dashboard overview
  const canCreateAppointment = true // Simplified for now

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <h1 className={`text-xl lg:text-2xl font-bold ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                {t('title')}
              </h1>
              {/* Calendar/List View Tabs */}
              <div className={`flex space-x-1 p-1 rounded-lg ${
                theme === 'dark' ? 'bg-zinc-700' : 'bg-zinc-100'
              }`}>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`py-1.5 px-3 text-xs font-medium rounded-md transition-colors ${
                    viewMode === 'calendar'
                      ? theme === 'dark' 
                        ? 'bg-zinc-600 text-gray-100 shadow-sm' 
                        : 'bg-white text-gray-900 shadow-sm'
                      : theme === 'dark'
                        ? 'text-gray-300 hover:text-gray-100'
                        : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Calendar
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`py-1.5 px-3 text-xs font-medium rounded-md transition-colors ${
                    viewMode === 'list'
                      ? theme === 'dark' 
                        ? 'bg-zinc-600 text-gray-100 shadow-sm' 
                        : 'bg-white text-gray-900 shadow-sm'
                      : theme === 'dark'
                        ? 'text-gray-300 hover:text-gray-100'
                        : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    List
                  </div>
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col-reverse items-end lg:flex-row lg:items-center gap-1 lg:gap-4">
            {/* Usage Limit Bar - Removed from appointments page as it's not needed */}
            <Link
              href="/dashboard/appointments/create"
              className={`ml-2 px-2 lg:px-4 py-2 md:px-4 md:py-2 text-xs lg:text-sm md:text-lg rounded-lg transition-colors inline-flex items-center gap-1 lg:gap-2 whitespace-nowrap ${
                canCreateAppointment
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-zinc-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t("addNew")}
            </Link>
          </div>
        </div>

        {/* Content */}
        {appointments.length === 0 ? (
          <EmptyState
            title={t('empty.title')}
            description={t('empty.description')}
            buttonText={t('addFirst')}
            onButtonClick={() => setSelectedDate(new Date())}
            icon={<svg className="mx-auto w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          />
        ) : (
          <>
            {viewMode === 'calendar' ? (
              <div className="dashboard-calendar-wrapper">
                <Calendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 600 }}
                  onSelectEvent={handleEventSelect}
                  onSelectSlot={handleSlotSelect}
                  selectable={true}
                  eventPropGetter={eventStyleGetter}
                  messages={messages}
                  views={['month', 'week']}
                  defaultView="month"
                  date={currentDate}
                  step={60}
                  timeslots={1}
                  className=""

                />
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className={`border rounded-lg p-4 sm:p-6 transition-colors ${
                      theme === 'dark' 
                        ? 'border-gray-600 bg-zinc-800' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                      <div className="w-full lg:w-56 flex-shrink-0">
                        <div className={`border rounded-lg p-4 lg:p-6 ${
                          theme === 'dark' 
                            ? 'border-gray-600 bg-zinc-700' 
                            : 'border-gray-200 bg-zinc-50'
                        }`}>
                          <div className="flex flex-row lg:flex-col items-center gap-3">
                            <div className="text-center">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </span>
                              <div className={`text-xs lg:text-sm mt-2 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                {new Date(appointment.start).toLocaleDateString('it-IT', { 
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className={`text-xl lg:text-2xl font-bold ${
                                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                              }`}>
                                {formatTime(appointment.start)}
                              </div>
                              <div className={`text-xs lg:text-sm ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                Ends at {formatTime(appointment.end)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-3">
                          <div>
                            <h3 className={`text-xl lg:text-2xl font-semibold mb-1 ${
                              theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                            }`}>
                              {appointment.title}
                            </h3>
                            {appointment.service_board_title && (
                              <p className={`text-xs font-medium ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                {appointment.service_board_title}
                              </p>
                            )}
                          </div>
                          
                          {appointment.notes && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500 text-xs whitespace-nowrap">Notes:</span>
                              <p className={`text-xs mt-0 line-clamp-2 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                {appointment.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="w-full lg:w-64 flex-shrink-0">
                        <div className={`border rounded-lg p-4 lg:p-6 ${
                          theme === 'dark' 
                            ? 'border-gray-600 bg-zinc-700' 
                            : 'border-gray-200 bg-zinc-50'
                        }`}>
                          <div className="flex flex-col gap-1 lg:gap-2">
                            <div className="flex items-center gap-2 lg:gap-2">
                              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-xs lg:text-sm">
                                  {appointment.customerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </span>
                              </div>
                              <h4 className={`font-medium text-sm lg:text-base ${
                                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                              }`}>
                                {appointment.customerName}
                              </h4>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-medium ${
                                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                              }`}>
                                {appointment.customerEmail}
                              </span>
                            </div>
                            
                            {appointment.customerPhone && (
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-medium ${
                                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                                }`}>
                                  {appointment.customerPhone}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="w-full lg:w-32 flex-shrink-0">
                        <div className="flex flex-row lg:flex-col gap-2">
                          <button
                            onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                            className={`flex-1 lg:w-full px-3 py-2 text-sm rounded-md border transition-colors ${
                              theme === 'dark'
                                ? 'border-green-500 text-green-400 hover:bg-green-900/20'
                                : 'border-green-500 text-green-600 hover:bg-green-50'
                            }`}
                          >
                            Confirm
                          </button>
                          
                          <button
                            onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                            className={`flex-1 lg:w-full px-3 py-2 text-sm rounded-md border transition-colors ${
                              theme === 'dark'
                                ? 'border-red-500 text-red-400 hover:bg-red-900/20'
                                : 'border-red-500 text-red-600 hover:bg-red-50'
                            }`}
                          >
                            Cancel
                          </button>
                          
                          <button
                            onClick={() => handleDeleteAppointment(appointment.id)}
                            className={`w-8 h-8 rounded-full border transition-colors flex items-center justify-center ${
                              theme === 'dark'
                                ? 'border-red-500 text-red-400 hover:bg-red-900/20'
                                : 'border-red-500 text-red-600 hover:bg-red-50'
                            }`}
                            title="Delete Appointment"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

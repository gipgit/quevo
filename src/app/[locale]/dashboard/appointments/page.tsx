'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS, it } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import DashboardLayout from '@/components/dashboard/dashboard-layout';
import { UsageLimitBar } from '@/components/dashboard/UsageLimitBar';
import { UpgradePlanCTA } from '@/components/dashboard/UpgradePlanCTA';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useToaster } from '@/components/ui/ToasterProvider';
import { useBusiness } from '@/lib/business-context';
import EmptyState from '@/components/EmptyState';
import { getPlatformIcon } from '@/lib/platform-icons';

const locales = {
  'en-US': enUS,
  'it': it,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Appointment {
  id: string;
  title: string;
  start: string | Date;
  end: string | Date;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  appointment_title?: string;
  service_board_title?: string;
  service_board_ref?: string;
  platform_name?: string;
  platform_link?: string;
  appointment_location?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export default function AppointmentsPage() {
  const t = useTranslations('Dashboard');
  const { showToast } = useToaster();
  const { currentBusiness } = useBusiness();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  useEffect(() => {
    if (currentBusiness) {
      fetchAppointments();
    }
  }, [currentBusiness]);

  const fetchAppointments = async () => {
    if (!currentBusiness) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/businesses/${currentBusiness.business_id}/appointments`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      
      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      showToast({
        title: t('error'),
        message: t('appointments.fetchError'),
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventSelect = (event: Appointment) => {
    // Handle event selection - could open a modal with details
    console.log('Selected appointment:', event);
  };

  const handleSlotSelect = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedDate(start);
    // Could open a modal to create new appointment
    console.log('Selected slot:', { start, end });
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    return dateObj.toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid Time';
    
    return dateObj.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/businesses/${currentBusiness?.business_id}/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update appointment status');
      }

      // Refresh appointments after status change
      await fetchAppointments();
      
      showToast({
        title: t('success'),
        message: t('appointments.statusUpdated'),
        type: 'success',
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      showToast({
        title: t('error'),
        message: t('appointments.statusUpdateError'),
        type: 'error',
      });
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm(t('appointments.confirmDelete'))) return;

    try {
      const response = await fetch(`/api/businesses/${currentBusiness?.business_id}/appointments/${appointmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete appointment');
      }

      // Refresh appointments after deletion
      await fetchAppointments();
      
      showToast({
        title: t('success'),
        message: t('appointments.deleted'),
        type: 'success',
      });
    } catch (error) {
      console.error('Error deleting appointment:', error);
      showToast({
        title: t('error'),
        message: t('appointments.deleteError'),
        type: 'error',
      });
    }
  };

  const eventStyleGetter = (event: Appointment) => {
    let style: React.CSSProperties = {
      backgroundColor: '#3b82f6',
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block',
    };

    switch (event.status) {
      case 'confirmed':
        style.backgroundColor = '#10b981';
        break;
      case 'cancelled':
        style.backgroundColor = '#ef4444';
        break;
      case 'completed':
        style.backgroundColor = '#6b7280';
        break;
      case 'pending':
        style.backgroundColor = '#f59e0b';
        break;
    }

    return { style };
  };

  // Convert appointments to proper Date objects for the calendar
  const calendarEvents = appointments.map(appointment => ({
    ...appointment,
    title: `${appointment.title} - ${appointment.customerName}`,
    start: typeof appointment.start === 'string' ? new Date(appointment.start) : appointment.start,
    end: typeof appointment.end === 'string' ? new Date(appointment.end) : appointment.end,
  }));

  const messages = {
    allDay: t('appointments.allDay'),
    previous: t('appointments.previous'),
    next: t('appointments.next'),
    today: t('appointments.today'),
    month: t('appointments.month'),
    week: t('appointments.week'),
    day: t('appointments.day'),
    agenda: t('appointments.agenda'),
    date: t('appointments.date'),
    time: t('appointments.time'),
    event: t('appointments.event'),
    noEventsInRange: t('appointments.noEventsInRange'),
    showMore: (total: number) => t('appointments.showMore', { total }),
  };

  const renderHeader = () => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('appointments.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t('appointments.description')}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSelectedDate(new Date())}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('appointments.addNew')}
        </button>
      </div>
    </div>
  );

  const renderViewTabs = () => (
    <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-6">
      <button
        onClick={() => setViewMode('calendar')}
        className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
          viewMode === 'calendar'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Calendar
        </div>
      </button>
      <button
        onClick={() => setViewMode('list')}
        className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
          viewMode === 'list'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          List
        </div>
      </button>
    </div>
  );

  const renderAppointmentsList = () => (
    <div>
      <div className="p-6">
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 transition-colors bg-white dark:bg-gray-800"
            >
              <div className="flex gap-6">
                <div className="w-80 flex-shrink-0">
                  {/* Date, Time, Status, Platform and Location */}
                  <div className="flex flex-col gap-3">
                    {/* Date and Time Card with integrated status and platform/location */}
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 bg-white dark:bg-gray-800">
                      <div className="flex justify-between items-start mb-4">
                        {/* Date Section */}
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {new Date(appointment.start).getDate()}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 font-light">
                            {new Date(appointment.start).toLocaleDateString('it-IT', { weekday: 'long' })}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(appointment.start).toLocaleDateString('it-IT', { month: 'long' })}
                          </div>
                        </div>
                        {/* Status Pill */}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                        {/* Time Section */}
                        <div className="text-center">
                          <div className="text-xl font-semibold text-gray-900 dark:text-white">
                            {formatTime(appointment.start)}
                          </div>
                          <div className="text-base text-gray-600 dark:text-gray-400">
                            {formatTime(appointment.end)}
                          </div>
                        </div>
                      </div>
                      {/* Platform/Location Info integrated in the card */}
                      {appointment.platform_name && (
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-5 h-5 flex items-center justify-center">
                              <img 
                                src={getPlatformIcon(appointment.platform_name)} 
                                alt={appointment.platform_name}
                                className="w-4 h-4"
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {appointment.platform_name}
                            </span>
                          </div>
                          {appointment.platform_link && (
                            <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg px-3 py-2">
                              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate">
                                {appointment.platform_link}
                              </span>
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => navigator.clipboard.writeText(appointment.platform_link!)}
                                  className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                  title="Copy link"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </button>
                                <a
                                  href={appointment.platform_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                  title="Open link"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {!appointment.platform_name && appointment.appointment_location && (
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 flex items-center justify-center">
                              <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {appointment.appointment_location}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Column 2: Title, Customer Card and Notes - Takes remaining space */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {appointment.title}
                      </h3>
                      {appointment.service_board_title && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                          {appointment.service_board_title}
                        </p>
                      )}
                    </div>
                    
                    {/* Customer Card */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                            {appointment.customerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-base">
                          {appointment.customerName}
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {/* Email Section */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-900 dark:text-white truncate max-w-28">
                            {appointment.customerEmail}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => navigator.clipboard.writeText(appointment.customerEmail)}
                              className="p-0.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                              title="Copy email"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => window.open(`mailto:${appointment.customerEmail}`)}
                              className="p-0.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                              title="Send email"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        {/* Phone Section - Only show if phone is available */}
                        {appointment.customerPhone && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-900 dark:text-white truncate max-w-28">
                              {appointment.customerPhone}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => appointment.customerPhone && navigator.clipboard.writeText(appointment.customerPhone)}
                                className="p-0.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                                title="Copy phone"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => window.open(`tel:${appointment.customerPhone}`)}
                                className="p-0.5 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                                title="Call"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => appointment.customerPhone && window.open(`https://wa.me/${appointment.customerPhone.replace(/\D/g, '')}`)}
                                className="p-0.5 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                                title="WhatsApp"
                              >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {appointment.notes && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">Notes:</span>
                        <p className="text-xs text-gray-700 dark:text-gray-300 mt-0 line-clamp-2">
                          {appointment.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 4: Management Buttons - Fixed width, aligned to right */}
                <div className="w-32 flex-shrink-0">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                      className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                    >
                      Confirm
                    </button>
                    
                    <button
                      onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                      className="w-full px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                    >
                      Cancel
                    </button>
                    
                    <button
                      onClick={() => handleEventSelect(appointment)}
                      className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                      title="View Details"
                    >
                      <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handleDeleteAppointment(appointment.id)}
                      className="w-full px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      title="Delete Appointment"
                    >
                      <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );



  const renderCalendar = () => (
    <div>
      <div className="p-6">
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          onSelectEvent={handleEventSelect}
          onSelectSlot={handleSlotSelect}
          selectable
          eventPropGetter={eventStyleGetter}
          messages={messages}
          views={['month', 'week', 'day', 'agenda']}
          defaultView="month"
          step={60}
          timeslots={1}
          className="dark:bg-gray-900"
        />
      </div>
    </div>
  );

  if (!currentBusiness) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {renderHeader()}
        
        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : appointments.length === 0 ? (
          <EmptyState
            title={t('appointments.empty.title')}
            description={t('appointments.empty.description')}
            buttonText={t('appointments.addFirst')}
            onButtonClick={() => setSelectedDate(new Date())}
            icon={<svg className="mx-auto w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          />
        ) : (
          <>
            {renderViewTabs()}
            {viewMode === 'calendar' ? renderCalendar() : renderAppointmentsList()}
          </>
        )}
      </div>
    </DashboardLayout>
  );
} 
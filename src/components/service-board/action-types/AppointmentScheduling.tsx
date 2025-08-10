"use client";

import React, { useState } from 'react';
import { AppointmentSchedulingDetails } from '@/types/service-board';
import { format } from 'date-fns';
import { enUS, it } from 'date-fns/locale';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import DatetimeConfirmationModal from '@/components/modals/DatetimeConfirmationModal';
import AppointmentConfirmationModal from '@/components/modals/AppointmentConfirmationModal';
import { useBusinessProfile } from '@/contexts/BusinessProfileContext';
import { getPlatformIcon } from '@/lib/platform-icons';

interface Props {
  details: AppointmentSchedulingDetails;
  onUpdate?: (details: AppointmentSchedulingDetails) => void;
  action_id: string;
  onAppointmentConfirmed?: () => void;
}

export default function AppointmentScheduling({ details, onUpdate, action_id, onAppointmentConfirmed }: Props) {
  const platformLabelMap: Record<string, string> = {
    google_meet: 'Google Meet',
    microsoft_teams: 'Microsoft Teams',
    zoom: 'Zoom',
    skype: 'Skype'
  };

  const humanizePlatform = (platformKey: string): string => {
    if (!platformKey) return '';
    return platformLabelMap[platformKey] || platformKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };
  const appointmentSchedulingConfig: Array<{ key: keyof AppointmentSchedulingDetails | 'appointment_title_status' | 'appointment_type'; label: string; type: 'custom' | 'text'; shouldRender?: (d: AppointmentSchedulingDetails) => boolean; }> = [
    { key: 'appointment_title_status', label: 'Appointment', type: 'custom' },
    { key: 'appointment_type', label: 'Appointment Type', type: 'custom' },
    { key: 'address', label: 'Address', type: 'text', shouldRender: (d: AppointmentSchedulingDetails) => d.appointment_type === 'in_person' },
    { key: 'datetimes_options', label: 'Select a date and time', type: 'custom', shouldRender: (d: AppointmentSchedulingDetails) => d.confirmation_status === 'pending_customer' && d.appointment_mode === 'multiple_choice' },
    { key: 'datetime_confirmed', label: 'Confirmed date and time', type: 'custom', shouldRender: (d: AppointmentSchedulingDetails) => d.datetime_confirmed !== null },
    { key: 'platform_options', label: 'Select your preferred platform', type: 'custom', shouldRender: (d: AppointmentSchedulingDetails) => d.appointment_type === 'online' && d.confirmation_status === 'pending_customer' },
    { key: 'platform_confirmed', label: 'Confirmed Platform', type: 'custom', shouldRender: (d: AppointmentSchedulingDetails) => d.appointment_type === 'online' && d.platform_confirmed !== null },
    { key: 'reschedule_reason', label: 'Reschedule Reason', type: 'text', shouldRender: (d: AppointmentSchedulingDetails) => d.reschedule_reason !== null },
    { key: 'appointment_id', label: 'Appointment ID', type: 'text', shouldRender: (d: AppointmentSchedulingDetails) => d.appointment_id !== null && d.confirmation_status !== 'confirmed' },
  ];

  const params = useParams();
  const locale = (params as any).locale as string;
  const t = useTranslations('ServiceBoard');

  const getDateLocale = () => (locale === 'it' ? it : enUS);
  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    const dateLocale = getDateLocale();
    return {
      formattedDate: format(date, 'PPPP', { locale: dateLocale }),
      formattedTime: format(date, 'HH:mm'),
    };
  };
  const [selectedDatetime, setSelectedDatetime] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationStatus, setConfirmationStatus] = useState<'success' | 'error'>('success');
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [confirmationDetails, setConfirmationDetails] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { businessData } = useBusinessProfile() as { businessData: { business_id: string } };

  const handleDatetimeSelect = (datetime: string) => {
    setSelectedDatetime(datetime);
    // Don't open modal immediately anymore
  };

  const handlePlatformSelect = (platform: string) => {
    setSelectedPlatform(platform);
    // Don't open modal immediately anymore
  };

  const handleConfirmDatetime = async () => {
    if (!selectedDatetime || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/businesses/${businessData.business_id}/appointments/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action_id: action_id,
          datetime: selectedDatetime,
          platform: selectedPlatform,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || t('failedToConfirmAppointment'));
      }
      
      const { appointment } = await response.json();
      onUpdate?.(appointment.action_details);
      
      // Set success confirmation details
      setConfirmationStatus('success');
      setConfirmationMessage(t('appointmentConfirmed'));
      setConfirmationDetails({
        title: (details as any).appointment_title,
        datetime: selectedDatetime,
        platform: selectedPlatform,
        location: (details as any).appointment_location
      });
      
      // Show confirmation modal with a small delay to ensure smooth transition
      setTimeout(() => {
        setShowConfirmationModal(true);
      }, 300);
      
      // Refresh appointments list after successful confirmation
      setTimeout(() => {
        onAppointmentConfirmed?.();
      }, 100);
    } catch (error) {
      console.error('Error confirming appointment:', error);
      
      // Set error confirmation details
      setConfirmationStatus('error');
      setConfirmationMessage(error instanceof Error ? error.message : t('errorConfirmingAppointment'));
      setConfirmationDetails(null);
      
      // Show confirmation modal
      setShowConfirmationModal(true);
    } finally {
      setIsSubmitting(false);
      // Add a small delay before closing the modal to ensure the confirmation modal appears
      setTimeout(() => {
        setIsModalOpen(false);
        setSelectedDatetime(null);
        setSelectedPlatform(null);
      }, 200);
    }
  };

  const handleReject = async () => {
    try {
      const response = await fetch(`/api/businesses/${businessData.business_id}/appointments/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action_id: action_id,
          reason: 'Customer rejected all suggested times',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || t('failedToRejectAppointment'));
      }
      
      const { appointment } = await response.json();
      onUpdate?.(appointment.action_details);
      
      // Show success confirmation
      setConfirmationStatus('success');
      setConfirmationMessage(t('appointmentRejected'));
      setConfirmationDetails(null);
      setShowConfirmationModal(true);
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      
      // Show error confirmation
      setConfirmationStatus('error');
      setConfirmationMessage(error instanceof Error ? error.message : t('errorRejectingAppointment'));
      setConfirmationDetails(null);
      setShowConfirmationModal(true);
    }
  };

  const handleRescheduleRequest = async (reason: string) => {
    try {
      const response = await fetch(`/api/businesses/${businessData.business_id}/appointments/reschedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action_id: action_id,
          reason,
          current_datetime: details.datetime_confirmed,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || t('failedToRequestReschedule'));
      }
      
      const { appointment } = await response.json();
      onUpdate?.(appointment.action_details);
      
      // Show success confirmation
      setConfirmationStatus('success');
      setConfirmationMessage(t('rescheduleRequestSent'));
      setConfirmationDetails(null);
      setShowConfirmationModal(true);
    } catch (error) {
      console.error('Error requesting reschedule:', error);
      
      // Show error confirmation
      setConfirmationStatus('error');
      setConfirmationMessage(error instanceof Error ? error.message : t('errorRequestingReschedule'));
      setConfirmationDetails(null);
      setShowConfirmationModal(true);
    }
  };

  const handleCancel = async () => {
    try {
      const response = await fetch(`/api/businesses/${businessData.business_id}/appointments/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action_id: action_id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || t('failedToCancelAppointment'));
      }
      
      const { appointment } = await response.json();
      onUpdate?.(appointment.action_details);
      
      // Show success confirmation
      setConfirmationStatus('success');
      setConfirmationMessage(t('appointmentCancelled'));
      setConfirmationDetails(null);
      setShowConfirmationModal(true);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      
      // Show error confirmation
      setConfirmationStatus('error');
      setConfirmationMessage(error instanceof Error ? error.message : t('errorCancellingAppointment'));
      setConfirmationDetails(null);
      setShowConfirmationModal(true);
    }
  };

  const canConfirm = selectedDatetime && (
    details.appointment_type === 'in_person' || 
    (details.appointment_type === 'online' && selectedPlatform)
  );

  return (
    <div className="space-y-4">
      {/* Main appointment details */}
      <div className="space-y-4">
        {appointmentSchedulingConfig.map((field) => {
          if (field.shouldRender && !field.shouldRender(details)) return null;
          const value = (details as any)[field.key];

          // Inline renderer logic (migrated from AppointmentSchedulingRenderer)
          if (field.key === 'appointment_title_status') {
            const statusStyles: Record<string, string> = {
              pending_customer: 'bg-yellow-100 text-yellow-800',
              confirmed: 'bg-green-100 text-green-800',
              cancelled: 'bg-red-100 text-red-800',
              rejected: 'bg-red-100 text-red-800',
              rescheduled: 'bg-orange-100 text-orange-800',
            };
            const statusText: Record<string, string> = {
              pending_customer: t('pendingConfirmation'),
              confirmed: t('confirmed'),
              cancelled: t('cancelled'),
              rejected: t('rejected'),
              rescheduled: t('rescheduled'),
            };
            return (
              <div key={field.key} className="space-y-0">
                <label className="text-xs text-gray-500">{field.label}</label>
                <div className="flex items-center gap-x-2 gap-y-0 flex-wrap">
                  <div className="text-lg font-semibold text-gray-900">
                    {details.appointment_title || t('appointment')}
                  </div>
                  <div className={`w-fit px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap capitalize ${statusStyles[details.confirmation_status] || 'bg-gray-100 text-gray-800'}`}>
                    {statusText[details.confirmation_status] || details.confirmation_status}
                  </div>
                </div>
              </div>
            );
          }

          if (field.key === 'address' && value) {
            return (
              <div key={field.key} className="space-y-0">
                <label className="text-xs lg:text-sm font-medium text-gray-500">{field.label}</label>
                <div className="text-md lg:text-lg font-bold text-gray-700">{value}</div>
              </div>
            );
          }

          if (field.key === 'appointment_type') {
            return (
              <div key={field.key} className="space-y-1 hidden">
                <label className="text-xs font-medium text-gray-800">{field.label}</label>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize">
                  {value === 'online' ? 'Online Meeting' : 'In Person'}
                </div>
              </div>
            );
          }

          if (field.key === 'datetime_confirmed' && typeof value === 'string') {
            // Guard: show confirmed datetime only when confirmation_status is confirmed
            if (details.confirmation_status !== 'confirmed') return null;
            const { formattedDate, formattedTime } = formatDateTime(value);
            return (
              <div key={field.key} className="space-y-1">
                <label className="text-sm font-medium text-gray-800">Confirmed date and time</label>
                <div className="flex items-center gap-2">
                  <div className="text-md md:text-lg font-medium text-gray-900">{formattedDate}</div>
                  <div className="text-gray-400">•</div>
                  <div className="text-md md:text-lg font-medium text-gray-900">{formattedTime}</div>
                </div>
              </div>
            );
          }

          if (field.key === 'datetimes_options' && Array.isArray(value)) {
            // Hide selection once confirmed or not pending
            if (details.confirmation_status !== 'pending_customer') {
              return null;
            }
            const label = 'Select a date and time';
            return (
              <div key={field.key} className="space-y-1">
                <label className="text-sm font-medium text-gray-800">{label}</label>
                <div className="space-y-2">
                  {value.map((datetime: string, index: number) => {
                    const { formattedDate, formattedTime } = formatDateTime(datetime);
                    const isSelected = datetime === selectedDatetime;
                    return (
                      <div key={index} className={`p-4 rounded-lg cursor-pointer flex justify-between items-center ${isSelected ? 'border-[1px] border-green-500 bg-green-50' : 'border-[1px] border-gray-300 bg-gray-50 hover:bg-gray-50'}`} onClick={() => handleDatetimeSelect(datetime)}>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div className="text-md md:text-lg font-medium text-gray-900">{formattedDate}</div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{formattedTime}</span>
                          </div>
                        </div>
                        <button className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full shadow-sm ${isSelected ? 'text-white bg-green-600 hover:bg-green-700 w-8 h-8 p-0 flex items-center justify-center' : 'bg-gray-200'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`} onClick={(e) => { e.stopPropagation(); handleDatetimeSelect(datetime); }}>
                          {isSelected ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                          ) : 'Select'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          if (field.key === 'platform_options' && Array.isArray(value)) {
            // Only show platform selection when pending
            if (details.confirmation_status !== 'pending_customer') {
            return null;
            }
            const label = 'Select your preferred platform';
            return (
              <div key={field.key} className="space-y-1">
                <label className="text-sm font-medium text-gray-800">{label}</label>
                <div className="space-y-2">
                  {value.map((platform: string, index: number) => {
                    const isSelected = platform === selectedPlatform;
                    return (
                      <div key={index} className={`px-4 py-2 rounded-lg cursor-pointer flex justify-between items-center ${isSelected ? 'border-[1px] border-green-500 bg-green-50' : 'border-[1px] border-gray-300 bg-gray-50 hover:bg-gray-50'}`} onClick={() => handlePlatformSelect(platform)}>
                        <div className="flex items-center gap-2">
                          <img src={getPlatformIcon(humanizePlatform(platform))} alt={humanizePlatform(platform)} className="w-5 h-5" />
                          <div className="text-sm md:text-md font-medium text-gray-900">{humanizePlatform(platform)}</div>
                        </div>
                        <button className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full shadow-sm ${isSelected ? 'text-white bg-green-600 hover:bg-green-700 w-8 h-8 p-0 flex items-center justify-center' : 'bg-gray-200'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`} onClick={(e) => { e.stopPropagation(); handlePlatformSelect(platform); }}>
                          {isSelected ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                          ) : 'Select'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          if (field.key === 'platforms_selected' && Array.isArray(value)) {
            return (
              <div key={field.key} className="space-y-1">
                <label className="text-sm font-medium text-gray-500">{field.label}</label>
                <div className="flex flex-wrap gap-2">
                  {value.map((platform: string, index: number) => (
                    <span key={index} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <img src={getPlatformIcon(humanizePlatform(platform))} alt={humanizePlatform(platform)} className="w-4 h-4" />
                      {humanizePlatform(platform)}
                    </span>
                  ))}
                </div>
              </div>
            );
          }

          if (field.key === 'platform_confirmed' && value) {
            return (
              <div key={field.key} className="space-y-0">
                <label className="text-xs lg:text-sm font-medium text-gray-500">{field.label}</label>
                <div className="flex items-center gap-2 text-sm text-gray-900">
                  <img src={getPlatformIcon(humanizePlatform(String(value)))} alt={humanizePlatform(String(value))} className="w-5 h-5" />
                  <span>{humanizePlatform(String(value))}</span>
                </div>
              </div>
            )
          }

          if (field.key === 'appointment_id' && value) {
            return (
              <div key={field.key} className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Appointment Details</label>
                <Link href={`/appointments/${value}`} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">View Appointment</Link>
              </div>
            );
          }

          // Fallback renderer for unexpected values: render as plain text
          if (value !== undefined && value !== null) {
            let displayValue: string;
            try {
              displayValue = typeof value === 'string' ? value : Array.isArray(value) ? value.join(', ') : JSON.stringify(value);
            } catch {
              displayValue = String(value);
            }
          return (
              <div key={field.key} className="space-y-0">
                <label className="text-xs lg:text-sm font-medium text-gray-500">{field.label}</label>
                <div className="text-sm text-gray-700 break-words">{displayValue}</div>
            </div>
          );
          }

          return null;
        })}
      </div>

      {/* Confirm button */}
      {details.confirmation_status === 'pending_customer' && (
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={!canConfirm}
          className={`w-full px-4 py-2 text-sm font-medium rounded-md ${
            canConfirm 
              ? 'text-white bg-green-600 hover:bg-green-700'
              : 'text-gray-400 bg-gray-100 cursor-not-allowed'
          }`}
        >
          {!selectedDatetime 
            ? t('pleaseSelectDate')
            : !selectedPlatform && details.appointment_type === 'online'
            ? t('pleaseSelectPlatform')
            : t('confirmSelection')}
        </button>
      )}

      {/* Confirmation Modal */}
      {isModalOpen && (
        <DatetimeConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmDatetime}
          datetime={selectedDatetime!}
          platform={selectedPlatform}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Appointment Confirmation Modal */}
      <AppointmentConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        status={confirmationStatus}
        message={confirmationMessage}
        appointmentDetails={confirmationDetails}
      />
    </div>
  );
} 
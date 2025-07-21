"use client";

import React, { useState } from 'react';
import { AppointmentSchedulingDetails } from '@/types/service-board';
import { appointmentSchedulingConfig } from './renderers/configs/appointment-scheduling';
import AppointmentSchedulingRenderer from './renderers/AppointmentSchedulingRenderer';
import DatetimeConfirmationModal from '@/components/modals/DatetimeConfirmationModal';
import AppointmentConfirmationModal from '@/components/modals/AppointmentConfirmationModal';
import { useBusinessProfile } from '@/contexts/BusinessProfileContext';
import { useTranslations } from 'next-intl';

interface Props {
  details: AppointmentSchedulingDetails;
  onUpdate?: (details: AppointmentSchedulingDetails) => void;
  action_id: string;
  onAppointmentConfirmed?: () => void;
}

export default function AppointmentScheduling({ details, onUpdate, action_id, onAppointmentConfirmed }: Props) {
  const [selectedDatetime, setSelectedDatetime] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationStatus, setConfirmationStatus] = useState<'success' | 'error'>('success');
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [confirmationDetails, setConfirmationDetails] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { businessData } = useBusinessProfile() as { businessData: { business_id: string } };
  const t = useTranslations('ServiceBoard');

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
          if (field.shouldRender && !field.shouldRender(details)) {
            return null;
          }

          const value = details[field.key as keyof AppointmentSchedulingDetails];
          
          return (
            <div key={field.key} className="flex flex-col">
              <AppointmentSchedulingRenderer
                field={field}
                value={value}
                details={details}
                onDatetimeSelect={handleDatetimeSelect}
                onPlatformSelect={handlePlatformSelect}
                selectedDatetime={selectedDatetime}
                selectedPlatform={selectedPlatform}
              />
            </div>
          );
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
            ? 'Please Select a Date'
            : !selectedPlatform && details.appointment_type === 'online'
            ? 'Please Select a Platform'
            : 'Confirm Selection'}
        </button>
      )}

      {/* Action buttons based on status */}
      <div className="flex flex-col space-y-2">
        {details.confirmation_status === 'pending_customer' && (
          <button
            onClick={() => handleReject()}
            className="w-full px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md"
          >
            Reject All Suggested Times
          </button>
        )}

        {details.confirmation_status === 'confirmed' && (
          <button
            onClick={() => handleRescheduleRequest('Need to reschedule')}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-100 rounded-md"
          >
            Request Reschedule
          </button>
        )}

        {details.confirmation_status === 'confirmed' && (
          <button
            onClick={handleCancel}
            className="w-full px-4 py-2 text-sm font-medium text-red-700 bg-red-200 hover:bg-red-100 rounded-md"
          >
            Cancel Appointment
          </button>
        )}
      </div>

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
import React, { useState } from 'react';

interface Appointment {
  id: string;
  appointment_datetime: string;
  appointment_type: string;
  appointment_location: string;
  platform_name?: string;
  platform_link?: string;
  status: string;
  notes?: string;
  appointment_title?: string;
}

interface RescheduleCancelButtonProps {
  appointment: Appointment;
  businessId: string;
  onReschedule?: () => void;
  onCancel?: () => void;
  label?: string;
  className?: string;
  tServiceBoard: any;
  t: any;
}

const reasons = [
  'Unexpected commitment',
  'Feeling unwell',
  'Transport issues',
  'Work conflict',
  'Family emergency',
  'Other',
];

const RescheduleCancelButton: React.FC<RescheduleCancelButtonProps> = ({
  appointment,
  businessId,
  onReschedule,
  onCancel,
  label = '',
  className = '',
  tServiceBoard,
  t,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleReschedule = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/businesses/${businessId}/appointments/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_id: appointment.id,
          reason: selectedReason === 'Other' ? customReason : selectedReason,
          current_datetime: appointment.appointment_datetime,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || tServiceBoard('failedToRequestReschedule'));
      }
      alert(tServiceBoard('rescheduleRequestSent'));
      setShowModal(false);
      onReschedule?.();
    } catch (error) {
      alert(error instanceof Error ? error.message : tServiceBoard('errorRequestingReschedule'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/businesses/${businessId}/appointments/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_id: appointment.id,
          reason: selectedReason === 'Other' ? customReason : selectedReason,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || tServiceBoard('failedToCancelAppointment'));
      }
      alert(tServiceBoard('appointmentCancelled'));
      setShowModal(false);
      setShowCancelConfirm(false);
      onCancel?.();
    } catch (error) {
      alert(error instanceof Error ? error.message : tServiceBoard('errorCancellingAppointment'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className={`px-5 py-2 text-xs font-semibold text-white bg-gray-700 hover:bg-gray-800 rounded-full shadow transition-colors ${className}`}
        onClick={() => {
          setShowModal(true);
          setSelectedReason('');
          setCustomReason('');
        }}
      >
        {label || tServiceBoard('rescheduleOrCancel')}
      </button>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowModal(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-2xl font-bold mb-3 text-center">{tServiceBoard('rescheduleOrCancelTitle')}</h3>
            <div className="mb-3 text-xs text-gray-600 text-center">{tServiceBoard('optionalReasonPrompt')}</div>
            <div className="flex flex-col gap-2 mb-4">
              {reasons.map((reason) => (
                <label key={reason} className="flex items-center gap-2 text-xs text-gray-400 font-normal cursor-pointer">
                  <input
                    type="radio"
                    name="reschedule-cancel-reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                  />
                  <span>{tServiceBoard(`reason_${reason.replace(/\s+/g, '').toLowerCase()}`)}</span>
                </label>
              ))}
              {selectedReason === 'Other' && (
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded p-2 text-xs text-gray-500 mt-1"
                  placeholder={tServiceBoard('enterYourReason')}
                  value={customReason}
                  onChange={e => setCustomReason(e.target.value)}
                />
              )}
            </div>
            <div className="flex flex-row gap-2 mt-2">
              <button
                disabled={loading}
                onClick={handleReschedule}
                className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-black hover:bg-gray-900 rounded-md shadow transition-colors disabled:opacity-50"
              >
                {tServiceBoard('requestReschedule')}
              </button>
              <button
                disabled={loading}
                onClick={() => setShowCancelConfirm(true)}
                className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-md shadow transition-colors disabled:opacity-50"
              >
                {tServiceBoard('cancelAppointment')}
              </button>
            </div>
            {showCancelConfirm && (
              <div className="mt-4 p-4 rounded-lg border border-red-200 bg-red-50 flex flex-col gap-3 w-full max-w-full">
                <div className="text-xs text-red-700 text-center font-medium">
                  {tServiceBoard('cancelWarning')}
                </div>
                <div className="flex flex-row gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => setShowCancelConfirm(false)}
                    className="sm:flex-1 w-full px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md shadow transition-colors"
                  >
                    {t('back')}
                  </button>
                  <button
                    disabled={loading}
                    onClick={handleCancel}
                    className="sm:flex-1 w-full px-3 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md shadow transition-colors disabled:opacity-50"
                  >
                    {tServiceBoard('confirmCancel')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default RescheduleCancelButton; 
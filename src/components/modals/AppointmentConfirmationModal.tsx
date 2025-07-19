"use client";

import React from 'react';

interface AppointmentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'success' | 'error';
  message: string;
  appointmentDetails?: {
    title?: string;
    datetime?: string;
    platform?: string;
    location?: string;
  };
}

export default function AppointmentConfirmationModal({
  isOpen,
  onClose,
  status,
  message,
  appointmentDetails
}: AppointmentConfirmationModalProps) {
  if (!isOpen) return null;

  const isSuccess = status === 'success';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {isSuccess ? 'Appointment Confirmed!' : 'Confirmation Error'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Icon and Status */}
        <div className="flex justify-center mb-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            isSuccess 
              ? 'bg-green-100 text-green-600' 
              : 'bg-red-100 text-red-600'
          }`}>
            {isSuccess ? (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
        </div>

        {/* Message */}
        <div className="text-center mb-4">
          <p className={`text-sm ${
            isSuccess ? 'text-green-700' : 'text-red-700'
          }`}>
            {message}
          </p>
        </div>

        {/* Appointment Details (only show on success) */}
        {isSuccess && appointmentDetails && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Appointment Details</h4>
            <div className="space-y-2 text-sm">
              {appointmentDetails.title && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Title:</span>
                  <span className="font-medium">{appointmentDetails.title}</span>
                </div>
              )}
              {appointmentDetails.datetime && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time:</span>
                  <span className="font-medium">
                    {new Date(appointmentDetails.datetime).toLocaleDateString()} at{' '}
                    {new Date(appointmentDetails.datetime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
              {appointmentDetails.platform && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform:</span>
                  <span className="font-medium">{appointmentDetails.platform}</span>
                </div>
              )}
              {appointmentDetails.location && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{appointmentDetails.location}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              isSuccess
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            {isSuccess ? 'Great!' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
} 
// src/components/profile/sections/services/ServiceRequestConfirmationModal.jsx

"use client"; // This is a Client Component

import React, { useState } from 'react';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';

// Import ALL necessary date-fns locales at the top
import enUS from 'date-fns/locale/en-US';
import it from 'date-fns/locale/it';
import es from 'date-fns/locale/es';
import fr from 'date-fns/locale/fr';
import de from 'date-fns/locale/de';
import zhCN from 'date-fns/locale/zh-CN';
import ar from 'date-fns/locale/ar';

// Create a mapping object for easy lookup including all locales
const dateLocales = {
  'en-US': enUS,
  'it': it,
  'es': es,
  'fr': fr,
  'de': de,
  'zh-CN': zhCN,
  'ar': ar,
};

export default function ServiceRequestConfirmationModal({
  isOpen,
  onClose,
  onConfirm, // Now expects customer details as an argument: (customerDetails) => Promise<void>
  serviceRequestDetails, // { service: { service_name, duration_minutes, price, details_request }, selectedDateTime: { date, time } }
  themeColorButton,
  themeColorText,
  locale, // For currency and date formatting, will be like 'en-US', 'it', 'es', etc.
  businessName // Still used for display, just removed the specific line
}) {
  const t = useTranslations('ServiceRequest');
  const [loading, setLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState(null); // Renamed to avoid confusion with validation errors

  // State for customer details
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  // State for client-side validation errors
  const [validationErrors, setValidationErrors] = useState({});

  // Debugging logs for locale
  console.log("ServiceRequestConfirmationModal: received locale prop:", locale);

  if (!isOpen) return null;

  const { service, selectedDateTime } = serviceRequestDetails;

  // Get the correct date-fns locale based on the 'locale' prop, defaulting to enUS
  const currentDateFormatLocale = dateLocales[locale] || enUS;
  console.log("ServiceRequestConfirmationModal: currentDateFormatLocale used for date-fns:", currentDateFormatLocale);


  // Combine formatted date and time
  const formattedDateAndTime = selectedDateTime?.date && selectedDateTime?.time
    ? `${format(selectedDateTime.date, 'PPPP', { locale: currentDateFormatLocale })}, ${selectedDateTime.time}`
    : 'N/A';

  // Price formatting automatically handles locale differences via toLocaleString
  const servicePrice = service?.price?.toLocaleString(locale, { style: 'currency', currency: 'EUR' }) || 'N/A';

  const validateFields = () => {
    const errors = {};
    if (!customerName.trim()) {
      errors.customerName = t('nameRequired');
    }
    if (!customerEmail.trim()) {
      errors.customerEmail = t('emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(customerEmail)) {
      errors.customerEmail = t('invalidEmail');
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmServiceRequest = async () => {
    setSubmissionError(null); // Clear previous submission errors
    setValidationErrors({}); // Clear previous validation errors

    if (!validateFields()) {
      return; // Stop if validation fails
    }

    setLoading(true);
    try {
      // Pass all necessary details to the onConfirm callback
      await onConfirm({
        serviceId: service.service_id, // Assuming service_id is available here
        selectedDate: selectedDateTime.date,
        selectedTime: selectedDateTime.time,
        customerName,
        customerEmail,
        customerPhone: customerPhone || null, // Pass null if optional phone is empty
        customerNotes: customerNotes || null, // Pass null if optional notes are empty
      });
    } catch (err) {
      setSubmissionError(err.message || t('serviceRequestFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full" style={{ color: themeColorText }}>
        <h2 className="text-2xl font-bold mb-4">{t('confirmServiceRequestTitle')}</h2>

        <div className="space-y-3 mb-6">
          <p>
            <strong>{t('service')}:</strong> {service?.service_name || 'N/A'} (
            {service?.duration_minutes ? `${service.duration_minutes} ${t('minutes', { count: service.duration_minutes })}` : 'N/A'}
            )
          </p>
          <p><strong>{t('dateAndTime')}:</strong> {formattedDateAndTime}</p>
          <p className="text-xl font-bold mt-4"><strong>{t('price')}:</strong> {servicePrice}</p>
        </div>

        <h3 className="text-xl font-semibold mb-3">{t('yourDetails')}</h3>
        {/* Removed: <p className="text-sm text-gray-600 mb-4">{t('requiredFieldsNote')}</p> */}

        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
              {t('name')} <span className="text-gray-500 text-xs">{t('required')}</span> {/* Modified */}
            </label>
            <input
              type="text"
              id="customerName"
              className={`w-full p-2 border ${validationErrors.customerName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                if (validationErrors.customerName) setValidationErrors(prev => ({ ...prev, customerName: undefined }));
              }}
              required
            />
            {validationErrors.customerName && <p className="text-red-500 text-sm mt-1">{validationErrors.customerName}</p>}
          </div>

          <div>
            <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
              {t('email')} <span className="text-gray-500 text-xs">{t('required')}</span> {/* Modified */}
            </label>
            <input
              type="email"
              id="customerEmail"
              className={`w-full p-2 border ${validationErrors.customerEmail ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              value={customerEmail}
              onChange={(e) => {
                setCustomerEmail(e.target.value);
                if (validationErrors.customerEmail) setValidationErrors(prev => ({ ...prev, customerEmail: undefined }));
              }}
              required
            />
            {validationErrors.customerEmail && <p className="text-red-500 text-sm mt-1">{validationErrors.customerEmail}</p>}
          </div>

          <div>
            <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
              {t('telephone')} <span className="text-gray-500 text-xs">{t('optional')}</span>
            </label>
            <input
              type="tel"
              id="customerPhone"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>

          {service?.details_request && ( // Conditionally render notes field
            <div>
              <label htmlFor="customerNotes" className="block text-sm font-medium text-gray-700 mb-1">
                {service.details_request}
              </label>
              <textarea
                id="customerNotes"
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder={t('notesPlaceholder')} // New translation key for placeholder
              ></textarea>
            </div>
          )}
        </div>

        {submissionError && <p className="text-red-500 mb-4">{submissionError}</p>}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="py-2 px-4 rounded transition-colors border"
            style={{ backgroundColor: 'transparent', borderColor: themeColorButton, color: themeColorButton }}
            disabled={loading}
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleConfirmServiceRequest}
            className="py-2 px-4 rounded text-white transition-colors"
            style={{ backgroundColor: themeColorButton }}
            disabled={loading}
          >
            {loading ? t('confirming') : t('confirmServiceRequest')}
          </button>
        </div>
      </div>
    </div>
  );
}

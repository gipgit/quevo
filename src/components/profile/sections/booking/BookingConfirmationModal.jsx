// src/components/profile/sections/booking/BookingConfirmationModal.jsx

"use client"; // This is a Client Component

import React, { useState } from 'react';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';

// Import ALL necessary date-fns locales at the top
import enUS from 'date-fns/locale/en-US';
import it from 'date-fns/locale/it';
import es from 'date-fns/locale/es';
import fr from 'date-fns/locale/fr';   // <-- ADDED THIS IMPORT
import de from 'date-fns/locale/de';   // <-- ADDED THIS IMPORT
import zhCN from 'date-fns/locale/zh-CN'; // <-- ADDED THIS IMPORT
import ar from 'date-fns/locale/ar';   // <-- ADDED THIS IMPORT

// Create a mapping object for easy lookup including all locales
const dateLocales = {
  'en-US': enUS,
  'it': it,
  'es': es,
  'fr': fr,     // <-- ADDED THIS ENTRY
  'de': de,     // <-- ADDED THIS ENTRY
  'zh-CN': zhCN, // <-- ADDED THIS ENTRY
  'ar': ar,     // <-- ADDED THIS ENTRY
};

export default function BookingConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    bookingDetails, // { service, selectedDateTime: { date, time } }
    themeColorButton,
    themeColorText,
    locale, // For currency and date formatting, will be like 'en-US', 'it', 'es', etc.
    businessName
}) {
    const t = useTranslations('Booking');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const { service, selectedDateTime } = bookingDetails;

    // Get the correct date-fns locale based on the 'locale' prop, defaulting to enUS
    const currentDateFormatLocale = dateLocales[locale] || enUS;

    const formattedDate = selectedDateTime?.date ? format(selectedDateTime.date, 'PPPP', { locale: currentDateFormatLocale }) : 'N/A'; // Full date
    const formattedTime = selectedDateTime?.time || 'N/A';
    // Price formatting automatically handles locale differences via toLocaleString
    const servicePrice = service?.price?.toLocaleString(locale, { style: 'currency', currency: 'EUR' }) || 'N/A';

    const handleConfirmBooking = async () => {
        setLoading(true);
        setError(null);
        try {
            await onConfirm();
        } catch (err) {
            setError(err.message || t('bookingFailed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full" style={{ color: themeColorText }}>
                <h2 className="text-2xl font-bold mb-4">{t('confirmBookingTitle')}</h2>

                <div className="space-y-3 mb-6">
                    <p><strong>{t('business')}:</strong> {businessName}</p>
                    <p><strong>{t('service')}:</strong> {service?.service_name || 'N/A'}</p>
                    <p><strong>{t('duration')}:</strong> {service?.duration_minutes ? `${service.duration_minutes} ${t('minutes')}` : 'N/A'}</p>
                    <p><strong>{t('date')}:</strong> {formattedDate}</p>
                    <p><strong>{t('time')}:</strong> {formattedTime}</p>
                    <p className="text-xl font-bold mt-4"><strong>{t('price')}:</strong> {servicePrice}</p>
                </div>

                {error && <p className="text-red-500 mb-4">{error}</p>}

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
                        onClick={handleConfirmBooking}
                        className="py-2 px-4 rounded text-white transition-colors"
                        style={{ backgroundColor: themeColorButton }}
                        disabled={loading}
                    >
                        {loading ? t('confirming') : t('confirmBooking')}
                    </button>
                </div>
            </div>
        </div>
    );
}
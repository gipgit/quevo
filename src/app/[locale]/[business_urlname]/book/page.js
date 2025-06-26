// src/app/[locale]/(main)/[business_urlname]/book/page.jsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useBusinessProfile } from '@/contexts/BusinessProfileContext';
import { useRouter } from 'next/navigation';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { useTranslations } from 'next-intl';

// Helper for copying email (from PHP JS)
const copyEmailToClipboard = (email) => {
    const el = document.createElement('textarea');
    el.value = email;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    console.log('Email copied to clipboard:', email);
};

// BookingDetailsModal Component
const BookingDetailsModal = ({ show, onClose, onSubmit, bookingDetails, themeColorText, themeColorBackground, themeColorButton, isDarkBackground }) => {
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerNotes, setCustomerNotes] = useState('');

    const [errors, setErrors] = useState({});
    const t = useTranslations('Common');

    const validateForm = () => {
        const newErrors = {};
        if (!customerName) newErrors.customerName = t('fillAllRequiredFields');
        if (!customerEmail) newErrors.customerEmail = t('fillAllRequiredFields');
        else if (!/\S+@\S+\.\S+/.test(customerEmail)) newErrors.customerEmail = t('invalidEmailFormat');
        if (!customerPhone) newErrors.customerPhone = t('fillAllRequiredFields');
        else if (!/^[0-9\s\-\+\(\)]{7,20}$/.test(customerPhone)) newErrors.customerPhone = t('invalidPhoneFormat');

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit({ name: customerName, email: customerEmail, phone: customerPhone, message: customerNotes });
        }
    };

    const modalContentBg = isDarkBackground ? themeColorBackground : '#f4f4f4';
    const modalTextColor = isDarkBackground ? '#fff' : '#000';

    return (
        <div
            className={`fixed inset-0 bg-black bg-opacity-70 flex justify-center items-end transition-opacity duration-300 z-50 ${show ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
            onClick={onClose}
        >
            <div
                className="bg-white p-6 rounded-t-lg sm:rounded-lg shadow-lg w-full max-w-md transform transition-transform duration-300 translate-y-0"
                style={{ backgroundColor: modalContentBg, color: modalTextColor }}
                onClick={e => e.stopPropagation()}
            >
                <h3 className="text-xl font-bold mb-4" style={{ color: themeColorText }}>{t('confirmBooking')}</h3>
                <p className="mb-2" style={{ color: themeColorText }}>
                    {t('service')}: <span className="font-semibold">{bookingDetails.selectedService?.name}</span>
                </p>
                <p className="mb-2" style={{ color: themeColorText }}>
                    {t('date')}: <span className="font-semibold">{new Date(bookingDetails.selectedDate).toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </p>
                <p className="mb-4" style={{ color: themeColorText }}>
                    {t('time')}: <span className="font-semibold">{bookingDetails.selectedTime}</span>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium" style={{ color: themeColorText }}>{t('fullName')}</label>
                        <input
                            type="text"
                            id="name"
                            value={customerName}
                            onChange={(e) => { setCustomerName(e.target.value); setErrors(prev => ({ ...prev, customerName: null })); }}
                            className={`mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm ${errors.customerName ? 'is-invalid' : ''}`}
                            required
                        />
                        {errors.customerName && <span className="error-message">{errors.customerName}</span>}
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium" style={{ color: themeColorText }}>{t('email')}</label>
                        <input
                            type="email"
                            id="email"
                            value={customerEmail}
                            onChange={(e) => { setCustomerEmail(e.target.value); setErrors(prev => ({ ...prev, customerEmail: null })); }}
                            className={`mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm ${errors.customerEmail ? 'is-invalid' : ''}`}
                            required
                        />
                        {errors.customerEmail && <span className="error-message">{errors.customerEmail}</span>}
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium" style={{ color: themeColorText }}>{t('phoneOptional')}</label>
                        <input
                            type="tel"
                            id="phone"
                            value={customerPhone}
                            onChange={(e) => { setCustomerPhone(e.target.value); setErrors(prev => ({ ...prev, customerPhone: null })); }}
                            className={`mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm ${errors.customerPhone ? 'is-invalid' : ''}`}
                            required
                        />
                        {errors.customerPhone && <span className="error-message">{errors.customerPhone}</span>}
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium" style={{ color: themeColorText }}>{t('notesOptional')}</label>
                        <textarea
                            id="message"
                            value={customerNotes} // Changed from 'message' to 'customerNotes' for consistency
                            onChange={(e) => setCustomerNotes(e.target.value)}
                            rows="3"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 mt-4 rounded-lg font-bold text-white transition-colors duration-200"
                        style={{ backgroundColor: themeColorButton }}
                    >
                        {t('confirmBooking')}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-2 mt-2 rounded-lg font-bold border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                        style={{ color: themeColorText }}
                    >
                        {t('cancel')}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ConfirmationModal Component (Success Message)
const ConfirmationModal = ({ show, onClose, themeColorText, themeColorBackground }) => {
    const t = useTranslations('Common');
    const modalContentBg = themeColorBackground;
    const modalTextColor = themeColorText;

    return (
        <div className={`confirmation-overlay ${show ? 'active' : ''}`} onClick={onClose}>
            <div className="confirmation-overlay-content" style={{ backgroundColor: modalContentBg, color: modalTextColor }} onClick={e => e.stopPropagation()}>
                <button className="contact-modal-close" onClick={onClose} style={{ color: modalTextColor }}>&times;</button>
                <div className="mb-4">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: themeColorText }}>
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                    </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: themeColorText }}>{t('bookingConfirmed')}</h3>
                <p className="text-md mb-4" style={{ color: themeColorText }}>
                    {t('thankYouBookingReceived')}
                </p>
                <div className="booking-summary" style={{ backgroundColor: themeColorBackground }}>
                    {/* Summary will be dynamically inserted if needed */}
                </div>
                <button
                    onClick={onClose}
                    className="button btn-md mt-4"
                    style={{ backgroundColor: themeColorBackground, color: themeColorText, borderColor: themeColorText }}
                >
                    {t('close')}
                </button>
            </div>
        </div>
    );
};


// Main Booking Page Component
export default function BookingPage() {
    const businessProfile = useBusinessProfile();
    const router = useRouter();
    const tCommon = useTranslations('Common');
    const tBooking = useTranslations('Booking');

    const {
        businessData,
        themeVariables,
        isDarkBackground,
        themeColorText,
        themeColorBackground, // Added for modal styling
        themeColorButton,
    } = businessProfile;

    const [services, setServices] = useState([]);
    const [hasGeneralAvailability, setHasGeneralAvailability] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [selectedTime, setSelectedTime] = useState(null);
    const [isLoadingPage, setIsLoadingPage] = useState(true);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [slotErrorMessage, setSlotErrorMessage] = useState('');
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showLoadingModal, setShowLoadingModal] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!businessData?.business_id) {
                return;
            }
            setIsLoadingPage(true);
            try {
                const response = await fetch(`/api/booking/services?business_id=${businessData.business_id}`);
                const data = await response.json();
                if (response.ok) {
                    setServices(data.services);
                    setHasGeneralAvailability(data.hasGeneralAvailability);
                } else {
                    console.error('Failed to fetch services:', data.error);
                }
            } catch (error) {
                console.error('Error fetching initial booking data:', error);
            } finally {
                setIsLoadingPage(false);
            }
        };

        fetchInitialData();
    }, [businessData]);

    useEffect(() => {
        const fetchSlots = async () => {
            if (!selectedService || !selectedDate || !businessData?.business_id) {
                setAvailableTimeSlots([]);
                setSlotErrorMessage(tCommon('serviceSelectPlaceholder'));
                return;
            }

            setIsLoadingSlots(true);
            setSlotErrorMessage('');
            setAvailableTimeSlots([]);
            setSelectedTime(null);

            try {
                const response = await fetch(`/api/booking/slots?business_id=${businessData.business_id}&service_id=${selectedService.id}&date=${selectedDate}`);
                const data = await response.json();

                if (response.ok) {
                    if (data.slots && data.slots.length > 0) {
                        setAvailableTimeSlots(data.slots);
                    } else {
                        setAvailableTimeSlots([]);
                        setSlotErrorMessage(data.message || tCommon('noAvailability'));
                    }
                } else {
                    setAvailableTimeSlots([]);
                    setSlotErrorMessage(data.error || tCommon('errorFetchingAvailability'));
                }
            } catch (error) {
                console.error('Error fetching slots:', error);
                setSlotErrorMessage(tCommon('errorFetchingAvailability'));
            } finally {
                setIsLoadingSlots(false);
            }
        };

        fetchSlots();
    }, [selectedService, selectedDate, businessData, tCommon]);

    const handleServiceSelect = (service) => {
        setSelectedService(service);
        setSelectedTime(null);
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setSelectedTime(null);
    };

    const handleTimeSelect = (time) => {
        setSelectedTime(time);
    };

    const handleBookNow = () => {
        if (!selectedService) {
            alert(tCommon('pleaseSelectService'));
            return;
        }
        if (!selectedDate) {
            alert(tCommon('pleaseSelectDate'));
            return;
        }
        if (!selectedTime) {
            alert(tCommon('pleaseSelectTime'));
            return;
        }
        setShowBookingModal(true);
    };

    const handleSubmitBooking = async (customerDetails) => {
        setShowBookingModal(false);
        setShowLoadingModal(true);

        try {
            const response = await fetch('/api/booking/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessEmail: businessData.business_email,
                    customerEmail: customerDetails.email,
                    bookingDetails: {
                        businessId: businessData.business_id,
                        businessName: businessData.business_name,
                        serviceId: selectedService.id,
                        service: selectedService.name,
                        serviceDuration: selectedService.duration,
                        servicePrice: selectedService.price,
                        date: selectedDate,
                        time: selectedTime,
                        customerName: customerDetails.name,
                        customerPhone: customerDetails.phone,
                        customerMessage: customerDetails.message,
                    },
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setShowLoadingModal(false);
                setShowConfirmationModal(true);
                setSelectedService(null);
                setSelectedDate(new Date().toISOString().split('T')[0]);
                setSelectedTime(null);
            } else {
                setShowLoadingModal(false);
                alert(`${tCommon('errorBookingUnknown')}: ${result.message || result.error || ''}`);
            }
        } catch (error) {
            setShowLoadingModal(false);
            console.error('Error submitting booking:', error);
            alert(tCommon('errorNetworkBooking'));
        }
    };

    if (isLoading) {
        return <div className="text-center py-8" style={{ color: themeColorText || 'black' }}>{tCommon('loadingPage')}</div>;
    }

    if (!businessData) {
        return <div className="text-center py-8 text-red-500">{tCommon('errorBusinessDataNotAvailable')}</div>;
    }

    const headerBgColor = themeVariables?.['--theme-color-background'] || '#FFFFFF';
    const headerTextColor = themeVariables?.['--theme-color-text'] || '#000000';
    const lighterHeaderBgColor = themeVariables?.['--lighter-theme-color-background'] || '#F4F4F4';

    return (
        <div className="booking-page-container min-h-screen">
            <header className="booking-header w-full relative" style={{ backgroundColor: headerBgColor, color: headerTextColor }}>
                <div className="profile-cover w-full relative bg-gray-200 h-32 sm:h-40 md:h-40 lg:h-40">
                    {businessData.business_img_cover ? (
                        <Image
                            src={businessData.business_img_cover}
                            alt="Cover Photo"
                            fill
                            sizes="100vw"
                            className="object-cover"
                            priority
                        />
                    ) : (
                        <div className="cover-photo-placeholder w-full h-full" style={{ backgroundColor: lighterHeaderBgColor }}></div>
                    )}
                </div>

                <div className="container-profile-pic pic-lg relative mx-auto -translate-y-1/2 rounded-full overflow-hidden bg-gray-100"
                    style={{
                        width: '100px',
                        height: '100px',
                    }}>
                    {businessData.business_img_profile ? (
                        <Image
                            src={businessData.business_img_profile}
                            alt={`${businessData.business_name} Logo`}
                            fill
                            sizes="100px"
                            className="object-cover"
                            priority
                        />
                    ) : (
                        <div className="profile-image-placeholder w-full h-full" style={{ backgroundColor: lighterHeaderBgColor }}></div>
                    )}
                </div>

                <div className="container mx-auto max-w-3xl relative px-4 pb-4 mt-[-50px] text-center">
                    <p className="font-bold">{tBooking('headerTitle')}</p>
                    <h1 className="profile-club-name font-bold text-lg lg:text-lg leading-none">
                        {businessData.business_name}
                    </h1>
                    {businessData.business_address && (
                        <p className="mt-1 profile-club-location text-xs lg:text-sm">
                            {tBooking('headerLocation', { city: businessData.business_city, address: businessData.business_address })}
                        </p>
                    )}
                </div>
            </header>

            <section className="container mx-auto max-w-3xl px-4 py-8">
                <h2 className="text-2xl font-bold mb-4" style={{ color: themeColorText }}>{tCommon('selectService')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {services.map(service => (
                        <button
                            key={service.service_id}
                            className={`p-4 rounded-lg shadow-md text-left transition-all duration-200
                                ${selectedService?.service_id === service.service_id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}
                            onClick={() => handleServiceSelect(service)}
                        >
                            <h3 className="font-semibold text-lg">{service.service_name}</h3>
                            <p className="text-sm">{tCommon('duration')}: {service.duration_minutes} {tCommon('minutes')}</p>
                            <p className="font-bold text-md">{tCommon('price')}: €{service.price.toFixed(2)}</p>
                        </button>
                    ))}
                </div>

                {selectedService && (
                    <>
                        <h2 className="text-2xl font-bold mb-4" style={{ color: themeColorText }}>{tCommon('selectDate')}</h2>
                        <div className="grid grid-cols-3 gap-2 mb-8">
                            <Flatpickr
                                value={selectedDate}
                                onChange={([date]) => handleDateSelect(date.toISOString().split('T')[0])}
                                options={{
                                    dateFormat: "Y-m-d",
                                    minDate: "today",
                                }}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm col-span-3"
                                placeholder={tCommon('selectDate')}
                                required
                            />
                        </div>
                    </>
                )}

                {selectedDate && (
                    <>
                        <h2 className="text-2xl font-bold mb-4" style={{ color: themeColorText }}>{tCommon('selectTime')}</h2>
                        <div className="grid grid-cols-4 gap-2 mb-8">
                            {isLoadingSlots ? (
                                <p className="placeholder-text col-span-4">{tCommon('loadingAvailability')}</p>
                            ) : slotErrorMessage ? (
                                <p className={`placeholder-text ${slotErrorMessage.includes('Errore') ? 'error' : ''} col-span-4`}>{slotErrorMessage}</p>
                            ) : availableTimeSlots.length > 0 ? (
                                availableTimeSlots.map(time => (
                                    <button
                                        key={time}
                                        className={`p-2 rounded-md border text-sm transition-all duration-200
                                            ${selectedTime === time ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}
                                        onClick={() => handleTimeSelect(time)}
                                    >
                                        {time}
                                    </button>
                                ))
                            ) : (
                                <p className="placeholder-text col-span-4">{tCommon('noAvailability')}</p>
                            )}
                        </div>
                    </>
                )}

                {(selectedService && selectedDate && selectedTime) && (
                    <button
                        className="w-full py-3 mt-4 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
                        onClick={handleBookNow}
                    >
                        {tCommon('bookNow')}
                    </button>
                )}
            </section>

            {showBookingModal && (
                <BookingDetailsModal
                    show={showBookingModal}
                    onClose={() => setShowBookingModal(false)}
                    onSubmit={handleSubmitBooking}
                    bookingDetails={{ selectedService, selectedDate, selectedTime, businessName: businessData.business_name }}
                    themeColorText={themeColorText}
                    themeColorBackground={themeColorBackground}
                    themeColorButton={businessProfile.themeColorButton}
                    isDarkBackground={isDarkBackground}
                />
            )}

            {showLoadingModal && (
                <div className="modal-overlay show">
                    <div className="modal-content loading-content" style={{ backgroundColor: themeColorBackground, color: themeColorText }}>
                        <div className="spinner"></div>
                        <p className="text-sm">{tCommon('processingBooking')}</p>
                    </div>
                </div>
            )}

            {showConfirmationModal && (
                <ConfirmationModal
                    show={showConfirmationModal}
                    onClose={() => setShowConfirmationModal(false)}
                    themeColorText={themeColorText}
                    themeColorBackground={themeColorBackground}
                />
            )}
        </div>
    );
}
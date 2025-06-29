// src/components/profile/sections/booking/BookingPageClientContent.jsx

"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ServiceSelection from './ServiceSelection';
import DateTimeSelection from './DateTimeSelection';
import BookingConfirmationModal from './BookingConfirmationModal';
import { useTranslations } from 'next-intl';
import { format, parseISO } from 'date-fns';
import { useBusinessProfile } from '@/contexts/BusinessProfileContext'; // <<< ADD THIS IMPORT

export default function BookingPageClientContent({
    business,
    services: rawServices,
    categories: rawCategories // <--- ADDED: Accept categories prop here
    // locale // <<< REMOVED: No longer passed as a prop
}) {
    // Retrieve locale and other theme colors from context
    const { locale, themeColorBackground, themeColorButton, themeColorText } = useBusinessProfile(); // <<< GET LOCALE FROM CONTEXT

    const t = useTranslations('Booking'); // This hook will now implicitly use the locale from the context provider

    // Add console logs here to check what's coming in
    console.log("[BookingPageClientContent] Raw Services received:", rawServices);
    console.log("[BookingPageClientContent] Raw Categories received:", rawCategories);
    console.log("[BookingPageClientContent] Locale from context:", locale); // Confirm locale is available

    // State for booking flow
    const [step, setStep] = useState(1); // 1: Service Selection, 2: Date/Time Selection, 3: Confirmation
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDateTime, setSelectedDateTime] = useState(null); // { date: Date object, time: "HH:mm" string }
    const [totalOccupancyDuration, setTotalOccupancyDuration] = useState(0);

    // State for modal
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

    // Dynamic theme colors (already correctly pulled from 'business' prop, this is fine if business has priority)
    // const themeColorButton = business?.theme_color_button || '#4F46E5'; // If context has priority, remove these
    // const themeColorText = business?.theme_color_text || '#1F2937'; // and use themeColorButton, themeColorText from useBusinessProfile() directly.
    // Assuming 'business' prop contains the specific overrides, this might be intentional.

    // Process services and categories to group them - THIS IS CRUCIAL
    const { servicesByCategory, uncategorizedServices } = useMemo(() => {
        const byCategory = new Map();
        const uncategorized = [];

        const categoryMap = new Map(rawCategories?.map(cat => [cat.category_id, cat.category_name]) || []);

        rawServices?.forEach(service => {
            if (service.category_id !== null && categoryMap.has(service.category_id)) {
                const categoryName = categoryMap.get(service.category_id);
                if (!byCategory.has(categoryName)) {
                    byCategory.set(categoryName, []);
                }
                byCategory.get(categoryName).push(service);
            } else {
                uncategorized.push(service);
            }
        });

        const categorizedArray = Array.from(byCategory.entries()).map(([name, services]) => ({
            category_name: name,
            services: services,
        }));

        console.log("[BookingPageClientContent] Processed servicesByCategory:", categorizedArray);
        console.log("[BookingPageClientContent] Processed uncategorizedServices:", uncategorized);

        return { servicesByCategory: categorizedArray, uncategorizedServices: uncategorized };
    }, [rawServices, rawCategories]);


    // Handler for service selection
    const handleServiceSelect = useCallback((service) => {
        setSelectedService(service);
        setTotalOccupancyDuration(service.duration_minutes + (service.buffer_minutes || 0));
        setStep(2); // Move to date/time selection
    }, []);

    // Handler for date and time selection
    const handleDateTimeSelect = useCallback(({ date, time }) => {
        setSelectedDateTime({ date, time });
        setIsConfirmationModalOpen(true); // Open confirmation modal
    }, []);

    // Handler for confirming the booking
    const handleConfirmBooking = async () => {
        if (!selectedService || !selectedDateTime) {
            console.error("Booking details are incomplete.");
            throw new Error(t('incompleteBookingDetails'));
        }

        try {
            const bookingData = {
                businessId: business.business_id,
                serviceId: selectedService.service_id,
                customerEmail: 'test@example.com',
                customerName: 'Test User',
                customerPhone: '1234567890',
                bookingDate: format(selectedDateTime.date, 'yyyy-MM-dd'),
                bookingTime: selectedDateTime.time,
                totalPrice: selectedService.price,
            };

            const response = await fetch('/api/booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || t('bookingFailed'));
            }

            const result = await response.json();
            console.log("Booking confirmed:", result);

            alert(t('bookingSuccessful') + result.bookingReference);
            setIsConfirmationModalOpen(false);
            setStep(1);
            setSelectedService(null);
            setSelectedDateTime(null);

        } catch (error) {
            console.error("Error confirming booking:", error);
            throw error;
        }
    };

    const handleBack = useCallback(() => {
        setStep(prevStep => prevStep - 1);
        if (step === 2) {
            setSelectedDateTime(null);
        }
    }, [step]);


    return (
        <div className="container max-w-3xl mx-auto py-8 px-4">
            {step === 1 && (
                <ServiceSelection
                    servicesByCategory={servicesByCategory}
                    uncategorizedServices={uncategorizedServices}
                    categories={rawCategories}
                    onServiceSelect={handleServiceSelect}
                    themeColorText={themeColorText}
                    themeColorButton={themeColorButton}
                    locale={locale} // Still passing locale down to child components
                />
            )}

            {step === 2 && selectedService && (
                <DateTimeSelection
                    businessId={business.business_id}
                    totalOccupancyDuration={totalOccupancyDuration}
                    onDateTimeSelect={handleDateTimeSelect}
                    selectedDateTime={selectedDateTime}
                    themeColorText={themeColorText}
                    themeColorButton={themeColorButton}
                    locale={locale} // Still passing locale down to child components
                    onBack={handleBack}
                />
            )}

            {isConfirmationModalOpen && selectedService && selectedDateTime && (
                <BookingConfirmationModal
                    isOpen={isConfirmationModalOpen}
                    onClose={() => setIsConfirmationModalOpen(false)}
                    onConfirm={handleConfirmBooking}
                    bookingDetails={{ service: selectedService, selectedDateTime: selectedDateTime }}
                    themeColorButton={themeColorButton}
                    themeColorText={themeColorText}
                    locale={locale} // Still passing locale down to child components
                    businessName={business.business_name}
                />
            )}
        </div>
    );
}
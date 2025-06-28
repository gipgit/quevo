// src/components/profile/sections/booking/BookingPageClientContent.jsx

"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Import useMemo
import ServiceSelection from './ServiceSelection';
import DateTimeSelection from './DateTimeSelection';
import BookingConfirmationModal from './BookingConfirmationModal';
import { useTranslations } from 'next-intl';
import { format, parseISO } from 'date-fns';

export default function BookingPageClientContent({
    business,
    services: rawServices, // Renamed initialServices for clarity, as we'll process it
    categories: rawCategories, // <--- ADDED: Accept categories prop here
    locale // Passed from page.tsx (e.g., 'en-US', 'it', 'es')
}) {
    const t = useTranslations('Booking');

    // Add console logs here to check what's coming in
    console.log("[BookingPageClientContent] Raw Services received:", rawServices);
    console.log("[BookingPageClientContent] Raw Categories received:", rawCategories);

    // State for booking flow
    const [step, setStep] = useState(1); // 1: Service Selection, 2: Date/Time Selection, 3: Confirmation
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDateTime, setSelectedDateTime] = useState(null); // { date: Date object, time: "HH:mm" string }
    const [totalOccupancyDuration, setTotalOccupancyDuration] = useState(0);

    // State for modal
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

    // Dynamic theme colors
    const themeColorButton = business?.theme_color_button || '#4F46E5';
    const themeColorText = business?.theme_color_text || '#1F2937';

    // Process services and categories to group them - THIS IS CRUCIAL
    const { servicesByCategory, uncategorizedServices } = useMemo(() => {
        const byCategory = new Map();
        const uncategorized = []; // <-- Declared here

        // First, create a map for quick category name lookup
        // Ensure rawCategories is an array before mapping
        const categoryMap = new Map(rawCategories?.map(cat => [cat.category_id, cat.category_name]) || []);

        // Ensure rawServices is an array before iterating
        rawServices?.forEach(service => {
            // Check if service has a category_id and if that category exists in our map
            if (service.category_id !== null && categoryMap.has(service.category_id)) {
                const categoryName = categoryMap.get(service.category_id);
                if (!byCategory.has(categoryName)) {
                    byCategory.set(categoryName, []);
                }
                byCategory.get(categoryName).push(service);
            } else {
                // If no category_id or category not found, it's uncategorized
                uncategorized.push(service);
            }
        });

        // Convert Map to array of objects for easier rendering
        const categorizedArray = Array.from(byCategory.entries()).map(([name, services]) => ({
            category_name: name,
            services: services,
        }));

        console.log("[BookingPageClientContent] Processed servicesByCategory:", categorizedArray);
        console.log("[BookingPageClientContent] Processed uncategorizedServices:", uncategorized);

        // <--- THIS IS THE CRUCIAL LINE FIX:
        return { servicesByCategory: categorizedArray, uncategorizedServices: uncategorized };
    }, [rawServices, rawCategories]); // Recalculate only if rawServices or rawCategories change


    // Handler for service selection
    const handleServiceSelect = useCallback((service) => {
        setSelectedService(service);
        // Calculate total occupancy duration: service duration + buffer
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
                // customer details (you'd get this from authenticated user or a form)
                // For now, let's use placeholders
                customerEmail: 'test@example.com',
                customerName: 'Test User',
                customerPhone: '1234567890',
                bookingDate: format(selectedDateTime.date, 'yyyy-MM-dd'),
                bookingTime: selectedDateTime.time,
                totalPrice: selectedService.price,
                // We'll calculate booking_time_end in the API based on totalOccupancyDuration
                // status: 'pending' (default in DB)
                // staffId: null (for now, as we don't select staff)
            };

            const response = await fetch('/api/booking', { // This API route will be created next
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

            // Redirect to a confirmation page or show success message
            // router.push(`/booking/confirmation/${result.bookingReference}`); // Example redirect
            alert(t('bookingSuccessful') + result.bookingReference); // For now, an alert
            setIsConfirmationModalOpen(false); // Close modal
            setStep(1); // Reset flow
            setSelectedService(null);
            setSelectedDateTime(null);

        } catch (error) {
            console.error("Error confirming booking:", error);
            throw error; // Re-throw to be caught by the modal's error state
        }
    };

    const handleBack = useCallback(() => {
        setStep(prevStep => prevStep - 1);
        if (step === 2) { // If coming back from DateTimeSelection
            setSelectedDateTime(null);
        }
    }, [step]);


    return (
        <div className="container max-w-3xl mx-auto py-8 px-4">
            {step === 1 && (
                <ServiceSelection
                    // Pass the processed services and categories
                    servicesByCategory={servicesByCategory}
                    uncategorizedServices={uncategorizedServices}
                    categories={rawCategories} // Pass raw categories if ServiceSelection directly uses them
                    onServiceSelect={handleServiceSelect}
                    themeColorText={themeColorText}
                    themeColorButton={themeColorButton}
                    locale={locale}
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
                    locale={locale}
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
                    locale={locale}
                    businessName={business.business_name}
                />
            )}
        </div>
    );
}
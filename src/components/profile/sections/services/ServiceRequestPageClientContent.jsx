// src/components/profile/sections/services/ServiceRequestPageClientContent.jsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ServiceSelection from './ServiceSelection';
import DateTimeSelection from './DateTimeSelection';
import ServiceDetailsForm from './ServiceDetailsForm'; // New import
import { useTranslations } from 'next-intl';
import { format, parseISO } from 'date-fns';
import { useBusinessProfile } from '@/contexts/BusinessProfileContext';
import { useRouter } from 'next/navigation'; // Import useRouter
import Image from 'next/image'; // Import Next.js Image component
// import { useSession } from 'next-auth/react'; // Uncomment and import if using NextAuth.js or similar

export default function ServiceRequestPageClientContent({
    business,
    services: rawServices,
    categories: rawCategories
}) {
    const { locale, themeColorText, themeColorButton, themeColorBackgroundCard, themeColorBorder, themeColorBackground  } = useBusinessProfile();
    const t = useTranslations('ServiceRequest');
    const router = useRouter(); // Initialize useRouter
    // const { data: session } = useSession(); // Uncomment if using NextAuth.js


    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDateTime, setSelectedDateTime] = useState(null);
    const [totalOccupancyDuration, setTotalOccupancyDuration] = useState(0);

    const [serviceRequestStatusMessage, setServiceRequestStatusMessage] = useState(null);
    const [showStatusMessage, setShowStatusMessage] = useState(false);
    const [statusMessageType, setStatusMessageType] = useState('success'); // 'success' or 'error'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

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

        return { servicesByCategory: categorizedArray, uncategorizedServices: uncategorized };
    }, [rawServices, rawCategories]);


    const handleServiceSelect = useCallback((service) => {
        setSelectedService(service);
        setTotalOccupancyDuration(service.duration_minutes + (service.buffer_minutes || 0));

        // Conditionally move to step 2 or step 3 based on service.date_selection
        if (service.date_selection) {
            setStep(2); // Go to date and time selection
        } else {
            setSelectedDateTime(null); // Mark date and time as null
            setStep(3); // Go directly to service details form
        }
    }, []);

    const handleDateTimeSelect = useCallback(({ date, time }) => {
        console.log("ServiceRequestPageClientContent: Received date and time:", { date, time }); // <--- Add this line
        setSelectedDateTime({ date, time });
        setStep(3); // Advance to the new ServiceDetailsForm step
    }, []);

    // Updated handleConfirmServiceRequest to accept serviceItems and totalQuotationPrice
    const handleConfirmServiceRequest = async (customerDetails, serviceResponses, selectedServiceItems, totalQuotationPrice) => {
        if (!selectedService) {
            console.error("Service request details are incomplete.");
            throw new Error(t('incompleteServiceRequestDetails'));
        }

        // If date_selection is true, ensure selectedDateTime is not null
        if (selectedService.date_selection && !selectedDateTime) {
            console.error("Date and time selection is required for this service.");
            throw new Error(t('dateTimeRequired'));
        }

        try {
            // Show submitting overlay
            setIsSubmitting(true);
            setShowErrorModal(false);
            setErrorMessage('');

            // Determine customerUserId: If using NextAuth.js, it would be session?.user?.id
            // For now, it's illustrative. Replace with your actual auth integration.
            const customerUserId = null; // Default to null for guest service request
            // if (session?.user?.id) {
            //     customerUserId = session.user.id; // Example: assuming session.user.id holds the user's database ID
            // }

            // Ensure locale is a valid string before sending as a header
            const currentLocaleToSend = locale || 'en-US'; // Fallback to 'en-US' if locale is undefined or null

            const serviceRequestData = {
                serviceId: selectedService.service_id,
                customerName: customerDetails.customerName,
                customerEmail: customerDetails.customerEmail,
                customerPhone: customerDetails.customerPhone,
                customerNotes: customerDetails.customerNotes,
                requestDate: selectedDateTime ? format(selectedDateTime.date, 'yyyy-MM-dd') : null,
                requestTimeStart: selectedDateTime ? selectedDateTime.time : null,
                totalPrice: totalQuotationPrice,
                customerUserId: customerUserId,
                serviceResponses: {
                    confirmedRequirements: serviceResponses.confirmedRequirements,
                    questionResponses: serviceResponses.questionResponses,
                    checkboxResponses: serviceResponses.checkboxResponses,
                    selectedServiceItems: selectedServiceItems
                }
            };

            const response = await fetch(`/api/businesses/${business.business_id}/service-requests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-next-intl-locale': currentLocaleToSend,
                },
                body: JSON.stringify(serviceRequestData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                let errorMessage = errorData.error || t('serviceRequestFailed');
                
                // Add detailed error information if available
                if (errorData.details) {
                    errorMessage += `\n\n${errorData.details}`;
                }
                
                // Add usage information for limit errors
                if (errorData.errorType === 'MONTHLY_LIMIT_REACHED' && errorData.usage) {
                    errorMessage += `\n\nUsage: ${errorData.usage.current}/${errorData.usage.limit} (${errorData.usage.remaining} remaining)`;
                }
                
                throw new Error(errorMessage);
            }

            const result = await response.json();

            // Hide submitting overlay and show redirecting overlay
            setIsSubmitting(false);
            setIsRedirecting(true);

            // Redirect to the confirmation page using the URL from the API response
            router.push(result.confirmationPageUrl);

        } catch (error) {
            console.error("Error confirming service request:", error);
            
            // Hide submitting overlay and show error modal
            setIsSubmitting(false);
            setErrorMessage(error.message || t('serviceRequestFailed'));
            setShowErrorModal(true);
            
            throw error; // Re-throw to allow the form to catch and display the error
        }
    };

    const handleBack = useCallback(() => {
        setStep(prevStep => prevStep - 1);
        if (step === 2) {
            setSelectedDateTime(null); // Clear date/time if going back from date selection
        } else if (step === 3 && !selectedService?.date_selection) {
            // If coming back from ServiceDetailsForm and date_selection was false, go back to step 1
            setStep(1);
            setSelectedService(null); // Clear service selection if going back to step 1
        }
        // If coming back from ServiceDetailsForm and date_selection was true, stay at step 2
    }, [step, selectedService?.date_selection]);


    return (
        <div className="container max-w-3xl mx-auto min-h-[80vh] py-6 px-4 lg:px-8">
            {/* Full Screen Submitting Overlay */}
            {isSubmitting && (
                <div 
                    className="fixed inset-0 flex justify-center items-center z-50"
                    style={{ backgroundColor: themeColorBackground }}
                >
                    <div className="p-8 max-w-md w-full text-center">
                        <div className="relative mb-6">
                            {business.business_img_profile && (
                                <div className="w-24 h-24 rounded-full mx-auto overflow-hidden relative flex items-center justify-center">
                                    <div className="w-20 h-20 rounded-full overflow-hidden">
                                        <Image
                                            src={business.business_img_profile}
                                            alt="Business Profile"
                                            width={80}
                                            height={80}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                    <div 
                                        className="absolute inset-0 rounded-full border-2 border-transparent"
                                        style={{ 
                                            borderTopColor: themeColorButton,
                                            animation: 'spin 1s linear infinite'
                                        }}
                                    ></div>
                                </div>
                            )}
                        </div>
                        <h3 
                            className="text-xl font-semibold"
                            style={{ color: themeColorText }}
                        >
                            {t('submittingServiceRequest')}
                        </h3>
                    </div>
                </div>
            )}

            {/* Full Screen Redirecting Overlay */}
            {isRedirecting && (
                <div 
                    className="fixed inset-0 flex justify-center items-center z-50"
                    style={{ backgroundColor: themeColorBackground }}
                >
                    <div className="p-8 max-w-md w-full text-center">
                        <div className="relative mb-6">
                            {business.business_img_profile && (
                                <div className="w-24 h-24 rounded-full mx-auto overflow-hidden relative flex items-center justify-center">
                                    <div className="w-20 h-20 rounded-full overflow-hidden">
                                        <Image
                                            src={business.business_img_profile}
                                            alt="Business Profile"
                                            width={80}
                                            height={80}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                    <div 
                                        className="absolute inset-0 rounded-full border-2 border-transparent"
                                        style={{ 
                                            borderTopColor: themeColorButton,
                                            animation: 'spin 1s linear infinite'
                                        }}
                                    ></div>
                                </div>
                            )}
                        </div>
                        <h3 
                            className="text-xl font-semibold"
                            style={{ color: themeColorText }}
                        >
                            {t('redirectingToConfirmation')}
                        </h3>
                    </div>
                </div>
            )}

            {/* Error Modal */}
            {showErrorModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                        <div className="text-center mb-4">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('serviceRequestFailed')}</h3>
                            <p className="text-sm text-gray-500">{errorMessage}</p>
                        </div>
                        <div className="flex justify-center">
                            <button
                                onClick={() => setShowErrorModal(false)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md"
                            >
                                {t('ok')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {step === 1 && (
                <ServiceSelection
                    servicesByCategory={servicesByCategory}
                    uncategorizedServices={uncategorizedServices}
                    categories={rawCategories}
                    onServiceSelect={handleServiceSelect}
                    themeColorText={themeColorText}
                    themeColorBackgroundCard={themeColorBackgroundCard}
                    themeColorButton={themeColorButton} 
                    themeColorBorder={themeColorBorder} 
                    locale={locale}
                />
            )}

            {step === 2 && selectedService && selectedService.date_selection && (
                <DateTimeSelection
                    businessId={business.business_id}
                    totalOccupancyDuration={totalOccupancyDuration}
                    onDateTimeSelect={handleDateTimeSelect}
                    selectedDateTime={selectedDateTime}
                    themeColorText={themeColorText}
                    themeColorBackgroundCard={themeColorBackgroundCard}
                    themeColorButton={themeColorButton} 
                    themeColorBorder={themeColorBorder} 
                    locale={locale}
                    onBack={handleBack}
                />
            )}

            {/* Render ServiceDetailsForm if step is 3, regardless of date_selection */}
            {step === 3 && selectedService && (
                <ServiceDetailsForm
                    selectedService={selectedService}
                    selectedDateTime={selectedDateTime} // This can be null if date_selection is false
                    onConfirmServiceRequest={handleConfirmServiceRequest}
                    onBack={handleBack}
                    businessName={business.business_name}
                    themeColorText={themeColorText} 
                    themeColorBackgroundCard={themeColorBackgroundCard}
                    themeColorButton={themeColorButton}
                    themeColorBorder={themeColorBorder} 
                    locale={locale}
                />
            )}

            {showStatusMessage && (
                <div className={`mb-4 p-3 rounded-md text-center ${
                    statusMessageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {serviceRequestStatusMessage}
                </div>
            )}

        </div>
    );
}

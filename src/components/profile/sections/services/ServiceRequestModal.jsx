"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DateTimeSelection from './DateTimeSelection';
import ServiceItemsStep from './ServiceItemsStep';
import ServiceExtrasStep from './ServiceExtrasStep';
import RequirementsStep from './RequirementsStep';
import CustomerDetailsStep from './CustomerDetailsStep';
import EventSelectionStep from './EventSelectionStep';
import ServiceOverviewStep from './ServiceOverviewStep';
import { useTranslations } from 'next-intl';
import { format, parseISO } from 'date-fns';
import { useBusinessProfile } from '@/contexts/BusinessProfileContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// ServiceImage component for the left column
const ServiceImage = ({ serviceId, serviceName, businessPublicUuid }) => {
    const [imageError, setImageError] = useState(false);
    
    const imagePath = `/uploads/business/${businessPublicUuid}/services/${serviceId}.webp`;
    
    const handleImageError = () => {
        setImageError(true);
    };

    if (imageError) {
        return (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
        );
    }

    return (
        <Image
            src={imagePath}
            alt={serviceName}
            fill
            className="object-cover"
            onError={handleImageError}
        />
    );
};

export default function ServiceRequestModal({
    isOpen,
    onClose,
    selectedService,
    business,
    themeColorText,
    themeColorBackgroundCard,
    themeColorButton,
    themeColorBorder,
    themeColorBackground,
    locale
}) {
    const t = useTranslations('ServiceRequest');
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [selectedDateTime, setSelectedDateTime] = useState(null);
    const [totalOccupancyDuration, setTotalOccupancyDuration] = useState(0);
    const [serviceEvents, setServiceEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);

    // New state for the 3-step form data
    const [selectedServiceItems, setSelectedServiceItems] = useState({});
    const [totalQuotationPrice, setTotalQuotationPrice] = useState(0);
    const [selectedServiceExtras, setSelectedServiceExtras] = useState({});
    const [totalExtrasPrice, setTotalExtrasPrice] = useState(0);
    const [hasServiceExtras, setHasServiceExtras] = useState(false);
    const [confirmedRequirements, setConfirmedRequirements] = useState({});
    const [questionResponses, setQuestionResponses] = useState({});
    const [checkboxResponses, setCheckboxResponses] = useState({});
    const [customerDetails, setCustomerDetails] = useState(null);

    const [serviceRequestStatusMessage, setServiceRequestStatusMessage] = useState(null);
    const [showStatusMessage, setShowStatusMessage] = useState(false);
    const [statusMessageType, setStatusMessageType] = useState('success');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const fetchServiceEvents = useCallback(async (serviceId) => {
        setIsLoadingEvents(true);
        try {
            const response = await fetch(`/api/businesses/${business.business_id}/services/${serviceId}/events`);
            if (response.ok) {
                const data = await response.json();
                return { success: true, events: data.events || [] };
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('API Error:', response.status, errorData);
                return { success: false, error: `API Error: ${response.status}` };
            }
        } catch (error) {
            console.error('Error fetching service events:', error);
            return { success: false, error: 'Network error occurred' };
        } finally {
            setIsLoadingEvents(false);
        }
    }, [business.business_id]);

    // Function to determine the correct initial step based on service configuration
    const determineInitialStep = useCallback(async (service) => {
        // Always start with service overview (step 1)
        return 1;
    }, []);

    // Function to check if service items and requirements exist
    const checkServiceItemsAndRequirements = useCallback(async (service) => {
        try {
            const response = await fetch(`/api/businesses/${service.business_id}/services/${service.service_id}/details`);
            if (!response.ok) {
                throw new Error('Failed to fetch service details');
            }
            const data = await response.json();
            
            const hasServiceItems = (data.serviceItems || []).length > 0;
            const hasRequirements = (data.requirements || []).length > 0;
            const hasQuestions = (data.questions || []).length > 0;
            
            // Check for service extras
            const extrasResponse = await fetch(`/api/businesses/${service.business_id}/services/${service.service_id}/extras`);
            const hasExtras = extrasResponse.ok && (await extrasResponse.json()).extras?.length > 0;
            setHasServiceExtras(hasExtras);
            
            if (hasExtras) {
                return 5; // Service extras step
            } else if (hasServiceItems) {
                return 5; // Service items step (skip extras)
            } else if (hasRequirements || hasQuestions) {
                return 6; // Requirements step (skip extras and items)
            } else {
                return 7; // Customer details step (skip extras, items, and requirements)
            }
        } catch (error) {
            console.error('Error checking service details:', error);
            return 5; // Default to service items step (skip extras)
        }
    }, []);

    const handleServiceSelect = useCallback(async (service) => {
        console.log("handleServiceSelect called with service:", service);
        
        const initialStep = await determineInitialStep(service);
        setStep(initialStep);
    }, [determineInitialStep]);

    const handleServiceOverviewNext = useCallback(async () => {
        // Check if service has available_booking to determine next step
        if (selectedService.available_booking) {
            const result = await fetchServiceEvents(selectedService.service_id);
            
            if (!result.success) {
                setErrorMessage(result.error || t('failedToLoadEvents'));
                setShowErrorModal(true);
                return;
            }
            
            const events = result.events;
            setServiceEvents(events);
            
            if (events.length === 0) {
                // No events available, check if we can skip to requirements
                const nextStep = await checkServiceItemsAndRequirements(selectedService);
                setStep(nextStep);
            } else if (events.length === 1) {
                // One event found, set it as selected and go to date time selection
                const singleEvent = events[0];
                setSelectedEvent(singleEvent);
                const eventDuration = singleEvent.duration_minutes || 0;
                const eventBuffer = singleEvent.buffer_minutes || 0;
                setTotalOccupancyDuration(eventDuration + eventBuffer);
                setStep(3); // Date time selection
            } else {
                // Multiple events found, go to event selection step
                setStep(2); // Event selection
            }
        } else {
            // No date selection required, check if we can skip to requirements
            const nextStep = await checkServiceItemsAndRequirements(selectedService);
            setStep(nextStep);
        }
    }, [selectedService, fetchServiceEvents, checkServiceItemsAndRequirements, t]);

    const handleEventSelect = useCallback((event) => {
        setSelectedEvent(event);
        // Update totalOccupancyDuration based on the selected event's duration and buffer only
        const eventDuration = event.duration_minutes || 0;
        const eventBuffer = event.buffer_minutes || 0;
        setTotalOccupancyDuration(eventDuration + eventBuffer);
        setStep(3); // Go to date time selection with the selected event
    }, []);

    const handleDateTimeSelect = useCallback(({ date, time }) => {
        setSelectedDateTime({ date, time });
        setStep(5); // Always go to step 5, which will show extras or items based on hasServiceExtras state
    }, []);

    // New handlers for the 3-step form
    const handleServiceExtrasNext = useCallback(({ selectedExtras, totalExtrasPrice: price }) => {
        setSelectedServiceExtras(selectedExtras);
        setTotalExtrasPrice(price);
        setStep(6); // Go to next step (items or requirements)
    }, []);

    const handleServiceExtrasSkip = useCallback(() => {
        setStep(6); // Skip to next step (items or requirements)
    }, []);

    const handleServiceItemsNext = useCallback(({ selectedServiceItems: items, totalQuotationPrice: price }) => {
        setSelectedServiceItems(items);
        setTotalQuotationPrice(price);
        setStep(6); // Go to requirements step
    }, []);

    const handleServiceItemsSkip = useCallback(() => {
        setStep(6); // Skip to requirements step
    }, []);

    const handleRequirementsNext = useCallback(({ confirmedRequirements: reqs, questionResponses: qResps, checkboxResponses: cResps }) => {
        setConfirmedRequirements(reqs);
        setQuestionResponses(qResps);
        setCheckboxResponses(cResps);
        setStep(7); // Go to customer details step
    }, []);



    const handleConfirmServiceRequest = useCallback(async (customerDetails) => {
        if (!selectedService) {
            console.error("Service request details are incomplete. selectedService is null/undefined");
            setErrorMessage(t('incompleteServiceRequestDetails'));
            setShowErrorModal(true);
            return;
        }

        // Check if there are any required events that need date/time selection
        const hasRequiredEvents = serviceEvents && serviceEvents.some(event => event.is_required);
        if (hasRequiredEvents && !selectedDateTime) {
            console.error("Date and time selection is required for this service.");
            throw new Error(t('dateTimeRequired'));
        }

        try {
            // Show submitting overlay
            setIsSubmitting(true);
            setShowErrorModal(false);
            setErrorMessage('');

            const customerUserId = null; // Default to null for guest service request
            const currentLocaleToSend = locale || 'en-US';

            // Convert selectedServiceItems object to array for API
            const selectedServiceItemsArray = Object.values(selectedServiceItems || {});
            const selectedServiceExtrasArray = Object.values(selectedServiceExtras || {});

            const serviceRequestData = {
                serviceId: selectedService.service_id,
                customerName: customerDetails.customerName,
                customerEmail: customerDetails.customerEmail,
                customerPhone: customerDetails.customerPhone,
                customerNotes: customerDetails.customerNotes,
                requestDate: selectedDateTime ? format(selectedDateTime.date, 'yyyy-MM-dd') : null,
                requestTimeStart: selectedDateTime ? selectedDateTime.time : null,
                totalPrice: totalQuotationPrice + totalExtrasPrice,
                customerUserId: customerUserId,
                eventId: selectedEvent ? selectedEvent.event_id : null,
                serviceResponses: {
                    confirmedRequirements: confirmedRequirements,
                    questionResponses: questionResponses,
                    checkboxResponses: checkboxResponses,
                    selectedServiceItems: selectedServiceItemsArray,
                    selectedServiceExtras: selectedServiceExtrasArray
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
                console.error("API Error Response:", { status: response.status, errorData });
                let errorMessage = errorData.error || t('serviceRequestFailed');
                
                if (errorData.details) {
                    errorMessage += `\n\n${errorData.details}`;
                }
                
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
            setErrorMessage(error.message);
            setShowErrorModal(true);
        }
    }, [selectedService, selectedDateTime, totalQuotationPrice, totalExtrasPrice, confirmedRequirements, questionResponses, checkboxResponses, selectedServiceItems, selectedServiceExtras, serviceEvents, business.business_id, locale, t, router]);

    const handleCustomerDetailsConfirm = useCallback(async (details) => {
        // Safeguard: Check if selectedService is still available
        if (!selectedService) {
            console.error("selectedService is null in handleCustomerDetailsConfirm");
            setErrorMessage(t('incompleteServiceRequestDetails'));
            setShowErrorModal(true);
            return;
        }
        
        setCustomerDetails(details);
        // Now we have all the data, submit the service request
        await handleConfirmServiceRequest(details);
    }, [handleConfirmServiceRequest, selectedService, t]);

    const handleBack = useCallback(() => {
        if (step === 1) {
            // Going back from service overview - close modal
            onClose();
        } else if (step === 2) {
            // Going back from event selection to service overview
            setStep(1);
            setSelectedEvent(null);
            setServiceEvents([]);
        } else if (step === 3) {
            // Going back from date time selection to event selection (if multiple events) or service overview
            if (serviceEvents.length > 1) {
                setStep(2);
                setSelectedEvent(null);
            } else {
                setStep(1);
                setSelectedEvent(null);
                setServiceEvents([]);
            }
        } else if (step === 5) {
            // Going back from service extras/items to date time selection (if available_booking) or service overview
            if (selectedService && selectedService.available_booking) {
                setStep(3);
                setSelectedDateTime(null);
            } else {
                setStep(1);
                setSelectedEvent(null);
                setServiceEvents([]);
            }
        } else if (step === 6) {
            // Going back from requirements to service items/extras
            setStep(5); // Back to step 5 (extras or items based on hasServiceExtras state)
        } else if (step === 7) {
            // Going back from customer details to requirements
            setStep(6);
        }
    }, [step, serviceEvents.length, selectedService, onClose]);

    const handleCloseModal = useCallback(() => {
        onClose();
        // Reset all state
        setStep(1);
        setSelectedDateTime(null);
        setSelectedEvent(null);
        setServiceEvents([]);
        
        // Reset form data
        setSelectedServiceItems({});
        setTotalQuotationPrice(0);
        setSelectedServiceExtras({});
        setTotalExtrasPrice(0);
        setHasServiceExtras(false);
        setConfirmedRequirements({});
        setQuestionResponses({});
        setCheckboxResponses({});
        setCustomerDetails(null);
        
        setShowErrorModal(false);
        setErrorMessage('');
        setIsSubmitting(false);
        setIsRedirecting(false);
    }, [onClose]);

         // Reset state when modal opens - moved after all function definitions
     useEffect(() => {
         if (isOpen && selectedService) {
             setStep(1); // Start with service overview step
             setSelectedDateTime(null);
             setTotalOccupancyDuration(0);
             setSelectedEvent(null);
             setServiceEvents([]);
             
             // Reset form data
             setSelectedServiceItems({});
             setTotalQuotationPrice(0);
             setSelectedServiceExtras({});
             setTotalExtrasPrice(0);
             setHasServiceExtras(false);
             setConfirmedRequirements({});
             setQuestionResponses({});
             setCheckboxResponses({});
             setCustomerDetails(null);
             
             setShowErrorModal(false);
             setErrorMessage('');
         }
     }, [isOpen, selectedService]);

    if (!isOpen || !selectedService) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50 p-2 lg:p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                {/* Modal Header */}
                <div className="flex justify-between items-center py-2 lg:py-4 px-6 border-b border-gray-200">
                    <h2 className="text-lg lg:text-2xl font-semibold">
                        {selectedService.service_name}
                    </h2>
                    <button
                        onClick={handleCloseModal}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Modal Content */}
                <div className="flex flex-col lg:flex-row h-full max-h-[calc(90vh-80px)]">
                    {/* Left Column - Service Image (Always Visible) */}
                    <div className="lg:w-1/3 p-0 lg:p-6">
                        <div className="w-full h-[80px] lg:h-[500px] lg:rounded-2xl overflow-hidden bg-gray-100 relative">
                            <ServiceImage 
                                serviceId={selectedService.service_id} 
                                serviceName={selectedService.service_name}
                                businessPublicUuid={business.business_public_uuid}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/20 to-transparent"></div>
                        </div>
                    </div>

                                         {/* Right Column - Step Content */}
                     <div className="lg:w-2/3 overflow-y-auto">
                         {/* Service Overview Step */}
                         {step === 1 && selectedService && (
                             <ServiceOverviewStep
                                 selectedService={selectedService}
                                 onNext={handleServiceOverviewNext}
                                 onBack={handleBack}
                                 themeColorText={themeColorText}
                                 themeColorBackgroundCard={themeColorBackgroundCard}
                                 themeColorButton={themeColorButton}
                                 themeColorBorder={themeColorBorder}
                             />
                         )}

                         {/* Event Selection Step */}
                         {step === 2 && selectedService && !isLoadingEvents && serviceEvents.length > 1 && (
                            <EventSelectionStep
                                serviceEvents={serviceEvents}
                                selectedEvent={selectedEvent}
                                onEventSelect={handleEventSelect}
                                themeColorText={themeColorText}
                                themeColorBackgroundCard={themeColorBackgroundCard}
                                themeColorButton={themeColorButton}
                                themeColorBorder={themeColorBorder}
                            />
                        )}

                                                 {/* Date Time Selection Step */}
                         {step === 3 && selectedService && selectedService.available_booking && selectedEvent && (
                             <DateTimeSelection
                                 businessId={business.business_id}
                                 totalOccupancyDuration={totalOccupancyDuration}
                                 onDateTimeSelect={handleDateTimeSelect}
                                 selectedDateTime={selectedDateTime}
                                 selectedEvent={selectedEvent}
                                 themeColorText={themeColorText}
                                 themeColorBackgroundCard={themeColorBackgroundCard}
                                 themeColorButton={themeColorButton} 
                                 themeColorBorder={themeColorBorder} 
                                 locale={locale}
                                 onBack={serviceEvents.length > 1 ? handleBack : undefined}
                                                                   onSkip={() => setStep(5)}
                             />
                         )}

                                                 {/* Service Extras Step */}
                         {step === 5 && selectedService && hasServiceExtras && (
                             <ServiceExtrasStep
                                 selectedService={selectedService}
                                 onNext={handleServiceExtrasNext}
                                 onSkip={handleServiceExtrasSkip}
                                 onBack={handleBack}
                                 themeColorText={themeColorText}
                                 themeColorBackgroundCard={themeColorBackgroundCard}
                                 themeColorButton={themeColorButton}
                                 themeColorBorder={themeColorBorder}
                             />
                         )}

                         {/* Service Items Step */}
                         {step === 5 && selectedService && !hasServiceExtras && (
                             <ServiceItemsStep
                                 selectedService={selectedService}
                                 onNext={handleServiceItemsNext}
                                 onSkip={handleServiceItemsSkip}
                                 onBack={handleBack}
                                 themeColorText={themeColorText}
                                 themeColorBackgroundCard={themeColorBackgroundCard}
                                 themeColorButton={themeColorButton}
                                 themeColorBorder={themeColorBorder}
                             />
                         )}

                         {/* Requirements Step */}
                         {step === 6 && selectedService && (
                             <RequirementsStep
                                 selectedService={selectedService}
                                 onNext={handleRequirementsNext}
                                 onBack={handleBack}
                                 themeColorText={themeColorText}
                                 themeColorBackgroundCard={themeColorBackgroundCard}
                                 themeColorButton={themeColorButton}
                                 themeColorBorder={themeColorBorder}
                             />
                         )}

                         {/* Customer Details Step */}
                         {step === 7 && selectedService && (
                            <CustomerDetailsStep
                                onConfirm={handleCustomerDetailsConfirm}
                                onBack={handleBack}
                                themeColorText={themeColorText}
                                themeColorBackgroundCard={themeColorBackgroundCard}
                                themeColorButton={themeColorButton}
                                themeColorBorder={themeColorBorder}
                            />
                        )}
                        
                        
                    </div>
                </div>

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
            </div>
        </div>
    );
}

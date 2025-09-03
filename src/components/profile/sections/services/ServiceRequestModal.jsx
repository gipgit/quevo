"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DateTimeSelection from './DateTimeSelection';
import ServiceItemsStep from './ServiceItemsStep';
import ServiceExtrasStep from './ServiceExtrasStep';
import RequirementsStep from './RequirementsStep';
import QuestionsStep from './QuestionsStep';
import CustomerDetailsStep from './CustomerDetailsStep';
import EventSelectionStep from './EventSelectionStep';
import ServiceOverviewStep from './ServiceOverviewStep';
import { useTranslations } from 'next-intl';
import { format, parseISO } from 'date-fns';
import { useBusinessProfile } from '@/contexts/BusinessProfileContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// ServiceImage component for the left column
const ServiceImage = ({ serviceId, serviceName, businessPublicUuid, demo, hasImage, themeColorBackgroundCard, themeColorButton }) => {
    const [imageError, setImageError] = useState(false);
    
    // If has_image is false, show fallback instead of trying to fetch image
    if (hasImage === false) {
        return (
            <div className="w-full h-full" style={{ 
                background: `linear-gradient(135deg, ${themeColorBackgroundCard} 0%, ${themeColorButton} 100%)` 
            }}>
            </div>
        );
    }
    
    const getImageUrl = () => {
        if (!serviceId || !businessPublicUuid) return null;
        
        if (demo) {
            // Local path for demo services
            return `/uploads/business/${businessPublicUuid}/service/${serviceId}.webp`;
        } else {
            // R2 path for production services
            const publicDomain = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_DOMAIN;
            if (publicDomain) {
                return `${publicDomain}/business/${businessPublicUuid}/service/${serviceId}.webp`;
            } else {
                // Fallback to R2 endpoint
                const accountId = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_ACCOUNT_ID;
                return `https://${accountId}.r2.cloudflarestorage.com/business/${businessPublicUuid}/service/${serviceId}.webp`;
            }
        }
    };

    const imageUrl = getImageUrl();
    
    const handleImageError = () => {
        setImageError(true);
    };

    if (!imageUrl || imageError) {
        return (
            <div className="w-full h-full" style={{ 
                background: `linear-gradient(135deg, ${themeColorBackgroundCard} 0%, ${themeColorButton} 100%)` 
            }}>
            </div>
        );
    }

    return (
        <Image
            src={imageUrl}
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

    // Add state for enriched service details
    const [enrichedServiceDetails, setEnrichedServiceDetails] = useState(null);

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

    // Function to fetch enriched service details
    const fetchEnrichedServiceDetails = useCallback(async (service) => {
        try {
            const response = await fetch(`/api/businesses/${service.business_id}/services/${service.service_id}/details`);
            if (!response.ok) {
                throw new Error('Failed to fetch service details');
            }
            const data = await response.json();
            
            // Merge the original service data with the enriched details
            const enrichedService = {
                ...service,
                ...data.service // This includes consent fields and other details
            };
            
            console.log('Enriched service details:', enrichedService);
            setEnrichedServiceDetails(enrichedService);
            return enrichedService;
        } catch (error) {
            console.error('Error fetching enriched service details:', error);
            return service; // Fallback to original service data
        }
    }, []);

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
            
            // Use the has_items and has_extras fields from the service data
            const hasServiceItems = data.service?.has_items || false;
            const hasExtras = data.service?.has_extras || false;
            const hasRequirements = (data.requirements || []).length > 0;
            const hasQuestions = (data.questions || []).length > 0;
            
            setHasServiceExtras(hasExtras);
            

            
            if (hasServiceItems) {
                return 2; // Service items step
            } else if (hasExtras) {
                return 3; // Service extras step (skip items)
            } else if (hasRequirements || hasQuestions) {
                return 4; // Requirements step (skip items and extras)
            } else {
                return 5; // Event selection step (skip items, extras, and requirements)
            }
        } catch (error) {
            console.error('Error checking service details:', error);
            return 2; // Default to service items step
        }
    }, []);

    const handleServiceSelect = useCallback(async (service) => {
        console.log("handleServiceSelect called with service:", service);
        
        const initialStep = await determineInitialStep(service);
        setStep(initialStep);
    }, [determineInitialStep]);

    const handleServiceOverviewNext = useCallback(async () => {
        // Always go to the next step based on service configuration
        const nextStep = await checkServiceItemsAndRequirements(selectedService);
        setStep(nextStep);
    }, [selectedService, checkServiceItemsAndRequirements]);

    const handleEventSelect = useCallback((event) => {
        setSelectedEvent(event);
        // Update totalOccupancyDuration based on the selected event's duration and buffer only
        const eventDuration = event.duration_minutes || 0;
        const eventBuffer = event.buffer_minutes || 0;
        setTotalOccupancyDuration(eventDuration + eventBuffer);
        setStep(7); // Go to date time selection with the selected event
    }, []);

    const handleDateTimeSelect = useCallback(async ({ dateTimes }) => {
        // Store the simplified format
        setSelectedDateTime({ 
            dateTimes: dateTimes || [] // Array of ISO 8601 strings
        });
        setStep(8); // Go to customer details step
    }, []);

    // New handlers for the 3-step form
    const handleServiceExtrasNext = useCallback(({ selectedServiceExtras: extras, totalExtrasPrice: price }) => {
        setSelectedServiceExtras(extras);
        setTotalExtrasPrice(price);
        setStep(4); // Go to requirements step
    }, []);

    const handleServiceExtrasSkip = useCallback(() => {
        setStep(4); // Skip to requirements step
    }, []);

    const handleServiceItemsNext = useCallback(async ({ selectedServiceItems: items, totalQuotationPrice: price }) => {
        setSelectedServiceItems(items);
        setTotalQuotationPrice(price);
        
        // Check if service has extras to determine next step
        if (enrichedServiceDetails?.has_extras) {
            setStep(3); // Go to service extras step
        } else {
            setStep(4); // Skip to requirements step
        }
    }, [enrichedServiceDetails]);

    const handleServiceItemsSkip = useCallback(async () => {
        // Check if service has extras to determine next step
        if (enrichedServiceDetails?.has_extras) {
            setStep(3); // Skip to service extras step
        } else {
            setStep(4); // Skip to requirements step
        }
    }, [enrichedServiceDetails]);

    const handleRequirementsNext = useCallback(async ({ confirmedRequirements: reqs }) => {
        setConfirmedRequirements(reqs);
        
        // Go to questions step
        setStep(5);
    }, []);

    const handleQuestionsNext = useCallback(async ({ questionResponses: qResps, checkboxResponses: cResps }) => {
        setQuestionResponses(qResps);
        setCheckboxResponses(cResps);
        
        // Check if service has active_booking to determine next step
        if (selectedService.active_booking) {
            const result = await fetchServiceEvents(selectedService.service_id);
            
            if (!result.success) {
                setErrorMessage(result.error || t('failedToLoadEvents'));
                setShowErrorModal(true);
                return;
            }
            
            const events = result.events;
            setServiceEvents(events);
            
            if (events.length === 0) {
                // No events available, go directly to customer details
                setStep(8);
            } else if (events.length === 1) {
                // One event found, set it as selected and go to date time selection
                const singleEvent = events[0];
                setSelectedEvent(singleEvent);
                const eventDuration = singleEvent.duration_minutes || 0;
                const eventBuffer = singleEvent.buffer_minutes || 0;
                setTotalOccupancyDuration(eventDuration + eventBuffer);
                setStep(7); // Date time selection
            } else {
                // Multiple events found, go to event selection step
                setStep(6); // Event selection
            }
        } else {
            // No date selection required, go directly to customer details
            setStep(8);
        }
    }, [selectedService, fetchServiceEvents, t]);



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
                // Use simplified datetime format
                requestDateTimes: selectedDateTime?.dateTimes || [],
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
            // Going back from service items to service overview
            setStep(1);
        } else if (step === 3) {
            // Going back from service extras to service items
                setStep(2);
        } else if (step === 4) {
            // Going back from requirements to service extras (if available) or service items
            if (hasServiceExtras) {
                setStep(3);
            } else {
                setStep(2);
            }
        } else if (step === 5) {
            // Going back from questions to requirements
            setStep(4);
        } else if (step === 6) {
            // Going back from event selection to questions
            setStep(5);
        } else if (step === 7) {
            // Going back from date time selection to event selection (if multiple events) or questions
            if (serviceEvents.length > 1) {
                setStep(6);
                setSelectedEvent(null);
            } else {
                setStep(5);
                setSelectedEvent(null);
                setServiceEvents([]);
            }
        } else if (step === 8) {
            // Going back from customer details to date time selection
            setStep(7);
        }
    }, [step, serviceEvents.length, hasServiceExtras, onClose]);

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
        setEnrichedServiceDetails(null);
        
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
              setEnrichedServiceDetails(null);
             
             setShowErrorModal(false);
             setErrorMessage('');
              
              // Fetch enriched service details
              fetchEnrichedServiceDetails(selectedService);
         }
      }, [isOpen, selectedService, fetchEnrichedServiceDetails]);

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
                                demo={selectedService.demo}
                                hasImage={selectedService.has_image}
                                themeColorBackgroundCard={themeColorBackgroundCard}
                                themeColorButton={themeColorButton}
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

                                                   {/* Service Items Step */}
                          {step === 2 && selectedService && (
                              <ServiceItemsStep
                                  selectedService={enrichedServiceDetails || selectedService}
                                  onNext={handleServiceItemsNext}
                                  onSkip={handleServiceItemsSkip}
                                  onBack={handleBack}
                                  themeColorText={themeColorText}
                                  themeColorBackgroundCard={themeColorBackgroundCard}
                                  themeColorButton={themeColorButton}
                                  themeColorBorder={themeColorBorder}
                              />
                          )}

                          {/* Service Extras Step */}
                          {step === 3 && selectedService && (
                              <ServiceExtrasStep
                                  selectedService={enrichedServiceDetails || selectedService}
                                  onNext={handleServiceExtrasNext}
                                  onSkip={handleServiceExtrasSkip}
                                  onBack={handleBack}
                                  themeColorText={themeColorText}
                                  themeColorBackgroundCard={themeColorBackgroundCard}
                                  themeColorButton={themeColorButton}
                                  themeColorBorder={themeColorBorder}
                              />
                          )}

                                                   {/* Requirements Step */}
                         {step === 4 && selectedService && (
                             <RequirementsStep
                                 selectedService={enrichedServiceDetails || selectedService}
                                 onNext={handleRequirementsNext}
                                onBack={handleBack}
                                 themeColorText={themeColorText}
                                 themeColorBackgroundCard={themeColorBackgroundCard}
                                 themeColorButton={themeColorButton}
                                 themeColorBorder={themeColorBorder}
                             />
                         )}

                         {/* Questions Step */}
                         {step === 5 && selectedService && (
                             <QuestionsStep
                                 selectedService={enrichedServiceDetails || selectedService}
                                 onNext={handleQuestionsNext}
                                 onSkip={handleQuestionsNext}
                                 onBack={handleBack}
                                 themeColorText={themeColorText}
                                 themeColorBackgroundCard={themeColorBackgroundCard}
                                 themeColorButton={themeColorButton}
                                 themeColorBorder={themeColorBorder}
                             />
                         )}

                         {/* Event Selection Step */}
                          {step === 6 && selectedService && !isLoadingEvents && serviceEvents.length > 1 && (
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
                          {step === 7 && selectedService && selectedService.active_booking && selectedEvent && (
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
                                  onSkip={() => setStep(8)}
                             />
                         )}

                         {/* Customer Details Step */}
                         {step === 8 && selectedService && (
                            <CustomerDetailsStep
                                  selectedService={enrichedServiceDetails || selectedService}
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

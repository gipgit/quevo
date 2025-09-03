"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import LoadingSpinner from '../../../ui/LoadingSpinner';

// Import specific date-fns locales for client-side use
import enUS from 'date-fns/locale/en-US';
import it from 'date-fns/locale/it';
// Add any other locales you might use, e.g., import es from 'date-fns/locale/es';

// Create a mapping object for date-fns locales
const dateFnsLocales = {
    'en-US': enUS,
    'it': it,
    // Add other locales here
};

export default function ServiceDetailsForm({
    selectedService,
    selectedDateTime, // This can now be null
    onConfirmServiceRequest, // This function will now receive selected service items and total price
    onBack,
    businessName,
    themeColorText,
    themeColorBackgroundCard,
    themeColorButton,
    themeColorBorder,
    locale
}) {
    const t = useTranslations('ServiceRequest');
    const tCommon = useTranslations('Common');

    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerNotes, setCustomerNotes] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState(null);

    // Consent fields
    const [newsletterConsent, setNewsletterConsent] = useState(false);
    const [pdpConsent, setPdpConsent] = useState(false);

    const [service, setService] = useState(null); // Service details from API
    const [requirements, setRequirements] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [serviceItems, setServiceItems] = useState([]); // New state for service items
    // Changed key from itemId to serviceItemId to match Prisma schema
    const [selectedServiceItems, setSelectedServiceItems] = useState({}); // { serviceItemId: { quantity: number, price_base: number, price_type: string, item_name: string } }
    const [totalQuotationPrice, setTotalQuotationPrice] = useState(0); // New state for total price

    const [isLoadingDetails, setIsLoadingDetails] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    // State for customer responses
    const [confirmedRequirements, setConfirmedRequirements] = useState({}); // { requirement_block_id: boolean }
    const [questionResponses, setQuestionResponses] = useState({}); // { question_id: string (for open_text/media_url) }
    const [checkboxResponses, setCheckboxResponses] = useState({}); // { question_id: [option_id1, option_id2] }

    const [submissionError, setSubmissionError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDescription, setShowDescription] = useState(false);

    // Effect to check authentication and fetch user data
    useEffect(() => {
        const checkAuthAndFetchUserData = async () => {
            try {
                // Check if user is authenticated by making a request to a protected endpoint
                const response = await fetch('/api/auth/check-session');
                if (response.ok) {
                    const sessionData = await response.json();
                    if (sessionData.user?.id) {
                        setIsLoggedIn(true);
                        setUserRole(sessionData.user.role);
                        
                        // Fetch user data based on role
                        if (sessionData.user.role === 'customer') {
                            const userResponse = await fetch(`/api/user/customer/${sessionData.user.id}`);
                            if (userResponse.ok) {
                                const userData = await userResponse.json();
                                setCustomerName(`${userData.name_first || ''} ${userData.name_last || ''}`.trim());
                                setCustomerEmail(userData.email || '');
                                setCustomerPhone(userData.phone || '');
                            }
                        } else if (sessionData.user.role === 'manager') {
                            const userResponse = await fetch(`/api/user/manager/${sessionData.user.id}`);
                            if (userResponse.ok) {
                                const userData = await userResponse.json();
                                setCustomerName(`${userData.name_first || ''} ${userData.name_last || ''}`.trim());
                                setCustomerEmail(userData.email || '');
                                setCustomerPhone(userData.tel || '');
                            }
                        }
                    } else {
                        setIsLoggedIn(false);
                        setUserRole(null);
                    }
                } else {
                    setIsLoggedIn(false);
                    setUserRole(null);
                }
            } catch (error) {
                console.error('Error checking authentication:', error);
                setIsLoggedIn(false);
                setUserRole(null);
            }
        };

        checkAuthAndFetchUserData();
    }, []);

    // Effect to fetch service details including items
    useEffect(() => {
        const fetchServiceDetails = async () => {
            setIsLoadingDetails(true);
            setFetchError(null);
            try {
                const response = await fetch(`/api/businesses/${selectedService.business_id}/services/${selectedService.service_id}/details`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || t('errorFetchingServiceDetails'));
                }
                const data = await response.json();

                setService(data.service);
                setRequirements(data.requirements);
                setQuestions(data.questions);
                setServiceItems(data.serviceItems);

                // Initialize response states for requirements and questions
                const initialConfirmedRequirements = {};
                data.requirements.forEach(req => {
                    initialConfirmedRequirements[req.requirement_block_id] = false;
                });
                setConfirmedRequirements(initialConfirmedRequirements);

                const initialQuestionResponses = {};
                data.questions.filter(q => q.question_type !== 'checkbox_multi' && q.question_type !== 'checkbox_single').forEach(q => {
                    initialQuestionResponses[q.question_id] = '';
                });
                setQuestionResponses(initialQuestionResponses);

                const initialCheckboxResponses = {};
                data.questions.filter(q => q.question_type === 'checkbox_multi' || q.question_type === 'checkbox_single').forEach(q => {
                    initialCheckboxResponses[q.question_id] = q.question_type === 'checkbox_single' ? null : [];
                });
                setCheckboxResponses(initialCheckboxResponses);

                // Initialize selectedServiceItems: assuming all are optional and start unselected.
                const initialSelectedItems = {};
                setSelectedServiceItems(initialSelectedItems);

            } catch (err) {
                console.error("Error fetching service details:", err);
                setFetchError(err.message || t('errorFetchingServiceDetails'));
            } finally {
                setIsLoadingDetails(false);
            }
        };

        if (selectedService?.service_id && selectedService?.business_id) {
            fetchServiceDetails();
        }
    }, [selectedService?.service_id, t]);

    // Effect to calculate total quotation price whenever selected items or base service price changes
    useEffect(() => {
        // Ensure service.price_base is parsed as a float
        let currentTotalPrice = parseFloat(service?.price_base || 0); // Start with the base service price

        for (const serviceItemId in selectedServiceItems) {
            const item = selectedServiceItems[serviceItemId];
            // Ensure item.price_base is parsed as a float
            currentTotalPrice += parseFloat(item.price_base) * item.quantity;
        }
        setTotalQuotationPrice(currentTotalPrice);
    }, [selectedServiceItems, service?.price_base]);


    const handleRequirementChange = useCallback((id, checked) => {
        setConfirmedRequirements(prev => ({ ...prev, [id]: checked }));
    }, []);

    const handleQuestionTextChange = useCallback((id, value) => {
        setQuestionResponses(prev => ({ ...prev, [id]: value }));
    }, []);

    const handleCheckboxChange = useCallback((questionId, optionId, checked, questionType = 'checkbox_multi') => {
        setCheckboxResponses(prev => {
            if (questionType === 'checkbox_single') {
                // For single checkbox, store the selected value
                return { ...prev, [questionId]: checked ? optionId : null };
            } else {
                // For multi checkbox, store array of selected values
                const currentOptions = prev[questionId] || [];
                if (checked) {
                    return { ...prev, [questionId]: [...currentOptions, optionId] };
                } else {
                    return { ...prev, [questionId]: currentOptions.filter(id => id !== optionId) };
                }
            }
        });
    }, []);

    // Handler for toggling service item selection
    const handleServiceItemToggle = useCallback((item) => {
        setSelectedServiceItems(prev => {
            const serviceItemId = item.service_item_id;
            const isCurrentlySelected = prev[serviceItemId] && prev[serviceItemId].quantity > 0;

            if (isCurrentlySelected) {
                // Deselect the item by removing it from the selected items
                const newState = { ...prev };
                delete newState[serviceItemId];
                return newState;
            } else {
                // Select the item, default quantity to 1
                return {
                    ...prev,
                    [serviceItemId]: {
                        quantity: 1, // Default quantity when first selected
                        price_base: parseFloat(item.price_base), // Ensure price is a number
                        price_type: item.price_type, // Use price_type to determine if per unit
                        item_name: item.item_name
                    }
                };
            }
        });
    }, []);

    // Handler for changing quantity of per-unit service items
    const handleServiceItemQuantityChange = useCallback((serviceItemId, delta) => {
        setSelectedServiceItems(prev => {
            const currentItem = prev[serviceItemId];
            if (!currentItem) return prev; // Should not happen if buttons are only shown for selected items

            const newQuantity = currentItem.quantity + delta;
            if (newQuantity < 1) {
                // If quantity drops below 1, deselect the item
                const newState = { ...prev };
                delete newState[serviceItemId];
                return newState;
            }

            return {
                ...prev,
                [serviceItemId]: {
                    ...currentItem,
                    quantity: newQuantity
                }
            };
        });
    }, []);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmissionError(null);
        setIsSubmitting(true);

        // Basic validation
        if (!customerName || !customerEmail || !customerPhone) {
            setSubmissionError(t('allPersonalFieldsRequired'));
            setIsSubmitting(false);
            return;
        }

        // Validate phone number requirement
        if (service?.require_phone && !customerPhone.trim()) {
            setSubmissionError(t('phoneNumberRequired'));
            setIsSubmitting(false);
            return;
        }

        // Validate consent requirements
        if (service?.require_consent_pdp && !pdpConsent) {
            setSubmissionError(t('pdpConsentRequired'));
            setIsSubmitting(false);
            return;
        }

        if (service?.require_consent_newsletter && !newsletterConsent) {
            setSubmissionError(t('newsletterConsentRequired'));
            setIsSubmitting(false);
            return;
        }

        // Validate required requirements
        const unconfirmedRequired = requirements.filter(req => req.is_required && !confirmedRequirements[req.requirement_block_id]);
        if (unconfirmedRequired.length > 0) {
            setSubmissionError(t('allRequirementsMustBeConfirmed'));
            setIsSubmitting(false);
            return;
        }

        // Validate required questions
        const unansweredRequiredQuestions = questions.filter(q => q.is_required && q.question_type !== 'checkbox_multi' && q.question_type !== 'checkbox_single' && !questionResponses[q.question_id]);
        if (unansweredRequiredQuestions.length > 0) {
            setSubmissionError(t('allRequiredQuestionsMustBeAnswered'));
            setIsSubmitting(false);
            return;
        }

        const unselectedRequiredCheckboxes = questions.filter(q => q.is_required && (q.question_type === 'checkbox_multi' || q.question_type === 'checkbox_single') && (
            (q.question_type === 'checkbox_multi' && (!checkboxResponses[q.question_id] || checkboxResponses[q.question_id].length === 0)) ||
            (q.question_type === 'checkbox_single' && !checkboxResponses[q.question_id])
        ));
        if (unselectedRequiredCheckboxes.length > 0) {
            setSubmissionError(t('allRequiredCheckboxQuestionsMustBeAnswered'));
            setIsSubmitting(false);
            return;
        }

        try {
            const customerDetails = {
                customerName,
                customerEmail,
                customerPhone,
                customerNotes,
                newsletterConsent,
                pdpConsent,
            };

            const responses = {
                confirmedRequirements,
                questionResponses,
                checkboxResponses
            };

            // Prepare selected service items for submission
            const finalSelectedServiceItems = Object.keys(selectedServiceItems).map(serviceItemId => ({
                service_item_id: parseInt(serviceItemId, 10), // Ensure ID is number and correct field name
                quantity: selectedServiceItems[serviceItemId].quantity,
                price_base: parseFloat(selectedServiceItems[serviceItemId].price_base), // Ensure price is a number for submission
                item_name: selectedServiceItems[serviceItemId].item_name, // Include name for logging/reference
            }));

            // Pass all collected data to the parent's onConfirmServiceRequest function
            await onConfirmServiceRequest(customerDetails, responses, finalSelectedServiceItems, totalQuotationPrice);
            // The parent's onConfirmServiceRequest function is responsible for handling submission state and redirection
        } catch (error) {
            setSubmissionError(error.message || t('serviceRequestFailed'));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Use the dateFnsLocales map for formatting, directly from selectedDateTime prop
    const formattedDate = selectedDateTime?.date ? format(selectedDateTime.date, 'PPPP', { locale: dateFnsLocales[locale] || dateFnsLocales['en-US'] }) : '';

    // Create a new Date object that combines the date and time string for correct formatting
    let fullDateTimeForFormatting = null;
    if (selectedDateTime?.date && selectedDateTime?.time) {
        const [hours, minutes] = selectedDateTime.time.split(':').map(Number);
        fullDateTimeForFormatting = new Date(selectedDateTime.date); // Start with the selected date
        fullDateTimeForFormatting.setHours(hours, minutes, 0, 0); // Set the hours and minutes
    }

    const formattedTime = fullDateTimeForFormatting ? format(fullDateTimeForFormatting, 'HH:mm', { locale: dateFnsLocales[locale] || dateFnsLocales['en-US'] }) : '';


    return (
        <div className="pb-20">
            <p className={`hidden lg:block text-sm ${themeColorText}`}>{t('confirmServiceRequestTitle')}</p>

            {fetchError && (
                <div className="bg-red-100 text-red-800 p-3 rounded-md mt-4 mb-4">
                    {fetchError}
                </div>
            )}

            <div className="mt-2 mb-4 border-b pb-4">
                <div className="flex flex-col lg:flex-row lg:gap-8">
                    {/* Service Information Column */}
                    <div className="flex-1">
                        <div className="mb-2">
                            <p className="font-bold text-xl md:text-2xl lg:text-3xl leading-tight">
                                {selectedService?.service_name}
                                {selectedService?.description && (
                                    <button
                                        type="button"
                                        onClick={() => setShowDescription(!showDescription)}
                                        className="p-1 rounded-full hover:bg-gray-100 transition-colors ml-2"
                                        aria-label={showDescription ? 'Hide description' : 'Show description'}
                                    >
                                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </button>
                                )}
                            </p>
                        </div>
                        {showDescription && selectedService?.description && (
                            <p className="text-xs md:text-sm leading-tight opacity-80 mb-2">{selectedService?.description}</p>
                        )}
                        <p className="text-xs mt-1">
                           {selectedService?.price_base != null ? ( // Check if price_base has any value (0 or positive)
                            selectedService.price_base > 0 ? (
                                <p>{t('basePrice')}: € {parseFloat(selectedService.price_base).toFixed(2)}</p>
                            ) : (
                                <p className="text-green-400 font-semibold">{tCommon('free')}</p> // You can adjust this className
                            )
                            ) : (
                                <p className="opacity-50 italic">{t('priceNotAvailable')}</p> // You can adjust this className
                            )}
                        </p>
                    </div>

                    {/* Date Selection Column */}
                    {selectedService?.active_booking && (
                        <div className="flex-shrink-0 mt-4 lg:mt-0 lg:max-w-[30%]">
                            <p className="text-lg md:text-2xl lg:text-xl">{formattedDate}, {formattedTime}</p>
                        </div>
                    )}
                </div>
            </div>

            {isLoadingDetails ? (
                <div className="bg-gray-300 p-4 rounded-xl flex items-center justify-center my-4">
                    <LoadingSpinner />
                </div>
            ) : (
                <>
                    {/* --- Service Items Section (New) --- */}
                    {serviceItems.length > 0 && (
                        <div className="mb-6 border-b pb-4">
                            <p className={`font-bold text-lg mt-1 mb-2 ${themeColorText}`}>{t('optionalItemsTitle')}</p>
                            <div className="grid grid-cols-1 gap-2 mb-4">
                                {serviceItems.sort((a, b) => a.display_order - b.display_order).map(item => {
                                    const isSelected = selectedServiceItems[item.service_item_id] && selectedServiceItems[item.service_item_id].quantity > 0;
                                    return (
                                        <div
                                            key={item.service_item_id}
                                            className={`
                                                relative flex flex-row md:items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ease-in-out border
                                                ${isSelected ? 'border-l-4' : 'border-l'}
                                            `}
                                            onClick={() => handleServiceItemToggle(item)}
                                            style={isSelected ? { backgroundColor: themeColorBackgroundCard, color: themeColorText, borderColor: themeColorButton } : { backgroundColor: themeColorBackgroundCard, color: themeColorText, borderColor: themeColorBorder }}
                                        >
                                            <div className="text-base">
                                                                                                 <div className="flex items-center gap-1 md:gap-2">
                                                     {item.item_description && (
                                                         <button
                                                             type="button"
                                                             onClick={(e) => { e.stopPropagation(); }}
                                                             className="text-gray-400 hover:text-gray-600 transition-colors"
                                                         >
                                                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                             </svg>
                                                         </button>
                                                     )}
                                                     <p className="text-sm md:text-base font-medium">{item.item_name}</p>
                                                 </div>
                                                {item.item_description && <p className="text-xs opacity-60 leading-tight">{item.item_description}</p>}
                                                <p className="text-xs md:text-sm">
                                                    {isSelected 
                                                        ? `€${(parseFloat(item.price_base) * selectedServiceItems[item.service_item_id]?.quantity).toFixed(2)}`
                                                        : `${parseFloat(item.price_base).toFixed(2)}€${item.price_type === 'per_unit' && (item.price_unit ? ` / ${item.price_unit}` : '')}`
                                                    }
                                                </p>
                                            </div>
                                            {isSelected && item.price_type === 'per_unit' && ( // Use price_type for conditional rendering
                                                <div className="flex items-center justify-center mt-2 space-x-1 md:space-x-2">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); handleServiceItemQuantityChange(item.service_item_id, -1); }}
                                                        className="bg-white px-2 py-1 rounded-full text-sm font-bold shadow-sm"
                                                        style={{ color: themeColorButton, border: `1px solid ${themeColorButton}` }}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="font-bold text-center text-xs md:text-base">
                                                        {selectedServiceItems[item.service_item_id]?.quantity || 0}
                                                        {item.price_type === 'per_unit' && (item.price_unit ? ` ${item.price_unit}` : '')}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); handleServiceItemQuantityChange(item.service_item_id, 1); }}
                                                        className="bg-white px-2 py-1 rounded-full text-sm font-bold shadow-sm"
                                                        style={{ color: themeColorButton, border: `1px solid ${themeColorButton}` }}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            {/* --- Quotation Summary Card --- */}
                            <div className={`w-full flex flex-col xlg:items-center`}>
                                <div className="">
                                <p className="text-xs" >{t('totalPrice')}:</p>
                                <p className="font-bold text-2xl" style={{color: themeColorButton}}>€ {totalQuotationPrice.toFixed(2)}</p>
                                </div>
                                <div className="">
                                <p className="text-xs leading-none opacity-50">{t('optionalItemsDescription')}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* --- End Service Items Section --- */}

                    {/* --- Requirements Section --- */}
                    {requirements.length > 0 && (
                        <div className="mb-4 pb-4 border-b">
                            <h3 className={`text-xl font-semibold mb-3 ${themeColorText}`}>{t('requirementsTitle')}</h3>
                            {requirements.map(req => (
                                <div key={req.requirement_block_id} className="mb-3 ">
                                    <label className="flex items-start">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-5 w-5 rounded mt-1 mr-2"
                                            checked={confirmedRequirements[req.requirement_block_id] || false}
                                            onChange={(e) => handleRequirementChange(req.requirement_block_id, e.target.checked)}
                                        />
                                        <div className="text-sm">
                                            <span className="">{req.title}:</span>{' '}
                                            <span className="">{req.requirements_text}</span>
                                            {req.is_required && (
                                                <span className="inline-block ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                                    {tCommon('required')}
                                                </span>
                                            )}
                                        </div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}
                    {/* --- End Requirements Section --- */}

                    {/* --- Questions Section --- */}
                    {questions.length > 0 && (
                        <div className="mb-4 border-b pb-4">
                            <h3 className={`text-xl font-semibold mb-3 ${themeColorText}`}>{t('questionsTitle')}</h3>
                            {questions.sort((a, b) => a.display_order - b.display_order).map(q => (
                                <div key={q.question_id} className="mb-4">
                                    <label className="block text-sm font-medium mb-1">
                                        {q.question_text} {q.is_required && (
                                            <span className="inline-block ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                                {tCommon('required')}
                                            </span>
                                        )}
                                    </label>
                                    {q.question_type === 'open' && (
                                        <input
                                            type="text"
                                            id={`question-${q.question_id}`} // Added ID for accessibility
                                            className="mt-1 block w-full rounded-md border shadow-sm p-2"
                                            style={{ backgroundColor: themeColorBackgroundCard, color: themeColorText, borderColor: themeColorBorder}}
                                            maxLength={q.max_length || 100}
                                            value={questionResponses[q.question_id] || ''}
                                            onChange={(e) => handleQuestionTextChange(q.question_id, e.target.value)}
                                            required={q.is_required}
                                        />
                                    )}
                                    {q.question_type === 'media_upload' && (
                                        <input
                                            type="url" // Using URL for simplicity, actual file upload would be more complex
                                            id={`question-${q.question_id}`} // Added ID for accessibility
                                            className="mt-1 block w-full rounded-md border shadow-sm p-2"
                                            placeholder={t('mediaUploadPlaceholder')}
                                            value={questionResponses[q.question_id] || ''}
                                            onChange={(e) => handleQuestionTextChange(q.question_id, e.target.value)}
                                            required={q.is_required}
                                        />
                                    )}
                                    {q.question_type === 'checkbox_multi' && (
                                        <div className="mt-1 flex flex-row flex-wrap items-center gap-x-3">
                                            {q.options?.sort((a, b) => a.display_order - b.display_order).map(option => (
                                                <label key={option.option_id} className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="form-checkbox h-4 w-4 rounded mr-1"
                                                        checked={(checkboxResponses[q.question_id] || []).includes(option.option_id)}
                                                        onChange={(e) => handleCheckboxChange(q.question_id, option.option_id, e.target.checked, 'checkbox_multi')}
                                                    />
                                                    <span className="text-xs md:text-sm">{option.option_text}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                    {q.question_type === 'checkbox_single' && (
                                        <div className="mt-1 flex flex-row flex-wrap items-center gap-x-3">
                                            {q.options?.sort((a, b) => a.display_order - b.display_order).map(option => (
                                                <label key={option.option_id} className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name={`question-${q.question_id}`}
                                                        className="form-radio h-4 w-4 rounded mr-1"
                                                        checked={checkboxResponses[q.question_id] === option.option_id}
                                                        onChange={(e) => handleCheckboxChange(q.question_id, option.option_id, e.target.checked, 'checkbox_single')}
                                                    />
                                                    <span className="text-xs md:text-sm">{option.option_text}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    {/* --- End Questions Section --- */}
                </>
            )}

            {/* --- Your Details Section --- */}
            <form onSubmit={handleSubmit}>
                <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-xl font-semibold ${themeColorText}`}>{t('yourDetails')}</h3>
                    
                    {/* Authentication Status */}
                    {isLoggedIn && (
                        <div className="flex items-center">
                            <svg className="w-4 h-4 text-green-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-green-600 text-xs font-medium">
                                {userRole === 'manager' 
                                    ? t('loggedInAsManager') || 'Logged in as Business Manager'
                                    : t('loggedInAsCustomer') || 'Logged in as Customer'
                                }
                            </span>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:gap-4 mb-6 border-b pb-4">
                    <div>
                        <label htmlFor="customerName" className="block text-xs md:text-sm font-medium">{tCommon('name')}</label>
                        <input
                            type="text"
                            id="customerName"
                            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                            style={{ backgroundColor: themeColorBackgroundCard, color: themeColorText, borderColor: themeColorBorder}}
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="customerEmail" className="block text-xs md:text-sm font-medium">{tCommon('email')}</label>
                        <input
                            type="email"
                            id="customerEmail"
                            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                            style={{ backgroundColor: themeColorBackgroundCard, color: themeColorText, borderColor: themeColorBorder}}
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="customerPhone" className="block text-xs md:text-sm font-medium">{tCommon('phone')}</label>
                        <input
                            type="tel"
                            id="customerPhone"
                            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                            style={{ backgroundColor: themeColorBackgroundCard, color: themeColorText, borderColor: themeColorBorder}}
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            required
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="customerNotes" className="block text-xs md:text-sm font-medium">{t('additionalNotes')}</label>
                        <textarea
                            id="customerNotes"
                            rows="2"
                            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                            style={{ backgroundColor: themeColorBackgroundCard, color: themeColorText, borderColor: themeColorBorder}}
                            value={customerNotes}
                            onChange={(e) => setCustomerNotes(e.target.value)}
                        ></textarea>
                    </div>
                </div>
                {/* --- End Your Details Section --- */}

                {/* --- Consent Section --- */}
                {(service?.require_consent_pdp || service?.require_consent_newsletter) && (
                    <div className="mb-6 border-b pb-4">
                        <h3 className={`text-xl font-semibold mb-3 ${themeColorText}`}>{t('consentTitle')}</h3>
                        
                        {service?.require_consent_pdp && (
                            <div className="mb-3">
                                <label className="flex items-start">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-5 w-5 rounded mt-1 mr-2"
                                        checked={pdpConsent}
                                        onChange={(e) => setPdpConsent(e.target.checked)}
                                        required={service?.require_consent_pdp}
                                    />
                                    <div className="text-sm">
                                        <span className="inline-block ml-1 md:ml-2 px-1.5 md:px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                                            {tCommon('required')}
                                        </span>
                                        <span className="ml-2">{t('pdpConsentText')}</span>
                                    </div>
                                </label>
                            </div>
                        )}
                        
                        {service?.require_consent_newsletter && (
                            <div className="mb-3">
                                <label className="flex items-start">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-5 w-5 rounded mt-1 mr-2"
                                        checked={newsletterConsent}
                                        onChange={(e) => setNewsletterConsent(e.target.checked)}
                                        required={service?.require_consent_newsletter}
                                    />
                                    <div className="text-sm">
                                        <span className="inline-block ml-1 md:ml-2 px-1.5 md:px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                                            {tCommon('required')}
                                        </span>
                                        <span className="ml-2">
                                            {service?.require_consent_newsletter_text || t('newsletterConsentText')}
                                        </span>
                                    </div>
                                </label>
                            </div>
                        )}
                    </div>
                )}
                {/* --- End Consent Section --- */}

                {submissionError && (
                    <div className="bg-red-100 text-red-800 p-3 text-sm rounded-md mb-4 text-center">
                        {submissionError}
                    </div>
                )}

                <div className="flex justify-between mt-6">
                    <button
                        type="button"
                        onClick={onBack}
                        className={`py-2 px-4 rounded-md text-sm font-medium'}`}
                        style={{ backgroundColor: 'transparent', color: themeColorText, border: `1px solid ${themeColorText}` }}
                    >
                        {tCommon('back')}
                    </button>
                    <button
                        type="submit"
                        className={`py-2 px-4 rounded-md text-sm md:text-lg font-medium`}
                        style={{ color: "#FFF", backgroundColor: themeColorButton}}
                        disabled={isSubmitting || isLoadingDetails}
                    >
                        {isSubmitting ? tCommon('submitting') + '...' : t('confirmServiceRequestButton')}
                    </button>
                </div>
            </form>
        </div>
    );
}

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';

export default function ServiceItemsStep({
    selectedService,
    onNext,
    onSkip,
    onBack,
    themeColorText,
    themeColorBackgroundCard,
    themeColorBackgroundSecondary,
    themeColorButton,
    themeColorBorder
}) {
    const t = useTranslations('ServiceRequest');

    const [serviceItems, setServiceItems] = useState([]);
    const [selectedServiceItems, setSelectedServiceItems] = useState({});
    const [totalQuotationPrice, setTotalQuotationPrice] = useState(0);
    const [isLoadingDetails, setIsLoadingDetails] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [expandedDescriptions, setExpandedDescriptions] = useState({});

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

                setServiceItems(data.serviceItems || []);

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
    }, [selectedService?.service_id, selectedService?.business_id, t]);

    // Effect to calculate total quotation price whenever selected items or base service price changes
    useEffect(() => {
        // Ensure selectedService.price is parsed as a float
        let currentTotalPrice = parseFloat(selectedService?.price_base || 0); // Start with the base service price

        for (const serviceItemId in selectedServiceItems) {
            const item = selectedServiceItems[serviceItemId];
            // Ensure item.price_base is parsed as a float
            currentTotalPrice += parseFloat(item.price_base) * item.quantity;
        }
        setTotalQuotationPrice(currentTotalPrice);
    }, [selectedServiceItems, selectedService?.price_base]);

    // Handler for toggling service item selection
    const handleServiceItemToggle = useCallback((item) => {
        setSelectedServiceItems(prev => {
            const serviceItemId = item.service_item_id;
            const isCurrentlySelected = prev[serviceItemId] && prev[serviceItemId].quantity > 0;

            if (isCurrentlySelected) {
                // Remove item from selection
                const newSelection = { ...prev };
                delete newSelection[serviceItemId];
                return newSelection;
            } else {
                // Add item to selection with quantity 1
                return {
                    ...prev,
                    [serviceItemId]: {
                        quantity: 1,
                        price_base: item.price_base,
                        price_type: item.price_type,
                        item_name: item.item_name,
                        price_unit: item.price_unit
                    }
                };
            }
        });
    }, []);

    // Handler for changing service item quantity
    const handleServiceItemQuantityChange = useCallback((serviceItemId, change) => {
        setSelectedServiceItems(prev => {
            const currentItem = prev[serviceItemId];
            if (!currentItem) return prev;

            const newQuantity = Math.max(0, currentItem.quantity + change);
            
            if (newQuantity === 0) {
                // Remove item if quantity becomes 0
                const newSelection = { ...prev };
                delete newSelection[serviceItemId];
                return newSelection;
            } else {
                // Update quantity
                return {
                    ...prev,
                    [serviceItemId]: {
                        ...currentItem,
                        quantity: newQuantity
                    }
                };
            }
        });
    }, []);

    const toggleDescription = useCallback((itemId) => {
        setExpandedDescriptions(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    }, []);

    const handleNext = () => {
        onNext({ selectedServiceItems, totalQuotationPrice });
    };

    const handleSkip = () => {
        onSkip();
    };

    const handleBack = () => {
        onBack();
    };

    if (isLoadingDetails) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: themeColorButton }}></div>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="text-center p-4">
                <p className="text-red-600 mb-4">{fetchError}</p>
                <button
                    onClick={handleSkip}
                    className="px-4 py-2 rounded-md text-sm font-medium"
                    style={{ color: "#FFF", backgroundColor: themeColorButton }}
                >
                    {t('continue')}
                </button>
            </div>
        );
    }

    // If no service items, show a message and allow skip
    if (serviceItems.length === 0) {
        return (
            <div className="space-y-6 flex flex-col h-full p-6">
                <div>
                    <h2 className="text-xl lg:text-2xl font-bold mb-2" style={{ color: themeColorText }}>
                        {t('serviceItemsTitle')}
                    </h2>
                </div>
                
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <p className="mb-4 opacity-60" style={{ color: themeColorText }}>{t('noServiceItemsAvailable')}</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between pt-4 mt-auto sticky bottom-0 border-t border-gray-200 -mx-6 px-6 py-4" style={{ background: `linear-gradient(to top, ${themeColorBackgroundSecondary}, ${themeColorBackgroundSecondary}95, transparent)`, borderColor: themeColorBorder }}>
                    <button
                        onClick={handleBack}
                        className="px-4 py-2 rounded-md text-sm font-medium"
                        style={{ backgroundColor: 'transparent', color: themeColorText, border: `1px solid ${themeColorText}` }}
                    >
                        {t('back')}
                    </button>
                    <button
                        onClick={handleSkip}
                        className="px-4 py-2 rounded-md text-sm font-medium"
                        style={{ color: "#FFF", backgroundColor: themeColorButton }}
                    >
                        {t('continue')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 p-6">
                <div className="mb-6">
                    <h2 className="text-lg lg:text-2xl font-bold mb-1 lg:mb-2" style={{ color: themeColorText }}>
                        {t('serviceItemsTitle')}
                    </h2>
                </div>

                {/* Service Items Section */}
                <div className="space-y-4">
                <div className="grid gap-1 lg:gap-3">
                    {serviceItems.map((item) => {
                        const isSelected = selectedServiceItems[item.service_item_id] && selectedServiceItems[item.service_item_id].quantity > 0;
                        
                        return (
                            <div
                                key={item.service_item_id}
                                className={`
                                    relative flex flex-row items-center justify-between p-2 lg:p-3 rounded-lg transition-all duration-200 ease-in-out border
                                    ${isSelected ? 'border-l-4' : 'border-l'}
                                `}
                                style={isSelected ? { backgroundColor: themeColorBackgroundCard, color: themeColorText, borderColor: themeColorButton } : { backgroundColor: themeColorBackgroundCard, color: themeColorText, borderColor: themeColorBorder }}
                            >
                                <div className="text-base flex-1">
                                                                         <div className="flex items-center gap-1 md:gap-2">
                                         {item.item_description && (
                                             <button
                                                 type="button"
                                                 onClick={() => toggleDescription(item.service_item_id)}
                                                 className="opacity-60 hover:opacity-80 transition-opacity"
                                             >
                                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                 </svg>
                                             </button>
                                         )}
                                         <p className="text-sm md:text-base font-medium leading-none">{item.item_name}</p>
                                     </div>
                                    {item.item_description && expandedDescriptions[item.service_item_id] && (
                                        <p className="text-xs opacity-60 leading-none mt-1">{item.item_description}</p>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-xs md:text-sm font-medium">
                                            {isSelected 
                                                ? `€${(parseFloat(item.price_base) * selectedServiceItems[item.service_item_id]?.quantity).toFixed(2)}`
                                                : `${parseFloat(item.price_base).toFixed(2)}€${item.price_type === 'per_unit' && item.price_unit ? ` / ${item.price_unit}` : ''}`
                                            }
                                        </p>
                                    </div>
                                    
                                                                         {!isSelected ? (
                                         <button
                                             type="button"
                                             onClick={() => handleServiceItemToggle(item)}
                                             className="px-2 py-1 lg:px-3 lg:py-1 rounded-md text-xs lg:text-sm font-medium"
                                             style={{ backgroundColor: 'transparent', color: themeColorText, border: `1px solid ${themeColorBorder}` }}
                                         >
                                             Add
                                         </button>
                                     ) : (
                                                                                   <div className="flex items-center space-x-1 md:space-x-2">
                                             <button
                                                 type="button"
                                                 onClick={() => handleServiceItemQuantityChange(item.service_item_id, -1)}
                                                 className="px-2 py-1 rounded-full text-sm font-bold shadow-sm"
                                                 style={{ color: "#FFF", backgroundColor: themeColorButton }}
                                             >
                                                 -
                                             </button>
                                                                                           <span className="font-bold text-center text-xs md:text-base min-w-[2rem]">
                                                  {selectedServiceItems[item.service_item_id]?.quantity || 0}
                                                  {item.price_type === 'per_unit' && (item.price_unit ? ` ${item.price_unit}` : '')}
                                              </span>
                                             <button
                                                 type="button"
                                                 onClick={() => handleServiceItemQuantityChange(item.service_item_id, 1)}
                                                 className="px-2 py-1 rounded-full text-sm font-bold shadow-sm"
                                                 style={{ color: "#FFF", backgroundColor: themeColorButton }}
                                             >
                                                 +
                                             </button>
                                         </div>
                                     )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Quotation Summary Card */}
                <div className="w-full flex flex-col xlg:items-center">
                    <div className="">
                        <p className="text-xs">{t('totalPrice')}:</p>
                        <p className="font-bold text-2xl" style={{color: themeColorButton}}>€ {totalQuotationPrice.toFixed(2)}</p>
                    </div>
                    <div className="">
                        <p className="text-xs leading-none opacity-50" style={{ color: themeColorText }}>{t('optionalItemsDescription')}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Action Buttons */}
            <div className="sticky bottom-0 p-6 border-t" style={{ borderColor: themeColorBorder, backgroundColor: themeColorBackgroundSecondary }}>
                <div className="flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        className="px-4 py-2 rounded-lg border text-sm flex items-center"
                        style={{ borderColor: themeColorBorder, color: themeColorText }}
                    >
                        <svg className="w-4 h-4 lg:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="hidden lg:inline">{t('back')}</span>
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={handleSkip}
                            className="px-4 py-2 rounded-lg text-sm"
                            style={{ borderColor: themeColorBorder, color: themeColorText }}
                        >
                            {t('skip')}
                        </button>
                        <button
                            onClick={handleNext}
                            className="px-6 py-2 rounded-lg font-medium"
                            style={{ backgroundColor: themeColorButton, color: 'white' }}
                        >
                            {t('continue')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

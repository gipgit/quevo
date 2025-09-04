"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';

export default function ServiceExtrasStep({
    selectedService,
    onNext,
    onSkip,
    onBack,
    themeColorText,
    themeColorBackgroundCard,
    themeColorButton,
    themeColorBorder
}) {
    const t = useTranslations('ServiceRequest');

    const [serviceExtras, setServiceExtras] = useState([]);
    const [selectedServiceExtras, setSelectedServiceExtras] = useState({});
    const [totalExtrasPrice, setTotalExtrasPrice] = useState(0);
    const [isLoadingDetails, setIsLoadingDetails] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [expandedDescriptions, setExpandedDescriptions] = useState({});

    // Effect to fetch service extras
    useEffect(() => {
        const fetchServiceExtras = async () => {
            setIsLoadingDetails(true);
            setFetchError(null);
            try {
                const response = await fetch(`/api/businesses/${selectedService.business_id}/services/${selectedService.service_id}/extras`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || t('errorFetchingServiceExtras'));
                }
                const data = await response.json();

                setServiceExtras(data.extras || []);

                // Initialize selectedServiceExtras: assuming all are optional and start unselected.
                const initialSelectedExtras = {};
                setSelectedServiceExtras(initialSelectedExtras);

            } catch (err) {
                console.error("Error fetching service extras:", err);
                setFetchError(err.message || t('errorFetchingServiceExtras'));
            } finally {
                setIsLoadingDetails(false);
            }
        };

        if (selectedService?.service_id && selectedService?.business_id) {
            fetchServiceExtras();
        }
    }, [selectedService?.service_id, selectedService?.business_id, t]);

    // Effect to calculate total extras price whenever selected extras change
    useEffect(() => {
        let currentTotalPrice = 0;

        for (const serviceExtraId in selectedServiceExtras) {
            const extra = selectedServiceExtras[serviceExtraId];
            // Ensure extra.price_base is parsed as a float
            currentTotalPrice += parseFloat(extra.price_base) * extra.quantity;
        }
        setTotalExtrasPrice(currentTotalPrice);
    }, [selectedServiceExtras]);

    // Handler for toggling service extra selection
    const handleServiceExtraToggle = useCallback((extra) => {
        setSelectedServiceExtras(prev => {
            const serviceExtraId = extra.service_extra_id;
            const isCurrentlySelected = prev[serviceExtraId] && prev[serviceExtraId].quantity > 0;

            if (isCurrentlySelected) {
                // Remove extra from selection
                const newSelection = { ...prev };
                delete newSelection[serviceExtraId];
                return newSelection;
            } else {
                // Add extra to selection with quantity 1
                return {
                    ...prev,
                    [serviceExtraId]: {
                        quantity: 1,
                        price_base: extra.price_base,
                        price_type: extra.price_type,
                        extra_name: extra.extra_name,
                        price_unit: extra.price_unit
                    }
                };
            }
        });
    }, []);

    // Handler for changing service extra quantity
    const handleServiceExtraQuantityChange = useCallback((serviceExtraId, change) => {
        setSelectedServiceExtras(prev => {
            const currentExtra = prev[serviceExtraId];
            if (!currentExtra) return prev;

            const newQuantity = currentExtra.quantity + change;
            if (newQuantity < 1) {
                // Remove extra if quantity drops below 1
                const newSelection = { ...prev };
                delete newSelection[serviceExtraId];
                return newSelection;
            }

            return {
                ...prev,
                [serviceExtraId]: {
                    ...currentExtra,
                    quantity: newQuantity
                }
            };
        });
    }, []);

    const handleNext = () => {
        onNext({
            selectedServiceExtras: selectedServiceExtras,
            totalExtrasPrice: totalExtrasPrice
        });
    };

    const handleSkip = () => {
        onSkip();
    };

    if (isLoadingDetails) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex-1 p-6">
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: themeColorButton }}></div>
                    </div>
                </div>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex-1 p-6">
                    <div className="text-center text-red-600">
                        <p>{fetchError}</p>
                        <button
                            onClick={handleSkip}
                            className="mt-4 px-4 py-2 rounded-lg text-sm"
                            style={{ backgroundColor: themeColorButton, color: 'white' }}
                        >
                            Continue without extras
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (serviceExtras.length === 0) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex-1 p-6">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold mb-4" style={{ color: themeColorText }}>
                            {t('serviceExtrasTitle') || 'Service Extras'}
                        </h3>
                        <p className="text-gray-600 mb-6">{t('noExtrasAvailable') || 'No additional extras available for this service.'}</p>
                        <button
                            onClick={handleSkip}
                            className="px-6 py-3 rounded-lg font-medium"
                            style={{ backgroundColor: themeColorButton, color: 'white' }}
                        >
                            {t('continue')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 p-6">
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: themeColorText }}>
                        {t('serviceExtrasTitle') || 'Service Extras'}
                    </h3>
                </div>

                <div className="space-y-3 lg:space-y-4 mb-6">
                    {serviceExtras.map((extra) => {
                        const isSelected = selectedServiceExtras[extra.service_extra_id] && selectedServiceExtras[extra.service_extra_id].quantity > 0;
                        const selectedExtra = selectedServiceExtras[extra.service_extra_id];
                        
                        return (
                            <div
                                key={extra.service_extra_id}
                                className={`p-3 lg:p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                    isSelected
                                        ? 'border-l-4'
                                        : 'border-l'
                                }`}
                                style={isSelected ? { backgroundColor: themeColorBackgroundCard, color: themeColorText, borderColor: themeColorButton } : { backgroundColor: themeColorBackgroundCard, color: themeColorText, borderColor: themeColorBorder }}
                                onClick={() => handleServiceExtraToggle(extra)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div>
                                            <h4 className="font-medium" style={{ color: themeColorText }}>
                                                {extra.extra_name}
                                            </h4>
                                            {extra.extra_description && (
                                                <p className="text-xs lg:text-sm text-gray-600 mt-1">
                                                    {extra.extra_description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right text-sm lg:text-base">
                                        <span className="font-semibold" style={{ color: themeColorText }}>
                                            {isSelected 
                                                ? `€${(parseFloat(extra.price_base) * selectedExtra.quantity).toFixed(2)}`
                                                : `€${parseFloat(extra.price_base).toFixed(2)}`
                                            }
                                        </span>
                                        {extra.price_unit && extra.price_type === 'per_unit' && (
                                            <span className="text-xs text-gray-500 block">
                                                per {extra.price_unit}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                {isSelected && extra.price_type === 'per_unit' && (
                                    <div className="flex items-center justify-center mt-3 space-x-2">
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleServiceExtraQuantityChange(extra.service_extra_id, -1); }}
                                            className="bg-white px-2 py-1 rounded-full text-sm font-bold shadow-sm"
                                            style={{ color: themeColorButton, border: `1px solid ${themeColorButton}` }}
                                        >
                                            -
                                        </button>
                                        <span className="font-bold text-center text-sm">
                                            {selectedExtra.quantity}
                                            {extra.price_unit ? ` ${extra.price_unit}` : ''}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleServiceExtraQuantityChange(extra.service_extra_id, 1); }}
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

                {totalExtrasPrice > 0 && (
                    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: themeColorBackgroundCard, borderColor: themeColorBorder }}>
                        <div className="flex justify-between items-center">
                            <span className="font-medium" style={{ color: themeColorText }}>
                                {t('totalExtras') || 'Total Extras'}:
                            </span>
                            <span className="font-semibold text-lg" style={{ color: themeColorText }}>
                                €{totalExtrasPrice.toFixed(2)}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="sticky bottom-0 p-6 border-t bg-white" style={{ borderColor: themeColorBorder }}>
                <div className="flex justify-between items-center">
                    <button
                        onClick={onBack}
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

"use client";

import React, { useState, useEffect } from 'react';
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
    const [selectedExtras, setSelectedExtras] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchServiceExtras();
    }, [selectedService]);

    const fetchServiceExtras = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/businesses/${selectedService.business_id}/services/${selectedService.service_id}/extras`);
            if (response.ok) {
                const data = await response.json();
                setServiceExtras(data.extras || []);
            } else {
                console.error('Failed to fetch service extras');
                setError('Failed to load service extras');
            }
        } catch (error) {
            console.error('Error fetching service extras:', error);
            setError('Error loading service extras');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExtraToggle = (extraId, extra) => {
        setSelectedExtras(prev => {
            const newSelected = { ...prev };
            if (newSelected[extraId]) {
                delete newSelected[extraId];
            } else {
                newSelected[extraId] = extra;
            }
            return newSelected;
        });
    };

    const handleNext = () => {
        onNext({
            selectedExtras: selectedExtras,
            totalExtrasPrice: Object.values(selectedExtras).reduce((total, extra) => total + (extra.price_base || 0), 0)
        });
    };

    const handleSkip = () => {
        onSkip();
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: themeColorButton }}></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="text-center text-red-600">
                    <p>{error}</p>
                    <button
                        onClick={handleSkip}
                        className="mt-4 px-4 py-2 rounded-lg text-sm"
                        style={{ backgroundColor: themeColorButton, color: 'white' }}
                    >
                        Continue without extras
                    </button>
                </div>
            </div>
        );
    }

    if (serviceExtras.length === 0) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: themeColorText }}>
                        Service Extras
                    </h3>
                    <p className="text-gray-600 mb-6">No additional extras available for this service.</p>
                    <button
                        onClick={handleSkip}
                        className="px-6 py-3 rounded-lg font-medium"
                        style={{ backgroundColor: themeColorButton, color: 'white' }}
                    >
                        Continue
                    </button>
                </div>
            </div>
        );
    }

    const totalSelectedPrice = Object.values(selectedExtras).reduce((total, extra) => total + (extra.price_base || 0), 0);

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 p-6">
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: themeColorText }}>
                        Service Extras
                    </h3>
                    <p className="text-gray-600 text-sm">
                        Select any additional services you'd like to include with your booking.
                    </p>
                </div>

                <div className="space-y-4 mb-6">
                    {serviceExtras.map((extra) => (
                        <div
                            key={extra.service_extra_id}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedExtras[extra.service_extra_id]
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                            style={{ backgroundColor: selectedExtras[extra.service_extra_id] ? 'rgba(59, 130, 246, 0.05)' : themeColorBackgroundCard }}
                            onClick={() => handleExtraToggle(extra.service_extra_id, extra)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={!!selectedExtras[extra.service_extra_id]}
                                            onChange={() => handleExtraToggle(extra.service_extra_id, extra)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <div>
                                            <h4 className="font-medium" style={{ color: themeColorText }}>
                                                {extra.extra_name}
                                            </h4>
                                            {extra.extra_description && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {extra.extra_description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="font-semibold" style={{ color: themeColorText }}>
                                        €{extra.price_base?.toFixed(2) || '0.00'}
                                    </span>
                                    {extra.price_unit && extra.price_type !== 'fixed' && (
                                        <span className="text-xs text-gray-500 block">
                                            per {extra.price_unit}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {totalSelectedPrice > 0 && (
                    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: themeColorBackgroundCard, borderColor: themeColorBorder }}>
                        <div className="flex justify-between items-center">
                            <span className="font-medium" style={{ color: themeColorText }}>
                                Total Extras:
                            </span>
                            <span className="font-semibold text-lg" style={{ color: themeColorText }}>
                                €{totalSelectedPrice.toFixed(2)}
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

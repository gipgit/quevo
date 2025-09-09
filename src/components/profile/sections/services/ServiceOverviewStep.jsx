"use client";

import React from 'react';
import { useTranslations } from 'next-intl';

export default function ServiceOverviewStep({
    selectedService,
    onNext,
    onBack,
    themeColorText,
    themeColorBackgroundCard,
    themeColorBackgroundSecondary,
    themeColorButton,
    themeColorBorder
}) {
    const t = useTranslations('ServiceRequest');

    const formatPrice = (price) => {
        if (!price || price === 0) return null;
        return `€${price.toFixed(2)}`;
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 px-4 py-3 md:px-6 md:py-4 lg:p-6">
                <div className="mb-2 md:mb-4 lg:mb-6">
                    <h3 className="text-lg md:text-xl lg:text-2xl font-semibold mb-2 md:mb-3 lg:mb-4" style={{ color: themeColorText }}>
                        {selectedService.service_name}
                    </h3>
                    {selectedService.description && (
                        <p className="text-base leading-relaxed mb-6 opacity-70" style={{ color: themeColorText }}>
                            {selectedService.description}
                        </p>
                    )}
                </div>

                <div className="mb-6">
                    {selectedService.price_base && selectedService.price_base > 0 && (
                        <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: themeColorBorder }}>
                            <span className="font-medium" style={{ color: themeColorText }}>
                                {t('basePrice')}:
                            </span>
                            <span className="text-lg font-semibold" style={{ color: themeColorText }}>
                                {formatPrice(selectedService.price_base)}
                            </span>
                        </div>
                    )}

                    {selectedService.duration_minutes && (
                        <div className="flex items-center justify-between py-3">
                            <span className="text-sm opacity-70" style={{ color: themeColorText }}>
                                {t('duration')}:
                            </span>
                            <span className="text-sm font-medium" style={{ color: themeColorText }}>
                                {selectedService.duration_minutes} {t('minutes')}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="sticky bottom-0 px-4 py-3 md:px-6 md:py-4 lg:p-6 border-t" style={{ borderColor: themeColorBorder, backgroundColor: themeColorBackgroundSecondary }}>
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
                    <button
                        onClick={onNext}
                        className="px-6 py-2 rounded-lg font-medium"
                        style={{ backgroundColor: themeColorButton, color: 'white' }}
                    >
                        {t('continue')}
                    </button>
                </div>
            </div>
        </div>
    );
}

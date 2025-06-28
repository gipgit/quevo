// src/app/[locale]/[business_urlname]/sections/PromotionsPageContent.jsx

"use client";

import React from 'react';
import { useBusinessProfile } from '@/contexts/BusinessProfileContext';
import { useTranslations } from 'next-intl';

export default function PromotionsPageContent() {
    const businessProfile = useBusinessProfile();

    const {
        businessData,
        businessPromos,
        themeColorText,
        themeVariables,
    } = businessProfile;

    const t = useTranslations('Common');

    if (!businessData || !businessPromos) {
        return <div className="text-center py-8" style={{ color: themeColorText || 'black' }}>{t('loadingPromotions')}</div>;
    }

    const promotions = businessPromos || [];

    return (
        <>
            {promotions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {promotions.map(promo => (
                        <div
                            key={promo.promo_id}
                            className="bg-white p-6 rounded-lg shadow-md"
                            style={{ backgroundColor: themeVariables?.['--card-item-background'] }}
                        >
                            <h3 className="text-xl font-semibold mb-2" style={{ color: themeColorText }}>{promo.promo_title}</h3>
                            <p className="text-gray-700" style={{ color: themeColorText }}>{promo.promo_description}</p>
                            {promo.promo_value && (
                                <p className="text-lg font-semibold" style={{ color: themeVariables?.['--theme-color-button'] }}>
                                    {promo.promo_value} {promo.promo_type === 'PERCENTAGE' ? '%' : promo.promo_type === 'FIXED_AMOUNT' ? '€' : ''}
                                    {promo.promo_type !== 'FREE_SHIPPING' && promo.promo_type !== 'BOGO' && t('discountSuffix')} 
                                </p>
                            )}
                            {(promo.date_start || promo.date_end) && (
                                <p className="text-sm text-gray-500 mt-2">
                                    {t('validFrom')}{' '}
                                    {promo.date_start ? new Date(promo.date_start).toLocaleDateString() : t('notApplicable')}{' '}
                                    {t('to')}{' '}
                                    {promo.date_end ? new Date(promo.date_end).toLocaleDateString() : t('notApplicable')}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-sm mt-10" style={{ color: themeColorText }}>{t('noPromotionsAvailable')}</p>
            )}
        </>
    );
}
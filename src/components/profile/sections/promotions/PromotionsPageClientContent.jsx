// src/components/profile/sections/promotions/PromotionsPageClientContent.jsx

"use client";

import React from 'react';
import { useBusinessProfile } from '@/contexts/BusinessProfileContext';
import { useTranslations } from 'next-intl';
import PromotionCard from './PromotionCard'; // Import the new PromotionCard component

export default function PromotionsPageClientContent({ initialPromotionsData }) {
    const { themeColorText, themeColorBackground, themeColorButton, locale } = useBusinessProfile(); // Get locale from context if available, otherwise pass it down.
    const t = useTranslations('Promotions');

    const { businessData, promotions } = initialPromotionsData;

    if (!businessData) {
        return <div className="text-center py-10" style={{ color: themeColorText }}>{t('loading')}</div>;
    }

    return (
        <div className="container max-w-3xl mx-auto py-8 px-4">

            {promotions && promotions.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {promotions.map((promotion) => (
                        <PromotionCard
                            key={promotion.promo_id}
                            promotion={promotion}
                            themeColorText={themeColorText}
                            themeColorBackground={themeColorBackground}
                            themeColorButton={themeColorButton}
                            locale={locale} // Pass locale to the card for date formatting
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10" style={{ color: themeColorText }}>
                    <p className="text-lg">{t('noPromotionsYet')}</p>
                    <p className="text-sm opacity-75 mt-2">{t('checkBackLater')}</p>
                </div>
            )}
        </div>
    );
}
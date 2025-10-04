// src/components/profile/sections/promotions/PromotionsPageClientContent.jsx

"use client";

import React from 'react';
import { useBusinessProfile } from '@/contexts/BusinessProfileContext';
import { useTranslations } from 'next-intl';
import PromotionCard from './PromotionCard'; // Import the new PromotionCard component
import EmptyStateProfile from '@/components/ui/EmptyStateProfile';

export default function PromotionsPageClientContent({ initialPromotionsData }) {
    const { themeColorText, themeColorBackground, themeColorBackgroundSecondary, themeColorButton, themeColorBorder, locale } = useBusinessProfile(); // Get locale from context if available, otherwise pass it down.
    const t = useTranslations('Promotions');

    const { businessData, promotions } = initialPromotionsData;

    if (!businessData) {
        return <div className="text-center py-10" style={{ color: themeColorText }}>{t('loading')}</div>;
    }

    return (
        <div className="container mx-auto py-8 px-4">

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
                <EmptyStateProfile 
                    icon={<svg className="mx-auto w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    title={t('noPromotionsYet')}
                    description={t('checkBackLater')}
                    titleColor={themeColorText}
                    backgroundColor={themeColorBackgroundSecondary}
                    borderColor={themeColorBorder}
                />
            )}
        </div>
    );
}
// src/components/profile/sections/promotions/PromotionCard.jsx

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function PromotionCard({ promotion, themeColorText, themeColorBackground, locale }) {
    const t = useTranslations('Promotions');

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full"
             style={{ backgroundColor: themeColorBackground, color: themeColorText }}>
            {promotion.image_url && ( // Assuming promo model might have an image_url or similar field for visual promos
                <div className="relative w-full h-48 sm:h-56 md:h-64 flex-shrink-0">
                    <Image
                        src={promotion.image_url}
                        alt={promotion.promo_title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                    />
                </div>
            )}
            <div className="p-4 flex-grow flex flex-col">
                <h3 className="text-xl font-semibold mb-2">{promotion.promo_title}</h3>
                <p className="text-gray-700 text-sm mb-4 flex-grow" style={{ color: themeColorText }}>
                    {promotion.promo_text_full}
                </p>

                {promotion.promo_conditions && (
                    <p className="text-xs opacity-80 mb-2">{t('conditions')}: {promotion.promo_conditions}</p>
                )}

                {(promotion.date_start || promotion.date_end) && (
                    <p className="text-xs opacity-75 mb-2">
                        {promotion.date_start && t('validFrom')}: {new Date(promotion.date_start).toLocaleDateString(locale)}
                        {promotion.date_end && ` ${t('validUntil')}: ${new Date(promotion.date_end).toLocaleDateString(locale)}`}
                    </p>
                )}

                {/* Example of an action button, adapt as needed */}
                <button
                    className="mt-auto inline-block text-white py-2 px-4 rounded transition-colors"
                    style={{ backgroundColor: 'var(--theme-color-button, #007bff)' }} // Use CSS variable or direct prop
                >
                    {t('viewDetails')}
                </button>
            </div>
        </div>
    );
}
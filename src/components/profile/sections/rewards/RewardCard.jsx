// src/components/profile/sections/rewards/RewardCard.jsx

import React from 'react';
import { useTranslations } from 'next-intl';

export default function RewardCard({ reward, themeColorText, themeColorBackground, locale }) {
    const t = useTranslations('Rewards');

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full"
             style={{ backgroundColor: themeColorBackground, color: themeColorText }}>
            {/* You could add an image here if your reward model had one */}
            {/* <div className="relative w-full h-48 sm:h-56 md:h-64 flex-shrink-0">
                <Image
                    src={reward.image_url} // Assuming reward.image_url exists
                    alt={reward.reward_description}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                />
            </div> */}
            <div className="p-4 flex-grow flex flex-col">
                <h3 className="text-xl font-semibold mb-2">{reward.reward_description}</h3>
                <p className="text-gray-700 text-sm mb-4 flex-grow" style={{ color: themeColorText }}>
                    {t('requiredPoints')}: <span className="font-bold">{reward.required_points}</span> {t('points')}
                </p>

                {reward.quantity_available !== null && (
                    <p className="text-sm opacity-80 mb-2">
                        {t('quantityAvailable')}: {reward.quantity_available > 0 ? reward.quantity_available : t('outOfStock')}
                    </p>
                )}

                {(reward.reward_start_date || reward.reward_end_date) && (
                    <p className="text-xs opacity-75 mb-2">
                        {reward.reward_start_date && t('validFrom')}: {new Date(reward.reward_start_date).toLocaleDateString(locale)}
                        {reward.reward_end_date && ` ${t('validUntil')}: ${new Date(reward.reward_end_date).toLocaleDateString(locale)}`}
                    </p>
                )}

                <button
                    className="mt-auto inline-block text-white py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: 'var(--theme-color-button, #007bff)' }}
                    // Add logic to disable button if not enough points or out of stock
                    disabled={reward.quantity_available !== null && reward.quantity_available <= 0}
                >
                    {t('redeem')}
                </button>
            </div>
        </div>
    );
}
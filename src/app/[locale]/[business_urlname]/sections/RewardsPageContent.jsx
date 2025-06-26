// src/app/[locale]/(main)/[business_urlname]/sections/RewardsPageContent.jsx

"use client";

import React from 'react';
import { useBusinessProfile } from '@/contexts/BusinessProfileContext';
import { useTranslations } from 'next-intl';

export default function RewardsPageContent() {
    const businessProfile = useBusinessProfile();

    const {
        businessData,
        businessRewards,
        themeColorText,
        themeVariables,
    } = businessProfile;

    const t = useTranslations('Common');

    if (!businessData || !businessRewards) {
        return <div className="text-center py-8" style={{ color: themeColorText || 'black' }}>{t('loadingLoyaltyProgram')}</div>;
    }

    const rewards = businessRewards || [];

    return (
        <>
            {rewards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {rewards.map(reward => (
                        <div
                            key={reward.reward_id}
                            className="bg-white p-6 rounded-lg shadow-md"
                            style={{ backgroundColor: themeVariables?.['--card-item-background'] }}
                        >
                            <h3 className="text-xl font-semibold mb-2" style={{ color: themeColorText }}>{reward.reward_name}</h3>
                            <p className="text-gray-700" style={{ color: themeColorText }}>{reward.reward_description}</p>
                            {reward.points_required && (
                                <p className="text-lg font-semibold" style={{ color: themeVariables?.['--theme-color-button'] }}>
                                    {t('pointsRequired')}: {reward.points_required} {/* New translation key for "Punti richiesti" */}
                                </p>
                            )}
                            {(reward.reward_start_date || reward.reward_end_date) && (
                                <p className="text-sm text-gray-500 mt-2">
                                    {t('validFrom')}{' '}
                                    {reward.reward_start_date ? new Date(reward.reward_start_date).toLocaleDateString() : t('notApplicable')}{' '}
                                    {t('to')}{' '}
                                    {reward.reward_end_date ? new Date(reward.reward_end_date).toLocaleDateString() : t('notApplicable')}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-sm mt-10" style={{ color: themeColorText }}>{t('noLoyaltyRewardsAvailable')}</p>
            )}
        </>
    );
}
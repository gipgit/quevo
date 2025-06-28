// src/components/profile/sections/rewards/RewardsPageClientContent.jsx

"use client";

import React from 'react';
import { useBusinessProfile } from '@/contexts/BusinessProfileContext';
import { useTranslations } from 'next-intl';
import RewardCard from './RewardCard'; // Import the new RewardCard component

export default function RewardsPageClientContent({ initialRewardsData }) {
    const { themeColorText, themeColorBackground, themeColorButton, locale } = useBusinessProfile();
    const t = useTranslations('Rewards');

    const { businessData, rewards } = initialRewardsData;

    if (!businessData) {
        return <div className="text-center py-10" style={{ color: themeColorText }}>{t('loading')}</div>;
    }

    return (
        <div className="container max-w-3xl mx-auto py-8 px-4">
            
            {rewards && rewards.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {rewards.map((reward) => (
                        <RewardCard
                            key={reward.reward_id}
                            reward={reward}
                            themeColorText={themeColorText}
                            themeColorBackground={themeColorBackground}
                            themeColorButton={themeColorButton}
                            locale={locale}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10" style={{ color: themeColorText }}>
                    <p className="text-lg">{t('noRewardsYet')}</p>
                    <p className="text-sm opacity-75 mt-2">{t('checkBackLater')}</p>
                </div>
            )}
        </div>
    );
}
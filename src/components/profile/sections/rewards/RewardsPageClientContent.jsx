// src/components/profile/sections/rewards/RewardsPageClientContent.jsx

"use client";

import React from 'react';
import { useBusinessProfile } from '@/contexts/BusinessProfileContext';
import { useTranslations } from 'next-intl';
import RewardCard from './RewardCard'; // Import the new RewardCard component
import EmptyStateProfile from '@/components/ui/EmptyStateProfile';

export default function RewardsPageClientContent({ initialRewardsData }) {
    const { themeColorText, themeColorBackground, themeColorBackgroundSecondary, themeColorButton, themeColorBorder, locale } = useBusinessProfile();
    const t = useTranslations('Rewards');

    const { businessData, rewards } = initialRewardsData;

    if (!businessData) {
        return <div className="text-center py-10" style={{ color: themeColorText }}>{t('loading')}</div>;
    }

    return (
        <div className="container mx-auto py-8 px-4">
            
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
                <EmptyStateProfile 
                    icon={<svg className="mx-auto w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
                    title={t('noRewardsYet')}
                    description={t('checkBackLater')}
                    titleColor={themeColorText}
                    backgroundColor={themeColorBackgroundSecondary}
                    borderColor={themeColorBorder}
                />
            )}
        </div>
    );
}
// src/app/[locale]/[business_urlname]/(sections)/rewards/page.tsx

import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getBusinessProfileLeanData, getRewardsData } from '@/lib/data/business-profile'; // You'll create getRewardsData

import RewardsPageClientContent from '@/components/profile/sections/rewards/RewardsPageClientContent';

export async function generateMetadata({ params: { locale, business_urlname } }) {
    const t = await getTranslations({ locale, namespace: 'Rewards' });

    const { businessData } = await getBusinessProfileLeanData(business_urlname);

    if (!businessData) {
        return {
            title: t('notFoundTitle'),
            description: t('notFoundDescription'),
        };
    }

    return {
        title: t('pageTitle', { businessName: businessData.business_name }),
        description: t('pageDescription', { businessName: businessData.business_name }),
    };
}

export default async function RewardsPage({ params: { locale, business_urlname } }) {
    const { businessData } = await getBusinessProfileLeanData(business_urlname);

    if (!businessData) {
        notFound();
    }

    // Fetch rewards data for the specific business ID
    const rewards = await getRewardsData(businessData.business_id);

    const initialRewardsData = {
        businessData,
        rewards,
    };

    return (
        <RewardsPageClientContent initialRewardsData={initialRewardsData} />
    );
}
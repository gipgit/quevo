// src/app/[locale]/[business_urlname]/(sections)/promotions/page.tsx

import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getBusinessProfileLeanData, getPromotionsData } from '@/lib/data/business-profile'; // getPromotionsData will be updated below

// Adjusted import path for the client component
import PromotionsPageClientContent from '@/components/profile/sections/promotions/PromotionsPageClientContent';

export async function generateMetadata({ params: { locale, business_urlname } }) {
    const t = await getTranslations({ locale, namespace: 'Promotions' });

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

export default async function PromotionsPage({ params: { locale, business_urlname } }) {
    const { businessData } = await getBusinessProfileLeanData(business_urlname);

    if (!businessData) {
        notFound();
    }

    // Pass the business_id to fetch promotions
    const promotions = await getPromotionsData(businessData.business_id);

    const initialPromotionsData = {
        businessData,
        promotions,
    };

    return (
        <PromotionsPageClientContent initialPromotionsData={initialPromotionsData} />
    );
}
// src/app/[locale]/[business_urlname]/(sections)/promotions/page.tsx

import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getBusinessProfileLeanData, getPromotionsData } from '@/lib/data/business-profile';

// Adjusted import path for the client component
import PromotionsPageClientContent from '@/components/profile/sections/promotions/PromotionsPageClientContent';

// Define the interface for the params object
interface BusinessPageParams {
  locale: string;
  business_urlname: string;
}

export async function generateMetadata({ params }: { params: BusinessPageParams }) {
    // Hardcoded static metadata as requested
    return {
        title: "Quevo",
        description: "Quevo",
    };
}

export default async function PromotionsPage({ params }: { params: BusinessPageParams }) {
    // Destructure locale and business_urlname from the now-typed params object
    const { locale, business_urlname } = params; // 'locale' is destructured, but not passed to client component

    // Fetch business profile data
    const { businessData } = await getBusinessProfileLeanData(business_urlname);

    if (!businessData) {
        console.error(`[page.tsx] Business not found or error fetching for URL: ${business_urlname}`);
        notFound();
    }

    const promotions = await getPromotionsData(businessData.business_id);

    const initialPromotionsData = {
        businessData,
        promotions,
    };

    return (
        <PromotionsPageClientContent
            initialPromotionsData={initialPromotionsData}
            // locale={locale} // <<< --- REMOVED THIS LINE
        />
    );
}
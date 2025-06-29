// src/app/[locale]/[business_urlname]/(sections)/rewards/page.tsx

import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server'; // Keep this import if it's used elsewhere or you plan to use it for page content translations
import { getBusinessProfileLeanData, getRewardsData } from '@/lib/data/business-profile'; // You'll create getRewardsData

import RewardsPageClientContent from '@/components/profile/sections/rewards/RewardsPageClientContent';

// Define the interface for the params object, consistent with other dynamic routes
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

export default async function RewardsPage({ params }: { params: BusinessPageParams }) {
    // Destructure locale and business_urlname from the now-typed params object
    const { locale, business_urlname } = params;

    // Fetch business profile data
    // TypeScript will infer the type of `businessData` based on `getBusinessProfileLeanData`'s return type.
    const { businessData } = await getBusinessProfileLeanData(business_urlname);

    if (!businessData) {
        // If business data fetching failed or business not found, trigger Next.js 404
        console.error(`[page.tsx] Business not found or error fetching for URL: ${business_urlname}`);
        notFound();
    }

    // Fetch rewards data for the specific business ID
    const rewards = await getRewardsData(businessData.business_id);

    const initialRewardsData = {
        businessData, // businessData is guaranteed not to be null here
        rewards,
    };

    return (
        <RewardsPageClientContent initialRewardsData={initialRewardsData} />
    );
}
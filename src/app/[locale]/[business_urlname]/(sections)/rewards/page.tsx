// src/app/[locale]/[business_urlname]/(sections)/rewards/page.tsx

import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server'; // Keep this import if used elsewhere
import { getBusinessProfileLeanData, getRewardsData } from '@/lib/data/business-profile';

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
    const { locale, business_urlname } = params; // 'locale' is destructured, but not passed to client component

    // Fetch business profile data
    const { businessData } = await getBusinessProfileLeanData(business_urlname);

    if (!businessData) {
        // If business data fetching failed or business not found, trigger Next.js 404
        console.error(`[page.tsx] Business not found or error fetching for URL: ${business_urlname}`);
        notFound();
    }

    // Fetch rewards data for the specific business ID
    const rewards = await getRewardsData(businessData.business_id);

    const initialRewardsData = {
        businessData,
        rewards,
    };

    return (
        <RewardsPageClientContent
            initialRewardsData={initialRewardsData}
            // locale={locale} // <<< --- REMOVED THIS LINE (as per your instruction to get it from context)
        />
    );
}
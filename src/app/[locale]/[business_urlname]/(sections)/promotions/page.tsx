// src/app/[locale]/[business_urlname]/(sections)/promotions/page.tsx

import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server'; // Keep this import if it's used elsewhere or you plan to use it for page content translations
import { getBusinessProfileLeanData, getPromotionsData } from '@/lib/data/business-profile';

// Adjusted import path for the client component
import PromotionsPageClientContent from '@/components/profile/sections/promotions/PromotionsPageClientContent';

// Define the interface for the params object
interface BusinessPageParams { // Use BusinessPageParams for consistency across similar routes
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
    const { locale, business_urlname } = params; // Ensure locale is destructured here

    // Fetch business profile data
    // TypeScript will infer the type of `businessData` based on `getBusinessProfileLeanData`'s return type.
    const { businessData } = await getBusinessProfileLeanData(business_urlname);

    if (!businessData) {
        // If business data fetching failed or business not found, return 404
        console.error(`[page.tsx] Business not found or error fetching for URL: ${business_urlname}`);
        notFound();
    }

    // Pass the business_id to fetch promotions
    const promotions = await getPromotionsData(businessData.business_id);

    const initialPromotionsData = {
        businessData, // businessData is guaranteed not to be null here
        promotions,
    };

    return (
        <PromotionsPageClientContent
            initialPromotionsData={initialPromotionsData}
            locale={locale} // <<< --- IMPORTANT: Pass the locale prop here
        />
    );
}
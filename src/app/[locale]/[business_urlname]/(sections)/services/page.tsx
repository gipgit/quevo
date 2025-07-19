// src/app/[locale]/[business_urlname]/(sections)/services/page.tsx

import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server'; // Keep if used elsewhere
import { getBusinessProfileLeanData, getServiceRequestServicesData } from '@/lib/data/business-profile';
import ServiceRequestPageClientContent from '@/components/profile/sections/services/ServiceRequestPageClientContent';

interface ServiceRequestPageParams {
  locale: string;
  business_urlname: string;
}

export async function generateMetadata({ params }: { params: ServiceRequestPageParams }) {
    return {
        title: "Quevo",
        description: "Quevo",
    };
}

export default async function ServiceRequestPage({ params }: { params: ServiceRequestPageParams }) {
    const { locale, business_urlname } = params; // 'locale' is destructured, but not passed to client component

    // Fetch business profile data first to get business.business_id
    const { businessData: business, themeColorButton, themeColorText } = await getBusinessProfileLeanData(business_urlname);

    if (!business) {
        // If business data fetching failed or business not found, return 404
        console.error(`[page.tsx] Business not found or error fetching for URL: ${business_urlname}`);
        notFound();
    }

    // Now fetch services services data using the actual business_id
    // getServiceRequestServicesData returns { services, categories }
    const { services, categories } = await getServiceRequestServicesData(business.business_id);

    console.log("[page.tsx] Passing to Client Component - Services:", services);
    console.log("[page.tsx] Passing to Client Component - Categories:", categories);

    return (
        <ServiceRequestPageClientContent
            business={{
                ...business,
                theme_color_button: themeColorButton || '#4F46E5', // Example default if not provided by getBusinessProfileLeanData
                theme_color_text: themeColorText || '#1F2937',   // Example default
            }}
            services={services}
            categories={categories} // Pass the fetched categories
            // locale={locale} // <<< --- REMOVED THIS LINE (as per your instruction to get it from context)
        />
    );
}
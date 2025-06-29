// src/app/[locale]/[business_urlname]/(sections)/booking/page.tsx

import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getBusinessProfileLeanData, getBookingServicesData } from '@/lib/data/business-profile';
import BookingPageClientContent from '@/components/profile/sections/booking/BookingPageClientContent';

// Define the interface for the params object
interface BookingPageParams {
  locale: string;
  business_urlname: string;
}

export async function generateMetadata({ params }: { params: BookingPageParams }) {
    const t = await getTranslations('Booking');
    // Ensure the messages are available for metadata generation
    // This part might still show MISSING_MESSAGE if Booking.pageDescription is not in your en.json
    return {
        title: t('pageTitle'),
        description: t('pageDescription'),
    };
}

export default async function BookingPage({ params }: { params: BookingPageParams }) {
    const { locale, business_urlname } = params;

    // Fetch business profile data first to get business.business_id
    const { businessData: business, themeColorButton, themeColorText} = await getBusinessProfileLeanData(business_urlname);

    if (!business) {
        // If business data fetching failed or business not found, return 404
        console.error(`[page.tsx] Business not found or error fetching for URL`);
        notFound();
    }

    // Now fetch booking services data using the actual business_id
    // getBookingServicesData returns { services, categories }
    const { services, categories } = await getBookingServicesData(business.business_id);

    console.log("[page.tsx] Passing to Client Component - Services:", services);
    console.log("[page.tsx] Passing to Client Component - Categories:", categories);

    return (
        <BookingPageClientContent
            business={business}
            services={services}
            categories={categories} // Pass the fetched categories
            locale={locale}
        />
    );
}
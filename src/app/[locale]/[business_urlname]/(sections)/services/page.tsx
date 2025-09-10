// src/app/[locale]/[business_urlname]/(sections)/services/page.tsx

import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server'; // Keep if used elsewhere
import { getServiceRequestServicesData } from '@/lib/data/business-profile';
import ServiceRequestWrapper from '@/components/profile/sections/services/ServiceRequestWrapper';

interface ServiceRequestPageParams {
  locale: string;
  business_urlname: string;
}

export async function generateMetadata({ params }: { params: ServiceRequestPageParams }) {
    return {
        title: "Flowia",
        description: "Flowia",
    };
}

export default async function ServiceRequestPage({ params }: { params: ServiceRequestPageParams }) {
    const { locale, business_urlname } = params; // 'locale' is destructured, but not passed to client component

    // OPTIMIZED: Only fetch services data - business data is already available from layout
    const { services, categories } = await getServiceRequestServicesData(business_urlname);

    console.log("[page.tsx] Passing to Client Component - Services:", services);
    console.log("[page.tsx] Passing to Client Component - Categories:", categories);

    return (
        <ServiceRequestWrapper
            services={services}
            categories={categories}
        />
    );
}
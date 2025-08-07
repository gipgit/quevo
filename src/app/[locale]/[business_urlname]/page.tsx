// src/app/[locale]/[business_urlname]/page.tsx
// This page renders the default section content directly based on user settings

import { notFound } from 'next/navigation';
import { getServiceRequestServicesData, getPromotionsData, getRewardsData, getProductsData } from '@/lib/data/business-profile';
import ServiceRequestWrapper from '@/components/profile/sections/services/ServiceRequestWrapper';
import prisma from '@/lib/prisma';

import { getCachingSettings } from '@/lib/config/caching';

// OPTIMIZED: Add ISR for better performance on free tier
const cachingSettings = getCachingSettings();
export const revalidate = cachingSettings.revalidate;
export const dynamic = cachingSettings.dynamic;
export const fetchCache = cachingSettings.fetchCache;

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

export default async function BusinessRootPage({ params }: { params: ServiceRequestPageParams }) {
    const { locale, business_urlname } = params;

    if (!business_urlname) {
        notFound();
    }

    // OPTIMIZED: Get only the default_page setting first
    const business = await prisma.business.findUnique({
        where: { business_urlname },
        select: {
            business_id: true,
            businessprofilesettings: {
                select: { default_page: true }
            }
        }
    });

    if (!business) {
        notFound();
    }

    const defaultPage = business.businessprofilesettings?.default_page || 'services';

    // OPTIMIZED: Conditionally fetch section data based on default_page
    switch (defaultPage) {
        case 'services':
            const { services, categories } = await getServiceRequestServicesData(business_urlname);
            return (
                <ServiceRequestWrapper
                    services={services}
                    categories={categories}
                />
            );
            
        case 'promotions':
            const promotions = await getPromotionsData(business.business_id);
            // Import and render promotions component
            const PromotionsPageClientContent = (await import('@/components/profile/sections/promotions/PromotionsPageClientContent')).default;
            return <PromotionsPageClientContent initialPromotionsData={{ businessData: business, promotions }} />;
            
        case 'rewards':
            const rewards = await getRewardsData(business.business_id);
            // Import and render rewards component
            const RewardsPageClientContent = (await import('@/components/profile/sections/rewards/RewardsPageClientContent')).default;
            return <RewardsPageClientContent initialRewardsData={{ businessData: business, rewards }} />;
            
        case 'products':
            const productsData = await getProductsData(business_urlname) as { businessMenuItems: any[] };
            // Import and render products component
            const ProductsPageClientContent = (await import('@/components/profile/sections/products/ProductsPageClientContent')).default;
            return <ProductsPageClientContent businessMenuItems={productsData.businessMenuItems} />;
            
        default:
            // For any other default page type, fallback to services
            const { services: fallbackServices, categories: fallbackCategories } = await getServiceRequestServicesData(business_urlname);
            return (
                <ServiceRequestWrapper
                    services={fallbackServices}
                    categories={fallbackCategories}
                />
            );
    }
}
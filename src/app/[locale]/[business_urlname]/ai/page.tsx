// src/app/[locale]/[business_urlname]/ai/page.tsx
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getServiceRequestServicesData, getPromotionsData, getRewardsData, getProductsData } from '@/lib/data/business-profile';
import AIChatClientWrapper from './AIChatClientWrapper';

interface AIChatPageParams {
  locale: string;
  business_urlname: string;
}

export const revalidate = 0;
export const dynamic = 'auto';
export const fetchCache = 'force-no-store';

export async function generateMetadata({ params }: { params: AIChatPageParams }) {
    return {
        title: "AI Assistant - Flowia",
        description: "Chat with our AI assistant to explore services, get quotes, and more",
    };
}

export default async function AIChatPage({ params }: { params: AIChatPageParams }) {
    const { locale, business_urlname } = params;

    if (!business_urlname) {
        notFound();
    }

    // Get business data
    const business = await prisma.business.findUnique({
        where: { business_urlname },
        select: {
            business_id: true,
            business_name: true,
            business_descr: true,
            business_email: true,
            business_phone: true,
            business_img_profile: true,
            businessprofilesettings: {
                select: {
                    theme_color_background: true,
                    theme_color_text: true,
                    theme_color_button: true,
                }
            }
        }
    });

    if (!business) {
        notFound();
    }

    // Fetch all available data for the AI assistant
    const [servicesData, promotions, rewards, productsData] = await Promise.all([
        getServiceRequestServicesData(business_urlname),
        getPromotionsData(business.business_id),
        getRewardsData(business.business_id),
        getProductsData(business_urlname)
    ]);

    // Prepare the initial data for the AI assistant
    const aiAssistantData = {
        business: {
            id: business.business_id,
            name: business.business_name,
            description: business.business_descr || '',
            email: String(business.business_email || ''),
            phone: String(business.business_phone || ''),
            img_profile: business.business_img_profile || undefined,
        },
        services: servicesData.services,
        categories: servicesData.categories,
        promotions,
        rewards,
        products: (productsData as any).businessMenuItems || [],
        themeColors: {
            background: business.businessprofilesettings?.theme_color_background || '#FFFFFF',
            text: business.businessprofilesettings?.theme_color_text || '#000000',
            button: business.businessprofilesettings?.theme_color_button || '#007bff',
        }
    };

    return (
        <div className="w-full mx-auto">
            <AIChatClientWrapper initialData={aiAssistantData} />
        </div>
    );
}

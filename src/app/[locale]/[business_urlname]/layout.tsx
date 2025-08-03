// src/app/[locale]/[business_urlname]/layout.tsx
// This is a Server Component.

import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { BusinessProfileClientWrapper } from './BusinessProfileClientWrapper';
import '@/app/styles/business.css';
import { getTranslations } from 'next-intl/server';
import { hexToRgb, adjustColor } from '@/lib/utils/colors'; // Make sure this path is correct


// Function to get social icon path (can be moved to a utils file if used elsewhere)
const getSocialIconPath = (linkType: string) => {
    const iconMap: { [key: string]: string } = {
        website: '/icons/website.svg', google_review: '/icons/google.png',
        facebook: '/icons/links-icons/facebook.svg', instagram: '/icons/links-icons/instagram.svg',
        whatsapp: '/icons/links-icons/whatsapp.svg', telegram: '/icons/links-icons/telegram.svg',
        tiktok: '/icons/links-icons/tiktok.svg', youtube: '/icons/links-icons/youtube.svg',
        linkedin: '/icons/links-icons/linkedin.svg', twitter: '/icons/links-icons/twitter.com.svg',
        pinterest: '/icons/links-icons/pinterest.svg', snapchat: '/icons/links-icons/snapchat.svg',
    };
    return iconMap[linkType.toLowerCase()] || `/icons/links-icons/${linkType.toLowerCase()}.svg`;
};

// Available fonts (can be moved to a config file)
const AVAILABLE_FONTS_PUBLIC = [
    { font_id: 1, font_name: 'Font1', font_css_stack: 'Font1, Arial, serif' },
    { font_id: 2, font_name: 'Font2', font_css_stack: 'Font2, Arial, serif' },
    { font_id: 3, font_name: 'Font3', font_css_stack: 'Font3, Arial, serif' },
    { font_id: 4, font_name: 'Font4', font_css_stack: "Font4, Arial, serif" },
    { font_id: 5, font_name: 'Font5', font_css_stack: "Font5, Arial, serif" }
];


export async function generateMetadata({ params }: { params: { business_urlname: string } }) {
    const { business_urlname } = params;
    const t = await getTranslations('Common');

    const business = await prisma.business.findUnique({
        where: { business_urlname: business_urlname },
        select: { business_name: true, business_descr: true, business_public_uuid: true },
    });

    if (!business) {
        return {
            title: t('errorBusinessNotFoundTitle'),
            description: t('errorBusinessNotFoundDescription'),
        };
    }
    const profileImageUrl = `/uploads/business/profile/${business.business_public_uuid}.webp`;
    return {
        title: business.business_name,
        description: business.business_descr || t('defaultBusinessDescription', { businessName: business.business_name }),
        openGraph: {
            title: business.business_name,
            description: business.business_descr || t('defaultBusinessDescription', { businessName: business.business_name }),
            url: `https://your-app-domain.com/${business_urlname}`,
            siteName: 'Your App Name',
            images: [{ url: profileImageUrl, width: 800, height: 600, alt: `${business.business_name} Profile` }],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: business.business_name,
            description: business.business_descr || t('defaultBusinessDescription', { businessName: business.business_name }),
            creator: '@yourtwitterhandle',
            images: [profileImageUrl],
        },
    };
}

// Set revalidation time for this layout's data (e.g., every hour, as it's common data)
export const revalidate = 3600; // 1 hour

export default async function BusinessProfileLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { business_urlname: string };
}) {
    const { business_urlname } = params;
    const t = await getTranslations('Common');

    console.log(`[${new Date().toISOString()}] Server Layout - Request received for:`, business_urlname);

    if (!business_urlname) {
        notFound();
    }

    let data: any = null;
    let error: string | null = null;

    try {
        const businessData = await prisma.business.findUnique({
            where: { business_urlname: business_urlname },
            include: {
                businessprofilesettings: true, // Keep this for general settings and default_page
                businesslink: true,          // Keep for universally displayed links (website, social icons in header/footer)
                businesspaymentmethod: { include: { paymentmethod: true } }, // Keep if payment methods are always visible
            },
        });

        console.log(`[${new Date().toISOString()}] Server Layout - Prisma findUnique result for ${business_urlname}:`, businessData ? 'FOUND' : 'NOT FOUND', businessData?.business_name || '');

        if (!businessData) {
            notFound();
        }

        const defaultSettings = {
            default_page: 'products',
            theme_color_background: '#FFFFFF', theme_color_text: '#000000', theme_color_button: '#000000', theme_font: '1', show_address: true, show_website: true, show_socials: true, show_btn_booking: true, show_btn_payments: true, show_btn_review: true, show_btn_phone: true, show_btn_email: true, show_btn_order: false,
        };
        const businessSettings = businessData.businessprofilesettings ? {
            ...businessData.businessprofilesettings,
            last_updated: businessData.businessprofilesettings.last_updated?.toISOString() || null,
        } : defaultSettings;

        const selectedFont = AVAILABLE_FONTS_PUBLIC.find(
            (font) => font.font_id === parseInt(businessSettings.theme_font ?? '1', 10)
        );
        const themeFontCssStack = selectedFont ? selectedFont.font_css_stack : 'Arial, sans-serif';

        const processedBusinessLinks = businessData.businesslink.map(link => {
            return {
                ...link,
                label: link.link_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                icon: getSocialIconPath(link.link_type)
            };
        });

        let websiteLinkUrl: string | null = null;
        let googleReviewLinkUrl: string | null = null;
        let bookingLinkUrl = `/${business_urlname}/booking`;
        businessData.businesslink.forEach(link => {
            if (link.link_type === 'website') { websiteLinkUrl = link.link_url; }
            if (link.link_type === 'google_review') { googleReviewLinkUrl = link.link_url; }
        });

        const profileImageUrl = `/uploads/business/${businessData.business_public_uuid}/profile.webp`;
        const coverImageUrl = `/uploads/business/${businessData.business_public_uuid}/cover.webp`;


        data = {
            businessData: {
                business_id: businessData.business_id,
                business_name: businessData.business_name,
                business_descr: businessData.business_descr,
                business_city: businessData.business_city,
                business_country: businessData.business_country,
                business_region: businessData.business_region,
                business_address: businessData.business_address,
                business_phone: businessData.business_phone,
                business_email: businessData.business_email,
                business_public_uuid: businessData.business_public_uuid,
                business_urlname: businessData.business_urlname,
                business_urlname_last_edited: businessData.business_urlname_last_edited?.toISOString() || null,
                date_created: businessData.date_created?.toISOString() || null,
                business_img_profile: profileImageUrl,
                business_img_cover: coverImageUrl,
            },
            businessSettings: { ...businessSettings, theme_font_css_stack: themeFontCssStack },
            businessLinks: processedBusinessLinks,
            websiteLinkUrl: websiteLinkUrl,
            googleReviewLinkUrl: googleReviewLinkUrl,
            bookingLinkUrl: bookingLinkUrl,
            businessPaymentMethods: businessData.businesspaymentmethod.map((bpm: any) => {
                let details = {};
                if (bpm.method_details_json) {
                    try {
                        details = typeof bpm.method_details_json === 'string' ? JSON.parse(bpm.method_details_json) : bpm.method_details_json;
                    } catch (e) {
                        console.error("Error processing method_details_json:", e);
                    }
                }
                return {
                    ...bpm,
                    details: details,
                    label: bpm.paymentmethod.method_name,
                    icon: `/icons/payment_icons/${bpm.paymentmethod.method_name.toLowerCase().replace(/\s/g, '_')}.svg`
                };
            }),
        };

        const themeColorText = data.businessSettings.theme_color_text || '#000000';
        const themeColorBackground = data.businessSettings.theme_color_background || '#FFFFFF';
        const themeColorButton = data.businessSettings.theme_color_button || '#000000';
        const themeFont = data.businessSettings.theme_font_css_stack;

        const themeColorTextRgb = hexToRgb(themeColorText);
        const borderColorOpacity = 0.1;
        const themeColorBorder = `rgba(${themeColorTextRgb}, ${borderColorOpacity})`;
        
        // Generate new background colors based on luminance
        const themeColorBackgroundSecondary = adjustColor(themeColorBackground, 0.18, 0.025);
        const themeColorBackgroundCard = adjustColor(themeColorBackground, 0.18, 0.135); 
        
        const isDarkBackground = parseInt(themeColorBackground.replace('#', ''), 16) < (0xFFFFFF / 2);

        data.themeVariables = {
            '--theme-font': themeFont,
            '--theme-color-background': themeColorBackground,
            '--theme-color-background-secondary': themeColorBackgroundSecondary, // New variable
            '--theme-color-background-card': themeColorBackgroundCard,       // New variable
            '--theme-color-text': themeColorText,
            '--theme-color-button': themeColorButton,
            '--theme-color-text-rgb': themeColorTextRgb ? themeColorTextRgb.join(',') : '0,0,0',
            '--border-color-opacity': borderColorOpacity,
            '--profile-nav-border-color': isDarkBackground ? 'rgba(255, 255, 255, 0.19)' : 'rgba(0, 0, 0, 0.18)',
            '--section-active-border-color': isDarkBackground ? 'rgb(255, 255, 255)' : 'rgb(14, 14, 14)',
            '--category-pills-wrapper-background': isDarkBackground ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.075)',
            '--category-pill-border-color': isDarkBackground ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
            '--accordion-item-border-color': isDarkBackground ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
            '--card-item-background': isDarkBackground ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.025)',
            '--card-item-box-shadow': isDarkBackground ? '0 1px 5px rgba(255, 255, 255, 0.2)' : '0 1px 5px #03030308',
            '--order-bar-box-shadow': isDarkBackground ? '0 -2px 10px rgba(255,255,255,0.1)' : '0 -2px 10px rgba(0,0,0,0.1)',
            '--is-dark-background': isDarkBackground ? '1' : '0',
        };
        data.themeColorText = themeColorText;
        data.themeColorBackground = themeColorBackground;
        data.themeColorButton = themeColorButton;
        data.themeColorBackgroundSecondary = themeColorBackgroundSecondary; 
        data.themeColorBackgroundCard = themeColorBackgroundCard;   
        data.themeColorBorder = themeColorBorder;   

    } catch (e: any) {
        console.error(`[${new Date().toISOString()}] BusinessProfileLayout: Caught error fetching or processing business data for ${business_urlname}:`, e.message, e.stack);
        error = t('errorFetchingBusinessData', { error: e.message });
    }


    if (error) {
        return <div className="text-center py-10 text-red-500">{t('error')}: {error}</div>;
    }

    if (!data) {
        console.warn(`[${new Date().toISOString()}] Server Layout - 'data' is null/undefined unexpectedly after processing, but no explicit error for ${business_urlname}.`);
        return <div className="text-center py-10">{t('loadingLayout')}</div>;
    }

    const cssVariables = data.themeVariables;
    const bodyClass = data.isDarkBackground ? 'body--dark-bg' : 'body--light-bg';

    return (
        <BusinessProfileClientWrapper initialServerData={data} cssVariables={cssVariables} bodyClass={bodyClass}>
            {children}
        </BusinessProfileClientWrapper>
    );
}

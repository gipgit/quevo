// src/app/(main)/[business_urlname]/layout.tsx


import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma'; 
import { BusinessProfileClientWrapper } from './BusinessProfileClientWrapper';

import '@/app/styles/business.css';


import { hexToRgb } from '@/lib/utils/colors';

function lightenHexColor(hex: string, percent: number) {
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#') || hex.length !== 7) {
        return hex;
    }
    const f = parseInt(hex.slice(1), 16);
    const t = 255;
    const p = percent;
    const R = (f >> 16);
    const G = (f >> 8) & 0x00ff;
    const B = f & 0x0000ff;
    const newR = Math.min(255, Math.max(0, Math.round(R + (t - R) * p)));
    const newG = Math.min(255, Math.max(0, Math.round(G + (t - G) * p)));
    const newB = Math.min(255, Math.max(0, Math.round(B + (t - B) * p)));
    return "#" + ((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1).toUpperCase();
}

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

const AVAILABLE_FONTS_PUBLIC = [{ font_id: 1, font_name: 'Font1', font_css_stack: 'Font1, Arial, serif' }, { font_id: 2, font_name: 'Font2', font_css_stack: 'Font2, Arial, serif' }, { font_id: 3, font_name: 'Font3', font_css_stack: 'Font3, Arial, serif' }, { font_id: 4, font_name: 'Font4', font_css_stack: "Font4, Arial, serif" }, { font_id: 5, font_name: 'Font5', font_css_stack: "Font5, Arial, serif" }];


export async function generateMetadata({ params }: { params: { business_urlname: string } }) {
    const { business_urlname } = params;
    const business = await prisma.business.findUnique({
        where: { business_urlname: business_urlname },
        select: { business_name: true, business_descr: true, business_public_uuid: true },
    });
    if (!business) {
        return { title: 'Business Not Found', description: 'The requested business profile could not be found.' };
    }
    const profileImageUrl = `/uploads/business/profile/${business.business_public_uuid}.webp`;
    return {
        title: business.business_name,
        description: business.business_descr || `Discover ${business.business_name}'s profile and products.`,
        openGraph: {
            title: business.business_name,
            description: business.business_descr || `Discover ${business.business_name}'s profile and products.`,
            url: `https://your-app-domain.com/${business_urlname}`,
            siteName: 'Your App Name',
            images: [{ url: profileImageUrl, width: 800, height: 600, alt: `${business.business_name} Profile` }],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: business.business_name,
            description: business.business_descr || `Discover ${business.business_name}'s profile and products.`,
            creator: '@yourtwitterhandle',
            images: [profileImageUrl],
        },
    };
}


export default async function BusinessProfileLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { business_urlname: string };
}) {
    const { business_urlname } = params;

    console.log(`[${new Date().toISOString()}] Server Layout - Request received for:`, business_urlname);

    if (!business_urlname) {
        console.log(`[${new Date().toISOString()}] Server Layout - business_urlname is missing, calling notFound().`);
        notFound();
    }

    let data: any = null; 
    let error: string | null = null;

    try {
        const businessData = await prisma.business.findUnique({
            where: { business_urlname: business_urlname },
            include: {
                businessprofilesettings: true,
                businesslink: true,
                businesspaymentmethod: { include: { paymentmethod: true } },
                menuitem: { include: { menuitemvariation: { orderBy: { variation_name: 'asc' } }, menucategory: true }, orderBy: { display_order: 'asc' } },
                menucategory: { orderBy: { display_order: 'asc' } },
                promo: true,
                businessreward: true,
            },
        });

        console.log(`[${new Date().toISOString()}] Server Layout - Prisma findUnique result for ${business_urlname}:`, businessData ? 'FOUND' : 'NOT FOUND', businessData?.business_name || '');

        if (!businessData) {
            console.log(`[${new Date().toISOString()}] Server Layout - businessData not found from Prisma, calling notFound().`);
            notFound();
        }

      
        const defaultSettings = {
            default_page: 'home', theme_color_background: '#FFFFFF', theme_color_text: '#000000', theme_color_button: '#000000', theme_font: '1', show_address: true, show_website: true, show_socials: true, show_btn_booking: true, show_btn_payments: true, show_btn_review: true, show_btn_phone: true, show_btn_email: true, show_btn_order: false,
        };
        const businessSettings = businessData.businessprofilesettings ? {
            ...businessData.businessprofilesettings,
            last_updated: businessData.businessprofilesettings.last_updated?.toISOString() || null,
        } : defaultSettings;

        const selectedFont = AVAILABLE_FONTS_PUBLIC.find(
            (font) => font.font_id === parseInt(businessSettings.theme_font, 10)
        );
        const themeFontCssStack = selectedFont ? selectedFont.font_css_stack : 'Arial, sans-serif';

        const processedBusinessLinks = businessData.businesslink.map(link => {
            return {
                ...link,
                label: link.link_name || link.link_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                icon: getSocialIconPath(link.link_type)
            };
        });

        let websiteLinkUrl: string | null = null;
        let googleReviewLinkUrl: string | null = null;
        let bookingLinkUrl = `/booking?b=${business_urlname}`;
        businessData.businesslink.forEach(link => {
            if (link.link_type === 'website') { websiteLinkUrl = link.link_url; }
            if (link.link_type === 'google_review') { googleReviewLinkUrl = link.link_url; }
        });

        const profileImageUrl = `/uploads/business/profile/${businessData.business_public_uuid}.webp`;
        const coverImageUrl = `/uploads/business/cover/${businessData.business_public_uuid}.webp`;

        const menuItemsByCategory: { [key: number]: any } = {};
        const allCategories = businessData.menucategory || [];
        allCategories.forEach(cat => { menuItemsByCategory[cat.category_id] = { category_id: cat.category_id, category_name: cat.category_name, display_order: cat.display_order, items: [] }; });
        const UNCAT_CATEGORY_ID = -1;
        if (!menuItemsByCategory[UNCAT_CATEGORY_ID]) {
            menuItemsByCategory[UNCAT_CATEGORY_ID] = { category_id: UNCAT_CATEGORY_ID, category_name: 'Altro', display_order: Infinity, items: [] };
        }
        businessData.menuitem?.forEach(item => {
            let itemImageUrl = null;
            if (item.image_available) { itemImageUrl = `/uploads/menu/${businessData.business_public_uuid}/item_${item.item_id}.webp`; }
            const processedItem = {
                ...item, price: item.price?.toString() || null, item_img: itemImageUrl,
                date_created: item.date_created?.toISOString() || null, date_update: item.date_update?.toISOString() || null,
                menucategory: item.menucategory ? { ...item.menucategory, date_created: item.menucategory.date_created?.toISOString() || null, date_update: item.menucategory.date_update?.toISOString() || null, } : null,
                menuitemvariation: item.menuitemvariation?.map((variation: any) => { // Use any for variation
                    let calculatedVariationPrice;
                    if (variation.price_override !== null && variation.price_override !== undefined) { calculatedVariationPrice = parseFloat(variation.price_override.toString());
                    } else if (variation.price_modifier !== null && variation.price_modifier !== undefined) { calculatedVariationPrice = (parseFloat(item.price?.toString() || '0') + parseFloat(variation.price_modifier?.toString() || '0'));
                    } else { calculatedVariationPrice = parseFloat(item.price?.toString() || '0'); }
                    return { ...variation, calculated_variation_price: calculatedVariationPrice?.toString() || null, price_override: variation.price_override?.toString() || null, price_modifier: variation.price_modifier?.toString() || null, date_created: variation.date_created?.toISOString() || null, date_update: variation.date_update?.toISOString() || null, };
                }) || [],
            };
            const targetCategoryId = processedItem.category_id || UNCAT_CATEGORY_ID;
            if (menuItemsByCategory[targetCategoryId]) { menuItemsByCategory[targetCategoryId].items.push(processedItem); } else { menuItemsByCategory[UNCAT_CATEGORY_ID].items.push(processedItem); }
        });
        const sortedCategoriesWithItems = Object.values(menuItemsByCategory).filter(cat => cat.items.length > 0).sort((a: any, b: any) => { if (a.category_id === UNCAT_CATEGORY_ID) return 1; if (b.category_id === UNCAT_CATEGORY_ID) return -1; if (a.display_order !== b.display_order) { return a.display_order - b.display_order; } return a.category_name.localeCompare(b.category_name); });

        const businessPromos = businessData.promo?.map((promo: any) => ({ 
            ...promo,
            date_created: promo.date_created?.toISOString() || null,
            date_start: promo.date_start?.toISOString() || null,
            date_end: promo.date_end?.toISOString() || null,
        })) || [];

        const businessRewards = businessData.businessreward?.map((reward: any) => ({ 
            ...reward,
            reward_start_date: reward.reward_start_date?.toISOString() || null,
            reward_end_date: reward.reward_end_date?.toISOString() || null,
        })) || [];


        data = {
            businessData: {
                business_name: businessData.business_name, business_descr: businessData.business_descr, business_city: businessData.business_city, business_country: businessData.business_country, business_region: businessData.business_region, business_address: businessData.business_address, business_phone: businessData.business_phone, business_email: businessData.business_email, business_public_uuid: businessData.business_public_uuid, business_urlname: businessData.business_urlname, business_urlname_last_edited: businessData.business_urlname_last_edited?.toISOString() || null, date_created: businessData.date_created?.toISOString() || null, business_img_profile: profileImageUrl, business_img_cover: coverImageUrl,
            },
            businessSettings: { ...businessSettings, theme_font_css_stack: themeFontCssStack, },
            businessLinks: processedBusinessLinks,
            websiteLinkUrl: websiteLinkUrl, googleReviewLinkUrl: googleReviewLinkUrl, bookingLinkUrl: bookingLinkUrl,
            businessPaymentMethods: businessData.businesspaymentmethod.map((bpm: any) => { 
                let details = {};
                if (bpm.method_details_json) {
                    try { details = typeof bpm.method_details_json === 'string' ? JSON.parse(bpm.method_details_json) : bpm.method_details_json; } catch (e) { console.error("Error processing method_details_json:", e); }
                }
                return { ...bpm, details: details, label: bpm.paymentmethod.method_name, icon: `/icons/payment_icons/${bpm.paymentmethod.method_name.toLowerCase().replace(/\s/g, '_')}.svg` };
            }),
            businessMenuItems: sortedCategoriesWithItems,
            businessPromos: businessPromos,
            businessRewards: businessRewards,
            businessServices: [], 
        };

       
        const themeColorText = data.businessSettings.theme_color_text || '#000000';
        const themeColorBackground = data.businessSettings.theme_color_background || '#FFFFFF';
        const themeColorButton = data.businessSettings.theme_color_button || '#000000';
        const themeFont = data.businessSettings.theme_font_css_stack;

        const themeColorTextRgb = hexToRgb(themeColorText);
        const borderColorOpacity = 0.2;
        const lighterThemeColorBackground = lightenHexColor(themeColorBackground, 0.2);
        const isDarkBackground = parseInt(themeColorBackground.replace('#', ''), 16) < (0xFFFFFF / 2);

        data.themeVariables = { 
            '--theme-font': themeFont,
            '--theme-color-background': themeColorBackground,
            '--lighter-theme-color-background': lighterThemeColorBackground,
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
        data.isDarkBackground = isDarkBackground;

        console.log(`[${new Date().toISOString()}] Server Layout - Final 'data' object structure for ${business_urlname}:`);
        console.log(JSON.stringify({
            hasBusinessData: !!data.businessData,
            hasSettings: !!data.businessSettings,
            hasLinks: data.businessLinks?.length > 0,
            hasMenuItems: data.businessMenuItems?.length > 0,
            hasThemeVariables: !!data.themeVariables,
            businessName: data.businessData?.business_name,
            businessUUID: data.businessData?.business_public_uuid,
            themeBackground: data.themeColorBackground,
        }, null, 2)); 


    } catch (e: any) {
        console.error(`[${new Date().toISOString()}] BusinessProfileLayout: Caught error fetching or processing business data for ${business_urlname}:`, e.message, e.stack);
        error = 'Failed to load business data: ' + e.message;
    }

    console.log(`[${new Date().toISOString()}] Server Layout - Before return: data is ${data ? 'populated' : 'null'}, error is ${error ? 'present' : 'null'} for ${business_urlname}`);


    if (error) {
        return <div className="text-center py-10 text-red-500">Errore: {error}</div>;
    }

    if (!data) { 
        console.warn(`[${new Date().toISOString()}] Server Layout - 'data' is null/undefined unexpectedly after processing, but no explicit error for ${business_urlname}.`);
        return <div className="text-center py-10">Caricamento layout...</div>;
    }

    const cssVariables = data.themeVariables;
    const bodyClass = data.isDarkBackground ? 'body--dark-bg' : 'body--light-bg';

    return (
        <BusinessProfileClientWrapper initialServerData={data} cssVariables={cssVariables} bodyClass={bodyClass}>
            {children}
        </BusinessProfileClientWrapper>
    );
}
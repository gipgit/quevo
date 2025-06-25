// src/app/(main)/[business_urlname]/page.js

// IMPORTS FOR THE SERVER COMPONENT (the main 'page' export)
// These imports are for elements that can be rendered on the server or passed as props.
import { notFound } from 'next/navigation'; // For proper 404 handling in App Router
import prisma from '@/lib/prisma'; // Assuming you have an alias set up for your lib folder
import './business.css'; // This CSS is loaded by the Server Component, applied immediately

// Import the new Client Component file
import BusinessProfileClient from './BusinessProfileClient'; // Updated path

// Import the hexToRgb utility here, as it's needed server-side to calculate CSS variables.
// Ensure this utility function is pure JavaScript and does not use browser-specific APIs (e.g., document, window).
import { hexToRgb } from '@/lib/utils/colors'; // Assuming this path is correct and the file is server-compatible

// --- Utility function for lightening hex colors (server-side safe) ---
// This function will lighten a hex color by a given percentage towards white (255,255,255).
function lightenHexColor(hex, percent) {
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#') || hex.length !== 7) {
        console.warn("Invalid hex color provided to lightenHexColor:", hex);
        return hex; // Return original if invalid
    }

    var f = parseInt(hex.slice(1), 16),
        t = 255, // Target component value for white
        p = percent;

    var R = (f >> 16),
        G = (f >> 8) & 0x00ff,
        B = f & 0x0000ff;

    R = Math.round(R + (t - R) * p);
    G = Math.round(G + (t - G) * p);
    B = Math.round(B + (t - B) * p);

    // Ensure values are within 0-255 range
    R = Math.min(255, Math.max(0, R));
    G = Math.min(255, Math.max(0, G));
    B = Math.min(255, Math.max(0, B));

    return "#" + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1).toUpperCase();
}


// Hardcoded Fonts (Moved here as they are data used by the server component to determine the font stack for the client component)
const AVAILABLE_FONTS_PUBLIC = [{
    font_id: 1,
    font_name: 'Font1',
    font_css_stack: 'Font1, Arial, serif'
}, {
    font_id: 2,
    font_name: 'Font2',
    font_css_stack: 'Font2, Arial, serif'
}, {
    font_id: 3,
    font_name: 'Font3',
    font_css_stack: 'Font3, Arial, serif'
}, {
    font_id: 4,
    font_name: 'Font4',
    font_css_stack: "Font4, Arial, serif"
}, {
    font_id: 5,
    font_name: 'Font5',
    font_css_stack: "Font5, Arial, serif"
}];


// --- SERVER COMPONENT: BusinessProfilePage ---
// This component fetches data on the server. It does NOT use any React hooks (useState, useEffect, useRef).
export default async function BusinessProfilePage({ params }) {
    const { business_urlname } = params;
    const activeSection = 'products'; // Default to 'products' for the index page

    let data = null;
    let error = null;

    try {
        const businessData = await prisma.business.findUnique({
            where: {
                business_urlname: business_urlname,
            },
            include: {
                businessprofilesettings: true,
                businesslink: true,
                businesspaymentmethod: {
                    include: {
                        paymentmethod: true,
                    },
                },
                menuitem: {
                    include: {
                        menuitemvariation: {
                            orderBy: {
                                variation_name: 'asc'
                            }
                        },
                        menucategory: true,
                    },
                    orderBy: {
                        display_order: 'asc',
                    }
                },
                menucategory: {
                    orderBy: {
                        display_order: 'asc'
                    }
                },
            },
        });

        if (!businessData) {
            notFound(); // Use Next.js's notFound() helper for proper 404 response
        }

        const defaultSettings = {
            default_page: 'home',
            theme_color_background: '#FFFFFF',
            theme_color_text: '#000000',
            theme_color_button: '#000000',
            theme_font: '1',
            show_address: true,
            show_website: true,
            show_socials: true,
            show_btn_booking: true,
            show_btn_payments: true,
            show_btn_review: true,
            show_btn_phone: true,
            show_btn_email: true,
            show_btn_order: false,
        };

        const businessSettings = businessData.businessprofilesettings ? {
            ...businessData.businessprofilesettings,
            last_updated: businessData.businessprofilesettings.last_updated?.toISOString() || null,
        } : defaultSettings;

        const selectedFont = AVAILABLE_FONTS_PUBLIC.find(
            (font) => font.font_id === parseInt(businessSettings.theme_font, 10)
        );
        const themeFontCssStack = selectedFont ? selectedFont.font_css_stack : 'Arial, sans-serif';

        const getSocialIconPath = (linkType) => {
            const iconMap = {
                website: '/icons/website.svg',
                google_review: '/icons/google.png',
                facebook: '/icons/links-icons/facebook.svg',
                instagram: '/icons/links-icons/instagram.svg',
                whatsapp: '/icons/links-icons/whatsapp.svg',
                telegram: '/icons/links-icons/telegram.svg',
                tiktok: '/icons/links-icons/tiktok.svg',
                youtube: '/icons/links-icons/youtube.svg',
                linkedin: '/icons/links-icons/linkedin.svg',
                twitter: '/icons/links-icons/twitter.com.svg',
                pinterest: '/icons/links-icons/pinterest.svg',
                snapchat: '/icons/links-icons/snapchat.svg',
            };
            return iconMap[linkType.toLowerCase()] || `/icons/links-icons/${linkType.toLowerCase()}.svg`;
        };

        const processedBusinessLinks = businessData.businesslink.map(link => {
            return {
                ...link,
                label: link.link_name || link.link_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                icon: getSocialIconPath(link.link_type)
            };
        });

        let websiteLinkUrl = null;
        let googleReviewLinkUrl = null;
        let bookingLinkUrl = `/booking?b=${business_urlname}`;

        businessData.businesslink.forEach(link => {
            if (link.link_type === 'website') {
                websiteLinkUrl = link.link_url;
            }
            if (link.link_type === 'google_review') {
                googleReviewLinkUrl = link.link_url;
            }
        });

        const profileImageUrl = `/uploads/business/profile/${businessData.business_public_uuid}.webp`;
        const coverImageUrl = `/uploads/business/cover/${businessData.business_public_uuid}.webp`;

        const menuItemsByCategory = {};
        const allCategories = businessData.menucategory || [];

        allCategories.forEach(cat => {
            menuItemsByCategory[cat.category_id] = {
                category_id: cat.category_id,
                category_name: cat.category_name,
                display_order: cat.display_order,
                items: []
            };
        });

        const UNCAT_CATEGORY_ID = -1;
        if (!menuItemsByCategory[UNCAT_CATEGORY_ID]) {
            menuItemsByCategory[UNCAT_CATEGORY_ID] = {
                category_id: UNCAT_CATEGORY_ID,
                category_name: 'Altro',
                display_order: Infinity,
                items: []
            };
        }

        businessData.menuitem?.forEach(item => {
            let itemImageUrl = null;
            if (item.image_available) {
                itemImageUrl = `/uploads/menu/${businessData.business_public_uuid}/item_${item.item_id}.webp`;
            }

            const processedItem = {
                ...item,
                price: item.price?.toString() || null,
                item_img: itemImageUrl,
                date_created: item.date_created?.toISOString() || null,
                date_update: item.date_update?.toISOString() || null,

                menucategory: item.menucategory ? {
                    ...item.menucategory,
                    date_created: item.menucategory.date_created?.toISOString() || null,
                    date_update: item.menucategory.date_update?.toISOString() || null,
                } : null,

                menuitemvariation: item.menuitemvariation?.map(variation => {
                    let calculatedVariationPrice;
                    if (variation.price_override !== null && variation.price_override !== undefined) {
                        calculatedVariationPrice = parseFloat(variation.price_override.toString());
                    } else if (variation.price_modifier !== null && variation.price_modifier !== undefined) {
                        calculatedVariationPrice = (parseFloat(item.price?.toString() || '0') + parseFloat(variation.price_modifier?.toString() || '0'));
                    } else {
                        calculatedVariationPrice = parseFloat(item.price?.toString() || '0');
                    }

                    return {
                        ...variation,
                        calculated_variation_price: calculatedVariationPrice?.toString() || null,
                        price_override: variation.price_override?.toString() || null,
                        price_modifier: variation.price_modifier?.toString() || null,
                        date_created: variation.date_created?.toISOString() || null,
                        date_update: variation.date_update?.toISOString() || null,
                    };
                }) || [],
            };

            const targetCategoryId = processedItem.category_id || UNCAT_CATEGORY_ID;
            if (menuItemsByCategory[targetCategoryId]) {
                menuItemsByCategory[targetCategoryId].items.push(processedItem);
            } else {
                menuItemsByCategory[UNCAT_CATEGORY_ID].items.push(processedItem);
            }
        });

        const sortedCategoriesWithItems = Object.values(menuItemsByCategory)
            .filter(cat => cat.items.length > 0)
            .sort((a, b) => {
                if (a.category_id === UNCAT_CATEGORY_ID) return 1;
                if (b.category_id === UNCAT_CATEGORY_ID) return -1;
                if (a.display_order !== b.display_order) {
                    return a.display_order - b.display_order;
                }
                return a.category_name.localeCompare(b.category_name);
            });

        data = {
            businessData: {
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
            businessSettings: {
                ...businessSettings,
                theme_font_css_stack: themeFontCssStack,
            },
            businessLinks: processedBusinessLinks,
            websiteLinkUrl: websiteLinkUrl,
            googleReviewLinkUrl: googleReviewLinkUrl,
            bookingLinkUrl: bookingLinkUrl,
            businessPaymentMethods: businessData.businesspaymentmethod.map(bpm => {
                let details = {};
                if (bpm.method_details_json) {
                    try {
                        details = typeof bpm.method_details_json === 'string'
                            ? JSON.parse(bpm.method_details_json)
                            : bpm.method_details_json;
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
            businessMenuItems: sortedCategoriesWithItems,
            businessPromos: [],
            businessServices: [],
            activeSection: activeSection,
        };
    } catch (e) {
        console.error('Error fetching business data:', e);
        error = 'Failed to load business data: ' + e.message;
    }

    if (error) {
        return <div className="text-center py-10 text-red-500">Errore: {error}</div>;
    }

    if (!data) {
        return <div className="text-center py-10">Caricamento...</div>;
    }

    // --- Start dynamic CSS variable calculation on the server ---
    const themeColorText = data.businessSettings.theme_color_text || '#000000';
    const themeColorBackground = data.businessSettings.theme_color_background || '#FFFFFF';
    const themeColorButton = data.businessSettings.theme_color_button || '#000000';
    const themeFont = data.businessSettings.theme_font_css_stack;

    // Calculate themeColorTextRgb on the server
    const themeColorTextRgb = hexToRgb(themeColorText);
    const borderColorOpacity = 0.2; // Static opacity, but can be dynamic if needed

    // Calculate a slightly lighter background color for profile-main
    // Adjust the percentage (e.g., 0.1 for 10% lighter, 0.05 for 5% lighter) as needed
    const lighterThemeColorBackground = lightenHexColor(themeColorBackground, 0.2); // 5% lighter

    const isDarkBackground = parseInt(themeColorBackground.replace('#', ''), 16) < (0xFFFFFF / 2);

    // Prepare CSS variables as a style object
    const cssVariables = {
        '--theme-font': themeFont,
        '--theme-color-background': themeColorBackground,
        '--lighter-theme-color-background': lighterThemeColorBackground, // New variable
        '--theme-color-text': themeColorText,
        '--theme-color-button': themeColorButton,
        '--theme-color-text-rgb': themeColorTextRgb, // Pass RGB value as a variable
        '--border-color-opacity': borderColorOpacity,

        '--profile-nav-border-color': isDarkBackground ? 'rgba(255, 255, 255, 0.19)' : '#00000030',
        '--section-active-border-color': isDarkBackground ? 'rgb(255, 255, 255)' : 'rgb(14, 14, 14)',
        '--category-pills-wrapper-background': isDarkBackground ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.15)',
        '--category-pill-border-color': isDarkBackground ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
        '--accordion-item-border-color': isDarkBackground ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
        '--card-item-background': isDarkBackground ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.025)',
        '--card-item-box-shadow': isDarkBackground ? '0 1px 5px rgba(255, 255, 255, 0.2)' : '0 1px 5px #03030308',
        '--order-bar-box-shadow': isDarkBackground ? '0 -2px 10px rgba(255,255,255,0.1)' : '0 -2px 10px rgba(0,0,0,0.1)',
    };

    // Determine the body class based on dark/light background
    const bodyClass = isDarkBackground ? 'body--dark-bg' : 'body--light-bg';

    // Render the Client Component and pass all fetched data as a single prop
    return (
        <div style={cssVariables} className={`min-h-screen ${bodyClass}`}>
            <BusinessProfileClient data={data} />
        </div>
    );
}
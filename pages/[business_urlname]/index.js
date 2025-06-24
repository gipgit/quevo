// pages/[business_urlname]/index.js
import Head from 'next/head';
import Image from 'next/image';
import Script from 'next/script';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import prisma from '../../src/lib/prisma';
import { hexToRgb } from '../../src/utils/colors';

import '../../public/css/business.css';

import BusinessProfileHeader from '../../components/BusinessProfileHeader';
import ProfileMenuOverlay from '../../components/modals/ProfileMenuOverlay';
import ContactModal from '../../components/modals/ContactModal';
import PaymentsModal from '../../components/modals/PaymentsModal';
import MenuCategoryAccordion from '../../components/MenuCategoryAccordion';

// Hardcoded Fonts (Must match the PHP logic for consistency)
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
}, ];


export async function getServerSideProps(context) {
    const { business_urlname } = context.params;
    const activeSection = 'products'; // Default to 'products' for the index page

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
                menuitem: { // Include menu items
                    include: {
                        menuitemvariation: {
                            orderBy: {
                                variation_name: 'asc'
                            }
                        },
                        menucategory: true, // This includes the related category object
                    },
                    orderBy: {
                        display_order: 'asc',
                    }
                },
                menucategory: { // Also fetch all categories for this business
                    orderBy: {
                        display_order: 'asc'
                    }
                },
            },
        });

        if (!businessData) {
            return {
                notFound: true
            };
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

        // Helper function for social icon paths
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
                twitter: '/icons/links-icons/twitter.svg',
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

        // Construct profile and cover image URLs using business_public_uuid
        const profileImageUrl = `/uploads/business/profile/${businessData.business_public_uuid}.webp`;
        const coverImageUrl = `/uploads/business/cover/${businessData.business_public_uuid}.webp`;

        // Process Menu Items and Group by Category
        const menuItemsByCategory = {};
        const allCategories = businessData.menucategory || [];

        // Initialize categories in the map, including a potential "Altro" (Uncategorized)
        allCategories.forEach(cat => {
            menuItemsByCategory[cat.category_id] = {
                category_id: cat.category_id,
                category_name: cat.category_name,
                display_order: cat.display_order,
                items: []
            };
        });

        const UNCAT_CATEGORY_ID = -1; // A unique ID for uncategorized items
        if (!menuItemsByCategory[UNCAT_CATEGORY_ID]) {
            menuItemsByCategory[UNCAT_CATEGORY_ID] = {
                category_id: UNCAT_CATEGORY_ID,
                category_name: 'Altro', // Or 'Uncategorized'
                display_order: Infinity, // Place at the very end
                items: []
            };
        }

        // Updated processing for menu items, checking `image_available`
        businessData.menuitem?.forEach(item => {
            let itemImageUrl = null;
            // Build the image URL only if image_available is true
            if (item.image_available) {
                itemImageUrl = `/uploads/menu/${businessData.business_public_uuid}/item_${item.item_id}.webp`;
            }

            const processedItem = {
                ...item,
                price: item.price?.toString() || null,
                item_img: itemImageUrl, // Will be the URL or null based on image_available
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
                        calculatedVariationPrice = parseFloat(variation.price_override);
                    } else if (variation.price_modifier !== null && variation.price_modifier !== undefined) {
                        calculatedVariationPrice = (parseFloat(item.price || '0') + parseFloat(variation.price_modifier || '0'));
                    } else {
                        calculatedVariationPrice = parseFloat(item.price || '0');
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


        // Convert map to sorted array of categories, filtering out empty ones
        const sortedCategoriesWithItems = Object.values(menuItemsByCategory)
            .filter(cat => cat.items.length > 0) // Only include categories that actually have items
            .sort((a, b) => {
                // Sort uncategorized to the end, then by display_order, then by name
                if (a.category_id === UNCAT_CATEGORY_ID) return 1;
                if (b.category_id === UNCAT_CATEGORY_ID) return -1;
                if (a.display_order !== b.display_order) {
                    return a.display_order - b.display_order;
                }
                return a.category_name.localeCompare(b.category_name);
            });


        const data = {
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
                // Pass the constructed image URLs
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
                        details = bpm.method_details_json;
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
            businessMenuItems: sortedCategoriesWithItems, // Now it's grouped by category
            businessPromos: [], // Assuming these are fetched elsewhere or not needed for products section
            businessServices: [], // Assuming these are fetched elsewhere or not needed for products section
            activeSection: activeSection,
        };

        return {
            props: {
                data,
            },
        };
    } catch (error) {
        console.error('Error fetching business data for index page:', error);
        return {
            props: {
                data: null,
                error: 'Failed to load business data.'
            },
        };
    }
}

export default function BusinessProfile({ data, error }) {
    const [showMenuOverlay, setShowMenuOverlay] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showPaymentsModal, setShowPaymentsModal] = useState(false);
    const [activeContactTab, setActiveContactTab] = useState('phone');
    const [activeCategory, setActiveCategory] = useState(null); // State for active category pill

    // Refs for each category section to scroll to
    const categoryRefs = useRef({});

    if (error) {
        return <div className="text-center py-10 text-red-500">Errore: {error}</div>;
    }

    if (!data) {
        return <div className="text-center py-10">Caricamento...</div>;
    }

    const {
        businessData,
        businessSettings,
        businessLinks,
        businessPaymentMethods,
        businessMenuItems, // This now contains the grouped categories and their items
        websiteLinkUrl,
        googleReviewLinkUrl,
        bookingLinkUrl,
        activeSection,
    } = data;

    const themeColorText = businessSettings.theme_color_text || '#000000';
    const themeColorBackground = businessSettings.theme_color_background || '#FFFFFF';
    const themeColorButton = businessSettings.theme_color_button || '#000000';
    const themeFont = businessSettings.theme_font_css_stack;
    const themeColorTextRgb = hexToRgb(themeColorText);
    const borderColorOpacity = 0.2;

    const isDarkBackground = parseInt(themeColorBackground.replace('#', ''), 16) < (0xFFFFFF / 2);
    const bodyClass = isDarkBackground ? 'body--dark-bg' : 'body--light-bg';

    const toggleMenuOverlay = () => setShowMenuOverlay(!showMenuOverlay);
    const toggleContactModal = (tab = 'phone') => {
        console.log('toggleContactModal in parent called. Current showContactModal:', showContactModal, 'New tab:', tab);
        setActiveContactTab(tab);
        setShowContactModal(!showContactModal);
        console.log('showContactModal after update (might not be immediate):', !showContactModal);
    };
    const togglePaymentsModal = () => setShowPaymentsModal(!showPaymentsModal);

    // Scroll handler for category pills
    const scrollToCategory = (categoryId) => {
        if (categoryRefs.current[categoryId]) {
            const topBarHeight = document.getElementById('topbar-club')?.offsetHeight || 0;
            const categoryPillsHeight = document.getElementById('category-pills')?.offsetHeight || 0;
            const offset = topBarHeight + categoryPillsHeight + 16; // Add some extra padding

            window.scrollTo({
                top: categoryRefs.current[categoryId].offsetTop - offset,
                behavior: 'smooth'
            });
            setActiveCategory(categoryId); // Set active pill on click
        }
    };

    // Intersection Observer to update active pill on scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.5) { // At least 50% visible
                        setActiveCategory(parseInt(entry.target.id.replace('category-', '')));
                    }
                });
            }, {
                root: null, // viewport
                rootMargin: `-${(document.getElementById('topbar-club')?.offsetHeight || 0) + (document.getElementById('category-pills')?.offsetHeight || 0)}px 0px 0px 0px`, // Adjust top margin dynamically
                threshold: 0.5, // Trigger when 50% of the target is visible
            }
        );

        // Observe each category accordion
        businessMenuItems.forEach(category => {
            const element = categoryRefs.current[category.category_id];
            if (element) {
                observer.observe(element);
            }
        });

        // Set initial active category to the first one with items
        if (businessMenuItems.length > 0) {
            setActiveCategory(businessMenuItems[0].category_id);
        }


        return () => {
            businessMenuItems.forEach(category => {
                const element = categoryRefs.current[category.category_id];
                if (element) {
                    observer.unobserve(element);
                }
            });
        };
    }, [businessMenuItems]);


    return (
        <>
            <Head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>{businessData.business_name}</title>

                <style>
                    {`
                        .profile-header {
                            background-color: ${themeColorBackground}!important;
                            color: ${themeColorText}!important;
                            font-family: ${themeFont}!important;
                        }

                         .profile-main {
                            background-color: ${themeColorBackground}!important;
                            color: ${themeColorText}!important;
                            font-family: ${themeFont}!important;
                        }

                        .font-semibold {
                            font-family: inherit!important;
                            font-weight: 700!important;
                        }

                        .font-bold {
                            font-family: inherit!important;
                            font-weight: 700!important;
                        }

                        .button {
                            font-family: inherit!important;
                            font-weight: 700!important;
                        }

                        #topbar-club {
                            background-color: ${themeColorBackground};
                            color: ${themeColorText};
                        }

                        .profile-cover::before {
                            background: ${themeColorBackground};
                        }

                        .body--dark-bg .profile-header {
                            background: linear-gradient(to top, rgba(255, 255, 255, 0.15) ,rgba(255, 255, 255, 0) 35%);
                        }
                        .body--light-bg .profile-header {
                            background: linear-gradient(to top, rgba(0, 0, 0, 0.1) ,rgba(0, 0, 0, 0) 35%);
                        }

                        .body--light-bg .btn-bg-settings { background: ${themeColorButton}!important; color: #fff!important; }

                        .body--dark-bg .btn-bg-settings { background: ${themeColorButton}!important; color: #fff!important; }

                        /* Invert icons for dark mode if they are originally dark on light background */
                        .body--dark-bg .profile-header .contact-button img,
                        .body--dark-bg .profile-club-links-list .link-icon-wrapper img { filter: invert(1) brightness(1.5); }

                        /* Ensure icons are normal for light mode */
                        .body--light-bg .profile-header .contact-button img,
                        .body--light-bg .profile-club-links-list .link-icon-wrapper img { filter: invert(0); }

                        /* Icons on main buttons like Prenota, Payments, Reviews */
                        .body--dark-bg .profile-header .button img { filter: invert(0); }
                        .body--light-bg .profile-header .button img { filter: invert(0); }


                        .body--dark-bg .profile-club-links-list .link-icon-wrapper{ background-color: rgba(255, 255, 255, 0);}
                        .body--light-bg .profile-club-links-list .link-icon-wrapper{ background-color: rgba(0, 0, 0, 0);}

                        .body--dark-bg .profile-nav-sections{ border-color:rgba(255, 255, 255, 0.19); }
                        .body--light-bg .profile-nav-sections{ border-color: #00000030; }

                        .body--dark-bg .profile-nav-sections .section-active{ border-color:rgb(255, 255, 255); }
                        .body--light-bg .profile-nav-sections .section-active{ border-color:rgb(14, 14, 14); }

                        .body--dark-bg .category-pills-container{ background: ${themeColorBackground}; }
                        .body--light-bg .category-pills-container{ background: ${themeColorBackground}; }

                        .body--dark-bg .category-pills-container .pills-wrapper{ background: rgba(255, 255, 255, 0.15); }
                        .body--light-bg .category-pills-container .pills-wrapper{ background: rgba(0, 0, 0, 0.075); }

                        .body--dark-bg .category-pill{ border-color: rgba(255, 255, 255, 0.5); color: ${themeColorText}; }
                        .body--light-bg .category-pill{ border-color: rgba(0, 0, 0, 0.5); color: ${themeColorText}; }

                        .body--dark-bg .category-pill.active {
                            background-color: ${themeColorButton};
                            color: #fff;
                            border-color: ${themeColorButton};
                        }
                        .body--light-bg .category-pill.active {
                            background-color: ${themeColorButton};
                            color: #fff;
                            border-color: ${themeColorButton};
                        }


                        .body--dark-bg .accordion-item { border-color: rgba(255, 255, 255, 0.5); }
                        .body--light-bg .accordion-item { border-color: rgba(0, 0, 0, 0.5); }

                        .body--light-bg .card-item {
                            background-color: rgb(255, 255, 255);
                            border-color: rgba(${themeColorTextRgb}, ${borderColorOpacity}) !important;
                            box-shadow: 0 1px 5px #03030308;
                        }

                        .body--dark-bg .card-item {
                            background-color: rgba(255, 255, 255, 0.1);
                            border-color: rgba(${themeColorTextRgb}, ${borderColorOpacity}) !important;
                            box-shadow: 0 1px 5px rgba(255, 255, 255, 0.2);
                        }

                        .link-look {
                            color: ${themeColorText};
                        }
                        .link-look a {
                            color: inherit;
                            text-decoration: underline;
                        }

                        .btn-google-review {
                            color: #fff;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 8px;
                            padding: 10px 20px;
                            border-radius: 9999px;
                            font-weight: bold;
                            transition: background-color 0.3s ease;
                        }
                        .btn-google-review img {
                            width: 24px;
                            height: 24px;
                            vertical-align: middle;
                        }
                    `}
                </style>
            </Head>

            <div className={`min-h-screen ${bodyClass}`}>
                {/* Top Bar */}
                <nav id="topbar-club" className="flex items-center w-full p-4 fixed top-0 left-0 z-40 shadow-sm"
                    style={{
                        backgroundColor: themeColorBackground,
                        color: themeColorText
                    }}>
                    <div className="flex-1">
                        <div className="container-profile-pic pic-xs w-8 h-8 relative rounded-full overflow-hidden">
                            {/* Use constructed profileImageUrl */}
                            <Image src={businessData.business_img_profile || '/images/default-profile-xs.png'} alt="Profile" layout="fill" objectFit="cover" />
                        </div>
                    </div>
                    <div className="flex-1 text-center">
                        <span className="font-bold lg:text-md leading-none" style={{
                            whiteSpace: 'nowrap'
                        }}>
                            {businessData.business_name}
                        </span>
                    </div>
                    <div className="flex-1 text-right">
                        <a onClick={toggleMenuOverlay} className="button-menu-topbar-profile hamburger-checkbox navbar-toggle ml-auto cursor-pointer">
                            <div className="hamburger-icon menu-button">
                                <label htmlFor="openmenu" id="hamburger-label">
                                    <svg width="16" height="16" viewBox="0 0 16 16">
                                        <path fill={themeColorText} stroke={themeColorText} d="M12.6661 7.33348C12.2979 7.33348 11.9994 7.63195 11.9994 8.00014C11.9994 8.36833 12.2979 8.66681 12.6661 8.66681C13.0343 8.66681 13.3328 8.36833 13.3328 8.00014C13.3328 7.63195 13.0343 7.33348 12.6661 7.33348Z"></path>
                                        <path fill={themeColorText} stroke={themeColorText} d="M8.00057 7.33348C7.63238 7.33348 7.3339 7.63195 7.3339 8.00014C7.3339 8.36833 7.63238 8.66681 8.00057 8.66681C8.36876 8.66681 8.66724 8.36833 8.66724 8.00014C8.66724 7.63195 8.36876 7.33348 8.00057 7.33348Z"></path>
                                        <path fill={themeColorText} stroke={themeColorText} d="M3.33333 7.33348C2.96514 7.33348 2.66667 7.63195 2.66667 8.00014C2.66667 8.36833 2.96514 8.66681 3.33333 8.66681C3.70152 8.66681 4 8.36833 4 8.00014C4 7.63195 3.70152 7.33348 3.33333 7.33348Z"></path>
                                    </svg>
                                </label>
                            </div>
                        </a>
                    </div>
                </nav>

                {/* Adjust main content padding to account for fixed top bar */}
                <div className="">
                    {/* Business Profile Header Section */}
                    <BusinessProfileHeader
                        businessData={businessData}
                        businessSettings={businessSettings}
                        websiteLinkUrl={websiteLinkUrl}
                        googleReviewLinkUrl={googleReviewLinkUrl}
                        businessLinks={businessLinks}
                        bookingLinkUrl={bookingLinkUrl}
                        toggleContactModal={toggleContactModal}
                        togglePaymentsModal={togglePaymentsModal}
                        businessUrlname={businessData.business_urlname}
                        activeSection={activeSection}
                        businessPaymentMethods={businessPaymentMethods}
                    />

                    {/* Order Bar (conditional, as per PHP) */}
                    {activeSection === 'products' && businessSettings.show_btn_order && (
                        <div id="order-bar" className="active fixed bottom-0 left-0 w-full p-4 z-30" style={{ backgroundColor: themeColorBackground, boxShadow: isDarkBackground ? '0 -2px 10px rgba(255,255,255,0.1)' : '0 -2px 10px rgba(0,0,0,0.1)' }}>
                            <Link href={`/order?b=${businessData.business_urlname}`} className="button btn-md btn-bg-settings shadow-lg text-white mobile-w-full block text-center"
                                style={{ backgroundColor: themeColorButton, color: 'white' }}>
                                Componi Ordine
                            </Link>
                        </div>
                    )}

                    {/* Category Pills Navigation (Sticky) */}
                    {activeSection === 'products' && businessMenuItems.length > 0 && (
                        <div id="category-pills" className="category-pills-container sticky top-0 z-20 w-full shadow-sm" style={{ backgroundColor: themeColorBackground }}>
                            <div className="pills-wrapper overflow-x-auto flex space-x-2 px-4 py-4 scrollbar-hide"
                                style={{ backgroundColor: isDarkBackground ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.075)' }}>
                                    <div className="container mx-auto max-w-3xl ">
                                    {businessMenuItems.map(category => (
                                        <button
                                            key={category.category_id}
                                            className={`category-pill flex-shrink-0 px-4 py-2 rounded-full border text-sm font-medium transition-colors duration-200 mr-2
                                                ${activeCategory === category.category_id ? 'active' : ''}`}
                                            style={{
                                                borderColor: isDarkBackground ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                                                color: isDarkBackground ? themeColorText : themeColorText, // Always use theme color for non-active
                                                ...(activeCategory === category.category_id && {
                                                    backgroundColor: themeColorButton,
                                                    color: '#fff',
                                                    borderColor: themeColorButton
                                                })
                                            }}
                                            onClick={() => scrollToCategory(category.category_id)}
                                        >
                                            {category.category_name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Content Area */}
                    <main className="profile-main py-4 px-4">
                        <div className="container mx-auto max-w-3xl">
                        {activeSection === 'products' && (
                            <section className="business-menu-items">
                                {businessMenuItems.length > 0 ? (
                                    // Map over the grouped categories and render MenuCategoryAccordion for each
                                    businessMenuItems.map(category => (
                                        <div
                                            key={category.category_id}
                                            id={`category-${category.category_id}`} // Add ID for scrolling
                                            ref={el => categoryRefs.current[category.category_id] = el} // Assign ref
                                        >
                                            <MenuCategoryAccordion
                                                category={category}
                                                themeColorTextRgb={themeColorTextRgb}
                                                borderColorOpacity={borderColorOpacity}
                                                isDarkBackground={isDarkBackground}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center opacity-70">Nessun prodotto disponibile al momento.</p>
                                )}
                            </section>
                        )}
                        </div>
                    </main>
                    {activeSection === 'products' && businessSettings.show_btn_order && (
                        <div className="pb-24"></div>
                    )}
                </div>

                {/* Modals - Controlled by state */}
                <ProfileMenuOverlay
                    show={showMenuOverlay}
                    onClose={toggleMenuOverlay}
                    businessUrlname={businessData.business_urlname}
                    businessPublicUuid={businessData.business_public_uuid}
                />
                <ContactModal
                    show={showContactModal}
                    onClose={toggleContactModal}
                    businessData={businessData}
                    businessSettings={businessSettings}
                    activeTab={activeContactTab}
                />
                <PaymentsModal
                    show={showPaymentsModal}
                    onClose={togglePaymentsModal}
                    businessPaymentMethods={businessPaymentMethods}
                />
            </div>
            <Script src="/js/all.js" strategy="lazyOnload" />
            <Script src="/js/qrcode.js" strategy="lazyOnload" />
        </>
    );
}
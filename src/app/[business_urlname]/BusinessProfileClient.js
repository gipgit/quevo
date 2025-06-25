// src/app/(main)/[business_urlname]/BusinessProfileClient.js

"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';

import BusinessProfileHeader from '@/components/BusinessProfileHeader';
import ProfileMenuOverlay from '@/components/modals/ProfileMenuOverlay';
import ContactModal from '@/components/modals/ContactModal';
import PaymentsModal from '@/components/modals/PaymentsModal';
import MenuCategoryAccordion from '@/components/MenuCategoryAccordion';

import Image from 'next/image';
import Link from 'next/link';

import Head from 'next/head';

import './business.css';


export default function BusinessProfileClient({ data }) {
    const [showMenuOverlay, setShowMenuOverlay] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showPaymentsModal, setShowPaymentsModal] = useState(false);
    const [activeContactTab, setActiveContactTab] = useState('phone');
    const [activeCategory, setActiveCategory] = useState(null);

    const categoryRefs = useRef({});
    const isProgrammaticScroll = useRef(false);

    const {
        businessData,
        businessSettings,
        businessLinks,
        businessPaymentMethods,
        businessMenuItems,
        websiteLinkUrl,
        googleReviewLinkUrl,
        bookingLinkUrl,
        activeSection,
    } = data;

    const themeColorText = businessSettings.theme_color_text || '#000000';
    const themeColorBackground = businessSettings.theme_color_background || '#FFFFFF';
    const themeColorButton = businessSettings.theme_color_button || '#000000';
    const themeFont = businessSettings.theme_font_css_stack; 
    
    const isDarkBackground = parseInt((businessSettings.theme_color_background || '#FFFFFF').replace('#', ''), 16) < (0xFFFFFF / 2);

    const openContactModal = (tab = 'phone') => {
        setActiveContactTab(tab);
        setShowContactModal(true);
        if (showMenuOverlay) {
            setShowMenuOverlay(false);
        }
        console.log('Contact Modal Opened for tab:', tab);
    };

    const closeContactModal = () => {
        setShowContactModal(false);
        console.log('Contact Modal Closed');
    };

    const openPaymentsModal = () => {
        setShowPaymentsModal(true);
        if (showMenuOverlay) {
            setShowPaymentsModal(false);
        }
        console.log('Payments Modal Opened');
    };

    const closePaymentsModal = () => {
        setShowPaymentsModal(false);
        console.log('Payments Modal Closed');
    };

    const toggleMenuOverlay = () => setShowMenuOverlay(!showMenuOverlay);


    const scrollToCategory = useCallback((categoryId) => {
        if (categoryRefs.current[categoryId]) {
            isProgrammaticScroll.current = true;
            setActiveCategory(categoryId);

            const topBarHeight = document.getElementById('topbar-club')?.offsetHeight || 0;
            const categoryPillsHeight = document.getElementById('category-pills-section')?.offsetHeight || 0;
            
            // Further reduced padding to bring the category title even closer to the top.
            // Try 0px for no extra space, or 4px for a very minimal gap.
            const extraPadding = 5; 
            const offset = categoryPillsHeight + extraPadding;

            window.scrollTo({
                top: (categoryRefs.current[categoryId]?.offsetTop || 0) - offset,
                behavior: 'smooth'
            });

            setTimeout(() => {
                isProgrammaticScroll.current = false;
            }, 700);
        }
    }, []);

    useEffect(() => {
        const topBarHeight = document.getElementById('topbar-club')?.offsetHeight || 0;
        const pillsHeight = document.getElementById('category-pills-section')?.offsetHeight || 0;
        
        const activeZoneTop = topBarHeight + pillsHeight; 

        const rootMarginValue = `-${activeZoneTop + 5}px 0px 0px 0px`; 

        let scrollTimeout;

        const observer = new IntersectionObserver(
            (entries) => {
                if (isProgrammaticScroll.current) {
                    return;
                }

                if (scrollTimeout) {
                    clearTimeout(scrollTimeout);
                }

                scrollTimeout = setTimeout(() => {
                    let newActiveCategoryId = null;
                    let minDistanceFromActiveZoneTop = Infinity;

                    const currentScrollY = window.scrollY;

                    for (const entry of entries) {
                        const categoryId = parseInt(entry.target.id.replace('category-', ''));
                        
                        if (!entry.isIntersecting || entry.intersectionRatio < 0.05) { 
                            continue;
                        }

                        const rect = entry.boundingClientRect;
                        
                        const distanceFromActiveZone = Math.abs(rect.top - activeZoneTop);

                        if (rect.top <= activeZoneTop + 20) { 
                            if (distanceFromActiveZone < minDistanceFromActiveZoneTop) {
                                minDistanceFromActiveZoneTop = distanceFromActiveZone;
                                newActiveCategoryId = categoryId;
                            }
                        }
                    }

                    if (newActiveCategoryId === null && businessMenuItems.length > 0 && currentScrollY < (activeZoneTop + 100)) {
                        newActiveCategoryId = businessMenuItems[0].category_id;
                    }

                    if (newActiveCategoryId !== null && newActiveCategoryId !== activeCategory) {
                        setActiveCategory(newActiveCategoryId);
                    }

                }, 100);
            },
            {
                root: null,
                rootMargin: rootMarginValue,
                threshold: Array.from({ length: 101 }, (_, i) => i / 100),
            }
        );

        businessMenuItems.forEach(category => {
            const element = categoryRefs.current[category.category_id];
            if (element) {
                observer.observe(element);
            }
        });

        if (businessMenuItems.length > 0 && activeCategory === null) {
            setActiveCategory(businessMenuItems[0].category_id);
        }

        return () => {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            businessMenuItems.forEach(category => {
                const element = categoryRefs.current[category.category_id];
                if (element) {
                    observer.unobserve(element);
                }
            });
            observer.disconnect();
        };
    }, [businessMenuItems, activeCategory, scrollToCategory]);

    return (
        <>
            <Head>
                <title>{businessData.business_name}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>
            
            <div className="min-h-screen">
                {/* Top Bar */}
                <nav id="topbar-club" className="flex items-center w-full p-4 fixed top-0 left-0 z-40 shadow-sm">
                    <div className="flex-1">
                        <div className="container-profile-pic pic-xs w-8 h-8 relative rounded-full overflow-hidden">
                            <Image src={businessData.business_img_profile || '/images/default-profile-xs.png'} alt="Profile" fill objectFit="cover" />
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
                                        <path fill="var(--theme-color-text)" stroke="var(--theme-color-text)" d="M12.6661 7.33348C12.2979 7.33348 11.9994 7.63195 11.9994 8.00014C11.9994 8.36833 12.2979 8.66681 12.6661 8.66681C13.0343 8.66681 13.3328 8.36833 13.3328 8.00014C13.3328 7.63195 13.0343 7.33348 12.6661 7.33348Z"></path>
                                        <path fill="var(--theme-color-text)" stroke="var(--theme-color-text)" d="M8.00057 7.33348C7.63238 7.33348 7.3339 7.63195 7.3339 8.00014C7.3339 8.36833 7.63238 8.66681 8.00057 8.66681C8.36876 8.66681 8.66724 8.36833 8.66724 8.00014C8.66724 7.63195 8.36876 7.33348 8.00057 7.33348Z"></path>
                                        <path fill="var(--theme-color-text)" stroke="var(--theme-color-text)" d="M3.33333 7.33348C2.96514 7.33348 2.66667 7.63195 2.66667 8.00014C2.66667 8.36833 2.96514 8.66681 3.33333 8.66681C3.70152 8.66681 4 8.36833 4 8.00014C4 7.63195 3.70152 7.33348 3.33333 7.33348Z"></path>
                                    </svg>
                                </label>
                            </div>
                        </a>
                    </div>
                </nav>

                <div className="">
                    <BusinessProfileHeader
                        businessData={businessData}
                        businessSettings={businessSettings}
                        websiteLinkUrl={websiteLinkUrl}
                        googleReviewLinkUrl={googleReviewLinkUrl}
                        businessLinks={businessLinks}
                        bookingLinkUrl={bookingLinkUrl}
                        toggleContactModal={openContactModal}
                        togglePaymentsModal={openPaymentsModal}
                        businessUrlname={businessData.business_urlname}
                        activeSection={activeSection}
                        businessPaymentMethods={businessPaymentMethods}
                        themeColorText={themeColorText}
                        themeColorBackground={themeColorBackground}
                        themeColorButton={themeColorButton}
                        isDarkBackground={isDarkBackground}
                    />

                    {activeSection === 'products' && businessMenuItems.length > 0 && (
                        <section id="category-pills-section" className="category-pills-section sticky top-0 z-20 w-full shadow-sm" style={{ background: 'var(--theme-color-background)' }}>
                            <div
                                className="category-pills-wrapper w-full"
                                style={{ background: 'var(--category-pills-wrapper-background)' }}
                            >
                                <div
                                    className="pills-darken-overlay w-full py-4"
                                    style={{ background: 'rgba(0,0,0,0.05)' }}
                                >
                                    <div
                                        className="flex space-x-2 px-4 overflow-x-auto scrollbar-hide container mx-auto max-w-3xl"
                                    >
                                        {businessMenuItems.map(category => (
                                            <button
                                                key={category.category_id}
                                                className={`category-pill flex-shrink-0 px-4 py-2 rounded-full border text-sm font-medium transition-colors duration-200 mr-2
                                                    ${activeCategory === category.category_id ? 'active' : ''}`}
                                                onClick={() => scrollToCategory(category.category_id)}
                                            >
                                                {category.category_name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {activeSection === 'products' && businessSettings.show_btn_order && (
                        <div
                            id="order-bar"
                            className="active fixed bottom-0 left-0 w-full p-4 z-30"
                        >
                            <Link href={`/order?b=${businessData.business_urlname}`} className="button btn-md btn-bg-settings shadow-lg text-white mobile-w-full block text-center">
                                Componi Ordine
                            </Link>
                        </div>
                    )}

                    <main className="profile-main pt-4 pb-20 px-4">
                        <div className="container mx-auto max-w-3xl">
                            {activeSection === 'products' && (
                                <section className="business-menu-items">
                                    {businessMenuItems.length > 0 ? (
                                        businessMenuItems.map(category => (
                                            <div
                                                key={category.category_id}
                                                id={`category-${category.category_id}`}
                                                ref={el => (categoryRefs.current[category.category_id] = el)}
                                            >
                                                <MenuCategoryAccordion
                                                    category={category}
                                                    menuItems={category.items}
                                                    themeColorText={themeColorText}
                                                    isDarkBackground={isDarkBackground}
                                                    themeColorBackground={themeColorBackground}
                                                    themeColorButton={themeColorButton}
                                                />
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-lg mt-10">Nessun prodotto disponibile.</p>
                                    )}
                                </section>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            {showMenuOverlay && (
                <ProfileMenuOverlay
                    businessData={businessData}
                    businessSettings={businessSettings}
                    businessLinks={businessLinks}
                    websiteLinkUrl={websiteLinkUrl}
                    googleReviewLinkUrl={googleReviewLinkUrl}
                    bookingLinkUrl={bookingLinkUrl}
                    openContactModal={openContactModal}
                    openPaymentsModal={openPaymentsModal}
                    onClose={toggleMenuOverlay}
                    themeColorBackground={themeColorBackground}
                    themeColorText={themeColorText}
                    isDarkBackground={isDarkBackground}
                    themeColorButton={themeColorButton}
                    profileId={businessData.business_urlname}
                />
            )}

            {showContactModal && (
                <ContactModal
                    show={showContactModal}
                    businessData={businessData}
                    businessSettings={businessSettings}
                    businessLinks={businessLinks}
                    onClose={closeContactModal}
                    initialTab={activeContactTab}
                    themeColorText={themeColorText}
                    isDarkBackground={isDarkBackground}
                    themeColorButton={themeColorButton}
                />
            )}

            {showPaymentsModal && (
                <PaymentsModal
                    show={showPaymentsModal}
                    businessData={businessData}
                    businessPaymentMethods={businessPaymentMethods}
                    onClose={closePaymentsModal}
                    themeColorText={themeColorText}
                    isDarkBackground={isDarkBackground}
                    themeColorButton={themeColorButton}
                />
            )}
        </>
    );
}
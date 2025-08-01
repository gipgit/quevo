// src/app/[locale]/[business_urlname]/BusinessProfileClientWrapper.jsx

"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation'; // Still use this to get the current URL path
import { Link } from '@/i18n/navigation'; // IMPORTANT: Use locale-aware Link from next-intl/navigation

import { BusinessProfileProvider } from '@/contexts/BusinessProfileContext'; // Keep your context provider
import BusinessProfileHeader from '@/components/BusinessProfileHeader-backup'; // Your header component

// Import your modal components
import ProfileMenuOverlay from '@/components/modals/ProfileMenuOverlay';
import ContactModal from '@/components/modals/ContactModal';
import PaymentsModal from '@/components/modals/PaymentsModal';

import { useTranslations } from 'next-intl'; // Import useTranslations for client-side translation

export function BusinessProfileClientWrapper({ initialServerData, children, cssVariables, bodyClass }) {
    // State for managing modal visibility
    const [showContactModal, setShowContactModal] = useState(false);
    const [activeContactTab, setActiveContactTab] = useState('phone');
    const [showPaymentsModal, setShowPaymentsModal] = useState(false);
    const [showMenuOverlay, setShowMenuOverlay] = useState(false);

    const t = useTranslations('Common'); // Initialize translations

    const pathname = usePathname(); // e.g., /en/nutrizionista_equilibrio/products
    const { business_urlname } = initialServerData.businessData;
    const locale = pathname.split('/')[1]; // Extract locale from the pathname

    // Derive the current active section slug directly from the pathname
    const pathSegments = pathname.split('/').filter(Boolean); // Remove empty strings
    const currentSectionSlug = pathSegments[pathSegments.length - 1]; // Last segment is the section name

    // A list of all possible section slugs for validation
    const possibleSectionSlugs = ['products', 'promotions', 'rewards', 'bookings'];
    const activeSection = possibleSectionSlugs.includes(currentSectionSlug) ? currentSectionSlug : initialServerData.businessSettings.default_page;

    // --- NEW LOGIC: Determine if the header should be shown ---
    const isBookingConfirmationPage = pathname.startsWith(`/${locale}/${business_urlname}/booking/`) && pathSegments.length === 4;
    const isServiceBoardPage = pathname.startsWith(`/${locale}/${business_urlname}/s/`) && pathSegments.length === 4;

    // Memoize the context value to prevent unnecessary re-renders of consumers
    const contextValue = useMemo(() => {
        return {
            businessData: initialServerData.businessData,
            businessSettings: initialServerData.businessSettings,
            businessLinks: initialServerData.businessLinks,
            businessPaymentMethods: initialServerData.businessPaymentMethods,
            websiteLinkUrl: initialServerData.websiteLinkUrl,
            googleReviewLinkUrl: initialServerData.googleReviewLinkUrl,
            bookingLinkUrl: initialServerData.bookingLinkUrl,

            isDarkBackground: initialServerData.isDarkBackground,
            themeColorText: initialServerData.themeColorText,
            themeColorBackground: initialServerData.themeColorBackground,
            themeColorBackgroundSecondary: initialServerData.themeColorBackgroundSecondary,
            themeColorBackgroundCard: initialServerData.themeColorBackgroundCard,
            themeColorButton: initialServerData.themeColorButton,
            themeColorBorder: initialServerData.themeColorBorder,

            currentPathSection: currentSectionSlug,
        };
    }, [initialServerData, currentSectionSlug]);

    // Modal open/close handlers (remain unchanged)
    const openContactModal = useCallback((tab = 'phone') => {
        setActiveContactTab(tab);
        setShowContactModal(true);
        setShowMenuOverlay(false);
    }, []);

    const closeContactModal = useCallback(() => {
        setShowContactModal(false);
    }, []);

    const openPaymentsModal = useCallback(() => {
        setShowPaymentsModal(true);
        setShowMenuOverlay(false);
    }, []);

    const closePaymentsModal = useCallback(() => {
        setShowPaymentsModal(false);
    }, []);

    const toggleMenuOverlay = useCallback(() => setShowMenuOverlay(prev => !prev), []);

    if (!initialServerData || !initialServerData.businessData) {
        return <div className="text-center py-10">{t('loadingPage')}</div>;
    }

    const showOrderBar = initialServerData.businessSettings.show_btn_order && activeSection === 'products';

    return (
        <BusinessProfileProvider value={contextValue}>
            <div style={cssVariables} className={`${bodyClass} profile-content-wrapper`}>

                {/* --- CONDITIONAL RENDERING OF BusinessProfileHeader --- */}
                {!isBookingConfirmationPage && !isServiceBoardPage && (
                    
                    <div className="flex flex-col md:flex-row">
                        <div className="w-full lg:w-1/2 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
                            <BusinessProfileHeader
                                toggleContactModal={openContactModal}
                                togglePaymentsModal={openPaymentsModal}
                                toggleMenuOverlay={toggleMenuOverlay}
                                initialServerData={initialServerData}
                            />
                        </div>
                        
                        <div className="w-full lg:w-1/2">
                            <div className='profile-main min-h-screen'>
                                {children} {/* This is where the specific section's page.tsx content will render */}
                            </div>
                        </div>
                    </div>
                )}

                {/* For booking confirmation and service board pages, keep single column layout */}
                {(isBookingConfirmationPage || isServiceBoardPage) && (
                    <div className='profile-main min-h-screen'>
                        {children}
                    </div>
                )}

                {showOrderBar && ( // Conditional render based on show_btn_order setting AND active section
                    <div
                        id="order-bar"
                        className="active fixed bottom-0 left-0 w-full pt-8 pb-4 px-4 z-30 flex items-center justify-center"
                        style={{ background: `linear-gradient(to top, ${initialServerData.themeColorButton}, transparent 70%)` }}
                    >
                        <Link
                            href={`/${locale}/order?b=${business_urlname}`} // Ensure this is the correct order page URL
                            className="button btn-md btn-bg-settings text-white w-full md:w-auto block text-center rounded-lg"
                            style={{ backgroundColor: initialServerData.themeColorButton, color: initialServerData.themeColorText }}
                        >
                            {t('composeOrder')}
                        </Link>
                    </div>
                )}

                {showMenuOverlay && (
                    <ProfileMenuOverlay
                        openContactModal={openContactModal}
                        openPaymentsModal={openPaymentsModal}
                        onClose={toggleMenuOverlay}
                        businessData={initialServerData.businessData}
                        businessSettings={initialServerData.businessSettings}
                        businessLinks={initialServerData.businessLinks}
                        businessPaymentMethods={initialServerData.businessPaymentMethods}
                        themeColorText={initialServerData.themeColorText}
                        themeColorBackground={initialServerData.themeColorBackground}
                        themeColorButton={initialServerData.themeColorButton}
                        isDarkBackground={initialServerData.isDarkBackground}
                    />
                )}

                {showContactModal && (
                    <ContactModal
                        show={showContactModal}
                        onClose={closeContactModal}
                        initialTab={activeContactTab}
                        businessData={initialServerData.businessData}
                        businessSettings={initialServerData.businessSettings}
                        businessLinks={initialServerData.businessLinks}
                        themeColorText={initialServerData.themeColorText}
                        themeColorBackground={initialServerData.themeColorBackground}
                        themeColorButton={initialServerData.themeColorButton}
                        isDarkBackground={initialServerData.isDarkBackground}
                    />
                )}

                {showPaymentsModal && (
                    <PaymentsModal
                        show={showPaymentsModal}
                        onClose={closePaymentsModal}
                        businessPaymentMethods={initialServerData.businessPaymentMethods}
                        themeColorText={initialServerData.themeColorText}
                        themeColorBackground={initialServerData.themeColorBackground}
                        themeColorButton={initialServerData.themeColorButton}
                        isDarkBackground={initialServerData.isDarkBackground}
                    />
                )}
            </div>
        </BusinessProfileProvider>
    );
}

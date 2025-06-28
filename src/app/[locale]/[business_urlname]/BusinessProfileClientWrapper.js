// src/app/[locale]/[business_urlname]/BusinessProfileClientWrapper.jsx

"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation'; // Still use this to get the current URL path
import { Link } from '@/i18n/navigation'; // IMPORTANT: Use locale-aware Link from next-intl/navigation

import { BusinessProfileProvider } from '@/contexts/BusinessProfileContext'; // Keep your context provider
import BusinessProfileHeader from '@/components/BusinessProfileHeader'; // Your header component

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
    // This will be 'products', 'promotions', 'rewards', 'booking', or the business_urlname if at root.
    const pathSegments = pathname.split('/').filter(Boolean); // Remove empty strings
    const currentSectionSlug = pathSegments[pathSegments.length - 1]; // Last segment is the section name

    // Determine the "active section" that is actually being displayed by the URL
    // We expect the root to redirect to the default_page (e.g. /products).
    // So, 'products' is the actual segment, not the business_urlname.
    // The previous logic where `currentSectionSlug === initialServerData.businessData.business_urlname`
    // meant that the root URL for the business was considered 'products', which is now handled by the redirector.
    // So, `activeSection` here truly represents the last segment if it's a known section.
    // This 'activeSection' variable is now less about controlling routing and more about
    // contextual display *within* this wrapper (e.g., for the order bar).

    // A list of all possible section slugs for validation
    const possibleSectionSlugs = ['products', 'promotions', 'rewards', 'booking']; // Add any other sections
    const activeSection = possibleSectionSlugs.includes(currentSectionSlug) ? currentSectionSlug : initialServerData.businessSettings.default_page;


    // Memoize the context value to prevent unnecessary re-renders of consumers
    const contextValue = useMemo(() => {
        // We no longer directly inject 'activeSection' into the context for route control
        // as the App Router manages this via the URL.
        // Instead, the context provides the base initial server data and derived theme properties.
        return {
            // These properties are now directly from initialServerData which came from the lean layout
            businessData: initialServerData.businessData,
            businessSettings: initialServerData.businessSettings,
            businessLinks: initialServerData.businessLinks,
            businessPaymentMethods: initialServerData.businessPaymentMethods,
            websiteLinkUrl: initialServerData.websiteLinkUrl,
            googleReviewLinkUrl: initialServerData.googleReviewLinkUrl,
            bookingLinkUrl: initialServerData.bookingLinkUrl, // This link should point to the booking section

            // Pass through theme variables if not directly applied as CSS variables
            isDarkBackground: initialServerData.isDarkBackground,
            themeColorText: initialServerData.themeColorText,
            themeColorBackground: initialServerData.themeColorBackground,
            themeColorButton: initialServerData.themeColorButton,

            // Optionally, if needed by child components that can't use usePathname
            // but need to know the *current section*, you can still derive it here
            // and pass it. However, directly using usePathname in those components is often better.
            currentPathSection: currentSectionSlug, // This can be used for UI logic if needed
        };
    }, [initialServerData, currentSectionSlug]); // Dependencies updated to reflect properties used

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
        // This client-side loading state should ideally be rare now due to server-side rendering
        return <div className="text-center py-10">{t('loadingPage')}</div>;
    }

    // Pass necessary data to BusinessProfileHeader directly or via context
    // The BusinessProfileHeader itself will need to be updated to use Link from '@/i18n/navigation'
    // and derive its active tab state from usePathname.
    // The order bar is now conditionally rendered based on the actual URL path
    // or a direct check against `activeSection` derived from `usePathname`.
    const showOrderBar = initialServerData.businessSettings.show_btn_order && activeSection === 'products';

    return (
        <BusinessProfileProvider value={contextValue}>
            <div style={cssVariables} className={`${bodyClass} profile-content-wrapper`}>

                <BusinessProfileHeader
                    toggleContactModal={openContactModal}
                    togglePaymentsModal={openPaymentsModal}
                    toggleMenuOverlay={toggleMenuOverlay}
                    // Pass initialServerData to the header if it needs it directly, or let it consume context
                    initialServerData={initialServerData}
                />

                <div className='profile-main h-min-screen'>
                    {children} {/* This is where the specific section's page.tsx content will render */}
                </div>

                {showOrderBar && ( // Conditional render based on show_btn_order setting AND active section
                    <div
                        id="order-bar"
                        className="active fixed bottom-0 left-0 w-full p-4 z-30"
                        style={{ backgroundColor: initialServerData.themeColorButton, boxShadow: initialServerData.themeVariables['--order-bar-box-shadow'] }}
                    >
                        <Link
                            href={`/${locale}/order?b=${business_urlname}`} // Ensure this is the correct order page URL
                            className="button btn-md btn-bg-settings text-white mobile-w-full block text-center rounded-lg"
                            style={{ backgroundColor: initialServerData.themeColorButton, color: initialServerData.themeColorText }}
                        >
                            {t('composeOrder')} {/* Translated "Componi Ordine" */}
                        </Link>
                    </div>
                )}

                {showMenuOverlay && (
                    <ProfileMenuOverlay
                        openContactModal={openContactModal}
                        openPaymentsModal={openPaymentsModal}
                        onClose={toggleMenuOverlay}

                        // Pass all initialServerData to modals as props
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

                        // Pass all initialServerData to modals as props
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

                        // Pass all initialServerData to modals as props
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
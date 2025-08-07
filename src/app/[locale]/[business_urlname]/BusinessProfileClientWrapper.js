// src/app/[locale]/[business_urlname]/BusinessProfileClientWrapper.jsx

"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation'; // Still use this to get the current URL path
import { Link } from '@/i18n/navigation'; // IMPORTANT: Use locale-aware Link from next-intl/navigation
import Image from 'next/image';
import { useTranslations } from 'next-intl'; // Import useTranslations for client-side translation
import { BusinessProfileProvider } from '@/contexts/BusinessProfileContext'; // Keep your context provider
import BusinessProfileHeader from '@/components/BusinessProfileHeader'; // Your header component

// Import your modal components
import ProfileMenuOverlay from '@/components/modals/ProfileMenuOverlay';
import ContactModal from '@/components/modals/ContactModal';
import PaymentsModal from '@/components/modals/PaymentsModal';

export function BusinessProfileClientWrapper({ initialServerData, children, cssVariables, bodyClass }) {
    // State for managing modal visibility
    const [showContactModal, setShowContactModal] = useState(false);
    const [activeContactTab, setActiveContactTab] = useState('phone');
    const [showPaymentsModal, setShowPaymentsModal] = useState(false);
    const [showMenuOverlay, setShowMenuOverlay] = useState(false);
    
    // OPTIMIZED: Add state for payment methods loading
    const [businessPaymentMethods, setBusinessPaymentMethods] = useState(initialServerData.businessPaymentMethods || []);
    const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(false);

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

    // OPTIMIZED: Memoize the context value to prevent unnecessary re-renders of consumers
    const contextValue = useMemo(() => {
        return {
            businessData: initialServerData.businessData,
            businessSettings: initialServerData.businessSettings,
            businessLinks: initialServerData.businessLinks,
            businessPaymentMethods: businessPaymentMethods, // Use the state instead of initial data
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
            buttonContentColor: initialServerData.buttonContentColor, // Add the server-calculated button text color

            currentPathSection: currentSectionSlug,
        };
    }, [initialServerData, currentSectionSlug, businessPaymentMethods]);

    // Modal open/close handlers (remain unchanged)
    const openContactModal = useCallback((tab = 'phone') => {
        setActiveContactTab(tab);
        setShowContactModal(true);
        setShowMenuOverlay(false);
    }, []);

    const closeContactModal = useCallback(() => {
        setShowContactModal(false);
    }, []);

    const openPaymentsModal = useCallback(async () => {
        // OPTIMIZED: Load payment methods when modal opens
        console.log('Opening payments modal, loading payment methods...');
        setIsLoadingPaymentMethods(true);
        setShowPaymentsModal(true);
        setShowMenuOverlay(false);
        
        try {
            const response = await fetch(`/api/business/${initialServerData.businessData.business_id}/payment-methods`);
            console.log('Payment methods API response:', response.status);
            if (response.ok) {
                const data = await response.json();
                console.log('Payment methods data:', data);
                setBusinessPaymentMethods(data.paymentMethods || []);
            } else {
                console.error('Failed to load payment methods, status:', response.status);
            }
        } catch (error) {
            console.error('Error loading payment methods:', error);
        } finally {
            setIsLoadingPaymentMethods(false);
            console.log('Payment methods loading completed');
        }
    }, [initialServerData.businessData.business_id]);

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
            <div style={cssVariables} className={`${bodyClass} profile-content-wrapper relative`}>
                

                {/* --- CONDITIONAL RENDERING OF BusinessProfileHeader --- */}
                {!isBookingConfirmationPage && !isServiceBoardPage && (
                 
                    <div className="flex flex-col lg:flex-row-reverse lg:items-start relative z-10 lg:p-8 lg:mt-12">
                        <div className="w-full lg:w-1/2 lg:sticky lg:top-0 lg:overflow-y-hidden">
                            <BusinessProfileHeader
                                toggleContactModal={openContactModal}
                                togglePaymentsModal={openPaymentsModal}
                                toggleMenuOverlay={toggleMenuOverlay}
                                initialServerData={initialServerData}
                            />
                        </div>
                        
                        <div className="w-full lg:w-1/2 lg:min-h-screen">
                            <div className='profile-main lg:min-h-screen lg:rounded-2xl'>
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
                        businessPaymentMethods={businessPaymentMethods}
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
                        businessPaymentMethods={businessPaymentMethods}
                        isLoading={isLoadingPaymentMethods}
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

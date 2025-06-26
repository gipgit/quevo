// src/app/(main)/[business_urlname]/BusinessProfileClientWrapper.jsx

"use client"; 
import React, { useMemo, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link'; 

import { BusinessProfileProvider } from '@/contexts/BusinessProfileContext';
import BusinessProfileHeader from '@/components/BusinessProfileHeader';

import ProfileMenuOverlay from '@/components/modals/ProfileMenuOverlay';
import ContactModal from '@/components/modals/ContactModal';
import PaymentsModal from '@/components/modals/PaymentsModal';


export function BusinessProfileClientWrapper({ initialServerData, children, cssVariables, bodyClass }) {
    // State for managing modal visibility
    const [showContactModal, setShowContactModal] = useState(false);
    const [activeContactTab, setActiveContactTab] = useState('phone'); 
    const [showPaymentsModal, setShowPaymentsModal] = useState(false);
    const [showMenuOverlay, setShowMenuOverlay] = useState(false); 

    const pathname = usePathname();
    const pathSegments = pathname.split('/').filter(Boolean); 
    const currentSectionSlug = pathSegments[pathSegments.length - 1];

    // 'products' is the default if on the base URL (e.g., /nutrizionista_equilibrio)
    const activeSection = (currentSectionSlug === initialServerData.businessData.business_urlname || !currentSectionSlug)
        ? 'products'
        : currentSectionSlug;

    const contextValue = useMemo(() => {
        return {
            ...initialServerData,
            activeSection: activeSection,
        };
    }, [initialServerData, activeSection]);

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
        return <div className="text-center py-10">Loading profile (client side fallback)...</div>;
    }

    const businessData = initialServerData.businessData;
    const businessSettings = initialServerData.businessSettings;

    return (
        <BusinessProfileProvider value={contextValue}>
            <div style={cssVariables} className={`${bodyClass} profile-content-wrapper`}>
                
                <BusinessProfileHeader
                    toggleContactModal={openContactModal}
                    togglePaymentsModal={openPaymentsModal}
                    toggleMenuOverlay={toggleMenuOverlay}
                />

                <div className='profile-main h-screen'>
                {children}  {/* (products, promotions or rewards)*/}
                </div>

                {activeSection === 'products' && businessSettings.show_btn_order && (
                    <div
                        id="order-bar"
                        className="active fixed bottom-0 left-0 w-full p-4 z-30"
                    >
                        <Link href={`/order?b=${businessData.business_urlname}`} className="button btn-md btn-bg-settings text-white mobile-w-full block text-center" style={{ backgroundColor: initialServerData.themeColorButton, color: initialServerData.themeColorText }}>
                            Componi Ordine
                        </Link>
                    </div>
                )}

                {showMenuOverlay && (
                    <ProfileMenuOverlay
                        openContactModal={openContactModal}
                        openPaymentsModal={openPaymentsModal}
                        onClose={toggleMenuOverlay}
                       
                        businessData={businessData}
                        businessSettings={businessSettings}
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
                        
                        businessData={businessData}
                        businessSettings={businessSettings}
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
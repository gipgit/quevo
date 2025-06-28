// src/app/[locale]/[business_urlname]/BusinessProfileClient.js

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

import { useBusinessProfile } from '@/contexts/BusinessProfileContext';
import ProductListings from '../../../components/profile/sections/products/ProductsPageClientContent';
import PromotionsDisplay from './sections/PromotionsPageContent';
import RewardsDisplay from './sections/RewardsPageContent';

import BusinessProfileHeader from '@/components/BusinessProfileHeader';
import ProfileMenuOverlay from '@/components/modals/ProfileMenuOverlay';
import ContactModal from '@/components/modals/ContactModal';
import PaymentsModal from '@/components/modals/PaymentsModal';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import './business.css';


export default function BusinessProfileClient() {
    const {
        data,
        themeVariables,
        isDarkBackground,
        themeColorText,
        themeColorBackground,
        themeColorButton
    } = useBusinessProfile();

    if (!data || !data.businessData || !data.businessSettings) {
        return <div className="text-center py-10">Caricamento Business Profile...</div>;
    }

    const {
        businessData,
        businessSettings,
        businessLinks,
        businessPaymentMethods,
        websiteLinkUrl,
        googleReviewLinkUrl,
        bookingLinkUrl,
        activeSection: initialActiveSection,
    } = data;

    const [showMenuOverlay, setShowMenuOverlay] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showPaymentsModal, setShowPaymentsModal] = useState(false);
    const [activeContactTab, setActiveContactTab] = useState('phone');

    const pathname = usePathname();
    const currentPathSegment = pathname.split('/').pop() || 'products';
    const activeSection = initialActiveSection || currentPathSegment;

    const openContactModal = useCallback((tab = 'phone') => {
        setActiveContactTab(tab);
        setShowContactModal(true);
        if (showMenuOverlay) {
            setShowMenuOverlay(false);
        }
    }, [showMenuOverlay]);

    const closeContactModal = useCallback(() => {
        setShowContactModal(false);
    }, []);

    const openPaymentsModal = useCallback(() => {
        setShowPaymentsModal(true);
        if (showMenuOverlay) {
            setShowMenuOverlay(false);
        }
    }, [showMenuOverlay]);

    const closePaymentsModal = useCallback(() => {
        setShowPaymentsModal(false);
    }, []);

    const toggleMenuOverlay = useCallback(() => setShowMenuOverlay(prev => !prev), []);

    return (
        <div className="min-h-screen profile-content-wrapper">
            <nav id="topbar-club" className="flex items-center w-full p-4 fixed top-0 left-0 z-40 shadow-sm">
                <div className="flex-1">
                    <div className="container-profile-pic pic-xs w-8 h-8 relative rounded-full overflow-hidden">
                        <Image
                            src={businessData.business_img_profile || '/images/default-profile-xs.png'}
                            alt={`${businessData.business_name} Profile`}
                            fill
                            sizes="32px"
                            priority
                            className="object-cover"
                        />
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
                    <button
                        onClick={toggleMenuOverlay}
                        className="button-menu-topbar-profile hamburger-checkbox navbar-toggle ml-auto cursor-pointer"
                        type="button"
                        aria-label="Toggle menu"
                    >
                        <div className="hamburger-icon menu-button">
                            <label htmlFor="openmenu" id="hamburger-label">
                                <svg width="16" height="16" viewBox="0 0 16 16">
                                    <path fill="var(--theme-color-text)" stroke="var(--theme-color-text)" d="M12.6661 7.33348C12.2979 7.33348 11.9994 7.63195 11.9994 8.00014C11.9994 8.36833 12.2979 8.66681 12.6661 8.66681C13.0343 8.66681 13.3328 8.36833 13.3328 8.00014C13.3328 7.63195 13.0343 7.33348 12.6661 7.33348Z"></path>
                                    <path fill="var(--theme-color-text)" stroke="var(--theme-color-text)" d="M8.00057 7.33348C7.63238 7.33348 7.3339 7.63195 7.3339 8.00014C7.3339 8.36833 7.63238 8.66681 8.00057 8.66681C8.36876 8.66681 8.66724 8.36833 8.66724 8.00014C8.66724 7.63195 8.36876 7.33348 8.00057 7.33348Z"></path>
                                    <path fill="var(--theme-color-text)" stroke="var(--theme-color-text)" d="M3.33333 7.33348C2.96514 7.33348 2.66667 7.63195 2.66667 8.00014C2.66667 8.36833 2.96514 8.66681 3.33333 8.66681C3.70152 8.66681 4 8.36833 4 8.00014C4 7.63195 3.70152 7.33348 3.33333 7.33348Z"></path>
                                </svg>
                            </label>
                        </div>
                    </button>
                </div>
            </nav>

            <div className="">
                <BusinessProfileHeader
                    toggleContactModal={openContactModal}
                    togglePaymentsModal={openPaymentsModal}
                />

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
                        {activeSection === 'products' && <ProductListings />}
                        {activeSection === 'promotions' && <PromotionsDisplay />}
                        {activeSection === 'rewards' && <RewardsDisplay />}
                    </div>
                </main>
            </div>

            {showMenuOverlay && (
                <ProfileMenuOverlay
                    openContactModal={openContactModal}
                    openPaymentsModal={openPaymentsModal}
                    onClose={toggleMenuOverlay}
                />
            )}

            {showContactModal && (
                <ContactModal
                    show={showContactModal}
                    onClose={closeContactModal}
                    initialTab={activeContactTab}
                    businessData={businessData}
                    businessSettings={businessSettings}
                    themeColorText={themeColorText}
                    themeColorBackground={themeColorBackground}
                    themeColorButton={themeColorButton}
                    isDarkBackground={isDarkBackground}
                />
            )}

            {showPaymentsModal && (
                <PaymentsModal
                    show={showPaymentsModal}
                    onClose={closePaymentsModal}
                    businessPaymentMethods={businessPaymentMethods}
                    themeColorText={themeColorText}
                    themeColorBackground={themeColorBackground}
                    themeColorButton={themeColorButton}
                    isDarkBackground={isDarkBackground}
                />
            )}
        </div>
    );
}
// src/components/BusinessProfileHeader.jsx

'use client';

import React, { useCallback, useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/navigation';

import { useBusinessProfile } from '@/contexts/BusinessProfileContext';
import { useTranslations } from 'next-intl';
import { parseContacts, hasValidContacts } from '@/lib/utils/contacts';

const BusinessProfileHeader = ({ toggleContactModal, togglePaymentsModal, toggleMenuOverlay }) => {
    const [scrollOpacity, setScrollOpacity] = useState(1);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const {
        businessData,
        businessSettings,
        businessLinks,
        websiteLinkUrl,
        googleReviewLinkUrl,
        bookingLinkUrl,
        businessPaymentMethods,
        isDarkBackground,
        themeColorText,
        themeColorButton,
        buttonContentColor, // Use server-calculated button text color
    } = useBusinessProfile();

    const t = useTranslations('Common');
    const tBooking = useTranslations('Booking');

    const pathname = usePathname();
    const pathSegments = pathname.split('/').filter(Boolean);
    const businessUrlnameInPath = pathSegments[1];
    const currentSectionSlug = pathSegments[2];

    const activeSection = currentSectionSlug || businessSettings.default_page;

    // Scroll effect for desktop hero
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const fadeStart = 0;
            const fadeEnd = windowHeight * 0.8; // Start fading after 80% of viewport height
            
            if (scrollY <= fadeStart) {
                setScrollOpacity(1);
            } else if (scrollY >= fadeEnd) {
                setScrollOpacity(0);
            } else {
                const fadeRange = fadeEnd - fadeStart;
                const currentFade = scrollY - fadeStart;
                const opacity = 1 - (currentFade / fadeRange);
                setScrollOpacity(Math.max(0, opacity));
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when clicking outside or pressing escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setIsMobileMenuOpen(false);
            }
        };

        if (isMobileMenuOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    if (!businessData) {
        return <div className="text-center py-4" style={{ color: themeColorText || 'gray' }}>{t('loadingHeader')}</div>;
    }


    // OPTIMIZED: Use server-calculated button text color
    const phones = parseContacts(businessData.business_phone);
    const emails = parseContacts(businessData.business_email);
    const hasPhones = hasValidContacts(phones);
    const hasEmails = hasValidContacts(emails);

    const primaryButtonClassName = `button btn-md block text-center shadow-lg`;
    const primaryButtonStyle = {
        backgroundColor: themeColorButton,
        color: buttonContentColor
    };

    const secondaryButtonStyle = {
        backgroundColor: 'transparent',
        color: themeColorText,
        border: `1px solid ${themeColorText}`
    };

    const circularButtonBaseClass = `flex flex-col items-center rounded-full transition-colors duration-200`;

    const getButtonIconStyle = useCallback(() => {
        return {
            filter: buttonContentColor === 'white' ? 'invert(1)' : 'none',
        };
    }, [buttonContentColor]);

    const filteredSocialLinks = businessLinks.filter(
        (link) =>
            link.link_type !== 'website' &&
            link.link_type !== 'google_review' &&
            link.link_type !== 'phone' &&
            link.link_type !== 'email' &&
            link.link_type !== 'booking'
    );

    return (
        <header className="profile-header relative h-full z-50">
            {/* Desktop Navbar - Only visible on lg+ devices */}
            <nav className="profile-navbar hidden lg:block fixed top-0 left-0 right-0 z-50 shadow-sm" style={{ borderBottom: `1px solid ${isDarkBackground ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                <div className="container mx-auto py-2 px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Left side - Profile image, business name, and navigation links */}
                        <div className="flex items-center space-x-8">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0" style={{ boxShadow: '0.5px 0.5px 3px rgba(0, 0, 0, 0.4)' }}>
                                    {businessData.business_img_profile ? (
                                        <Image
                                            src={businessData.business_img_profile}
                                            alt=""
                                            width={40}
                                            height={40}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="w-full h-full" style={{ backgroundColor: themeColorText + '20' }}></div>
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-xl font-semibold" style={{ color: themeColorText }}>
                                        {businessData.business_name}
                                    </h1>
                                </div>
                            </div>

                            {/* Navigation links */}
                            <div className="flex items-center space-x-6">
                                <Link
                                    href={`/${businessUrlnameInPath}/services`}
                                    className={`text-sm font-medium transition-colors duration-200 ${activeSection === 'services' ? 'border-b-2' : ''}`}
                                    style={activeSection === 'services' ? { borderColor: themeColorText, color: themeColorText } : { color: themeColorText }}
                                >
                                    {t('services')}
                                </Link>
                                <Link
                                    href={`/${businessUrlnameInPath}/products`}
                                    className={`text-sm font-medium transition-colors duration-200 ${activeSection === 'products' ? 'border-b-2' : ''}`}
                                    style={activeSection === 'products' ? { borderColor: themeColorText, color: themeColorText } : { color: themeColorText }}
                                >
                                    {t('products')}
                                </Link>
                                <Link
                                    href={`/${businessUrlnameInPath}/promotions`}
                                    className={`text-sm font-medium transition-colors duration-200 ${activeSection === 'promotions' ? 'border-b-2' : ''}`}
                                    style={activeSection === 'promotions' ? { borderColor: themeColorText, color: themeColorText } : { color: themeColorText }}
                                >
                                    {t('promotions')}
                                </Link>
                                <Link
                                    href={`/${businessUrlnameInPath}/rewards`}
                                    className={`text-sm font-medium transition-colors duration-200 ${activeSection === 'rewards' ? 'border-b-2' : ''}`}
                                    style={activeSection === 'rewards' ? { borderColor: themeColorText, color: themeColorText } : { color: themeColorText }}
                                >
                                    {t('rewards')}
                                </Link>
                            </div>
                        </div>

                        {/* Right side - Social links and action buttons */}
                        <div className="flex items-center gap-x-3">
                            {/* Social Links */}
                            <div className="flex items-center gap-1">
                                {businessSettings.show_socials && filteredSocialLinks.map((link, index) => (
                                    <div key={index}>
                                        <Link href={link.link_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                                            {link.icon && (
                                                <Image
                                                    src={link.icon}
                                                    alt={link.label}
                                                    width={20}
                                                    height={20}
                                                />
                                            )}
                                        </Link>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col items-end gap-x-3">
                            {(businessSettings.show_address && businessData.business_address) && (
                                <p className="text-sm opacity-90">
                                        {businessData.business_city} / {businessData.business_address}
                                </p>
                            )}
                            {businessSettings.show_website && websiteLinkUrl && (
                                        <Link href={websiteLinkUrl} target="_blank" rel="noopener noreferrer" className="text-xs underline opacity-60 hover:opacity-100 transition-opacity">
                                            {websiteLinkUrl.replace(/^https?:\/\/(www\.)?/, '')}
                                        </Link>
                            )}
                            </div>
                                
                            {/* Action Buttons */}
                            {businessSettings.show_btn_payments && (
                                <button onClick={togglePaymentsModal} className="px-2 py-1 rounded-lg text-sm font-medium transition-colors duration-200" style={secondaryButtonStyle}>
                                    Pagamenti
                                </button>
                            )}

                            {businessSettings.show_btn_review && googleReviewLinkUrl && (
                                <Link href={googleReviewLinkUrl} target="_blank" rel="noopener noreferrer" className="px-2 py-1 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-1" style={secondaryButtonStyle}>
                                    Recensione
                                    <Image
                                        src="/icons/google.png"
                                        alt="Google"
                                        width={16}
                                        height={16}
                                    />
                                </Link>
                            )}


                            {businessSettings.show_btn_phone && hasPhones && (
                                <button onClick={() => toggleContactModal('phone')} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200" style={primaryButtonStyle}>
                                    <Image
                                        src="/icons/iconsax/phone.svg"
                                        alt={t('call')}
                                        width={18}
                                        height={18}
                                        style={getButtonIconStyle()}
                                    />
                                    <span className="text-base font-medium">{t('call')}</span>
                                </button>
                            )}

                            {businessSettings.show_btn_email && hasEmails && (
                                <button onClick={() => toggleContactModal('email')} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200" style={primaryButtonStyle}>
                                    <Image
                                        src="/icons/iconsax/email.svg"
                                        alt={t('email')}
                                        width={18}
                                        height={18}
                                        style={getButtonIconStyle()}
                                    />
                                    <span className="text-base font-medium">{t('email')}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile/Tablet Cover Image */}
            <div className="lg:hidden profile-cover w-full relative bg-gray-200 h-40 sm:h-40 md:h-40">
                {businessData.business_img_cover_mobile ? (
                    <Image
                        src={businessData.business_img_cover_mobile}
                        alt=""
                        fill
                        sizes="100vw"
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="cover-photo-placeholder w-full h-full" style={{ backgroundColor: themeColorText + '20' }}></div>
                )}
                
                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:bg-white/95 z-20"
                    style={{ color: themeColorText }}
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="6" cy="12" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="18" cy="12" r="2" />
                    </svg>
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end">
                    <div className="bg-white rounded-t-3xl w-full max-h-[85vh] overflow-y-auto relative">
                        {/* Close Button - Absolute positioned */}
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-colors hover:bg-gray-200 z-10"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="p-6 pt-16">
                            {/* Unified Profile Card with Page Link */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <div className="flex items-center space-x-3 mb-3">
                                    {/* Profile Image */}
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                        {businessData.business_img_profile ? (
                                            <Image
                                                src={businessData.business_img_profile}
                                                alt=""
                                                width={48}
                                                height={48}
                                                className="object-cover w-full h-full"
                                            />
                                        ) : (
                                            <div className="w-full h-full" style={{ backgroundColor: themeColorText + '20' }}></div>
                                        )}
                                    </div>
                                    
                                    {/* Business Name */}
                                    <h2 className="text-lg font-semibold" style={{ color: themeColorText }}>
                                        {businessData.business_name}
                                    </h2>
                                </div>
                                
                                {/* Page URL with Copy Button */}
                                <div className="w-full">
                                    <div className="flex items-center justify-between bg-white rounded-full p-1.5 border border-gray-200">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium truncate" style={{ color: themeColorText }}>
                                                {typeof window !== 'undefined' ? window.location.href : ''}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (typeof window !== 'undefined') {
                                                    navigator.clipboard.writeText(window.location.href);
                                                    // You could add a toast notification here
                                                }
                                            }}
                                            className="ml-2 p-1 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors flex-shrink-0"
                                        >
                                            <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 2z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Links - With borders to separate */}
                            <div className="space-y-0 mb-4">
                                <Link
                                    href={`/${businessUrlnameInPath}/services`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`block py-3 px-4 transition-colors duration-200 text-lg border-b border-gray-200 ${activeSection === 'services' ? 'font-semibold' : 'font-normal'}`}
                                    style={activeSection === 'services' ? { backgroundColor: themeColorButton + '20', color: themeColorText } : { color: themeColorText }}
                                >
                                    {t('services')}
                                </Link>
                                <Link
                                    href={`/${businessUrlnameInPath}/products`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`block py-3 px-4 transition-colors duration-200 text-lg border-b border-gray-200 ${activeSection === 'products' ? 'font-semibold' : 'font-normal'}`}
                                    style={activeSection === 'products' ? { backgroundColor: themeColorButton + '20', color: themeColorText } : { color: themeColorText }}
                                >
                                    {t('products')}
                                </Link>
                                <Link
                                    href={`/${businessUrlnameInPath}/promotions`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`block py-3 px-4 transition-colors duration-200 text-lg border-b border-gray-200 ${activeSection === 'promotions' ? 'font-semibold' : 'font-normal'}`}
                                    style={activeSection === 'promotions' ? { backgroundColor: themeColorButton + '20', color: themeColorText } : { color: themeColorText }}
                                >
                                    {t('promotions')}
                                </Link>
                                <Link
                                    href={`/${businessUrlnameInPath}/rewards`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`block py-3 px-4 transition-colors duration-200 text-lg ${activeSection === 'rewards' ? 'font-semibold' : 'font-normal'}`}
                                    style={activeSection === 'rewards' ? { backgroundColor: themeColorButton + '20', color: themeColorText } : { color: themeColorText }}
                                >
                                    {t('rewards')}
                                </Link>
                            </div>

                            {/* Google Review Button */}
                            {businessSettings.show_btn_review && googleReviewLinkUrl && (
                                <div className="mb-3">
                                    <Link 
                                        href={googleReviewLinkUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-colors duration-200 w-full"
                                        style={secondaryButtonStyle}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Recensione
                                        <Image
                                            src="/icons/google.png"
                                            alt="Google"
                                            width={16}
                                            height={16}
                                        />
                                    </Link>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                {businessSettings.show_btn_payments && (
                                    <button 
                                        onClick={() => {
                                            togglePaymentsModal();
                                            setIsMobileMenuOpen(false);
                                        }} 
                                        className="w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
                                        style={primaryButtonStyle}
                                    >
                                        Pagamenti
                                    </button>
                                )}

                                {/* Phone and Email buttons in same row */}
                                {(businessSettings.show_btn_phone && hasPhones) || (businessSettings.show_btn_email && hasEmails) ? (
                                    <div className="flex gap-3">
                                        {businessSettings.show_btn_phone && hasPhones && (
                                            <button 
                                                onClick={() => {
                                                    toggleContactModal('phone');
                                                    setIsMobileMenuOpen(false);
                                                }} 
                                                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
                                                style={primaryButtonStyle}
                                            >
                                                <Image
                                                    src="/icons/iconsax/phone.svg"
                                                    alt={t('call')}
                                                    width={18}
                                                    height={18}
                                                    style={getButtonIconStyle()}
                                                />
                                                <span className="text-base font-medium">{t('call')}</span>
                                            </button>
                                        )}

                                        {businessSettings.show_btn_email && hasEmails && (
                                            <button 
                                                onClick={() => {
                                                    toggleContactModal('email');
                                                    setIsMobileMenuOpen(false);
                                                }} 
                                                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
                                                style={primaryButtonStyle}
                                            >
                                                <Image
                                                    src="/icons/iconsax/email.svg"
                                                    alt={t('email')}
                                                    width={18}
                                                    height={18}
                                                    style={getButtonIconStyle()}
                                                />
                                                <span className="text-base font-medium">{t('email')}</span>
                                            </button>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            )}

                         {/* Mobile/Tablet Profile Image - Hidden on desktop */}
             <div className="lg:hidden container-profile-pic pic-lg relative z-10 ml-4 -translate-y-1/2 rounded-full overflow-hidden bg-gray-100"
                 style={{
                     width: '80px',
                     height: '80px',
                 }}>
                 {businessData.business_img_profile ? (
                     <Image
                         src={businessData.business_img_profile}
                         alt=""
                         fill
                         sizes="80px"
                         className="object-cover"
                         priority
                     />
                 ) : (
                     <div className="profile-image-placeholder w-full h-full" style={{ backgroundColor: themeColorText + '20' }}></div>
                 )}
             </div>

            {/* Mobile/Tablet Layout (up to lg) */}
            <div className="lg:hidden container flex flex-col mx-auto max-w-3xl relative px-4 mt-[-50px]">
                <div className="flex gap-4 mt-4">
                    {/* Left Column: Business Info */}
                    <div className="flex-1">
                        <div className="text-left" style={{ color: themeColorText }}>
                            <p className="text-xl md:text-2xl font-bold">{businessData.business_name}</p>
                            {businessData.business_descr && <p className="d-none text-sm opacity-80 mt-1 max-w-lg">{businessData.business_descr}</p>}
                            <div className="flex flex-col gap-1 mt-1">
                                {(businessSettings.show_address && businessData.business_address) && (
                                    <p className="text-sm opacity-70" style={{ color: themeColorText }}>
                                        {businessData.business_city} / {businessData.business_address}
                                    </p>
                                )}

                                {businessSettings.show_website && websiteLinkUrl && (
                                    <Link href={websiteLinkUrl} target="_blank" rel="noopener noreferrer" className="text-sm underline opacity-50" style={{ color: themeColorText }}>
                                        {websiteLinkUrl.replace(/^https?:\/\/(www\.)?/, '')}
                                    </Link>
                                )}
                            </div>
                        </div>

                                                 <div className="flex flex-wrap gap-1 mt-2">
                             {businessSettings.show_socials && filteredSocialLinks.map((link, index) => (
                                 <div key={index} className="text-center">
                                     <Link href={link.link_url} target="_blank" rel="noopener noreferrer" className={circularButtonBaseClass}>
                                         <div className="link-icon-wrapper w-8 h-8 flex items-center justify-center rounded-full">
                                             {link.icon && (
                                                 <Image
                                                     src={link.icon}
                                                     alt={link.label}
                                                     width={22}
                                                     height={22}
                                                 />
                                             )}
                                         </div>
                                     </Link>
                                 </div>
                             ))}
                         </div>


                     </div>

                     {/* Right Column: Action Buttons */}
                     <div className="flex flex-col gap-2">

                         {businessSettings.show_btn_phone && hasPhones && (
                             <button onClick={() => toggleContactModal('phone')} className={circularButtonBaseClass} style={primaryButtonStyle}>
                                 <div className="link-icon-wrapper w-8 h-8 flex items-center justify-center rounded-full">
                                     <Image
                                         src="/icons/iconsax/phone.svg"
                                         alt={t('call')}
                                         width={16}
                                         height={16}
                                         style={getButtonIconStyle()}
                                     />
                                 </div>
                             </button>
                         )}

                         {businessSettings.show_btn_email && hasEmails && (
                             <button onClick={() => toggleContactModal('email')} className={circularButtonBaseClass} style={primaryButtonStyle}>
                                 <div className="link-icon-wrapper w-8 h-8 flex items-center justify-center rounded-full">
                                     <Image
                                         src="/icons/iconsax/email.svg"
                                         alt={t('email')}
                                         width={16}
                                         height={16}
                                         style={getButtonIconStyle()}
                                     />
                                 </div>
                             </button>
                         )}
                          {businessSettings.show_btn_payments && (
                             <button onClick={togglePaymentsModal} className="px-3 py-2 rounded-2xl text-xs font-medium transition-colors duration-200" style={primaryButtonStyle}>
                                 Pagamenti
                             </button>
                         )}
                     </div>
                </div>

                <nav className="profile-nav-sections mt-4 lg:hidden overflow-x-auto" style={{ borderColor: `rgba(${isDarkBackground ? '255,255,255' : '0,0,0'}, 0.2)` }}>
                    <ul className="flex justify-start text-base whitespace-nowrap">
                                                 <li>
                                 <Link
                                     href={`/${businessUrlnameInPath}/services`}
                                     className={`block py-2 px-2 transition-colors duration-200 text-left ${activeSection === 'services' ? 'section-active border-b-2 font-semibold' : 'font-normal'}`}
                                     style={activeSection === 'services' ? { borderColor: themeColorText, color: themeColorText } : { color: themeColorText }}
                                 >
                                     {t('services')}
                                 </Link>
                         </li>
                         <li>
                             <Link
                                 href={`/${businessUrlnameInPath}/products`}
                                 className={`block py-2 px-2 transition-colors duration-200 text-left ${activeSection === 'products' ? 'section-active border-b-2 font-semibold' : 'font-normal'}`}
                                 style={activeSection === 'products' ? { borderColor: themeColorText, color: themeColorText } : { color: themeColorText }}
                             >
                                 {t('products')}
                             </Link>
                         </li>
                         <li>
                             <Link
                                 href={`/${businessUrlnameInPath}/promotions`}
                                 className={`block py-2 px-2 transition-colors duration-200 text-left ${activeSection === 'promotions' ? 'section-active border-b-2 font-semibold' : 'font-normal'}`}
                                 style={activeSection === 'promotions' ? { borderColor: themeColorText, color: themeColorText } : { color: themeColorText }}
                             >
                                 {t('promotions')}
                             </Link>
                         </li>
                         <li>
                             <Link
                                 href={`/${businessUrlnameInPath}/rewards`}
                                 className={`block py-2 px-2 transition-colors duration-200 text-left ${activeSection === 'rewards' ? 'section-active border-b-2 font-semibold' : 'font-normal'}`}
                                 style={activeSection === 'rewards' ? { borderColor: themeColorText, color: themeColorText } : { color: themeColorText }}
                             >
                                 {t('rewards')}
                             </Link>
                         </li>
                    </ul>
                </nav>
            </div>

            {/* Desktop Hero Layout (lg+) */}
            <div className="hidden lg:flex flex-col justify-center h-screen max-h-screen overflow-y-auto relative">
                {/* Cover Image Background - Only for desktop layout */}
                {businessData.business_img_cover_desktop && (
                    <div className="absolute inset-0 z-0 my-8 rounded-lg">
                        <div className="relative h-full w-full rounded-lg">
                            <Image
                                src={businessData.business_img_cover_desktop}
                                alt=""
                                fill
                                sizes="100%"
                                className="object-cover rounded-xl"
                                priority
                            />
                            {/* Overlay for better text readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
                        </div>
                    </div>
                )}
                
                <div className="container mx-auto px-16 relative z-10">
                    <div className="text-left transition-opacity duration-300" style={{ color: 'white', opacity: scrollOpacity }}>
                        <div className="mb-0">
                            {businessData.business_descr && <p className="font-bold text-2xl md:text-4xl lg:text-5xl max-w-2xl mb-4" style={{ textShadow: '1px 1px 4px rgba(0, 0, 0, 0.5)' }}>{businessData.business_descr}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default BusinessProfileHeader;
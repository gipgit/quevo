// src/components/BusinessProfileHeader.jsx

'use client';

import React, { useCallback, useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/navigation';

import { useBusinessProfile } from '@/contexts/BusinessProfileContext';
import { useTranslations } from 'next-intl';
import { parseContacts, hasValidContacts } from '@/lib/utils/contacts';

const BusinessProfileHeader = ({ toggleContactModal, togglePaymentsModal, toggleMenuOverlay, toggleAddressModal }) => {
    const [overlayOpacity, setOverlayOpacity] = useState(0.3); // Start with light overlay
    const [imageTranslateY, setImageTranslateY] = useState(0); // Start with no translation
    const [imageHeight, setImageHeight] = useState(50); // Start with 50vh height
    const [imageOpacity, setImageOpacity] = useState(0); // Start with transparent image
    const [titleOpacity, setTitleOpacity] = useState(1); // Start with fully visible title
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    
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
        themeColorBackground,
        buttonContentColor, // Use server-calculated button text color
    } = useBusinessProfile();

    const t = useTranslations('Common');
    const tBooking = useTranslations('Booking');

    const pathname = usePathname();
    const pathSegments = pathname.split('/').filter(Boolean);
    const businessUrlnameInPath = pathSegments[1];
    const currentSectionSlug = pathSegments[2];

    const activeSection = currentSectionSlug || businessSettings.default_page;

    // Initial load effect - fade in and set image to normal height
    useEffect(() => {
        if (businessData && !hasLoaded) {
            const timer = setTimeout(() => {
                setImageHeight(50); // Set to normal height (50vh)
                setImageOpacity(1); // Fade in to full opacity
                setTitleOpacity(1); // Set title to fully visible
                setHasLoaded(true);
            }, 100); // Small delay to ensure smooth animation

            return () => clearTimeout(timer);
        }
    }, [businessData, hasLoaded]);

    // Scroll effect for desktop hero - make overlay darker, translate image up, reduce height, and fade out title on scroll
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const scrollThreshold = windowHeight * 0.3; // Start effects after 30% of viewport height
            
            if (scrollY <= 0) {
                setOverlayOpacity(0.3); // Light overlay at top
                setImageTranslateY(0); // No translation at top
                setImageHeight(50); // Normal height at top (50vh)
                setTitleOpacity(1); // Fully visible title at top
            } else if (scrollY >= scrollThreshold) {
                setOverlayOpacity(0.7); // Dark overlay at bottom
                setImageTranslateY(-20); // Maximum translation up
                setImageHeight(30); // Reduced height at bottom (30vh)
                setTitleOpacity(0); // Fully faded out title at bottom
            } else {
                const scrollRange = scrollThreshold;
                const currentScroll = scrollY;
                const progress = currentScroll / scrollRange; // 0 to 1
                
                // Overlay opacity: 0.3 to 0.7
                const opacityRange = 0.7 - 0.3;
                const newOpacity = 0.3 + (progress * opacityRange);
                setOverlayOpacity(Math.min(0.7, Math.max(0.3, newOpacity)));
                
                // Image translation: 0 to -20px
                const translateRange = -20;
                const newTranslateY = progress * translateRange;
                setImageTranslateY(newTranslateY);
                
                // Image height: 50vh to 30vh (reduce height from normal size)
                const heightRange = 30 - 50;
                const newHeight = 50 + (progress * heightRange);
                setImageHeight(Math.min(50, Math.max(30, newHeight)));
                
                // Title opacity: 1 to 0 (fade out title)
                const titleOpacityRange = 0 - 1;
                const newTitleOpacity = 1 + (progress * titleOpacityRange);
                setTitleOpacity(Math.min(1, Math.max(0, newTitleOpacity)));
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
            <nav className="profile-navbar hidden lg:block fixed top-0 left-0 right-0 z-50 " style={{ borderBottom: `0px solid ${isDarkBackground ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                <div className="container mx-auto py-3 px-5">
                    <div className="flex items-center justify-between">
                        {/* Left side - Profile image, business name, and navigation links */}
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
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
                        <div className="flex items-center space-x-3">
                                <Link
                                    href={`/${businessUrlnameInPath}/services`}
                                    className={`text-sm py-1 font-medium transition-colors duration-200 ${activeSection === 'services' ? 'border-b-2' : ''}`}
                                    style={activeSection === 'services' ? { borderColor: themeColorText, color: themeColorText } : { color: themeColorText }}
                                >
                                    {t('services')}
                                </Link>
                                <Link
                                    href={`/${businessUrlnameInPath}/products`}
                                    className={`text-sm py-1 font-medium transition-colors duration-200 ${activeSection === 'products' ? 'border-b-2' : ''}`}
                                    style={activeSection === 'products' ? { borderColor: themeColorText, color: themeColorText } : { color: themeColorText }}
                                >
                                    {t('products')}
                                </Link>
                                <Link
                                    href={`/${businessUrlnameInPath}/promotions`}
                                    className={`text-sm py-1 font-medium transition-colors duration-200 ${activeSection === 'promotions' ? 'border-b-2' : ''}`}
                                    style={activeSection === 'promotions' ? { borderColor: themeColorText, color: themeColorText } : { color: themeColorText }}
                                >
                                    {t('promotions')}
                                </Link>
                                <Link
                                    href={`/${businessUrlnameInPath}/rewards`}
                                    className={`text-sm py-1 font-medium transition-colors duration-200 ${activeSection === 'rewards' ? 'border-b-2' : ''}`}
                                    style={activeSection === 'rewards' ? { borderColor: themeColorText, color: themeColorText } : { color: themeColorText }}
                                >
                                    {t('rewards')}
                                </Link>
                                {/* Action Buttons */}
                                    {businessSettings.show_btn_payments && (
                                        <button onClick={togglePaymentsModal} className="py-1 text-sm font-medium transition-colors duration-200">
                                            Pagamenti
                                        </button>
                                )}
                            </div>
                           
                            
                        </div>

                        {/* Right side - action buttons */}
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

                            {businessSettings.show_address && businessData.business_address && (
                                <button onClick={toggleAddressModal} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200" style={primaryButtonStyle}>
                                    <Image
                                        src="/icons/iconsax/location.svg"
                                        alt="Indirizzo"
                                        width={18}
                                        height={18}
                                        style={getButtonIconStyle()}
                                    />
                                    <span className="text-base font-medium">Indirizzo</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile/Tablet Cover Image */}
            <div className="lg:hidden profile-cover w-full relative bg-gray-200 h-32 sm:h-40 md:h-40">
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

                                {/* Phone, Email, and Address buttons in same row */}
                                {(businessSettings.show_btn_phone && hasPhones) || (businessSettings.show_btn_email && hasEmails) || (businessSettings.show_address && businessData.business_address) ? (
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

                                        {businessSettings.show_address && businessData.business_address && (
                                            <button 
                                                onClick={() => {
                                                    toggleAddressModal();
                                                    setIsMobileMenuOpen(false);
                                                }} 
                                                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
                                                style={primaryButtonStyle}
                                            >
                                                <Image
                                                    src="/icons/iconsax/location.svg"
                                                    alt="Indirizzo"
                                                    width={18}
                                                    height={18}
                                                    style={getButtonIconStyle()}
                                                />
                                                <span className="text-base font-medium">Indirizzo</span>
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
             <div className="lg:hidden container-profile-pic pic-lg relative z-10 mx-auto -translate-y-[45px] rounded-full overflow-hidden bg-gray-100"
                 style={{
                     width: '70px',
                     height: '70px',
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
                <div className="flex flex-col justify-center items-center gap-2 mt-4">
                    {/* Left Column: Business Info */}
                    <div className="flex-1">
                        <div className="text-center" style={{ color: themeColorText }}>
                            <p className="text-2xl md:text-2xl font-bold">{businessData.business_name}</p>
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

                                           <div className="flex justify-center flex-wrap gap-1 mt-2">
                             {businessSettings.show_socials && filteredSocialLinks.map((link, index) => (
                                 <div key={index} className="text-center">
                                     <Link href={link.link_url} target="_blank" rel="noopener noreferrer" className={circularButtonBaseClass}>
                                         <div className="link-icon-wrapper w-7 h-7 flex items-center justify-center rounded-full">
                                             {link.icon && (
                                                 <Image
                                                     src={link.icon}
                                                     alt={link.label}
                                                     width={20}
                                                     height={20}
                                                 />
                                             )}
                                         </div>
                                     </Link>
                                 </div>
                             ))}
                         </div>


                     </div>

                     {/* Right Column: Action Buttons */}
                     <div className="flex flex-row gap-2">

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

                         {businessSettings.show_address && businessData.business_address && (
                             <button onClick={toggleAddressModal} className={circularButtonBaseClass} style={primaryButtonStyle}>
                                 <div className="link-icon-wrapper w-8 h-8 flex items-center justify-center rounded-full">
                                     <Image
                                         src="/icons/iconsax/location.svg"
                                         alt="Indirizzo"
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

            {/* Desktop Hero Container (lg+) */}
            <div className="max-w-[1600px] mx-auto hidden lg:flex rounded-2xl lg:flex-col justify-end overflow-y-auto relative">
                {/* Cover Image Background - Only for desktop layout */}
                {businessData.business_img_cover_desktop && (
                    <div className="w-full z-0 rounded-2xl">
                        <div className="relative w-full rounded-2xl transition-all duration-700 ease-out" style={{ height: `${imageHeight}vh` }}>
                            <Image
                                src={businessData.business_img_cover_desktop}
                                alt=""
                                fill
                                sizes="100%"
                                className="object-cover h-full rounded-2xl transition-all duration-300 ease-out"
                                style={{
                                    transform: `translateY(${imageTranslateY}px)`,
                                    opacity: imageOpacity
                                }}
                                priority
                            />
                            {/* Overlay for Hero Content*/}
                            <div 
                                className="absolute inset-0 rounded-2xl flex flex-col p-12 items-start justify-end transition-all duration-300 ease-out"
                                style={{
                                    background: `linear-gradient(to top, rgba(0, 0, 0, ${overlayOpacity}), transparent 25%)`,
                                    transform: `translateY(${imageTranslateY}px)`,
                                    opacity: imageOpacity
                                }}
                            >
                                 <div className="mb-0 text-center transition-opacity duration-300 ease-out" style={{ opacity: titleOpacity }}>
                                    {businessData.business_name && <p className="font-bold text-3xl md:text-4xl lg:text-6xl max-4-3xl mb-2 text-white" style={{ textShadow: '1px 1px 4px rgba(0, 0, 0, 0.5)' }}>{businessData.business_name}</p>}
                                    {businessData.business_descr && <p className="font-bold text-xl md:text-xl lg:text-2xl max-4-3xl text-white" style={{ textShadow: '1px 1px 4px rgba(0, 0, 0, 0.5)' }}>{businessData.business_descr}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                
            </div>
        </header>
    );
};

export default BusinessProfileHeader;
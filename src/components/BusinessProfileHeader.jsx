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
    
    const {
        businessData,
        businessSettings,
        businessLinks,
        websiteLinkUrl,
        googleReviewLinkUrl,
        bookingLinkUrl,
        businessPaymentMethods,
        themeVariables,
        isDarkBackground,
        themeColorText,
        themeColorButton,
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

    if (!businessData) {
        return <div className="text-center py-4" style={{ color: themeColorText || 'gray' }}>{t('loadingHeader')}</div>;
    }

    const logoAltText = `${businessData.business_name} Logo`;

    const getButtonContentColor = useCallback((bgColor) => {
        if (!bgColor) return 'white';
        const hex = bgColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? 'black' : 'white';
    }, []);
    const buttonContentColor = getButtonContentColor(themeColorButton);

    const phones = parseContacts(businessData.business_phone);
    const emails = parseContacts(businessData.business_email);
    const hasPhones = hasValidContacts(phones);
    const hasEmails = hasValidContacts(emails);

    const primaryButtonClassName = `button btn-md block text-center shadow-lg`;
    const primaryButtonStyle = {
        backgroundColor: themeColorButton,
        color: buttonContentColor
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
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                    {businessData.business_img_profile ? (
                                        <Image
                                            src={businessData.business_img_profile}
                                            alt={logoAltText}
                                            width={40}
                                            height={40}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="w-full h-full" style={{ backgroundColor: themeVariables['--lighter-theme-color-background'] }}></div>
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-lg font-semibold" style={{ color: themeColorText }}>
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
                        <div className="flex items-center space-x-3">
                            {/* Social Links */}
                            {businessSettings.show_socials && filteredSocialLinks.map((link, index) => (
                                <div key={index}>
                                    <Link href={link.link_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                                        {link.icon && (
                                            <Image
                                                src={link.icon}
                                                alt={link.label}
                                                width={16}
                                                height={16}
                                            />
                                        )}
                                    </Link>
                                </div>
                            ))}
                            
                            {/* Action Buttons */}
                            {businessSettings.show_btn_payments && businessPaymentMethods && businessPaymentMethods.length > 0 && (
                                <button onClick={togglePaymentsModal} className="px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200" style={primaryButtonStyle}>
                                    Pagamenti
                                </button>
                            )}

                            {businessSettings.show_btn_review && googleReviewLinkUrl && (
                                <Link href={googleReviewLinkUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-1" style={primaryButtonStyle}>
                                    Recensione
                                    <Image
                                        src="/icons/google.png"
                                        alt="Google"
                                        width={16}
                                        height={16}
                                        style={getButtonIconStyle()}
                                    />
                                </Link>
                            )}

                            {businessSettings.show_btn_phone && hasPhones && (
                                <button onClick={() => toggleContactModal('phone')} className={circularButtonBaseClass} style={primaryButtonStyle}>
                                    <div className="link-icon-wrapper w-10 h-10 flex items-center justify-center rounded-full">
                                        <Image
                                            src="/icons/iconsax/phone.svg"
                                            alt={t('call')}
                                            width={20}
                                            height={20}
                                            style={getButtonIconStyle()}
                                        />
                                    </div>
                                </button>
                            )}

                            {businessSettings.show_btn_email && hasEmails && (
                                <button onClick={() => toggleContactModal('email')} className={circularButtonBaseClass} style={primaryButtonStyle}>
                                    <div className="link-icon-wrapper w-10 h-10 flex items-center justify-center rounded-full">
                                        <Image
                                            src="/icons/iconsax/email.svg"
                                            alt={t('email')}
                                            width={20}
                                            height={20}
                                            style={getButtonIconStyle()}
                                        />
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>


            {/* Mobile/Tablet Cover Image */}
            <div className="lg:hidden profile-cover w-full relative bg-gray-200 h-32 sm:h-40 md:h-40">
                {businessData.business_img_cover ? (
                    <Image
                        src={businessData.business_img_cover}
                        alt={t('coverPhotoAlt')}
                        fill
                        sizes="100vw"
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="cover-photo-placeholder w-full h-full" style={{ backgroundColor: themeVariables['--lighter-theme-color-background'] }}></div>
                )}
            </div>

            {/* Mobile/Tablet Profile Image - Hidden on desktop */}
            <div className="lg:hidden container-profile-pic pic-lg relative z-10 mx-auto -translate-y-1/2 rounded-full overflow-hidden bg-gray-100"
                style={{
                    width: '100px',
                    height: '100px',
                }}>
                {businessData.business_img_profile ? (
                    <Image
                        src={businessData.business_img_profile}
                        alt={logoAltText}
                        fill
                        sizes="100px"
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="profile-image-placeholder w-full h-full" style={{ backgroundColor: themeVariables['--lighter-theme-color-background'] }}></div>
                )}
            </div>

            {/* Mobile/Tablet Layout (up to lg) */}
            <div className="lg:hidden container flex flex-col mx-auto max-w-3xl relative px-4 mt-[-50px]">
                <div className="text-center mt-4" style={{ color: themeColorText }}>
                    <p className="text-3xl md:text-4xl font-bold">{businessData.business_name}</p>
                    {businessData.business_descr && <p className="d-none text-sm opacity-80 mt-1 max-w-lg mx-auto">{businessData.business_descr}</p>}
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
                        {(businessSettings.show_address && businessData.business_address) && (
                            <p className="text-sm opacity-70" style={{ color: themeColorText }}>
                                {businessData.business_city} / {businessData.business_address}
                            </p>
                        )}

                        {businessSettings.show_website && websiteLinkUrl && (
                            <Link href={websiteLinkUrl} target="_blank" rel="noopener noreferrer" className="text-sm underline" style={{ color: themeColorText }}>
                                {websiteLinkUrl.replace(/^https?:\/\/(www\.)?/, '')}
                            </Link>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-1 mt-1">
                    {businessSettings.show_socials && filteredSocialLinks.map((link, index) => (
                        <div key={index} className="text-center">
                            <Link href={link.link_url} target="_blank" rel="noopener noreferrer" className={circularButtonBaseClass}>
                                <div className="link-icon-wrapper w-10 h-10 flex items-center justify-center rounded-full">
                                    {link.icon && (
                                        <Image
                                            src={link.icon}
                                            alt={link.label}
                                            width={24}
                                            height={24}
                                        />
                                    )}
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="flex flex-wrap justify-center items-center gap-2 mt-2">
                    {businessSettings.show_btn_payments && businessPaymentMethods && businessPaymentMethods.length > 0 && (
                        <button onClick={togglePaymentsModal} className="px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200" style={primaryButtonStyle}>
                            Pagamenti
                        </button>
                    )}

                    {businessSettings.show_btn_review && googleReviewLinkUrl && (
                        <Link href={googleReviewLinkUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-1" style={primaryButtonStyle}>
                            Recensione
                            <Image
                                src="/icons/google.png"
                                alt="Google"
                                width={16}
                                height={16}
                                style={getButtonIconStyle()}
                            />
                        </Link>
                    )}

                    {businessSettings.show_btn_phone && hasPhones && (
                        <button onClick={() => toggleContactModal('phone')} className={circularButtonBaseClass} style={primaryButtonStyle}>
                            <div className="link-icon-wrapper w-12 h-12 flex items-center justify-center rounded-full">
                                <Image
                                    src="/icons/iconsax/phone.svg"
                                    alt={t('call')}
                                    width={24}
                                    height={24}
                                    style={getButtonIconStyle()}
                                />
                            </div>
                        </button>
                    )}

                    {businessSettings.show_btn_email && hasEmails && (
                        <button onClick={() => toggleContactModal('email')} className={circularButtonBaseClass} style={primaryButtonStyle}>
                            <div className="link-icon-wrapper w-12 h-12 flex items-center justify-center rounded-full">
                                <Image
                                    src="/icons/iconsax/email.svg"
                                    alt={t('email')}
                                    width={24}
                                    height={24}
                                    style={getButtonIconStyle()}
                                />
                            </div>
                        </button>
                    )}
                </div>

                <nav className="profile-nav-sections mt-4 lg:hidden" style={{ borderColor: `rgba(${isDarkBackground ? '255,255,255' : '0,0,0'}, 0.2)` }}>
                    <ul className="flex justify-center text-base font-semibold">
                        <li>
                                <Link
                                    href={`/${businessUrlnameInPath}/services`}
                                    className={`block py-2 px-2 transition-colors duration-200 ${activeSection === 'booking' ? 'section-active border-b-2' : ''}`}
                                    style={activeSection === 'services' ? { borderColor: themeColorText, color: themeColorText } : { color: themeColorText }}
                                >
                                    {t('services')}
                                </Link>
                        </li>
                        <li>
                            <Link
                                href={`/${businessUrlnameInPath}/products`}
                                className={`block py-2 px-2 transition-colors duration-200 ${activeSection === 'products' ? 'section-active border-b-2' : ''}`}
                                style={activeSection === 'products' ? { borderColor: themeColorText, color: themeColorText } : { color: themeColorText }}
                            >
                                {t('products')}
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={`/${businessUrlnameInPath}/promotions`}
                                className={`block py-2 px-2 transition-colors duration-200 ${activeSection === 'promotions' ? 'section-active border-b-2' : ''}`}
                                style={activeSection === 'promotions' ? { borderColor: themeColorText, color: themeColorText } : { color: themeColorText }}
                            >
                                {t('promotions')}
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={`/${businessUrlnameInPath}/rewards`}
                                className={`block py-2 px-2 transition-colors duration-200 ${activeSection === 'rewards' ? 'section-active border-b-2' : ''}`}
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
                {businessData.business_img_cover && (
                    <div className="absolute inset-0 z-0 my-8 rounded-lg">
                        <div className="relative h-full w-full rounded-lg">
                            <Image
                                src={businessData.business_img_cover}
                                alt="Cover Background"
                                fill
                                sizes="100vw"
                                className="object-cover rounded-2xl"
                                priority
                            />
                            {/* Overlay for better text readability */}
                            <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>
                        </div>
                    </div>
                )}
                
                <div className="container mx-auto px-10 relative z-10">
                    <div className="text-left transition-opacity duration-300" style={{ color: 'white', opacity: scrollOpacity }}>
                        <div className="mb-6">
                            {businessData.business_descr && <p className="font-bold text-2xl md:text-4xl lg:text-5xl max-w-2xl mb-4" style={{ textShadow: '1px 1px 4px rgba(0, 0, 0, 0.5)' }}>{businessData.business_descr}</p>}
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                {(businessSettings.show_address && businessData.business_address) && (
                                    <p className="text-lg opacity-90" style={{ textShadow: '0.5px 0.5px 3px rgba(0, 0, 0, 0.4)' }}>
                                        {businessData.business_city} / {businessData.business_address}
                                    </p>
                                )}

                                {businessSettings.show_website && websiteLinkUrl && (
                                    <Link href={websiteLinkUrl} target="_blank" rel="noopener noreferrer" className="text-lg underline opacity-90 hover:opacity-100 transition-opacity" style={{ textShadow: '0.5px 0.5px 3px rgba(0, 0, 0, 0.4)' }}>
                                        {websiteLinkUrl.replace(/^https?:\/\/(www\.)?/, '')}
                                    </Link>
                                )}
                            </div>
                        </div>



                    </div>
                </div>
            </div>
        </header>
    );
};

export default BusinessProfileHeader;
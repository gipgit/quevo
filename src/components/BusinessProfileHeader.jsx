// src/components/BusinessProfileHeader.jsx

'use client';

import React, { useCallback } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/navigation';

import { useBusinessProfile } from '@/contexts/BusinessProfileContext';
import { useTranslations } from 'next-intl';

const BusinessProfileHeader = ({ toggleContactModal, togglePaymentsModal, toggleMenuOverlay }) => {
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
        <header className="profile-header relative">
            <div className="profile-cover w-full relative bg-gray-200 h-32 sm:h-40 md:h-40 lg:h-40">
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

            <div className="container-profile-pic pic-lg relative z-10 mx-auto -translate-y-1/2 rounded-full overflow-hidden bg-gray-100"
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

            <div className="container mx-auto max-w-3xl relative px-4 mt-[-50px]">
                <div className="text-center mt-4" style={{ color: themeColorText }}>
                    <p className="text-2xl md:text-3xl font-bold">{businessData.business_name}</p>
                    {businessData.business_descr && <p className="d-none text-sm opacity-80 mt-1 max-w-lg mx-auto">{businessData.business_descr}</p>}
                    {(businessSettings.show_address && businessData.business_address) && (
                        <p className="text-sm mt-1 opacity-70">
                            {tBooking('headerLocation', { city: businessData.business_city, address: businessData.business_address })}
                        </p>
                    )}

                    {businessSettings.show_website && websiteLinkUrl && (
                        <div className="mt-1">
                            <Link href={websiteLinkUrl} target="_blank" rel="noopener noreferrer" className="text-xs underline" style={{ color: themeColorText }}>
                                {websiteLinkUrl}
                            </Link>
                        </div>
                    )}
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
                    {businessSettings.show_btn_booking && (
                        <Link
                            href={
                                businessData.business_link_booking
                                    ? `/${businessUrlnameInPath}/booking`
                                    : bookingLinkUrl
                            }
                            className={primaryButtonClassName}
                            style={primaryButtonStyle}
                        >
                            {tBooking('headerTitle')}
                        </Link>
                    )}

                    {businessSettings.show_btn_phone && businessData.business_phone && (
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

                    {businessSettings.show_btn_email && businessData.business_email && (
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

                {businessSettings.show_btn_payments && businessPaymentMethods && businessPaymentMethods.length > 0 && (
                    <div className="text-center mt-4">
                        <button onClick={togglePaymentsModal} className="hover:underline font-semibold text-sm flex items-center justify-center mx-auto" style={{ color: themeColorText }}>
                            {t('paymentsMethod')}
                        </button>
                    </div>
                )}

                {businessSettings.show_btn_review && googleReviewLinkUrl && (
                    <div className="text-center mt-1">
                        <Link href={googleReviewLinkUrl} target="_blank" rel="noopener noreferrer" className="btn-google-review" style={{ color: themeColorText }}>
                            {t('leaveReview')}
                            <Image
                                src="/icons/google.png"
                                alt="Google"
                                width={24}
                                height={24}
                                className="inline-block ml-1"
                            />
                        </Link>
                    </div>
                )}

                <nav className="profile-nav-sections mt-4" style={{ borderColor: `rgba(${isDarkBackground ? '255,255,255' : '0,0,0'}, 0.2)` }}>
                    <ul className="flex justify-center text-sm font-semibold">
                        <li>
                            <Link
                                href={`/${businessUrlnameInPath}/products`}
                                className={`block py-2 px-4 transition-colors duration-200 ${activeSection === 'products' ? 'section-active border-b-2' : ''}`}
                                style={activeSection === 'products' ? { borderColor: themeColorText, color: themeColorText } : { color: themeColorText }}
                            >
                                {t('products')}
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={`/${businessUrlnameInPath}/promotions`}
                                className={`block py-2 px-4 transition-colors duration-200 ${activeSection === 'promotions' ? 'section-active border-b-2' : ''}`}
                                style={activeSection === 'promotions' ? { borderColor: themeColorText, color: themeColorText } : { color: themeColorText }}
                            >
                                {t('promotions')}
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={`/${businessUrlnameInPath}/rewards`}
                                className={`block py-2 px-4 transition-colors duration-200 ${activeSection === 'rewards' ? 'section-active border-b-2' : ''}`}
                                style={activeSection === 'rewards' ? { borderColor: themeColorText, color: themeColorText } : { color: themeColorText }}
                            >
                                {t('rewards')}
                            </Link>
                        </li>
                        {businessSettings.show_btn_booking && (
                            <li>
                                <Link
                                    href={`/${businessUrlnameInPath}/booking`}
                                    className={`block py-2 px-4 transition-colors duration-200 ${activeSection === 'booking' ? 'section-active border-b-2' : ''}`}
                                    style={activeSection === 'booking' ? { borderColor: themeColorText, color: themeColorText } : { color: themeColorText }}
                                >
                                    {tBooking('booking')}
                                </Link>
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default BusinessProfileHeader;
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Globe2 as GlobeAltIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const MobileMenuOverlay = ({
    isOpen,
    onClose,
    businessData,
    businessSettings,
    businessUrlnameInPath,
    activeSection,
    themeColorText,
    themeColorButton,
    themeColorBackground,
    themeColorBackgroundSecondary,
    themeColorBorder,
    googleReviewLinkUrl,
    hasPhones,
    hasEmails,
    togglePaymentsModal,
    toggleContactModal,
    toggleAddressModal,
    primaryButtonStyle,
    secondaryButtonStyle,
    getButtonIconStyle
}) => {
    const t = useTranslations('Common');
    const [DOMAIN, setDOMAIN] = useState("https://quevo.vercel.app");
    const [copied, setCopied] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    
    // Set the correct domain after component mounts
    useEffect(() => {
        const isLocalhost = window.location.hostname.includes("localhost");
        setDOMAIN(isLocalhost ? "http://localhost:3000" : "https://quevo.vercel.app");
    }, []);
    
    // Public link format: DOMAIN/business_urlname
    const publicUrl = `${DOMAIN}/${businessUrlnameInPath || ""}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(publicUrl);
            setCopied(true);
            setIsAnimating(true);
            setTimeout(() => setCopied(false), 2000);
            setTimeout(() => setIsAnimating(false), 300);
        } catch (err) {
            console.error("Failed to copy: ", err);
        }
    };

    const handleOpen = () => {
        window.open(`${publicUrl}`, "_blank");
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="lg:hidden fixed inset-0 backdrop-blur-sm z-50 flex items-end" style={{ backgroundColor: `${themeColorBackgroundSecondary}CC` }}>
            <div className="rounded-t-3xl w-full max-h-[85vh] overflow-y-auto relative" style={{ backgroundColor: themeColorBackground }}>
                {/* Close Button - Absolute positioned */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-colors hover:bg-gray-200 z-10"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="pt-8">
                    {/* Profile Image with QR Code and Link */}
                    <div className="flex flex-col items-center mb-2 px-6">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 mb-4">
                            {businessData.business_img_profile ? (
                                <Image
                                    src={businessData.business_img_profile}
                                    alt=""
                                    width={64}
                                    height={64}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <div className="w-full h-full" style={{ backgroundColor: themeColorText + '20' }}></div>
                            )}
                        </div>
                        
                        {/* Business Name */}
                        <h2 className="text-lg font-semibold mb-4 text-center" style={{ color: themeColorText }}>
                            {businessData.business_name}
                        </h2>
                        
                        {/* QR Code */}
                        <div className="flex justify-center mb-4">
                            <div className="p-3 rounded-lg" style={{ backgroundColor: themeColorBackgroundSecondary || '#f9fafb' }}>
                                <QRCodeSVG
                                    value={publicUrl}
                                    size={120}
                                    bgColor={themeColorBackgroundSecondary || '#f9fafb'}
                                    fgColor={themeColorText || '#000000'}
                                    level="M"
                                />
                            </div>
                        </div>
                        
                        {/* Link Pill with ShareProfileModal styling and integrated copy button */}
                        <div className={`max-w-[100%] mx-auto px-3 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm border mb-4 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 border-gray-200 transition-all duration-300 relative overflow-hidden ${
                            isAnimating ? 'animate-pill-shine' : ''
                        }`}>
                            <GlobeAltIcon className="w-4 h-4 text-blue-600 flex-shrink-0" strokeWidth={1} />
                            <span className="text-xs truncate flex-1">{publicUrl}</span>
                            <button
                                onClick={handleCopy}
                                className={`p-1 rounded-full transition-all duration-300 flex items-center justify-center ${
                                    copied ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {copied ? (
                                    <svg className="w-4 h-4 animate-checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Phone, Email, and Address buttons as links */}
                    {(businessSettings.show_btn_phone && hasPhones) || (businessSettings.show_btn_email && hasEmails) || (businessSettings.show_address && businessData.business_address) ? (
                        <div className="px-6 mb-2">
                            <div className="flex gap-3">
                                {businessSettings.show_btn_phone && hasPhones && (
                                    <button 
                                        onClick={() => {
                                            toggleContactModal('phone');
                                            onClose();
                                        }} 
                                        className="flex-1 py-3 px-4 transition-colors duration-200 text-lg text-center flex flex-col items-center gap-2"
                                        style={{ color: themeColorText }}
                                    >
                                        <div 
                                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                            style={{ backgroundColor: themeColorButton }}
                                        >
                                            <Image
                                                src="/icons/iconsax/phone.svg"
                                                alt={t('call')}
                                                width={18}
                                                height={18}
                                                style={{ filter: 'brightness(0) invert(1)' }}
                                            />
                                        </div>
                                        <span className="font-normal text-sm">{t('call')}</span>
                                    </button>
                                )}

                                {businessSettings.show_btn_email && hasEmails && (
                                    <button 
                                        onClick={() => {
                                            toggleContactModal('email');
                                            onClose();
                                        }} 
                                        className="flex-1 py-3 px-4 transition-colors duration-200 text-lg text-center flex flex-col items-center gap-2"
                                        style={{ color: themeColorText }}
                                    >
                                        <div 
                                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                            style={{ backgroundColor: themeColorButton }}
                                        >
                                            <Image
                                                src="/icons/iconsax/email.svg"
                                                alt={t('email')}
                                                width={18}
                                                height={18}
                                                style={{ filter: 'brightness(0) invert(1)' }}
                                            />
                                        </div>
                                        <span className="font-normal text-sm">{t('email')}</span>
                                    </button>
                                )}

                                {businessSettings.show_address && businessData.business_address && (
                                    <button 
                                        onClick={() => {
                                            toggleAddressModal();
                                            onClose();
                                        }} 
                                        className="flex-1 py-3 px-4 transition-colors duration-200 text-lg text-center flex flex-col items-center gap-2"
                                        style={{ color: themeColorText }}
                                    >
                                        <div 
                                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                            style={{ backgroundColor: themeColorButton }}
                                        >
                                            <Image
                                                src="/icons/iconsax/location.svg"
                                                alt="Indirizzo"
                                                width={18}
                                                height={18}
                                                style={{ filter: 'brightness(0) invert(1)' }}
                                            />
                                        </div>
                                        <span className="font-normal text-sm">Indirizzo</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : null}

                    {/* Navigation Links - With borders to separate */}
                    <div className="space-y-0 mb-4 w-full">
                        <Link
                            href={`/${businessUrlnameInPath}/services`}
                            onClick={onClose}
                            className={`block py-2 px-4 transition-colors duration-200 text-lg border-b ${activeSection === 'services' ? 'font-semibold' : 'font-normal'}`}
                            style={activeSection === 'services' ? { backgroundColor: themeColorButton + '20', color: themeColorText, borderColor: themeColorBorder || '#e5e7eb' } : { color: themeColorText, borderColor: themeColorBorder || '#e5e7eb' }}
                        >
                            {t('services')}
                        </Link>
                        <Link
                            href={`/${businessUrlnameInPath}/promotions`}
                            onClick={onClose}
                            className={`block py-2 px-4 transition-colors duration-200 text-lg border-b ${activeSection === 'promotions' ? 'font-semibold' : 'font-normal'}`}
                            style={activeSection === 'promotions' ? { backgroundColor: themeColorButton + '20', color: themeColorText, borderColor: themeColorBorder || '#e5e7eb' } : { color: themeColorText, borderColor: themeColorBorder || '#e5e7eb' }}
                        >
                            {t('promotions')}
                        </Link>
                        <Link
                            href={`/${businessUrlnameInPath}/rewards`}
                            onClick={onClose}
                            className={`block py-2 px-4 transition-colors duration-200 text-lg border-b ${activeSection === 'rewards' ? 'font-semibold' : 'font-normal'}`}
                            style={activeSection === 'rewards' ? { backgroundColor: themeColorButton + '20', color: themeColorText, borderColor: themeColorBorder || '#e5e7eb' } : { color: themeColorText, borderColor: themeColorBorder || '#e5e7eb' }}
                        >
                            {t('rewards')}
                        </Link>
                        {businessSettings.show_btn_payments && (
                            <button 
                                onClick={() => {
                                    togglePaymentsModal();
                                    onClose();
                                }} 
                                className="block py-3 px-4 transition-colors duration-200 text-lg w-full text-left"
                                style={{ color: themeColorText }}
                            >
                                Pagamenti
                            </button>
                        )}
                    </div>

                    {/* Google Review Button */}
                    {businessSettings.show_btn_review && googleReviewLinkUrl && (
                        <div className="mb-3 px-6">
                            <Link 
                                href={googleReviewLinkUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-colors duration-200 w-full"
                                style={secondaryButtonStyle}
                                onClick={onClose}
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


                 </div>
             </div>
         </div>
     );
 };

export default MobileMenuOverlay;

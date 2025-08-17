'use client';

import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

const MobileMenuOverlay = ({
    isOpen,
    onClose,
    businessData,
    businessSettings,
    businessUrlnameInPath,
    activeSection,
    themeColorText,
    themeColorButton,
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

    if (!isOpen) {
        return null;
    }

    return (
        <div className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end">
            <div className="bg-white rounded-t-3xl w-full max-h-[85vh] overflow-y-auto relative">
                {/* Close Button - Absolute positioned */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-colors hover:bg-gray-200 z-10"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="p-6 pt-16">
                    {/* Profile Image Only */}
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
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
                    </div>

                    {/* Navigation Links - With borders to separate */}
                    <div className="space-y-0 mb-4">
                        <Link
                            href={`/${businessUrlnameInPath}/services`}
                            onClick={onClose}
                            className={`block py-3 px-4 transition-colors duration-200 text-lg border-b border-gray-200 ${activeSection === 'services' ? 'font-semibold' : 'font-normal'}`}
                            style={activeSection === 'services' ? { backgroundColor: themeColorButton + '20', color: themeColorText } : { color: themeColorText }}
                        >
                            {t('services')}
                        </Link>
                        <Link
                            href={`/${businessUrlnameInPath}/products`}
                            onClick={onClose}
                            className={`block py-3 px-4 transition-colors duration-200 text-lg border-b border-gray-200 ${activeSection === 'products' ? 'font-semibold' : 'font-normal'}`}
                            style={activeSection === 'products' ? { backgroundColor: themeColorButton + '20', color: themeColorText } : { color: themeColorText }}
                        >
                            {t('products')}
                        </Link>
                        <Link
                            href={`/${businessUrlnameInPath}/promotions`}
                            onClick={onClose}
                            className={`block py-3 px-4 transition-colors duration-200 text-lg border-b border-gray-200 ${activeSection === 'promotions' ? 'font-semibold' : 'font-normal'}`}
                            style={activeSection === 'promotions' ? { backgroundColor: themeColorButton + '20', color: themeColorText } : { color: themeColorText }}
                        >
                            {t('promotions')}
                        </Link>
                        <Link
                            href={`/${businessUrlnameInPath}/rewards`}
                            onClick={onClose}
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

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        {businessSettings.show_btn_payments && (
                            <button 
                                onClick={() => {
                                    togglePaymentsModal();
                                    onClose();
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
                                            onClose();
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
                                            onClose();
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
                                            onClose();
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

                     {/* Page URL with Copy Button - Moved to bottom */}
                     <div className="mt-6 pt-4 border-t border-gray-200">
                         <div className="flex items-center justify-between bg-gray-50 rounded-full p-2 border border-gray-200">
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
                                 className="ml-2 p-1 rounded-full bg-white hover:bg-gray-100 transition-colors flex-shrink-0"
                             >
                                 <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 2z" />
                                 </svg>
                             </button>
                         </div>
                     </div>
                 </div>
             </div>
         </div>
     );
 };

export default MobileMenuOverlay;

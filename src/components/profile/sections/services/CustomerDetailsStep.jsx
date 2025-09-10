"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function CustomerDetailsStep({
    selectedService,
    onConfirm,
    onBack,
    themeColorText,
    themeColorBackgroundCard,
    themeColorBackgroundSecondary,
    themeColorButton,
    themeColorBorder
}) {
    const t = useTranslations('ServiceRequest');
    const tCommon = useTranslations('Common');

    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerNotes, setCustomerNotes] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState(null);
    
    // Consent fields
    const [newsletterConsent, setNewsletterConsent] = useState(false);
    const [pdpConsent, setPdpConsent] = useState(false);
    
    const [submissionError, setSubmissionError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Effect to check authentication and fetch user data
    useEffect(() => {
        const checkAuthAndFetchUserData = async () => {
            try {
                // Check if user is authenticated by making a request to a protected endpoint
                const response = await fetch('/api/auth/check-session');
                if (response.ok) {
                    const sessionData = await response.json();
                    if (sessionData.user?.id) {
                        setIsLoggedIn(true);
                        setUserRole(sessionData.user.role);
                        
                        // Fetch user data based on role
                        if (sessionData.user.role === 'customer') {
                            const userResponse = await fetch(`/api/user/customer/${sessionData.user.id}`);
                            if (userResponse.ok) {
                                const userData = await userResponse.json();
                                setCustomerName(`${userData.name_first || ''} ${userData.name_last || ''}`.trim());
                                setCustomerEmail(userData.email || '');
                                setCustomerPhone(userData.phone || '');
                            }
                        } else if (sessionData.user.role === 'manager') {
                            const userResponse = await fetch(`/api/user/manager/${sessionData.user.id}`);
                            if (userResponse.ok) {
                                const userData = await userResponse.json();
                                setCustomerName(`${userData.name_first || ''} ${userData.name_last || ''}`.trim());
                                setCustomerEmail(userData.email || '');
                                setCustomerPhone(userData.tel || '');
                            }
                        }
                    } else {
                        setIsLoggedIn(false);
                        setUserRole(null);
                    }
                } else {
                    setIsLoggedIn(false);
                    setUserRole(null);
                }
            } catch (error) {
                console.error('Error checking authentication:', error);
                setIsLoggedIn(false);
                setUserRole(null);
            }
        };

        checkAuthAndFetchUserData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
            setSubmissionError(t('pleaseFillAllRequiredFields'));
            return;
        }

        // Validate phone number requirement
        if (selectedService?.require_phone && !customerPhone.trim()) {
            setSubmissionError(t('phoneNumberRequired'));
            return;
        }

        // Validate consent requirements
        if (selectedService?.require_consent_pdp && !pdpConsent) {
            setSubmissionError(t('pdpConsentRequired'));
            return;
        }

        // Newsletter consent is optional - no validation required

        setIsSubmitting(true);
        setSubmissionError(null);

        try {
            const customerDetails = {
                customerName: customerName.trim(),
                customerEmail: customerEmail.trim(),
                customerPhone: customerPhone.trim(),
                customerNotes: customerNotes.trim(),
                newsletterConsent,
                pdpConsent,
            };

            onConfirm(customerDetails);
        } catch (error) {
            console.error('Error submitting customer details:', error);
            setSubmissionError(error.message || t('errorSubmittingDetails'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 px-4 py-3 md:px-6 md:py-4 lg:p-6">
                <div className="mb-2 md:mb-4 lg:mb-6 flex items-center justify-between">
                    <h2 className="text-base md:text-lg lg:text-2xl font-bold mb-1 md:mb-2 lg:mb-2" style={{ color: themeColorText }}>
                        {t('yourDetails')}
                    </h2>
                    
                    {/* Authentication Status - Compact Pill */}
                    {isLoggedIn && (
                        <div className="flex items-center px-3 py-1 rounded-full">
                            <svg className="w-4 h-4 text-green-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-green-600 text-sm font-medium">
                                {userRole === 'manager' 
                                    ? t('loggedInAsManager') || 'Logged in as Business Manager'
                                    : t('loggedInAsCustomer') || 'Logged in as Customer'
                                }
                            </span>
                        </div>
                    )}
                </div>

                <form id="customerDetailsForm" onSubmit={handleSubmit} className="space-y-4">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="customerName" className="block text-sm font-medium mb-1">
                            {tCommon('name')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="customerName"
                            className="w-full rounded-md border shadow-sm p-2"
                            style={{ backgroundColor: themeColorBackgroundCard, color: themeColorText, borderColor: themeColorBorder}}
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="customerEmail" className="block text-sm font-medium mb-1">
                            {tCommon('email')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            id="customerEmail"
                            className="w-full rounded-md border shadow-sm p-2"
                            style={{ backgroundColor: themeColorBackgroundCard, color: themeColorText, borderColor: themeColorBorder}}
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="customerPhone" className="block text-sm font-medium mb-1">
                            {tCommon('phone')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            id="customerPhone"
                            className="w-full rounded-md border shadow-sm p-2"
                            style={{ backgroundColor: themeColorBackgroundCard, color: themeColorText, borderColor: themeColorBorder}}
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="customerNotes" className="block text-sm font-medium mb-1">
                        {t('additionalNotes')}
                    </label>
                    <textarea
                        id="customerNotes"
                        rows="3"
                        className="w-full rounded-md border shadow-sm p-2"
                        style={{ backgroundColor: themeColorBackgroundCard, color: themeColorText, borderColor: themeColorBorder}}
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        placeholder={t('additionalNotesPlaceholder')}
                    />
                </div>

                {/* --- Consent Section --- */}
                {(selectedService?.require_consent_pdp || selectedService?.require_consent_newsletter) && (
                    <div className="border-t pt-4 mt-4" style={{ borderColor: themeColorBorder }}>
                        <h3 className="text-lg font-semibold mb-3" style={{ color: themeColorText }}>
                            {t('consentTitle')}
                        </h3>
                        
                        {selectedService?.require_consent_pdp && (
                            <div className="mb-3">
                                <label className="flex items-start">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-5 w-5 rounded mt-1 mr-2"
                                        checked={pdpConsent}
                                        onChange={(e) => setPdpConsent(e.target.checked)}
                                        required={selectedService?.require_consent_pdp}
                                    />
                                    <div className="text-sm">
                                        <span className="inline-block ml-1 md:ml-2 px-1.5 md:px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                                            {tCommon('required')}
                                        </span>
                                        <span className="ml-2">{t('pdpConsentText')}</span>
                                    </div>
                                </label>
                            </div>
                        )}
                        
                        {selectedService?.require_consent_newsletter && (
                            <div className="mb-3">
                                <label className="flex items-start">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-5 w-5 rounded mt-1 mr-2"
                                        checked={newsletterConsent}
                                        onChange={(e) => setNewsletterConsent(e.target.checked)}
                                    />
                                    <div className="text-sm">
                                        <span className="inline-block ml-1 md:ml-2 px-1.5 md:px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                                            {tCommon('optional')}
                                        </span>
                                        <span className="ml-2">
                                            {selectedService?.require_consent_newsletter_text || t('newsletterConsentText')}
                                        </span>
                                    </div>
                                </label>
                            </div>
                        )}
                    </div>
                )}
                {/* --- End Consent Section --- */}

                {submissionError && (
                    <div className="bg-red-100 text-red-800 p-3 text-sm rounded-md text-center">
                        {submissionError}
                    </div>
                )}
                </form>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 px-4 py-3 md:px-6 md:py-4 lg:p-6 border-t" style={{ borderColor: themeColorBorder, backgroundColor: themeColorBackgroundSecondary }}>
                <div className="flex justify-between items-center">
                    <button
                        type="button"
                        onClick={onBack}
                        className="px-4 py-2 rounded-lg border text-sm flex items-center"
                        style={{ borderColor: themeColorBorder, color: themeColorText }}
                    >
                        <svg className="w-4 h-4 lg:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="hidden lg:inline">{tCommon('back')}</span>
                    </button>
                    <button
                        type="submit"
                        form="customerDetailsForm"
                        className="px-6 py-2 rounded-lg font-medium"
                        style={{ backgroundColor: themeColorButton, color: 'white' }}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? tCommon('submitting') + '...' : t('confirmServiceRequestButton')}
                    </button>
                </div>
            </div>
        </div>
    );
}

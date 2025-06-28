// src/components/profile/sections/booking/ServiceSelection.jsx

"use client"; // This is a Client Component

import React, { useEffect } from 'react'; // Import useEffect for logging
import { useTranslations } from 'next-intl';

export default function ServiceSelection({
    // categories, // No longer directly used for iteration here, but can be kept for other purposes if needed
    // services, // Not used
    servicesByCategory, // Services pre-filtered by category (array of { category_name, services: [] })
    uncategorizedServices, // Services without a category
    onServiceSelect,
    selectedService,
    themeColorText,
    themeColorButton,
    locale // Passed for currency formatting
}) {
    const t = useTranslations('Booking');

    // Add console logs to verify received props
    useEffect(() => {
        console.log("[ServiceSelection] servicesByCategory received:", servicesByCategory);
        console.log("[ServiceSelection] uncategorizedServices received:", uncategorizedServices);
        // console.log("[ServiceSelection] categories received:", categories); // If you keep categories prop
    }, [servicesByCategory, uncategorizedServices]); // Add categories if you keep it in props

    // Determine background color for the card based on themeColorText for contrast
    const cardBackgroundColor = themeColorText === '#FFFFFF' ? '#F0F0F0' : '#FFFFFF';
    const itemBackgroundColor = themeColorText === '#FFFFFF' ? '#E0E0E0' : '#F8F8F8';

    return (
        <div className="" style={{ color: themeColorText}}>
            <p className="text-xl font-bold mb-4">{t('chooseService')}</p>

            {/* Render categorized services */}
            {servicesByCategory && Array.isArray(servicesByCategory) && servicesByCategory.length > 0 && (
                servicesByCategory.sort((a, b) => a.category_name.localeCompare(b.category_name)).map(categoryGroup => {
                    // categoryGroup is now directly { category_name: '...', services: [...] }
                    if (categoryGroup.services.length === 0) return null; // Only show category if it has services

                    return (
                        <div key={categoryGroup.category_name} className="mb-6"> {/* Use category_name as key, assuming it's unique enough for categories */}
                            <h3 className="text-xl font-semibold mb-3 border-b pb-2" style={{ borderColor: themeColorText + '40' }}>{categoryGroup.category_name}</h3>
                            {categoryGroup.services.map(service => (
                                <div
                                    key={service.service_id}
                                    className={`flex justify-between items-center p-3 mb-2 rounded-md cursor-pointer transition-colors ${
                                        selectedService?.service_id === service.service_id ? 'ring-2 ring-offset-2' : ''
                                    }`}
                                    style={{
                                        backgroundColor: selectedService?.service_id === service.service_id ? themeColorButton + '20' : itemBackgroundColor, // Lighter tint for selection/default
                                        borderColor: selectedService?.service_id === service.service_id ? themeColorButton : 'transparent',
                                        color: themeColorText,
                                        boxShadow: selectedService?.service_id === service.service_id ? `0 0 0 2px ${themeColorButton}` : 'none'
                                    }}
                                    onClick={() => onServiceSelect(service)}
                                >
                                    <div>
                                        <p className="font-medium">{service.service_name}</p>
                                        {service.description && (
                                            <p className="text-sm opacity-80">{service.description}</p>
                                        )}
                                        <p className="text-xs opacity-70 mt-1">{t('duration')}: {service.duration_minutes} {t('minutes', { minuti: service.duration_minutes })}</p>
                                    </div>
                                    <span className="font-bold text-md md:text-lg">
                                        {service.price.toLocaleString(locale, { style: 'currency', currency: 'EUR' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    );
                })
            )}
            {!servicesByCategory || servicesByCategory.length === 0 && uncategorizedServices.length === 0 && (
                 <p className="text-center text-gray-500">{t('noServicesAvailable')}</p>
            )}

            {/* Render uncategorized services if any */}
            {uncategorizedServices && uncategorizedServices.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-3 border-b pb-2" style={{ borderColor: themeColorText + '40' }}>{t('uncategorizedServices')}</h3>
                    {uncategorizedServices.map(service => (
                        <div
                            key={service.service_id}
                            className={`flex justify-between items-center p-3 mb-2 rounded-md cursor-pointer transition-colors ${
                                selectedService?.service_id === service.service_id ? 'ring-2 ring-offset-2' : ''
                            }`}
                            style={{
                                backgroundColor: selectedService?.service_id === service.service_id ? themeColorButton + '20' : itemBackgroundColor,
                                borderColor: selectedService?.service_id === service.service_id ? themeColorButton : 'transparent',
                                color: themeColorText,
                                boxShadow: selectedService?.service_id === service.service_id ? `0 0 0 2px ${themeColorButton}` : 'none'
                            }}
                            onClick={() => onServiceSelect(service)}
                        >
                            <div>
                                <p className="font-medium">{service.service_name}</p>
                                {service.description && (
                                    <p className="text-sm opacity-80">{service.description}</p>
                                )}
                                <p className="text-xs opacity-70 mt-1">{t('duration')}: {service.duration_minutes} {t('minutes')}</p>
                            </div>
                            <span className="font-bold text-lg">
                                {service.price.toLocaleString(locale, { style: 'currency', currency: 'EUR' })}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
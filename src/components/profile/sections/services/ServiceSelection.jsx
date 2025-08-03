// src/components/profile/sections/booking/ServiceSelection.jsx

"use client"; // This is a Client Component

import React, { useEffect } from 'react'; // Import useEffect for logging
import { useTranslations } from 'next-intl';

export default function ServiceSelection({
    servicesByCategory, // Services pre-filtered by category (array of { category_name, services: [] })
    uncategorizedServices, // Services without a category
    onServiceSelect,
    selectedService,
    themeColorText,
    themeColorButton,
    themeColorBackgroundCard,
    themeColorBorder,
    locale // Passed for currency formatting
}) {
    const t = useTranslations('ServiceRequest');


    return (
        <div className="x" style={{ color: themeColorText}}>
            <p className="text-lg lg:text-xl mb-4">{t('chooseService')}</p>

            {/* Render categorized services */}
            {servicesByCategory && Array.isArray(servicesByCategory) && servicesByCategory.length > 0 && (
                servicesByCategory.sort((a, b) => a.category_name.localeCompare(b.category_name)).map(categoryGroup => {
                    if (categoryGroup.services.length === 0) return null; // Only show category if it has services

                    return (
                        <div key={categoryGroup.category_name} className="mb-6">
                            <p className="text-sm font-medium mb-3 border-b pb-1" style={{ borderColor: themeColorText + '50' }}>{categoryGroup.category_name}</p>
                            {categoryGroup.services.map(service => (
                                <div
                                    key={service.service_id}
                                    className={`flex flex-col md:flex-row justify-between md:items-center gap-3 md:gap-5 p-4 md:p-5 mb-2 rounded-2xl cursor-pointer transition-colors border ${
                                        selectedService?.service_id === service.service_id ? 'ring-2 ring-offset-2' : ''
                                    }`}
                                    style={{
                                        backgroundColor: selectedService?.service_id === service.service_id ? themeColorButton + '20' : themeColorBackgroundCard, 
                                        borderColor: selectedService?.service_id === service.service_id ? themeColorButton : themeColorBorder,
                                        color: themeColorText,
                                        boxShadow: selectedService?.service_id === service.service_id ? `0 1px 5px ${themeColorButton}` : `0 1px 5px rgba(0,0,0,.075)`
                                    }}
                                    onClick={() => onServiceSelect(service)}
                                >
                                    <div>
                                        <p className="font-bold text-lg md:text-xl">{service.service_name}</p>
                                        {service.description && (
                                            <p className="mt-1 text-xs md:text-sm opacity-70">{service.description}</p>
                                        )}
                                        {service.date_selection && (
                                            <>
                                            <p className="text-xs opacity-70 mt-1">
                                                {t('duration')}: {service.duration_minutes} {t('minutes', { count: service.duration_minutes })}
                                            </p>
                                            <p className="text-sm opacity-80">{t('bookable')}</p>
                                            </>
                                        )}
                                    </div>
                                    <span className="font-medium text-md md:text-lg">
                                        {service.price_base.toLocaleString(locale, { style: 'currency', currency: 'EUR' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    );
                })
            )}
            {!servicesByCategory || servicesByCategory.length === 0 && uncategorizedServices.length === 0 && (
                   <p className="p-3 rounded-lg bg-white/50 text-sm opacity-50">{t('noServicesAvailable')}</p>
            )}

            {/* Render uncategorized services if any */}
            {uncategorizedServices && uncategorizedServices.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-sm font-semibold mb-3 border-b pb-1" style={{ borderColor: themeColorText + '40' }}>{t('uncategorizedServices')}</h3>
                    {uncategorizedServices.map(service => (
                        <div
                            key={service.service_id}
                            className={`flex justify-between items-center p-3 mb-2 rounded-md cursor-pointer transition-colors ${
                                selectedService?.service_id === service.service_id ? 'ring-2 ring-offset-2' : ''
                            }`}
                            style={{
                                backgroundColor: selectedService?.service_id === service.service_id ? themeColorButton + '20' : themeColorBackgroundCard,
                                borderColor: selectedService?.service_id === service.service_id ? themeColorButton : 'transparent',
                                color: themeColorText,
                                boxShadow: selectedService?.service_id === service.service_id ? `0 0 0 2px ${themeColorButton}` : 'none'
                            }}
                            onClick={() => onServiceSelect(service)}
                        >
                            <div>
                                <p className="font-medium md:text-lg">{service.service_name}</p>
                                {service.description && (
                                    <p className="mt-1 text-xs md:text-sm opacity-70">{service.description}</p>
                                )}
                                {/* Updated pluralization for minutes */}
                                <p className="text-xs opacity-70 mt-1">
                                    {t('duration')}: {service.duration_minutes} {t('minutes', { count: service.duration_minutes })}
                                </p>
                            </div>
                            <span className="font-bold text-lg">
                                {service.price_base.toLocaleString(locale, { style: 'currency', currency: 'EUR' })}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

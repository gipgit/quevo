// src/components/profile/sections/booking/ServiceSelection.jsx

"use client"; // This is a Client Component

import React, { useEffect } from 'react'; // Import useEffect for logging
import { useTranslations } from 'next-intl';
import EmptyState from '@/components/ui/EmptyState';

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


    // Check if there are any services available
    const hasServices = (servicesByCategory && Array.isArray(servicesByCategory) && servicesByCategory.some(category => category.services.length > 0)) || 
                       (uncategorizedServices && uncategorizedServices.length > 0);

    return (
        <div className="x" style={{ color: themeColorText}}>
            {hasServices && (
                <p className="text-lg lg:text-2xl mb-2 lg:mb-2">{t('chooseService')}</p>
            )}

            {/* Render categorized services */}
            {servicesByCategory && Array.isArray(servicesByCategory) && servicesByCategory.length > 0 && (
                servicesByCategory.sort((a, b) => a.category_name.localeCompare(b.category_name)).map(categoryGroup => {
                    if (categoryGroup.services.length === 0) return null; // Only show category if it has services

                    return (
                        <div key={categoryGroup.category_name} className="mb-6">
                            <p className="text-xs lg:text-sm opacity-60 font-medium mb-3 border-b pb-0 lg:pb-1" style={{ borderColor: themeColorText + '50' }}>{categoryGroup.category_name}</p>
                            {categoryGroup.services.map(service => (
                                <div
                                    key={service.service_id}
                                    className={`flex flex-col lg:flex-row justify-between lg:items-start gap-3 md:gap-5 p-4 md:p-5 mb-2 rounded-2xl cursor-pointer transition-colors border ${
                                        selectedService?.service_id === service.service_id ? 'ring-2 ring-offset-2' : ''
                                    }`}
                                    style={{
                                        backgroundColor: selectedService?.service_id === service.service_id ? themeColorButton + '20' : themeColorBackgroundCard, 
                                        borderColor: selectedService?.service_id === service.service_id ? themeColorButton : themeColorBorder,
                                        color: themeColorText,
                                        boxShadow: selectedService?.service_id === service.service_id ? `0 1px 2px ${themeColorButton}` : `0 1px 2px rgba(0,0,0,.075)`
                                    }}
                                    onClick={() => onServiceSelect(service)}
                                >
                                    <div className="flex-1">
                                        <p className="font-bold text-base md:text-xl leading-tight">{service.service_name}</p>
                                        {service.description && (
                                            <p className="mt-1 text-xs md:text-sm opacity-70">{service.description}</p>
                                        )}
                                    </div>
                                    <div className="flex flex-row lg:flex-col lg:items-end gap-3 lg:gap-1">
                                        <span className="font-medium text-md md:text-lg">
                                            {service.price_base.toLocaleString(locale, { style: 'currency', currency: 'EUR' })}
                                        </span>
                                        {service.date_selection && (
                                            <div className="flex flex-row items-center gap-3">
                                                <p className="text-xs opacity-70">
                                                    {t('duration')}: {service.duration_minutes} {t('minutes', { count: service.duration_minutes })}
                                                </p>
                                                <p className="text-xs opacity-80 leading-none">{t('bookable')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                })
            )}
            {!servicesByCategory || servicesByCategory.length === 0 && uncategorizedServices.length === 0 && (
                <EmptyState 
                    primaryTitle={t('noServicesAvailable')}
                    textColor="text-gray-600"
                    backgroundColor="bg-gray-50"
                    borderColor="border-gray-200"
                />
            )}

            {/* Render uncategorized services if any */}
            {uncategorizedServices && uncategorizedServices.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-sm font-semibold mb-3 border-b pb-1" style={{ borderColor: themeColorText + '40' }}>{t('uncategorizedServices')}</h3>
                    {uncategorizedServices.map(service => (
                        <div
                            key={service.service_id}
                            className={`flex flex-col lg:flex-row justify-between lg:items-start gap-3 p-3 mb-2 rounded-md cursor-pointer transition-colors ${
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
                            <div className="flex-1">
                                <p className="font-medium md:text-lg">{service.service_name}</p>
                                {service.description && (
                                    <p className="mt-1 text-xs md:text-sm opacity-70">{service.description}</p>
                                )}
                            </div>
                            <div className="flex flex-row lg:flex-col lg:items-end gap-3">
                                <span className="font-bold text-lg">
                                    {service.price_base.toLocaleString(locale, { style: 'currency', currency: 'EUR' })}
                                </span>
                                {service.date_selection && (
                                    <div className="flex flex-row items-center gap-3">
                                        <p className="text-xs opacity-70">
                                            {t('duration')}: {service.duration_minutes} {t('minutes', { count: service.duration_minutes })}
                                        </p>
                                        <p className="text-xs opacity-80 leading-none">{t('bookable')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

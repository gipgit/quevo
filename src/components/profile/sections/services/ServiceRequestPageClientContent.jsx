// src/components/profile/sections/services/ServiceRequestPageClientContent.jsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ServiceSelection from './ServiceSelection';
import ServiceRequestModal from './ServiceRequestModal';
import { useTranslations } from 'next-intl';
import { useBusinessProfile } from '@/contexts/BusinessProfileContext';

export default function ServiceRequestPageClientContent({
    business,
    services: rawServices,
    categories: rawCategories
}) {
    const { locale, themeColorText, themeColorButton, themeColorBackgroundCard, themeColorBorder, themeColorBackground  } = useBusinessProfile();
    const t = useTranslations('ServiceRequest');

    const [selectedService, setSelectedService] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { servicesByCategory, uncategorizedServices } = useMemo(() => {
        const byCategory = new Map();
        const uncategorized = [];

        const categoryMap = new Map(rawCategories?.map(cat => [cat.category_id, cat.category_name]) || []);

        rawServices?.forEach(service => {
            if (service.category_id !== null && categoryMap.has(service.category_id)) {
                const categoryName = categoryMap.get(service.category_id);
                if (!byCategory.has(categoryName)) {
                    byCategory.set(categoryName, []);
                }
                byCategory.get(categoryName).push(service);
            } else {
                uncategorized.push(service);
            }
        });

        const categorizedArray = Array.from(byCategory.entries()).map(([name, services]) => ({
            category_name: name,
            services: services,
        }));

        return { servicesByCategory: categorizedArray, uncategorizedServices: uncategorized };
    }, [rawServices, rawCategories]);

    const handleOpenServiceModal = useCallback((service) => {
        console.log("Parent handleOpenServiceModal called with service:", service);
        setSelectedService(service);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        console.log("Parent handleCloseModal called");
        setIsModalOpen(false);
        setSelectedService(null);
    }, []);

    return (
        <div className="container mx-auto min-h-[80vh] py-4 px-4 lg:px-0 lg:py-0">
            {/* Service Selection */}
            <ServiceSelection
                servicesByCategory={servicesByCategory}
                uncategorizedServices={uncategorizedServices}
                onOpenServiceModal={handleOpenServiceModal}
                themeColorText={themeColorText}
                themeColorBackgroundCard={themeColorBackgroundCard}
                themeColorButton={themeColorButton} 
                themeColorBorder={themeColorBorder} 
                businessPublicUuid={business.business_public_uuid}
                locale={locale}
            />

            {/* Service Request Modal */}
            <ServiceRequestModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                selectedService={selectedService}
                business={business}
                themeColorText={themeColorText}
                themeColorBackgroundCard={themeColorBackgroundCard}
                themeColorButton={themeColorButton}
                themeColorBorder={themeColorBorder}
                themeColorBackground={themeColorBackground}
                locale={locale}
            />
        </div>
    );
}

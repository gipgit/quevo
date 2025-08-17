// src/components/profile/sections/booking/ServiceSelection.jsx

"use client"; // This is a Client Component

import React, { useEffect, useState, useMemo } from 'react'; // Import useEffect for logging

// Add CSS animation styles
const animationStyles = `
  @keyframes fadeInSlideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in-slide-up {
    opacity: 0;
    animation: fadeInSlideUp 0.6s ease-out forwards;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = animationStyles;
  document.head.appendChild(styleSheet);
}
import { useTranslations } from 'next-intl';
import EmptyState from '@/components/ui/EmptyState';
import RichTextDisplay from '@/components/ui/RichTextDisplay';
import Image from 'next/image';

export default function ServiceSelection({
    servicesByCategory, // Services pre-filtered by category (array of { category_name, services: [] })
    uncategorizedServices, // Services without a category
    onServiceSelect, // Keep for backward compatibility
    onOpenServiceModal, // New prop for opening modal
    selectedService,
    themeColorText,
    themeColorButton,
    themeColorBackgroundCard,
    themeColorBorder,
    businessPublicUuid, // Business public UUID for image paths
    locale // Passed for currency formatting
}) {
    const t = useTranslations('ServiceRequest');

    // Category filter state
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Get all unique categories for filter pills
    const allCategories = useMemo(() => {
        const categories = new Set();
        categories.add('all'); // Add "all" option
        
        if (servicesByCategory && Array.isArray(servicesByCategory)) {
            servicesByCategory.forEach(category => {
                if (category.services.length > 0) {
                    categories.add(category.category_name);
                }
            });
        }
        
        return Array.from(categories);
    }, [servicesByCategory]);

    // Filter services based on selected category
    const filteredServices = useMemo(() => {
        if (selectedCategory === 'all') {
            const allServices = [];
            if (servicesByCategory && Array.isArray(servicesByCategory)) {
                servicesByCategory.forEach(category => {
                    allServices.push(...category.services);
                });
            }
            if (uncategorizedServices && uncategorizedServices.length > 0) {
                allServices.push(...uncategorizedServices);
            }
            return allServices;
        } else {
            const categoryServices = servicesByCategory?.find(cat => cat.category_name === selectedCategory)?.services || [];
            return categoryServices;
        }
    }, [selectedCategory, servicesByCategory, uncategorizedServices]);

    // Service Image Component with Fallback
    const ServiceImage = ({ serviceId, serviceName }) => {
        const [imageError, setImageError] = useState(false);
        const imagePath = `/uploads/business/${businessPublicUuid}/services/${serviceId}.webp`;
        
        console.log('Service Image Path:', {
            serviceId,
            serviceName,
            businessPublicUuid,
            imagePath,
            imageError
        });

        if (imageError) {
            // Fallback to placeholder
            return (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: themeColorText + '10' }}>
                   
                </div>
            );
        }

        return (
            <Image
                src={imagePath}
                alt={serviceName}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
                priority={false}
            />
        );
    };

    // Check if there are any services available
    const hasServices = (servicesByCategory && Array.isArray(servicesByCategory) && servicesByCategory.some(category => category.services.length > 0)) || 
                       (uncategorizedServices && uncategorizedServices.length > 0);

    return (
        <div className="space-y-6" style={{ color: themeColorText}}>
            {/* Category Filter Pills */}
            {hasServices && allCategories.length > 1 && (
                <div className="flex gap-2 overflow-x-auto lg:justify-center lg:overflow-x-visible lg:flex-wrap pb-2 lg:pb-0">
                    {allCategories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex-shrink-0 lg:flex-shrink ${
                                selectedCategory === category 
                                    ? 'shadow-lg' 
                                    : 'hover:shadow-md'
                            }`}
                            style={{
                                backgroundColor: 'transparent',
                                color: selectedCategory === category ? themeColorButton : themeColorText,
                                border: `1px solid ${selectedCategory === category ? themeColorButton : themeColorText}`,
                            }}
                        >
                            {category === 'all' ? t('allServices') : category}
                        </button>
                    ))}
                </div>
            )}

            {/* Services Grid */}
            {hasServices && filteredServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {filteredServices.map((service, index) => (
                        <div
                            key={service.service_id}
                            className={`w-full min-h-[200px] lg:min-h-[240px] rounded-2xl cursor-pointer transition-all duration-200 hover:scale-105 animate-fade-in-slide-up ${
                                selectedService?.service_id === service.service_id ? 'ring-2 ring-offset-2' : ''
                            }`}
                            style={{
                                backgroundColor: selectedService?.service_id === service.service_id ? themeColorButton + '20' : themeColorBackgroundCard, 
                                borderColor: selectedService?.service_id === service.service_id ? themeColorButton : themeColorBorder,
                                boxShadow: selectedService?.service_id === service.service_id 
                                    ? `0 4px 12px ${themeColorButton}40` 
                                    : '0 2px 8px rgba(0,0,0,0.1)',
                                animationDelay: `${index * 100}ms`,
                                animationFillMode: 'both'
                            }}
                                                            onClick={() => onOpenServiceModal ? onOpenServiceModal(service) : onServiceSelect(service)}
                        >
                            {/* Service Image with Overlay */}
                            <div className="w-full h-full min-h-[200px] lg:min-h-[240px] rounded-2xl overflow-hidden relative">
                                <ServiceImage serviceId={service.service_id} serviceName={service.service_name} />
                                {/* Dark gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                                {/* Service content in overlay */}
                                <div className="absolute inset-0 p-4 lg:p-6 flex flex-col justify-end">
                                    {/* Service details */}
                                    <div className="space-y-1 lg:space-y-2">
                                        {/* Service title */}
                                        <p className="text-white text-lg lg:text-xl font-bold leading-tight" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                                            {service.service_name}
                                        </p>
                                        
                                        {/* Price, Pills and Button row */}
                                        <div className="flex flex-row items-center justify-between">
                                            <div className="flex flex-row items-center gap-3">
                                                {/* Price */}
                                                <p className="text-white text-sm lg:text-lg font-semibold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                                                    {service.price_base.toLocaleString(locale, { style: 'currency', currency: 'EUR' })}
                                                </p>
                                                
                                                {/* Service Pills */}
                                                <div className="flex flex-row items-center gap-2">
                                                    {/* Bookable Pill */}
                                                    {service.date_selection && (
                                                        <span className="text-xs text-white/80" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                                                            {t('bookable')}
                                                        </span>
                                                    )}
                                                    
                                                    {/* Quotation Pill */}
                                                    {service.quotation_available && (
                                                        <span className="text-xs text-white/80" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                                                            {t('quotationAvailable')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Book button */}
                                            <button className='bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 lg:px-4 lg:py-2 text-xs lg:text-sm rounded-lg font-medium hover:bg-white/30 transition-colors' style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                                                {t('book')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyState 
                    primaryTitle={t('noServicesAvailable')}
                    textColor="text-gray-600"
                    backgroundColor="bg-gray-50"
                    borderColor="border-gray-200"
                />
            )}
        </div>
    );
}

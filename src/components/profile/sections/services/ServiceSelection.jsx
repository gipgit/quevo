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
import EmptyStateProfile from '@/components/ui/EmptyStateProfile';
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
    themeColorBackgroundSecondary,
    themeColorBorder,
    businessPublicUuid, // Business public UUID for image paths
    locale, // Passed for currency formatting
    isLoading = false // Loading state from parent
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
    const ServiceImage = ({ serviceId, serviceName, demo, hasImage }) => {
        const [imageError, setImageError] = useState(false);
        
        // If has_image is false, show fallback instead of trying to fetch image
        if (hasImage === false) {
            return (
                <div className="w-full h-full" style={{ 
                    background: `linear-gradient(135deg, ${themeColorBackgroundCard} 0%, ${themeColorButton} 100%)` 
                }}>
                </div>
            );
        }
        
        const getImageUrl = () => {
            if (!serviceId || !businessPublicUuid) return null;
            
            if (demo) {
                // Local path for demo services
                return `/uploads/business/${businessPublicUuid}/service/${serviceId}.webp`;
            } else {
                // R2 path for production services
                const publicDomain = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_DOMAIN;
                if (publicDomain) {
                    return `${publicDomain}/business/${businessPublicUuid}/service/${serviceId}.webp`;
                } else {
                    // Fallback to R2 endpoint
                    const accountId = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_ACCOUNT_ID;
                    return `https://${accountId}.r2.cloudflarestorage.com/business/${businessPublicUuid}/service/${serviceId}.webp`;
                }
            }
        };

        const imageUrl = getImageUrl();
        
        console.log('Service Image Path:', {
            serviceId,
            serviceName,
            businessPublicUuid,
            demo,
            hasImage,
            imageUrl,
            imageError
        });

        if (!imageUrl) {
            return (
                <div className="w-full h-full" style={{ 
                    background: `linear-gradient(135deg, ${themeColorBackgroundCard} 0%, ${themeColorButton} 100%)` 
                }}>
                </div>
            );
        }

        if (imageError) {
            // Fallback to placeholder
            return (
                <div className="w-full h-full" style={{ 
                    background: `linear-gradient(135deg, ${themeColorBackgroundCard} 0%, ${themeColorButton} 100%)` 
                }}>
                </div>
            );
        }

        return (
            <Image
                src={imageUrl}
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
                <div className={`flex gap-2 overflow-x-auto lg:justify-center lg:overflow-x-visible lg:flex-wrap pb-2 lg:pb-0 ${
                    isLoading ? 'opacity-0' : 'opacity-100'
                }`}
                    style={{
                        transform: isLoading ? 'translateY(20px)' : 'translateY(0)',
                        transition: 'opacity 1s ease-out 1.0s, transform 1s ease-out 1.0s'
                    }}>
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
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 ${
                    isLoading ? 'opacity-0' : 'opacity-100'
                }`}
                    style={{
                        transform: isLoading ? 'translateY(20px)' : 'translateY(0)',
                        transition: 'opacity 1s ease-out 1.2s, transform 1s ease-out 1.2s'
                    }}>
                    {filteredServices.map((service, index) => (
                        <div
                            key={service.service_id}
                            className={`w-full min-h-[200px] lg:min-h-[240px] rounded-2xl cursor-pointer transition-all duration-200 hover:scale-105 ${
                                selectedService?.service_id === service.service_id ? 'ring-2 ring-offset-2' : ''
                            }`}
                            style={{
                                backgroundColor: selectedService?.service_id === service.service_id ? themeColorButton + '20' : themeColorBackgroundCard, 
                                borderColor: selectedService?.service_id === service.service_id ? themeColorButton : themeColorBorder,
                                boxShadow: selectedService?.service_id === service.service_id 
                                    ? `0 4px 12px ${themeColorButton}40` 
                                    : '0 2px 8px rgba(0,0,0,0.1)',
                                opacity: isLoading ? 0 : 1,
                                transform: isLoading ? 'translateY(20px)' : 'translateY(0)',
                                transition: `opacity 0.6s ease-out ${1.2 + (index * 0.1)}s, transform 0.6s ease-out ${1.2 + (index * 0.1)}s`
                            }}
                                                            onClick={() => onOpenServiceModal ? onOpenServiceModal(service) : onServiceSelect(service)}
                        >
                            {/* Service Image with Overlay */}
                            <div className="w-full h-full min-h-[200px] lg:min-h-[240px] rounded-2xl overflow-hidden relative">
                                <ServiceImage 
                                    serviceId={service.service_id} 
                                    serviceName={service.service_name}
                                    demo={service.demo}
                                    hasImage={service.has_image}
                                />
                                {/* Dark gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                                {/* Service content in overlay */}
                                <div className="absolute inset-0 p-4 lg:p-6 flex flex-col justify-end">
                                    {/* Service details */}
                                    <div>
                                        {/* Service title */}
                                        <p className="text-white text-lg lg:text-xl font-bold leading-tight mb-1" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                                            {service.service_name}
                                        </p>
                                        
                                        {/* Price, Pills and Button row */}
                                        <div className="flex flex-row items-center justify-between">
                                            <div className="flex flex-row items-center gap-3">
                                                {/* Price */}
                                                {service.price_base && (
                                                    <p className="text-white text-sm lg:text-lg font-semibold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                                                        {service.price_base.toLocaleString(locale, { style: 'currency', currency: 'EUR' })}
                                                    </p>
                                                )}
                                                
                                                {/* Service Pills */}
                                                <div className="flex flex-row items-center gap-2">
                                                    {/* Bookable Pill */}
                                                    {service.active_booking && (
                                                        <span className="text-xs text-white/80" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                                                            {t('bookable')}
                                                        </span>
                                                    )}
                                                    
                                                    {/* Quotation Pill */}
                                                    {service.active_quotation && (
                                                        <span className="text-xs text-white/80" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                                                            {t('quotationAvailable')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Request button */}
                                            <button 
                                                className='px-4 py-2 lg:px-5 lg:py-2.5 text-sm lg:text-base rounded-lg font-medium transition-colors flex items-center gap-2' 
                                                style={{ 
                                                    backgroundColor: themeColorButton,
                                                    color: 'white',
                                                    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                                                    boxShadow: `0 0 0 1px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06), 0 8px 25px ${themeColorText}80`
                                                }}
                                            >
                                                {t('request')}
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyStateProfile 
                    icon={<svg className="mx-auto w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                    title={t('noServicesAvailable')}
                    description=""
                    titleColor={themeColorText}
                    backgroundColor={themeColorBackgroundSecondary}
                    borderColor={themeColorBorder}
                />
            )}
        </div>
    );
}

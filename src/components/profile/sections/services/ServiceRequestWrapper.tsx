"use client";

import React from 'react';
import { useBusinessProfile } from '@/contexts/BusinessProfileContext';
import ServiceRequestPageClientContent from './ServiceRequestPageClientContent';

interface ServiceRequestWrapperProps {
  services: any[];
  categories: any[];
}

export default function ServiceRequestWrapper({ services, categories }: ServiceRequestWrapperProps) {
    const { businessData, themeColorText, themeColorButton } = useBusinessProfile();
    
    const business = {
        business_id: (businessData as any)?.business_id,
        business_name: (businessData as any)?.business_name,
        business_descr: (businessData as any)?.business_descr,
        business_address: (businessData as any)?.business_address,
        business_city: (businessData as any)?.business_city,
        business_phone: (businessData as any)?.business_phone,
        business_email: (businessData as any)?.business_email,
        business_public_uuid: (businessData as any)?.business_public_uuid,
        business_urlname: (businessData as any)?.business_urlname,
        business_img_profile: (businessData as any)?.business_img_profile,
        business_img_cover: (businessData as any)?.business_img_cover,
        theme_color_button: themeColorButton,
        theme_color_text: themeColorText,
    };

    return (
        <ServiceRequestPageClientContent
            business={business}
            services={services}
            categories={categories}
        />
    );
} 
// src/app/(main)/[business_urlname]/page.js

"use client";

import { useBusinessProfile } from '@/contexts/BusinessProfileContext';
import ProductsPageContent from './sections/ProductsPageContent';

export default function BusinessProfilePage() {
  
    const businessProfile = useBusinessProfile();

    
    const { businessData, businessMenuItems } = businessProfile; 

   
    if (!businessData) {
        return <div className="text-center py-8">Caricamento prodotti...</div>;
    }

    return (
        <section>
            <ProductsPageContent
                businessData={businessData}
                businessMenuItems={businessMenuItems} 
            />
        </section>
    );
}
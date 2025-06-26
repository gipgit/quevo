// src/app/(main)/[business_urlname]/promotions/page.js

"use client";

import { useBusinessProfile } from '@/contexts/BusinessProfileContext';
import PromotionsPageContent from '../sections/PromotionsPageContent'; // Import the content component

export default function PromotionsPage() {
    const businessProfile = useBusinessProfile();

    const { businessData } = businessProfile;
    if (!businessData) {
        return <div className="text-center py-8">Caricamento promozioni...</div>;
    }

    return (
        <section className="container mx-auto max-w-3xl px-4 py-8">
            <PromotionsPageContent />
        </section>
    );
};
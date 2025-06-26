// src/app/(main)/[business_urlname]/rewards/page.js

"use client";

import { useBusinessProfile } from '@/contexts/BusinessProfileContext';
import RewardsPageContent from '../sections/RewardsPageContent'; 


const RewardsPage = () => {
    const businessProfile = useBusinessProfile();

    const { businessData } = businessProfile; 

    if (!businessData) {
        return <div className="text-center py-8">Caricamento premi...</div>;
    }

    return (
        <section className="container mx-auto max-w-3xl px-4 py-8">
            <RewardsPageContent />
        </section>
    );
};

export default RewardsPage;
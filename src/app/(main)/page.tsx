// app/page.jsx


import SectionHero from '@/components/landing/SectionHero';
import SectionFeatures from '@/components/landing/SectionFeatures';
import SectionSmartphone from '@/components/landing/SectionSmartphone'; // For your 3D tilt
import SectionHowPoints from '@/components/landing/SectionHowPoints'; // For your step-by-step display
import SectionFaqs from '@/components/landing/SectionFaqs'; // For your accordion/FAQ
import SectionExamplesSwiper from '@/components/landing/SectionExamplesSwiper'; // For the first Swiper
import SectionPlansSwiper from '@/components/landing/SectionPlansSwiper'; // For the second Swiper


export default function HomePage() {
    return (
        <>
         
         

            <main>

                <SectionHero />

                <SectionFeatures />

                <SectionSmartphone />

                <SectionHowPoints />

                <SectionFaqs />

                <SectionExamplesSwiper />

                <SectionPlansSwiper />


            </main>

          
        </>
    );
}
// app/page.jsx


import SectionHero from '@/components/landing/SectionHero';
import SectionFeatures from '@/components/landing/SectionFeatures';
import SectionSmartphone from '@/components/landing/SectionSmartphone';
import SectionHowPoints from '@/components/landing/SectionHowPoints'; 
import SectionFaqs from '@/components/landing/SectionFaqs'; 
import SectionExamplesSwiper from '@/components/landing/SectionExamplesSwiper';
import SectionPlansSwiper from '@/components/landing/SectionPlansSwiper'; 


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
// src/app/[locale]/(main)/page.jsx

import SectionBoard from '@/components/landing/SectionBoard';
import SectionActions from '@/components/landing/SectionActions';
import SectionHero from '@/components/landing/SectionHero';
import SectionSteps from '@/components/landing/SectionSteps'; 
import SectionFaqs from '@/components/landing/SectionFaqs'; 
import SectionCTA from '@/components/landing/SectionCTA'; 
import SectionCategories from '@/components/landing/SectionCategories';
import SectionFeatures from '@/components/landing/SectionFeatures';

interface HomePageProps {
  params: {
    locale: string;
  };
}

export default function HomePage({ params }: HomePageProps) {
    return (
        <>
         
            <main>

                <SectionHero locale={params.locale} />
                
                <SectionFeatures locale={params.locale} />
                
                <SectionActions locale={params.locale} />
                
            
                <SectionBoard locale={params.locale} />

                

                <SectionSteps locale={params.locale} />

                
                <SectionCategories/>
                

                <SectionFaqs />


                <SectionCTA />


            </main>

          
        </>
    );
}
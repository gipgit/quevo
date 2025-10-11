// src/app/[locale]/(main)/page.jsx

import SectionBoard from '@/components/landing/SectionBoard';
import SectionActions from '@/components/landing/SectionActions';
import SectionRequestFeatures from '@/components/landing/SectionRequestFeatures';
import SectionSupportFeatures from '@/components/landing/SectionSupportFeatures';
import SectionSupport from '@/components/landing/SectionSupport';
import SectionHero from '@/components/landing/SectionHero';
import SectionSteps from '@/components/landing/SectionSteps'; 
import SectionFaqs from '@/components/landing/SectionFaqs'; 
import SectionCTA from '@/components/landing/SectionCTA'; 
import SectionCategories from '@/components/landing/SectionCategories';
import SectionFeatures from '@/components/landing/SectionFeatures';
import SectionMarketingFeatures from '@/components/landing/SectionMarketingFeatures';
import SectionComparison from '@/components/landing/SectionComparison';

interface HomePageProps {
  params: {
    locale: string;
  };
}

export default function HomePage({ params }: HomePageProps) {
    return (
        <>
         
            <main className="overflow-x-hidden">

                <SectionHero locale={params.locale} />
                
                <SectionFeatures locale={params.locale} />

                <SectionSteps locale={params.locale} />
                
                <SectionBoard locale={params.locale} />

                <SectionActions locale={params.locale} />

                <SectionRequestFeatures locale={params.locale} />

                <SectionSupportFeatures locale={params.locale} />

                <SectionMarketingFeatures locale={params.locale} />

                <SectionCategories/>

                <SectionSupport locale={params.locale} />
                
                <SectionComparison locale={params.locale} />
                
                <SectionFaqs />

                <SectionCTA />


            </main>

          
        </>
    );
}
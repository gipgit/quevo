// components/landing/SectionCTA.tsx
'use client';

import { useTranslations } from 'next-intl';

export default function SectionCTA() {
    const t = useTranslations('Landing');
    
    return (
        <section className="container-landing-plans container-x-lg py-16" style={{
          background: 'radial-gradient(ellipse 120% 80% at center 90%, #FFD700 0%, #F59E0B 15%, #EAB308 30%, #1E40AF 50%, #1E3A8A 70%, #1E293B 85%, #0F172A 95%, #000000 100%)'
        }}>
            <div className="text-center">
                <p className="font-bold text-3xl lg:text-4xl mt-5 mb-4 text-white leading-tight">
                    {t('CTA.title')}
                </p>
                <p className="text-lg lg:text-2xl mb-4 text-white leading-tight">{t('CTA.subtitle')}</p>
                <div className="flex flex-col gap-4 justify-center items-center">
                    <a href="/signup" className="button py-2 px-4 lg:py-3 lg:px-6 btn-gradient-green bg-white text-gray-900 hover:bg-gray-100">{t('CTA.button')}</a>
                </div>
            </div>
        </section>
    );
} 
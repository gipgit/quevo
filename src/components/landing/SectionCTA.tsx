// components/landing/SectionCTA.tsx
'use client';

import { useTranslations } from 'next-intl';

export default function SectionCTA() {
    const t = useTranslations('Landing');
    
    return (
        <section className="container-landing-plans container-x-lg py-16" style={{
          background: 'radial-gradient(ellipse at center bottom, #FFD700 0%, #F59E0B 15%, #1E40AF 30%, #1E3A8A 50%, #0F172A 70%, #000000 100%)'
        }}>
            <div className="text-center">
                <p className="font-bold text-4xl lg:text-5xl mt-5 mb-4 text-white leading-tight">
                    {t('CTA.title')}
                </p>
                <p className="text-xl lg:text-3xl mb-4 text-white leading-tight">{t('CTA.subtitle')}</p>
                <div className="flex flex-col gap-4 justify-center items-center">
                    <a href="/signup" className="button btn-lg mobile-w-full btn-gradient-green bg-white text-gray-900 hover:bg-gray-100">{t('CTA.button')}</a>
                </div>
            </div>
        </section>
    );
} 
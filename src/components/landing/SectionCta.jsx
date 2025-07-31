// components/landing/SectionCTA.jsx
'use client';

export default function SectionCTA() {
    return (
        <section className="container-landing-plans container-x-lg py-12" style={{
          background: 'radial-gradient(ellipse at center bottom, #FFD700 0%, #4A5568 20%, #2D3748 40%, #1A202C 60%, #2C5282 80%, #1A202C 100%)'
        }}>
            <div className="text-center mb-12">
                <p className="font-bold text-4xl lg:text-5xl mt-5 mb-4 text-white leading-tight">
                    Un piano SEMPRE <span className="bg-gradient-to-t from-green-400 via-blue-600 to-cyan-400 bg-clip-text text-transparent">GRATUITO</span>
                </p>
                <p className="text-xl lg:text-3xl mb-4 text-white leading-tight">Annulli o cambia piano in qualsiasi momento.</p>
                <p className="text-lg lg:text-xl mb-8 text-white leading-tight">Sì, il piano gratuito è senza vincoli e senza carte.</p>
                <div className="flex flex-col gap-4 justify-center items-center">
                    <a href="/signup" className="button btn-lg mobile-w-full btn-gradient-green bg-white text-gray-900 hover:bg-gray-100">Start Now</a>
                    <a href="/plans" className="inline-flex items-center gap-2 text-white hover:text-gray-200 transition-colors">
                        Guarda i piani
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
}
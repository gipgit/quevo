// components/landing/SectionCTA.tsx
'use client';

import { useTranslations } from 'next-intl';

export default function SectionCTA() {
    const t = useTranslations('Landing');
    
    return (
        <section className="py-16 px-4 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div 
                    className="relative rounded-3xl p-8 lg:p-16 overflow-hidden"
                    style={{ backgroundColor: 'rgb(27, 12, 37)' }}
                >
                    {/* Gradient Layer 1 */}
                    <div 
                        className="absolute z-1"
                        style={{
                            background: 'linear-gradient(143.241deg, rgb(128, 169, 252) 0%, rgb(211, 123, 255) 31.087%, rgb(252, 171, 131) 70.4599%, rgb(255, 73, 212) 100%)',
                            filter: 'blur(80px)',
                            borderRadius: '100%',
                            opacity: 0.24,
                            height: '548px',
                            left: '-246px',
                            top: '-186px',
                            width: '658px'
                        }}
                    ></div>
                    
                    {/* Gradient Layer 2 */}
                    <div 
                        className="absolute z-1"
                        style={{
                            background: 'linear-gradient(140.017deg, rgb(239, 232, 246) 0%, rgb(213, 136, 251) 60.8266%, rgb(255, 73, 212) 100%)',
                            filter: 'blur(80px)',
                            borderRadius: '100%',
                            opacity: 0.18,
                            height: '548px',
                            right: '-86px',
                            top: '590px',
                            width: '658px'
                        }}
                    ></div>
                    
                    <div className="relative z-10 text-center">
                        <h2 className="text-2xl md:text-3xl lg:text-5xl font-normal leading-tight mb-4 drop-shadow-lg">
                            <span className="text-white">{t('CTA.title.part1')}</span> <span className="text-white">{t('CTA.title.part2')}</span>
                        </h2>
                        <p className="text-base lg:text-xl mb-8 text-gray-300 leading-tight lg:leading-relaxed max-w-3xl mx-auto drop-shadow-md">
                            {t('CTA.subtitle')}
                        </p>
                        <div className="flex flex-col gap-4 justify-center items-center">
                            <a href="/signup" className="relative px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-normal rounded-xl hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group">
                                {/* Multicolored border effect */}
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400 via-purple-500 via-pink-500 to-orange-400 opacity-75 blur-sm -z-10 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 -z-10"></div>
                                
                                {/* Enhanced shadow effects */}
                                <div className="absolute inset-0 rounded-xl shadow-[0_0_40px_rgba(6,182,212,0.6)] group-hover:shadow-[0_0_60px_rgba(6,182,212,0.8)] transition-shadow duration-300 -z-20"></div>
                                <div className="absolute inset-0 rounded-xl shadow-[0_0_40px_rgba(147,51,234,0.6)] group-hover:shadow-[0_0_60px_rgba(147,51,234,0.8)] transition-shadow duration-300 -z-20 ml-2"></div>
                                <div className="absolute inset-0 rounded-xl shadow-[0_0_60px_rgba(255,73,212,0.4)] group-hover:shadow-[0_0_80px_rgba(255,73,212,0.6)] transition-shadow duration-300 -z-20 -ml-1"></div>
                                
                                <span className="relative z-10">{t('CTA.button')}</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
} 
// components/landing/SectionCTA.tsx
'use client';

import { useTranslations } from 'next-intl';

export default function SectionCTA() {
    const t = useTranslations('Landing');
    
    return (
        <section className="py-16 px-4 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="relative bg-gradient-to-br from-blue-950 via-green-900 to-yellow-800 rounded-3xl p-8 lg:p-16 overflow-hidden">
                    {/* AI Pattern Overlay */}
                    <div className="absolute inset-0 opacity-15">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_75%_25%,rgba(148,163,184,0.06)_2px,transparent_2px)] bg-[length:30px_30px]"></div>
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_25%_75%,rgba(255,255,255,0.04)_1.5px,transparent_1.5px)] bg-[length:25px_25px]"></div>
                    </div>
                    
                    {/* Animated gradient orbs */}
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
                    <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
                    
                    <div className="relative z-10 text-center">
                        <h2 className="text-3xl lg:text-5xl font-bold leading-tight mb-4 drop-shadow-lg">
                            <span className="text-white">Ready to Transform</span> <span className="text-white">Your Business?</span>
                        </h2>
                        <p className="text-lg lg:text-2xl mb-8 text-gray-300 leading-tight lg:leading-relaxed max-w-3xl mx-auto drop-shadow-md">
                            Join thousands of businesses already using AI to streamline their operations and boost productivity
                        </p>
                        <div className="flex flex-col gap-4 justify-center items-center">
                            <a href="/signup" className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                                Get Started Free
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
} 
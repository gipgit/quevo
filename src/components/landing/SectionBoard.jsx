// components/landing/SectionBoard.jsx
'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

// Example businesses data based on actual database entries
const exampleBusinesses = {
  it: [
    {
      id: 1,
      name: "Traslochi Express",
      url: "traslochi_express",
      board_ref: "ABC123",
      desktopImage: "/landing/traslochi_express/board-desktop.webp",
      smartphoneImage: "/landing/traslochi_express/board-mobile.webp",
      category: "Traslochi"
    },
    {
      id: 2,
      name: "Edilizia Premium",
      url: "edilizia_premium",
      board_ref: "DEF456",
      desktopImage: "/landing/edilizia_premium/board-desktop.webp",
      smartphoneImage: "/landing/edilizia_premium/board-mobile.webp",
      category: "Edilizia"
    },
    {
      id: 3,
      name: "Digital Marketing Solutions",
      url: "digital_marketing_solutions",
      board_ref: "GHI789",
      desktopImage: "/landing/digital_marketing_solutions/board-desktop.webp",
      smartphoneImage: "/landing/digital_marketing_solutions/board-mobile.webp",
      category: "Marketing Digitale"
    }
  ],
  en: [
    {
      id: 1,
      name: "Express Moving Services",
      url: "traslochi_express",
      board_ref: "ABC123",
      desktopImage: "/landing/traslochi_express/board-desktop.webp",
      smartphoneImage: "/landing/traslochi_express/board-mobile.webp",
      category: "Moving Services"
    },
    {
      id: 2,
      name: "Premium Construction",
      url: "edilizia_premium",
      board_ref: "DEF456",
      desktopImage: "/landing/edilizia_premium/board-desktop.webp",
      smartphoneImage: "/landing/edilizia_premium/board-mobile.webp",
      category: "Construction"
    },
    {
      id: 3,
      name: "Digital Marketing Solutions",
      url: "digital_marketing_solutions",
      board_ref: "GHI789",
      desktopImage: "/landing/digital_marketing_solutions/board-desktop.webp",
      smartphoneImage: "/landing/digital_marketing_solutions/board-mobile.webp",
      category: "Digital Marketing"
    }
  ],
  es: [
    {
      id: 1,
      name: "Traslados Express",
      url: "traslochi_express",
      board_ref: "ABC123",
      desktopImage: "/landing/traslochi_express/board-desktop.webp",
      smartphoneImage: "/landing/traslochi_express/board-mobile.webp",
      category: "Traslados"
    },
    {
      id: 2,
      name: "Construcción Premium",
      url: "edilizia_premium",
      board_ref: "DEF456",
      desktopImage: "/landing/edilizia_premium/board-desktop.webp",
      smartphoneImage: "/landing/edilizia_premium/board-mobile.webp",
      category: "Construcción"
    },
    {
      id: 3,
      name: "Soluciones de Marketing Digital",
      url: "digital_marketing_solutions",
      board_ref: "GHI789",
      desktopImage: "/landing/digital_marketing_solutions/board-desktop.webp",
      smartphoneImage: "/landing/digital_marketing_solutions/board-mobile.webp",
      category: "Marketing Digital"
    }
  ]
};

export default function SectionBoard({ locale }) {
    const t = useTranslations('Landing');
    const tCommon = useTranslations('Common');
    const [currentBusinessIndex, setCurrentBusinessIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [timeRemaining, setTimeRemaining] = useState(3000); // 3 seconds in milliseconds
    
    // Use the passed locale prop instead of detecting from URL
    const currentLocale = ['it', 'en', 'es', 'de', 'fr'].includes(locale) ? locale : 'it';
    const businesses = exampleBusinesses[currentLocale] || exampleBusinesses.it;

    // Auto-play carousel with time tracking
    useEffect(() => {
        if (!isAutoPlaying) {
            setTimeRemaining(3000);
            return;
        }

        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 3000 - elapsed);
            setTimeRemaining(remaining);

            if (remaining <= 0) {
                setCurrentBusinessIndex((prev) => (prev + 1) % businesses.length);
                setTimeRemaining(3000);
            }
        }, 50); // Update every 50ms for smooth animation

        return () => clearInterval(interval);
    }, [isAutoPlaying, businesses.length, currentBusinessIndex]);

    const handleBusinessSelect = (index) => {
        setCurrentBusinessIndex(index);
        setIsAutoPlaying(false);
        setTimeRemaining(3000);
        
        // Resume auto-play after 5 seconds of manual navigation
        setTimeout(() => setIsAutoPlaying(true), 5000);
    };

    const currentBusiness = businesses[currentBusinessIndex];
    const progressPercentage = ((3000 - timeRemaining) / 3000) * 100;

    const renderTitleWithItalic = (text) => {
        const words = text.split(' ');
        return (
            <span>
                {words.map((word, index) => {
                    const cleanWord = word.replace(/[.,]/g, '');
                    // Check for all translations of seamless, guided, and clear
                    const isItalic = cleanWord === 'seamless' || 
                                   cleanWord === 'guided' || 
                                   cleanWord === 'fluida' || 
                                   cleanWord === 'guidata' || 
                                   cleanWord === 'guiada' ||
                                   cleanWord === 'clear' ||
                                   cleanWord === 'chiara' ||
                                   cleanWord === 'chiare' ||
                                   cleanWord === 'clara' ||
                                   cleanWord === 'claras';
                    
                    return (
                        <span key={index}>
                            {isItalic ? (
                                <span className="font-italic">{cleanWord}</span>
                            ) : (
                                word
                            )}
                            {index < words.length - 1 && ' '}
                        </span>
                    );
                })}
            </span>
        );
    };

    return (
        <section className="min-h-screen bg-white flex items-center">
            <div className="container mx-auto px-6 py-16 max-w-[1300px]">
                <div className="flex flex-col gap-12 items-center">
                    
                    {/* Top Row - Content */}
                     <div className="space-y-6 max-w-[1000px] text-center">
                         <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                             {renderTitleWithItalic(t('Board.title'))}
                         </h1>
                         <p className="text-md lg:text-lg text-gray-600 leading-tight lg:leading-relaxed">
                             {t('Board.description')}
                         </p>
                     </div>

                     {/* Board Pill Link Example and Get Started Button - Moved below cards */}
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                        <div className="w-full max-w-[90vw] lg:w-[500px] inline-flex items-center gap-2 rounded-full px-3 lg:px-4 py-2 lg:py-2 shadow-md border border-gray-200">
                            <div className="flex items-center gap-1 min-w-0 flex-1">
                                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                                    <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
                                    <ellipse cx="10" cy="10" rx="4" ry="9" stroke="currentColor" strokeWidth="2" />
                                    <line x1="1" y1="10" x2="19" y2="10" stroke="currentColor" strokeWidth="2" />
                                    <line x1="10" y1="1" x2="10" y2="19" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                <span className="text-gray-600 font-medium text-xs lg:text-sm">{tCommon('domainPrefix')}</span>
                                <span className="text-gray-800 font-semibold -ml-1 text-xs lg:text-sm">{currentBusiness.url}</span>
                                <span className="text-gray-600 truncate -ml-1 text-xs lg:text-sm">/s/{currentBusiness.board_ref}</span>
                            </div>
                            <Link 
                                href={`/${locale}/${currentBusiness.url}/s/${currentBusiness.board_ref}`}
                                className="inline-flex items-center gap-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-2 py-1 lg:px-3 lg:py-1.5 rounded-full text-xs font-medium transition-colors flex-shrink-0"
                            >
                                {t('viewExample')}
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </Link>
                        </div>
                        <Link 
                            href="/signup/business" 
                            className="button py-2 px-4 lg:py-2 lg:px-6 text-sm lg:text-base bg-gradient-to-r from-gray-700 to-gray-900 text-white hover:from-gray-600 hover:to-gray-800 inline-block"
                        >
                            {t('getStarted')}
                        </Link>
                    </div>

                    {/* Service Board Benefits Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 lg:gap-6 max-w-6xl mx-auto">
                       
                       {/* Unified View */}
                       <div className="bg-white rounded-2xl p-4 md:p-5 lg:p-6 border border-gray-100 md:col-span-2 lg:col-span-1">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-6 lg:w-6 lg:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight lg:leading-relaxed">{t('Board.benefits.unifiedView.title')}</h3>
                                    <p className="text-gray-600 leading-tight lg:leading-relaxed">
                                        {t('Board.benefits.unifiedView.description')}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                       {/* Clear View */}
                       <div className="bg-white rounded-2xl p-4 md:p-5 lg:p-6 border border-gray-100">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-6 lg:w-6 lg:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight lg:leading-relaxed">{t('Board.benefits.clearView.title')}</h3>
                                    <p className="text-gray-600 leading-tight lg:leading-relaxed">
                                        {t('Board.benefits.clearView.description')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Problem-Solving Power */}
                        <div className="bg-white rounded-2xl p-4 md:p-5 lg:p-6 border border-gray-100">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-6 lg:w-6 lg:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight lg:leading-relaxed">{t('Board.benefits.problemSolving.title')}</h3>
                                    <p className="text-gray-600 leading-tight lg:leading-relaxed">
                                        {t('Board.benefits.problemSolving.description')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Effortless Action Management */}
                        <div className="bg-white rounded-2xl p-4 md:p-5 lg:p-6 border border-gray-100">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-6 lg:w-6 lg:h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight lg:leading-relaxed">{t('Board.benefits.effortlessManagement.title')}</h3>
                                    <p className="text-gray-600 leading-tight lg:leading-relaxed">
                                        {t('Board.benefits.effortlessManagement.description')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Automated Notifications */}
                        <div className="bg-white rounded-2xl p-4 md:p-5 lg:p-6 border border-gray-100">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-6 lg:w-6 lg:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight lg:leading-relaxed">{t('Board.benefits.automatedNotifications.title')}</h3>
                                    <p className="text-gray-600 leading-tight lg:leading-relaxed">
                                        {t('Board.benefits.automatedNotifications.description')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Secure & Shareable Access */}
                        <div className="bg-white rounded-2xl p-4 md:p-5 lg:p-6 border border-gray-100">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-6 lg:w-6 lg:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight lg:leading-relaxed">{t('Board.benefits.secureAccess.title')}</h3>
                                    <p className="text-gray-600 leading-tight lg:leading-relaxed">
                                        {t('Board.benefits.secureAccess.description')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        
                    </div>

                    {/* Bottom Column - Carousel */}
                    <div className="relative">
                        {/* Desktop and Smartphone Views */}
                        <div className="relative flex flex-col lg:flex-row justify-center items-center gap-4">
                            {/* Smartphone View */}
                            <div className="relative z-20 -left-1 flex items-center">
                                <div className="bg-gray-800 rounded-3xl shadow-2xl p-1">
                                    <img 
                                        src={currentBusiness.smartphoneImage}
                                        alt={`${currentBusiness.name} mobile view`}
                                        className="w-[280px] h-[520px] rounded-2xl object-cover object-top"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'block';
                                        }}
                                        onLoad={(e) => {
                                            e.target.style.display = 'block';
                                            e.target.nextSibling.style.display = 'none';
                                        }}
                                    />
                                    <div 
                                        className="w-56 h-72 rounded-2xl bg-gradient-to-br from-gray-400 to-gray-600"
                                        style={{ display: 'none', minWidth: '14rem', minHeight: '18rem' }}
                                    />
                                </div>
                            </div>

                            {/* Desktop View */}
                            <div className="relative z-10 max-w-9xl overflow-visible w-[100vw] h-auto lg:w-full">
                                <div className="bg-gray-800 rounded-xl shadow-2xl p-1">
                                    <img 
                                        src={currentBusiness.desktopImage}
                                        alt={`${currentBusiness.name} desktop view`}
                                        className="w-full h-auto rounded-xl"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'block';
                                        }}
                                        onLoad={(e) => {
                                            e.target.style.display = 'block';
                                            e.target.nextSibling.style.display = 'none';
                                        }}
                                    />
                                    <div 
                                        className="w-full h-64 rounded-xl bg-gradient-to-br from-gray-500 to-gray-700"
                                        style={{ display: 'none', minWidth: '20rem', minHeight: '16rem' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Pills - Moved after images */}
                    <div className="flex flex-wrap gap-2 justify-center">
                        {businesses.map((business, index) => (
                            <button
                                key={business.id}
                                onClick={() => handleBusinessSelect(index)}
                                className={`relative px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 overflow-hidden ${
                                    index === currentBusinessIndex
                                        ? 'bg-gray-300 text-gray-900 shadow-lg'
                                        : 'bg-transparent text-gray-600 hover:text-gray-800 border border-gray-300'
                                }`}
                            >
                                {/* Loading bar background */}
                                {index === currentBusinessIndex && isAutoPlaying && (
                                    <div 
                                        className="absolute inset-0 bg-gray-400 transition-all duration-50 ease-linear"
                                        style={{ 
                                            width: `${progressPercentage}%`,
                                            left: '0',
                                            top: '0',
                                            bottom: '0'
                                        }}
                                    />
                                )}
                                {/* Text content */}
                                <span className="relative z-10">{business.category}</span>
                            </button>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}
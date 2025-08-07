// components/landing/SectionHero.jsx
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
      desktopImage: "/landing/traslochi_express/profile-desktop.webp",
      smartphoneImage: "/landing/traslochi_express/profile-mobile.webp",
      category: "Traslochi"
    },
    {
      id: 2,
      name: "Edilizia Premium",
      url: "edilizia_premium",
      desktopImage: "/landing/edilizia_premium/profile-desktop.webp",
      smartphoneImage: "/landing/edilizia_premium/profile-mobile.webp",
      category: "Edilizia"
    },
    {
      id: 3,
      name: "Digital Marketing Solutions",
      url: "digital_marketing_solutions",
      desktopImage: "/landing/digital_marketing_solutions/profile-desktop.webp",
      smartphoneImage: "/landing/digital_marketing_solutions/profile-mobile.webp",
      category: "Marketing Digitale"
    },
    {
      id: 4,
      name: "Agenzia Immobiliare Roma",
      url: "agenzia_immobiliare_roma",
      desktopImage: "/landing/agenzia_immobiliare_roma/profile-desktop.webp",
      smartphoneImage: "/landing/agenzia_immobiliare_roma/profile-mobile.webp",
      category: "Immobiliare"
    },
    {
      id: 5,
      name: "Concessionaria Auto Milano",
      url: "concessionaria_auto_milano",
      desktopImage: "/landing/concessionaria_auto_milano/profile-desktop.webp",
      smartphoneImage: "/landing/concessionaria_auto_milano/profile-mobile.webp",
      category: "Auto"
    }
  ],
  en: [
    {
      id: 1,
      name: "Express Moving Services",
      url: "traslochi_express",
      desktopImage: "/landing/traslochi_express/profile-desktop.webp",
      smartphoneImage: "/landing/traslochi_express/profile-mobile.webp",
      category: "Moving Services"
    },
    {
      id: 2,
      name: "Premium Construction",
      url: "edilizia_premium",
      desktopImage: "/landing/edilizia_premium/profile-desktop.webp",
      smartphoneImage: "/landing/edilizia_premium/profile-mobile.webp",
      category: "Construction"
    },
    {
      id: 3,
      name: "Digital Marketing Solutions",
      url: "digital_marketing_solutions",
      desktopImage: "/landing/digital_marketing_solutions/profile-desktop.webp",
      smartphoneImage: "/landing/digital_marketing_solutions/profile-mobile.webp",
      category: "Digital Marketing"
    },
    {
      id: 4,
      name: "Roma Real Estate Agency",
      url: "agenzia_immobiliare_roma",
      desktopImage: "/landing/agenzia_immobiliare_roma/profile-desktop.webp",
      smartphoneImage: "/landing/agenzia_immobiliare_roma/profile-mobile.webp",
      category: "Real Estate"
    },
    {
      id: 5,
      name: "Milan Auto Dealership",
      url: "concessionaria_auto_milano",
      desktopImage: "/landing/concessionaria_auto_milano/profile-desktop.webp",
      smartphoneImage: "/landing/concessionaria_auto_milano/profile-mobile.webp",
      category: "Automotive"
    }
  ],
  es: [
    {
      id: 1,
      name: "Traslados Express",
      url: "traslochi_express",
      desktopImage: "/landing/traslochi_express/profile-desktop.webp",
      smartphoneImage: "/landing/traslochi_express/profile-mobile.webp",
      category: "Traslados"
    },
    {
      id: 2,
      name: "Construcción Premium",
      url: "edilizia_premium",
      desktopImage: "/landing/edilizia_premium/profile-desktop.webp",
      smartphoneImage: "/landing/edilizia_premium/profile-mobile.webp",
      category: "Construcción"
    },
    {
      id: 3,
      name: "Soluciones de Marketing Digital",
      url: "digital_marketing_solutions",
      desktopImage: "/landing/digital_marketing_solutions/profile-desktop.webp",
      smartphoneImage: "/landing/digital_marketing_solutions/profile-mobile.webp",
      category: "Marketing Digital"
    },
    {
      id: 4,
      name: "Agencia Inmobiliaria Roma",
      url: "agenzia_immobiliare_roma",
      desktopImage: "/landing/agenzia_immobiliare_roma/profile-desktop.webp",
      smartphoneImage: "/landing/agenzia_immobiliare_roma/profile-mobile.webp",
      category: "Inmobiliaria"
    },
    {
      id: 5,
      name: "Concesionario Auto Milán",
      url: "concessionaria_auto_milano",
      desktopImage: "/landing/concessionaria_auto_milano/profile-desktop.webp",
      smartphoneImage: "/landing/concessionaria_auto_milano/profile-mobile.webp",
      category: "Automóviles"
    }
  ]
};

export default function SectionHero({ locale }) {
    const t = useTranslations('Landing');
    const tCommon = useTranslations('Common');
    const [currentBusinessIndex, setCurrentBusinessIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [timeRemaining, setTimeRemaining] = useState(3000); // 3 seconds in milliseconds
    
    // Use the passed locale prop instead of detecting from URL
    const currentLocale = ['it', 'en', 'es', 'de', 'fr'].includes(locale) ? locale : 'it';
    const businesses = exampleBusinesses[currentLocale] || exampleBusinesses.it;

    const renderTextWithItalic = (text) => {
        const words = text.split(' ');
        return (
            <span>
                {words.map((word, index) => {
                    const cleanWord = word.replace(/[.,]/g, '');
                    // Check for all translations of the specified words
                    const isItalic = cleanWord === 'one' || 
                                   cleanWord === 'single' || 
                                   cleanWord === 'intuitive' || 
                                   cleanWord === 'screen' ||
                                   cleanWord === 'increase' ||
                                   cleanWord === 'conversions' ||
                                   cleanWord === 'streamline' ||
                                   cleanWord === 'operations' ||
                                   // Italian translations
                                   cleanWord === 'unico' ||
                                   cleanWord === 'schermo' ||
                                   cleanWord === 'intuitivo' ||
                                   cleanWord === 'aumenta' ||
                                   cleanWord === 'conversioni' ||
                                   cleanWord === 'ottimizza' ||
                                   cleanWord === 'operazioni' ||
                                   // Spanish translations
                                   cleanWord === 'sola' ||
                                   cleanWord === 'pantalla' ||
                                   cleanWord === 'intuitiva' ||
                                   cleanWord === 'aumenta' ||
                                   cleanWord === 'conversiones' ||
                                   cleanWord === 'optimiza' ||
                                   cleanWord === 'operaciones';
                    
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

    return (
        <section className="min-h-screen flex items-center" style={{
          background: 'radial-gradient(circle at center 150%, #fefefe 0%, #fafafa 50%, #f5f5f5 70%, #ffffff 85%)'
        }}>
            <div className="container mx-auto px-12 py-16 max-w-[1480px]">
                <div className="flex flex-col gap-12 items-center">
                    
                    {/* Top Row - Content */}
                     <div className="space-y-6 max-w-[1000px] text-center">
                         <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-none mb-6">
                             {renderTextWithItalic(t('Hero.title'))}
                         </h1>
                         <p className="text-lg text-gray-600 leading-tight lg:leading-relaxed">
                             {renderTextWithItalic(t('Hero.subtitle'))}
                         </p>
                         
                         {/* 3 Horizontal List Items */}
                         <div className="flex flex-wrap justify-center gap-1 lg:gap-6 mt-4">
                             <div className="flex items-center gap-1 lg:gap-2 text-blue-500">
                                 <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                 </svg>
                                 <span className="text-blue-500 font-medium text-sm lg:text-base">{t('Hero.benefits.freePlan')}</span>
                             </div>
                             <div className="flex items-center gap-1 lg:gap-2 text-blue-500">
                                 <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                 </svg>
                                 <span className="text-blue-500 font-medium text-sm lg:text-base">{t('Hero.benefits.noPaymentDetails')}</span>
                             </div>
                             <div className="flex items-center gap-1 lg:gap-2 text-blue-500">
                                 <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                 </svg>
                                 <span className="text-blue-500 font-medium text-sm lg:text-base">{t('Hero.benefits.cancelAnytime')}</span>
                             </div>
                         </div>

                        {/* Example URL Link Pill and Get Started Button */}
                        <div className="inline-flex flex-col sm:flex-row gap-4 items-center justify-center max-w-[90vw] lg:max-w-[700px]">
                               <div className="w-full inline-flex items-center gap-3 bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 rounded-full px-3 lg:px-6 py-2 lg:py-3 shadow-lg relative" style={{
                               background: 'linear-gradient(white, white) padding-box, linear-gradient(to right, #60a5fa, #8b5cf6, #ec4899, #f59e0b, #10b981, #3b82f6) border-box',
                               border: '3px solid transparent'
                             }}>
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                                        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
                                        <ellipse cx="10" cy="10" rx="4" ry="9" stroke="currentColor" strokeWidth="2" />
                                        <line x1="1" y1="10" x2="19" y2="10" stroke="currentColor" strokeWidth="2" />
                                        <line x1="10" y1="1" x2="10" y2="19" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                    <span className="text-xs lg:text-sm text-gray-600 font-medium">{tCommon('domainPrefix')}</span>
                                    <span className="text-xs lg:text-sm text-gray-900 font-semibold truncate -ml-2">{currentBusiness.url}</span>
                                </div>
                                <Link 
                                    href={`/${locale}/${currentBusiness.url}`}
                                    className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-medium transition-colors flex-shrink-0"
                                >
                                    {t('Hero.viewExample')}
                                    <svg className="hidden lg:block" width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </Link>
                            </div>
                            <Link 
                                href="/signup" 
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-900 via-black to-gray-800 hover:from-black hover:to-gray-900 text-white px-8 py-3 lg:py-4 rounded-full text-md lg:text-lg transition-all duration-300 shadow-lg hover:shadow-xl  whitespace-nowrap"
                            >
                                {tCommon('getStarted')}
                            </Link>
                        </div>
                    </div>

                    {/* Bottom Column - Carousel */}
                    <div className="relative">
                        {/* Desktop and Smartphone Views */}
                        <div className="relative flex flex-col lg:flex-row justify-center lg:items-center gap-4">
                            {/* Smartphone View */}
                            <div className="relative z-20 -left-1 flex justify-center items-center">
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
                                        className="w-[280px] h-[520px] rounded-2xl bg-gradient-to-br from-gray-300 to-gray-400"
                                        style={{ display: 'none', minWidth: '14rem', minHeight: '18rem' }}
                                    />
                                </div>
                            </div>
                            {/* Desktop View */}
                            <div className="relative z-10 w-full max-w-9xl overflow-visible">
                                <div 
                                    className="bg-gray-800 rounded-lg shadow-2xl p-[1px] overflow-visible w-[100vw] h-auto lg:w-full"
                                >
                                    <img 
                                        src={currentBusiness.desktopImage}
                                        alt={`${currentBusiness.name} desktop view`}
                                        className="w-full h-auto rounded-lg object-contain"
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
                                        className="w-full h-[180px] lg:h-64 rounded-lg bg-gradient-to-br from-gray-300 to-gray-400"
                                        style={{ 
                                            display: 'none', 
                                            minWidth: '20rem', 
                                            minHeight: '16rem'
                                        }}
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
                                className={`relative px-2 lg:px-3 py-1 lg:py-1.5 rounded-full text-xs font-medium transition-all duration-200 overflow-hidden ${
                                    index === currentBusinessIndex
                                        ? 'bg-gray-200 text-gray-500 shadow-lg'
                                        : 'bg-transparent text-gray-500 hover:text-gray-800 border border-gray-300'
                                }`}
                            >
                                {/* Loading bar background */}
                                {index === currentBusinessIndex && isAutoPlaying && (
                                    <div 
                                        className="absolute inset-0 bg-gray-300 transition-all duration-50 ease-linear"
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
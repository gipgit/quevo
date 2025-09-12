// components/landing/SectionBoard.jsx

'use client';



import { useRef, useEffect, useState } from 'react';

import Link from 'next/link';

import { useTranslations } from 'next-intl';

import ServiceBoardScreenshot from './ServiceBoardScreenshot';


// Example businesses data - same structure as SectionHero
const exampleBusinesses = {
  it: [
    {
      id: 1,
      name: "Azienda Edilizia",
      url: "azienda_edilizia",
      category: "Edilizia",
      description: "Servizi di edilizia e ristrutturazione per la casa e l'ufficio.",
      coverImage: "/uploads/business/e1f2a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b/cover-desktop.webp",
      profileImage: "/uploads/business/e1f2a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b/profile.webp",
      boardRef: "ABC123",
      boardTitle: "Ristrutturazione Casa",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#262625",
        secondaryColor: "#1a1a19",
        accentColor: "#404040",
        backgroundColor: "#F5F5F5",
        textColor: "#333333",
        buttonBgColor: "#262625",
        buttonTextColor: "#FFFFFF",
        fontFamily: "Font1"
      }
    },
    {
      id: 2,
      name: "Azienda Traslochi",
      url: "azienda_traslochi",
      category: "Traslochi",
      description: "Servizi di traslochi e trasporti per casa e ufficio.",
      coverImage: "/uploads/business/b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6f/cover-desktop.webp",
      profileImage: "/uploads/business/b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6f/profile.webp",
      boardRef: "DEF456",
      boardTitle: "Trasloco Ufficio",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#262625",
        secondaryColor: "#1a1a19",
        accentColor: "#404040",
        backgroundColor: "#F5F5F5",
        textColor: "#333333",
        buttonBgColor: "#262625",
        buttonTextColor: "#FFFFFF",
        fontFamily: "Font1"
      }
    },
    {
      id: 3,
      name: "Digital Marketing Agency",
      url: "digital_marketing_agency",
      category: "Marketing Digitale",
      description: "Agenzia di marketing digitale e comunicazione strategica.",
      coverImage: "/uploads/business/5d6e7f8a-9b0c-1d2e-3f4a-5b6c7d8e9f0a/cover-desktop.webp",
      profileImage: "/uploads/business/5d6e7f8a-9b0c-1d2e-3f4a-5b6c7d8e9f0a/profile.webp",
      boardRef: "GHI789",
      boardTitle: "Campagna Social Media",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#8826ff",
        secondaryColor: "#6b1fcc",
        accentColor: "#a855f7",
        backgroundColor: "#212121",
        textColor: "#C4E8FF",
        buttonBgColor: "#8826ff",
        buttonTextColor: "#FFFFFF",
        fontFamily: "Font4"
      }
    },
    {
      id: 4,
      name: "Studio Commercialista",
      url: "studio_commercialista",
      category: "Consulenza",
      description: "Consulenza fiscale, bilanci, dichiarazioni e pianificazione.",
      coverImage: "/uploads/business/b8e2f3a4-5c6d-7e8f-9a0b-1c2d3e4f5a6b/cover-desktop.webp",
      profileImage: "/uploads/business/b8e2f3a4-5c6d-7e8f-9a0b-1c2d3e4f5a6b/profile.webp",
      boardRef: "JKL012",
      boardTitle: "Consulenza Fiscale",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#1E40AF",
        secondaryColor: "#1e3a8a",
        accentColor: "#3b82f6",
        backgroundColor: "#FFFFFF",
        textColor: "#0B0B0B",
        buttonBgColor: "#1E40AF",
        buttonTextColor: "#FFFFFF",
        fontFamily: "Font3"
      }
    }
  ],
  en: [
    {
      id: 1,
      name: "Construction Company",
      url: "azienda_edilizia",
      category: "Construction",
      description: "Construction and renovation services for home and office.",
      coverImage: "/uploads/business/e1f2a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b/cover-desktop.webp",
      profileImage: "/uploads/business/e1f2a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b/profile.webp",
      boardRef: "ABC123",
      boardTitle: "Home Renovation",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#262625",
        secondaryColor: "#1a1a19",
        accentColor: "#404040",
        backgroundColor: "#F5F5F5",
        textColor: "#333333",
        buttonBgColor: "#262625",
        buttonTextColor: "#FFFFFF",
        fontFamily: "Font1"
      }
    },
    {
      id: 2,
      name: "Moving Company",
      url: "azienda_traslochi",
      category: "Moving Services",
      description: "Moving and transport services for home and office.",
      coverImage: "/uploads/business/b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6f/cover-desktop.webp",
      profileImage: "/uploads/business/b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6f/profile.webp",
      boardRef: "DEF456",
      boardTitle: "Office Relocation",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#262625",
        secondaryColor: "#1a1a19",
        accentColor: "#404040",
        backgroundColor: "#F5F5F5",
        textColor: "#333333",
        buttonBgColor: "#262625",
        buttonTextColor: "#FFFFFF",
        fontFamily: "Font1"
      }
    },
    {
      id: 3,
      name: "Digital Marketing Agency",
      url: "digital_marketing_agency",
      category: "Digital Marketing",
      description: "Digital marketing agency and strategic communication.",
      coverImage: "/uploads/business/5d6e7f8a-9b0c-1d2e-3f4a-5b6c7d8e9f0a/cover-desktop.webp",
      profileImage: "/uploads/business/5d6e7f8a-9b0c-1d2e-3f4a-5b6c7d8e9f0a/profile.webp",
      boardRef: "GHI789",
      boardTitle: "Social Media Campaign",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#8826ff",
        secondaryColor: "#6b1fcc",
        accentColor: "#a855f7",
        backgroundColor: "#212121",
        textColor: "#C4E8FF",
        buttonBgColor: "#8826ff",
        buttonTextColor: "#FFFFFF",
        fontFamily: "Font2"
      }
    },
    {
      id: 4,
      name: "Accounting Studio",
      url: "studio_commercialista",
      category: "Consulting",
      description: "Tax consulting, financial statements, declarations and planning.",
      coverImage: "/uploads/business/b8e2f3a4-5c6d-7e8f-9a0b-1c2d3e4f5a6b/cover-desktop.webp",
      profileImage: "/uploads/business/b8e2f3a4-5c6d-7e8f-9a0b-1c2d3e4f5a6b/profile.webp",
      boardRef: "JKL012",
      boardTitle: "Tax Consultation",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#1E40AF",
        secondaryColor: "#1e3a8a",
        accentColor: "#3b82f6",
        backgroundColor: "#FFFFFF",
        textColor: "#0B0B0B",
        buttonBgColor: "#1E40AF",
        buttonTextColor: "#FFFFFF",
        fontFamily: "Font3"
      }
    }
  ],
  es: [
    {
      id: 1,
      name: "Empresa de Construcción",
      url: "azienda_edilizia",
      category: "Construcción",
      description: "Servicios de construcción y renovación para hogar y oficina.",
      coverImage: "/uploads/business/e1f2a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b/cover-desktop.webp",
      profileImage: "/uploads/business/e1f2a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b/profile.webp",
      boardRef: "ABC123",
      boardTitle: "Renovación Hogar",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#262625",
        secondaryColor: "#1a1a19",
        accentColor: "#404040",
        backgroundColor: "#F5F5F5",
        textColor: "#333333",
        buttonBgColor: "#262625",
        buttonTextColor: "#FFFFFF",
        fontFamily: "Font1"
      }
    },
    {
      id: 2,
      name: "Empresa de Mudanzas",
      url: "azienda_traslochi",
      category: "Mudanzas",
      description: "Servicios de mudanzas y transporte para hogar y oficina.",
      coverImage: "/uploads/business/b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6f/cover-desktop.webp",
      profileImage: "/uploads/business/b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6f/profile.webp",
      boardRef: "DEF456",
      boardTitle: "Traslado Oficina",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#262625",
        secondaryColor: "#1a1a19",
        accentColor: "#404040",
        backgroundColor: "#F5F5F5",
        textColor: "#333333",
        buttonBgColor: "#262625",
        buttonTextColor: "#FFFFFF",
        fontFamily: "Font1"
      }
    },
    {
      id: 3,
      name: "Agencia de Marketing Digital",
      url: "digital_marketing_agency",
      category: "Marketing Digital",
      description: "Agencia de marketing digital y comunicación estratégica.",
      coverImage: "/uploads/business/5d6e7f8a-9b0c-1d2e-3f4a-5b6c7d8e9f0a/cover-desktop.webp",
      profileImage: "/uploads/business/5d6e7f8a-9b0c-1d2e-3f4a-5b6c7d8e9f0a/profile.webp",
      boardRef: "GHI789",
      boardTitle: "Campaña Redes Sociales",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#8826ff",
        secondaryColor: "#6b1fcc",
        accentColor: "#a855f7",
        backgroundColor: "#212121",
        textColor: "#C4E8FF",
        buttonBgColor: "#8826ff",
        buttonTextColor: "#FFFFFF",
        fontFamily: "Font2"
      }
    },
    {
      id: 4,
      name: "Estudio Contable",
      url: "studio_commercialista",
      category: "Consultoría",
      description: "Consultoría fiscal, balances, declaraciones y planificación.",
      coverImage: "/uploads/business/b8e2f3a4-5c6d-7e8f-9a0b-1c2d3e4f5a6b/cover-desktop.webp",
      profileImage: "/uploads/business/b8e2f3a4-5c6d-7e8f-9a0b-1c2d3e4f5a6b/profile.webp",
      boardRef: "JKL012",
      boardTitle: "Consultoría Fiscal",
      socialLinks: [
        { type: 'facebook', icon: '/icons/links-icons/facebook.svg', url: '#' },
        { type: 'instagram', icon: '/icons/links-icons/instagram.svg', url: '#' },
        { type: 'tiktok', icon: '/icons/links-icons/tiktok.svg', url: '#' },
        { type: 'web', icon: '/icons/links-icons/google.svg', url: '#' }
      ],
      theme: {
        primaryColor: "#1E40AF",
        secondaryColor: "#1e3a8a",
        accentColor: "#3b82f6",
        backgroundColor: "#FFFFFF",
        textColor: "#0B0B0B",
        buttonBgColor: "#1E40AF",
        buttonTextColor: "#FFFFFF",
        fontFamily: "Font3"
      }
    }
  ]
};



export default function SectionBoard({ locale }) {

    const t = useTranslations('Landing');

    const tCommon = useTranslations('Common');

    const [currentBusinessIndex, setCurrentBusinessIndex] = useState(0);

    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const [timeRemaining, setTimeRemaining] = useState(3000); // 3 seconds in milliseconds
    const [scrollProgress, setScrollProgress] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const sectionRef = useRef(null);

    

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

    // Screen size detection
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 1024); // lg breakpoint is 1024px
        };

        checkScreenSize(); // Initial check
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Scroll detection for horizontal movement effect (mobile only)
    useEffect(() => {
        const handleScroll = () => {
            if (!sectionRef.current || !isMobile) {
                setScrollProgress(0);
                return;
            }

            const section = sectionRef.current;
            const rect = section.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // Calculate scroll progress within the section
            // When section is fully visible, progress is 0
            // When section starts to leave view, progress increases
            const sectionTop = rect.top;
            const sectionHeight = rect.height;
            
            // Only apply effect when section is in view
            if (sectionTop < windowHeight && sectionTop + sectionHeight > 0) {
                // Calculate progress: 0 when section is at top, 1 when section is at bottom
                // Start movement earlier by reducing the early start offset
                const progress = Math.max(0, Math.min(1, (windowHeight - sectionTop - 500) / (windowHeight + sectionHeight - 700)));
                setScrollProgress(progress);
            } else {
                setScrollProgress(0);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial call

        return () => window.removeEventListener('scroll', handleScroll);
    }, [isMobile]);



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

        <section ref={sectionRef} className="min-h-screen bg-white flex items-center overflow-x-hidden">

            <div className="container mx-auto px-6 py-16 max-w-[1300px]">

                <div className="flex flex-col gap-12 items-center">

                    

                    {/* Top Row - Content */}

                     <div className="space-y-6 max-w-[1000px] text-center">

                         <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">

                             {renderTitleWithItalic(t('Board.title'))}

                         </h1>

                         <p className="text-md lg:text-lg text-gray-600 leading-tight lg:leading-relaxed">

                             {t('Board.description')}

                         </p>

                     </div>






                    {/* Service Board Benefits Cards */}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 lg:gap-6 max-w-6xl mx-auto">

                       

                       {/* Unified View */}

                       <div className="bg-white rounded-2xl p-4 md:p-5 lg:p-6 border border-gray-100 md:col-span-2 lg:col-span-1">

                            <div className="flex flex-col items-center text-center space-y-4">

                                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">

                                    <svg className="w-8 h-8 lg:w-10 lg:h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">

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

                            <div className="flex flex-col items-center text-center space-y-4">

                                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">

                                    <svg className="w-8 h-8 lg:w-10 lg:h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />

                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />

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

                            <div className="flex flex-col items-center text-center space-y-4">

                                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">

                                    <svg className="w-8 h-8 lg:w-10 lg:h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">

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

                            <div className="flex flex-col items-center text-center space-y-4">

                                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">

                                    <svg className="w-8 h-8 lg:w-10 lg:h-10 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">

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

                            <div className="flex flex-col items-center text-center space-y-4">

                                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">

                                    <svg className="w-8 h-8 lg:w-10 lg:h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">

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

                            <div className="flex flex-col items-center text-center space-y-4">

                                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">

                                    <svg className="w-8 h-8 lg:w-10 lg:h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">

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



                    {/* Service Board Screenshots Carousel */}
                    <div className="relative">

                        {/* Gradient Container */}
                        <div 
                            className="rounded-3xl p-8 lg:p-12 overflow-hidden"
                            style={{
                                background: 'linear-gradient(to bottom, #374151, #4b5563, #111827)',
                                border: '4px solid transparent',
                                backgroundImage: 'linear-gradient(to bottom, #374151, #4b5563, #111827), linear-gradient(to right, #60a5fa, #8b5cf6, #ec4899, #f59e0b, #10b981, #3b82f6)',
                                backgroundOrigin: 'border-box',
                                backgroundClip: 'padding-box, border-box'
                            }}
                        >
                            <div className="backdrop-blur-sm rounded-3xl p-8 lg:p-12">
                        {/* Desktop and Smartphone Views */}

                                <div className="relative flex flex-col lg:flex-row justify-center items-center gap-8 lg:gap-12">
                                    {/* Mobile Service Board Screenshot */}
                                    <div className="relative z-20 flex items-center">
                                        <ServiceBoardScreenshot 
                                            business={currentBusiness}
                                            variant="mobile"
                                            className="shadow-2xl"
                                        />
                            </div>



                                    {/* Desktop Service Board Screenshot */}
                                    <div className="relative z-10 max-w-7xl overflow-visible w-full">
                                        <div 
                                            className="shadow-2xl transition-transform duration-100 ease-out md:transform-none md:scale-100"
                                            style={{
                                                // Apply horizontal movement and scaling only on mobile (xs to md) with faster movement
                                                // Start positioned to the right, then move left as user scrolls
                                                // Use cubic-bezier for rounder movement curve
                                                // Only apply transform on mobile screens
                                                transform: isMobile 
                                                    ? `translateX(${1400 + Math.pow(scrollProgress, 0.7) * -1700}px) scale(0.75)`
                                                    : 'translateX(0px) scale(1)',
                                            }}
                                        >
                                            <ServiceBoardScreenshot 
                                                business={currentBusiness}
                                                variant="desktop"
                                                className=""
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Board Pill Link Example */}
                                <div className="flex justify-center mt-8">
                                    <div className="w-full max-w-[90vw] lg:w-[500px] inline-flex items-center gap-2 rounded-full px-3 lg:px-4 py-2 lg:py-2 border border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200">
                                        <div className="flex items-center gap-1 min-w-0 flex-1">
                                            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 text-gray-600">
                                                <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
                                                <ellipse cx="10" cy="10" rx="4" ry="9" stroke="currentColor" strokeWidth="2" />
                                                <line x1="1" y1="10" x2="19" y2="10" stroke="currentColor" strokeWidth="2" />
                                                <line x1="10" y1="1" x2="10" y2="19" stroke="currentColor" strokeWidth="2" />
                                            </svg>
                                            <span className="text-white/80 font-medium text-xs lg:text-sm">{tCommon('domainPrefix')}</span>
                                            <span className="text-white font-semibold -ml-1 text-xs lg:text-sm">{currentBusiness.url}</span>
                                            <span className="text-white/80 truncate -ml-1 text-xs lg:text-sm">/s/{currentBusiness.boardRef}</span>
                                        </div>
                                        <Link 
                                            href={`/${locale}/${currentBusiness.url}/s/${currentBusiness.boardRef}`}
                                            className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-2 py-1 lg:px-3 lg:py-1.5 rounded-full text-xs font-medium transition-colors flex-shrink-0"
                                        >
                                            <span className="hidden lg:inline">{t('viewExample')}</span>
                                            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </Link>
                                    </div>
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

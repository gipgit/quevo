// components/landing/SectionHero.jsx
'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import BusinessProfileScreenshot from './BusinessProfileScreenshot';

// Example businesses data based on actual database entries
const exampleBusinesses = {
  it: [
    {
      id: 1,
      name: "Traslochi Express",
      url: "traslochi_express",
      category: "Traslochi",
      description: "Servizi rapidi di traslochi.",
      coverImage: "/uploads/business/11223344-5566-7788-9900-aabbccddeeff/cover-desktop.webp",
      profileImage: "/uploads/business/11223344-5566-7788-9900-aabbccddeeff/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/facebook.png', url: '#' },
        { type: 'instagram', icon: '/icons/instagram.svg', url: '#' },
        { type: 'web', icon: '/icons/web.png', url: '#' }
      ],
      theme: {
        primaryColor: "#3B82F6", // Blue
        secondaryColor: "#1E40AF", // Darker blue
        accentColor: "#60A5FA", // Light blue
        backgroundColor: "#F8FAFC", // Light gray
        textColor: "#374151", // Neutral dark gray
        buttonBgColor: "#3B82F6", // Blue
        buttonTextColor: "#FFFFFF", // White
        fontFamily: "Inter"
      }
    },
    {
      id: 2,
      name: "Edilizia Premium",
      url: "edilizia_premium",
      category: "Edilizia",
      description: "Ristrutturazioni e costruzioni di qualità.",
      coverImage: "/uploads/business/e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b/cover-desktop.webp",
      profileImage: "/uploads/business/e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/facebook.png', url: '#' },
        { type: 'instagram', icon: '/icons/instagram.svg', url: '#' },
        { type: 'web', icon: '/icons/web.png', url: '#' }
      ],
      theme: {
        primaryColor: "#059669", // Green
        secondaryColor: "#047857", // Darker green
        accentColor: "#10B981", // Light green
        backgroundColor: "#F0FDF4", // Light green
        textColor: "#374151", // Neutral dark gray
        buttonBgColor: "#059669", // Green
        buttonTextColor: "#FFFFFF", // White
        fontFamily: "Poppins"
      }
    },
    {
      id: 3,
      name: "Digital Marketing Solutions",
      url: "digital_marketing_solutions",
      category: "Marketing Digitale",
      description: "Agenzia di marketing digitale e comunicazione strategica.",
      coverImage: "/uploads/business/5d6e7f8a-9b0c-1d2e-3f4a-5b6c7d8e9f0a/cover-desktop.webp",
      profileImage: "/uploads/business/5d6e7f8a-9b0c-1d2e-3f4a-5b6c7d8e9f0a/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/facebook.png', url: '#' },
        { type: 'instagram', icon: '/icons/instagram.svg', url: '#' },
        { type: 'web', icon: '/icons/web.png', url: '#' }
      ],
      theme: {
        primaryColor: "#8B5CF6", // Purple
        secondaryColor: "#7C3AED", // Darker purple
        accentColor: "#A78BFA", // Light purple
        backgroundColor: "#FAF5FF", // Light purple
        textColor: "#374151", // Neutral dark gray
        buttonBgColor: "#8B5CF6", // Purple
        buttonTextColor: "#FFFFFF", // White
        fontFamily: "Roboto"
      }
    },
    {
      id: 4,
      name: "Agenzia Immobiliare Roma",
      url: "agenzia_immobiliare_roma",
      category: "Immobiliare",
      description: "Servizi immobiliari completi a Roma.",
      coverImage: "/uploads/business/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e/cover-desktop.webp",
      profileImage: "/uploads/business/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/facebook.png', url: '#' },
        { type: 'instagram', icon: '/icons/instagram.svg', url: '#' },
        { type: 'web', icon: '/icons/web.png', url: '#' }
      ],
      theme: {
        primaryColor: "#DC2626", // Red
        secondaryColor: "#B91C1C", // Darker red
        accentColor: "#EF4444", // Light red
        backgroundColor: "#FEF2F2", // Light red
        textColor: "#374151", // Neutral dark gray
        buttonBgColor: "#DC2626", // Red
        buttonTextColor: "#FFFFFF", // White
        fontFamily: "Open Sans"
      }
    },
    {
      id: 5,
      name: "Concessionaria Auto Milano",
      url: "concessionaria_auto_milano",
      category: "Auto",
      description: "Auto nuove e usate delle migliori marche.",
      coverImage: "/uploads/business/33445566-7788-9900-1122-ddeeffaabbcc/cover-desktop.webp",
      profileImage: "/uploads/business/33445566-7788-9900-1122-ddeeffaabbcc/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/facebook.png', url: '#' },
        { type: 'instagram', icon: '/icons/instagram.svg', url: '#' },
        { type: 'web', icon: '/icons/web.png', url: '#' }
      ],
      theme: {
        primaryColor: "#F59E0B", // Amber
        secondaryColor: "#D97706", // Darker amber
        accentColor: "#FBBF24", // Light amber
        backgroundColor: "#FFFBEB", // Light amber
        textColor: "#374151", // Neutral dark gray
        buttonBgColor: "#1F2937", // Dark gray instead of amber
        buttonTextColor: "#FFFFFF", // White
        fontFamily: "Montserrat"
      }
    },
    {
      id: 6,
      name: "Studio Commercialista Roma",
      url: "studio_commercialista_roma",
      category: "Consulenza",
      description: "Consulenza fiscale e commerciale professionale.",
      coverImage: "/uploads/business/11223344-5566-7788-9900-aabbccddeeff/cover-desktop.webp",
      profileImage: "/uploads/business/11223344-5566-7788-9900-aabbccddeeff/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/facebook.png', url: '#' },
        { type: 'instagram', icon: '/icons/instagram.svg', url: '#' },
        { type: 'web', icon: '/icons/web.png', url: '#' }
      ],
      theme: {
        primaryColor: "#6B7280", // Gray
        secondaryColor: "#4B5563", // Darker gray
        accentColor: "#9CA3AF", // Light gray
        backgroundColor: "#F9FAFB", // Light gray
        textColor: "#374151", // Neutral dark gray
        buttonBgColor: "#6B7280", // Gray
        buttonTextColor: "#FFFFFF", // White
        fontFamily: "Source Sans Pro"
      }
    },
    {
      id: 7,
      name: "Centro Medicina Estetica",
      url: "centro_medicina_estetica",
      category: "Salute",
      description: "Trattamenti di medicina estetica avanzati.",
      coverImage: "/uploads/business/f8a5c3b9-1e7d-4c0a-9d2e-0f1a2b3c4d5e/cover-desktop.webp",
      profileImage: "/uploads/business/f8a5c3b9-1e7d-4c0a-9d2e-0f1a2b3c4d5e/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/facebook.png', url: '#' },
        { type: 'instagram', icon: '/icons/instagram.svg', url: '#' },
        { type: 'web', icon: '/icons/web.png', url: '#' }
      ],
      theme: {
        primaryColor: "#EC4899", // Pink
        secondaryColor: "#BE185D", // Darker pink
        accentColor: "#F472B6", // Light pink
        backgroundColor: "#FDF2F8", // Light pink
        textColor: "#374151", // Neutral dark gray
        buttonBgColor: "#1F2937", // Dark gray instead of pink
        buttonTextColor: "#FFFFFF", // White
        fontFamily: "Lato"
      }
    },
    {
      id: 8,
      name: "Ristorante Italiano",
      url: "ristorante_italiano",
      category: "Ristorazione",
      description: "Cucina tradizionale italiana di qualità.",
      coverImage: "/uploads/business/7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b/cover-desktop.webp",
      profileImage: "/uploads/business/7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/facebook.png', url: '#' },
        { type: 'instagram', icon: '/icons/instagram.svg', url: '#' },
        { type: 'web', icon: '/icons/web.png', url: '#' }
      ],
      theme: {
        primaryColor: "#16A34A", // Green
        secondaryColor: "#15803D", // Darker green
        accentColor: "#22C55E", // Light green
        backgroundColor: "#F0FDF4", // Light green
        textColor: "#374151", // Neutral dark gray
        buttonBgColor: "#16A34A", // Green
        buttonTextColor: "#FFFFFF", // White
        fontFamily: "Playfair Display"
      }
    }
  ],
  en: [
    {
      id: 1,
      name: "Express Moving Services",
      url: "traslochi_express",
      category: "Moving Services",
      description: "Fast moving services.",
      coverImage: "/uploads/business/11223344-5566-7788-9900-aabbccddeeff/cover-desktop.webp",
      profileImage: "/uploads/business/11223344-5566-7788-9900-aabbccddeeff/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/facebook.png', url: '#' },
        { type: 'instagram', icon: '/icons/instagram.svg', url: '#' },
        { type: 'web', icon: '/icons/web.png', url: '#' }
      ],
      theme: {
        primaryColor: "#3B82F6", // Blue
        secondaryColor: "#1E40AF", // Darker blue
        accentColor: "#60A5FA", // Light blue
        backgroundColor: "#F8FAFC", // Light gray
        textColor: "#374151", // Neutral dark gray
        buttonBgColor: "#3B82F6", // Blue
        buttonTextColor: "#FFFFFF", // White
        fontFamily: "Inter"
      }
    },
    {
      id: 2,
      name: "Premium Construction",
      url: "edilizia_premium",
      category: "Construction",
      description: "Quality renovations and constructions.",
      coverImage: "/uploads/business/e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b/cover-desktop.webp",
      profileImage: "/uploads/business/e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/facebook.png', url: '#' },
        { type: 'instagram', icon: '/icons/instagram.svg', url: '#' },
        { type: 'web', icon: '/icons/web.png', url: '#' }
      ]
    },
    {
      id: 3,
      name: "Digital Marketing Solutions",
      url: "digital_marketing_solutions",
      category: "Digital Marketing",
      description: "Digital marketing agency and strategic communication.",
      coverImage: "/uploads/business/5d6e7f8a-9b0c-1d2e-3f4a-5b6c7d8e9f0a/cover-desktop.webp",
      profileImage: "/uploads/business/5d6e7f8a-9b0c-1d2e-3f4a-5b6c7d8e9f0a/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/facebook.png', url: '#' },
        { type: 'instagram', icon: '/icons/instagram.svg', url: '#' },
        { type: 'web', icon: '/icons/web.png', url: '#' }
      ]
    },
    {
      id: 4,
      name: "Roma Real Estate Agency",
      url: "agenzia_immobiliare_roma",
      category: "Real Estate",
      description: "Complete real estate services in Rome.",
      coverImage: "/uploads/business/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e/cover-desktop.webp",
      profileImage: "/uploads/business/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/facebook.png', url: '#' },
        { type: 'instagram', icon: '/icons/instagram.svg', url: '#' },
        { type: 'web', icon: '/icons/web.png', url: '#' }
      ]
    },
    {
      id: 6,
      name: "Milan Auto Dealership",
      url: "concessionaria_auto_milano",
      category: "Automotive",
      description: "New and used cars from the best brands.",
      coverImage: "/uploads/business/33445566-7788-9900-1122-ddeeffaabbcc/cover-desktop.webp",
      profileImage: "/uploads/business/33445566-7788-9900-1122-ddeeffaabbcc/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/facebook.png', url: '#' },
        { type: 'instagram', icon: '/icons/instagram.svg', url: '#' },
        { type: 'web', icon: '/icons/web.png', url: '#' }
      ]
    },
    {
      id: 7,
      name: "Roma Accounting Studio",
      url: "studio_commercialista_roma",
      category: "Consulting",
      description: "Professional tax and business consulting.",
      coverImage: "/uploads/business/11223344-5566-7788-9900-aabbccddeeff/cover-desktop.webp",
      profileImage: "/uploads/business/11223344-5566-7788-9900-aabbccddeeff/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/facebook.png', url: '#' },
        { type: 'instagram', icon: '/icons/instagram.svg', url: '#' },
        { type: 'web', icon: '/icons/web.png', url: '#' }
      ]
    },
    {
      id: 8,
      name: "Aesthetic Medicine Center",
      url: "centro_medicina_estetica",
      category: "Health",
      description: "Advanced aesthetic medicine treatments.",
      coverImage: "/uploads/business/f8a5c3b9-1e7d-4c0a-9d2e-0f1a2b3c4d5e/cover-desktop.webp",
      profileImage: "/uploads/business/f8a5c3b9-1e7d-4c0a-9d2e-0f1a2b3c4d5e/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/facebook.png', url: '#' },
        { type: 'instagram', icon: '/icons/instagram.svg', url: '#' },
        { type: 'web', icon: '/icons/web.png', url: '#' }
      ]
    }
  ],
  es: [
    {
      id: 1,
      name: "Traslados Express",
      url: "traslochi_express",
      category: "Traslados",
      description: "Servicios rápidos de mudanza.",
      coverImage: "/uploads/business/11223344-5566-7788-9900-aabbccddeeff/cover-desktop.webp",
      profileImage: "/uploads/business/11223344-5566-7788-9900-aabbccddeeff/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/facebook.png', url: '#' },
        { type: 'instagram', icon: '/icons/instagram.svg', url: '#' },
        { type: 'web', icon: '/icons/web.png', url: '#' }
      ]
    },
    {
      id: 2,
      name: "Construcción Premium",
      url: "edilizia_premium",
      category: "Construcción",
      description: "Renovaciones y construcciones de calidad.",
      coverImage: "/uploads/business/e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b/cover-desktop.webp",
      profileImage: "/uploads/business/e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/facebook.png', url: '#' },
        { type: 'instagram', icon: '/icons/instagram.svg', url: '#' },
        { type: 'web', icon: '/icons/web.png', url: '#' }
      ]
    },
    {
      id: 3,
      name: "Soluciones de Marketing Digital",
      url: "digital_marketing_solutions",
      category: "Marketing Digital",
      description: "Agencia de marketing digital y comunicación estratégica.",
      coverImage: "/uploads/business/5d6e7f8a-9b0c-1d2e-3f4a-5b6c7d8e9f0a/cover-desktop.webp",
      profileImage: "/uploads/business/5d6e7f8a-9b0c-1d2e-3f4a-5b6c7d8e9f0a/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/facebook.png', url: '#' },
        { type: 'instagram', icon: '/icons/instagram.svg', url: '#' },
        { type: 'web', icon: '/icons/web.png', url: '#' }
      ]
    },
    {
      id: 4,
      name: "Agencia Inmobiliaria Roma",
      url: "agenzia_immobiliare_roma",
      category: "Inmobiliaria",
      description: "Servicios inmobiliarios completos en Roma.",
      coverImage: "/uploads/business/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e/cover-desktop.webp",
      profileImage: "/uploads/business/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/facebook.png', url: '#' },
        { type: 'instagram', icon: '/icons/instagram.svg', url: '#' },
        { type: 'web', icon: '/icons/web.png', url: '#' }
      ]
    },
    {
      id: 5,
      name: "Concesionario Auto Milán",
      url: "concessionaria_auto_milano",
      category: "Automóviles",
      description: "Autos nuevos y usados de las mejores marcas.",
      coverImage: "/uploads/business/33445566-7788-9900-1122-ddeeffaabbcc/cover-desktop.webp",
      profileImage: "/uploads/business/33445566-7788-9900-1122-ddeeffaabbcc/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/facebook.png', url: '#' },
        { type: 'instagram', icon: '/icons/instagram.svg', url: '#' },
        { type: 'web', icon: '/icons/web.png', url: '#' }
      ]
    },
    {
      id: 6,
      name: "Estudio Contable Roma",
      url: "studio_commercialista_roma",
      category: "Consultoría",
      description: "Consultoría fiscal y comercial profesional.",
      coverImage: "/uploads/business/11223344-5566-7788-9900-aabbccddeeff/cover-desktop.webp",
      profileImage: "/uploads/business/11223344-5566-7788-9900-aabbccddeeff/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/facebook.png', url: '#' },
        { type: 'instagram', icon: '/icons/instagram.svg', url: '#' },
        { type: 'web', icon: '/icons/web.png', url: '#' }
      ]
    },
    {
      id: 7,
      name: "Centro de Medicina Estética",
      url: "centro_medicina_estetica",
      category: "Salud",
      description: "Tratamientos avanzados de medicina estética.",
      coverImage: "/uploads/business/f8a5c3b9-1e7d-4c0a-9d2e-0f1a2b3c4d5e/cover-desktop.webp",
      profileImage: "/uploads/business/f8a5c3b9-1e7d-4c0a-9d2e-0f1a2b3c4d5e/profile.webp",
      socialLinks: [
        { type: 'facebook', icon: '/icons/facebook.png', url: '#' },
        { type: 'instagram', icon: '/icons/instagram.svg', url: '#' },
        { type: 'web', icon: '/icons/web.png', url: '#' }
      ]
    }
  ]
};

export default function SectionHero({ locale }) {
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
                                   cleanWord === 'grows' ||
                                   cleanWord === 'grow' ||
                                   cleanWord === 'growing' ||
                                   cleanWord === 'evolving' ||
                                   cleanWord === 'evolve' ||
                                   cleanWord === 'adapts' ||
                                   cleanWord === 'adapt' ||
                                   cleanWord === 'amplify' ||
                                   cleanWord === 'amplifies' ||
                                   cleanWord === 'intelligent' ||
                                   cleanWord === 'automation' ||
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
                // Start movement later by reducing the early start offset
                const progress = Math.max(0, Math.min(1, (windowHeight - sectionTop - 100) / (windowHeight + sectionHeight - 200)));
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

    return (
        <section ref={sectionRef} className="min-h-screen flex items-center" style={{
          background: 'radial-gradient(circle at center 150%, #fefefe 0%, #fafafa 50%, #f5f5f5 70%, #ffffff 85%)'
        }}>
            <div className="container mx-auto px-12 py-16 max-w-[1480px]">
                <div className="flex flex-col gap-12 items-center">
                    
                    {/* Top Row - Content */}
                     <div className="space-y-6 max-w-[1000px] text-center">
                         <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-none mb-6">
                             <em className="text-blue-600">AI-Powered</em> {renderTextWithItalic("Business Platform That Grows With You")}
                         </h1>
                         <p className="text-lg text-gray-600 leading-tight lg:leading-relaxed">
                             {renderTextWithItalic("Simplify complex service interactions and amplify your marketing with intelligent automation. From customer guidance and support to AI-generated content and evolving features - your business platform adapts and grows with your needs.")}
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

                    {/* Bottom Column - Carousel with Gradient Background */}
                    <div className="relative">
                        {/* Gradient Background Container */}
                        <div className="relative rounded-3xl p-8 lg:p-12 overflow-hidden" style={{
                          background: 'linear-gradient(135deg, #1f2937 0%, #374151 20%, #4b5563 40%, #6b7280 60%, #9ca3af 80%, #1f2937 100%)'
                        }}>
                          {/* Subtle overlay for better readability */}
                          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                          
                          {/* Content Container */}
                          <div className="relative z-10">
                        {/* Desktop and Smartphone Views */}
                        <div className="relative flex flex-col lg:flex-row justify-center lg:items-center gap-4">
                            {/* Smartphone View */}
                            <div className="relative z-20 -left-1 flex justify-center items-center">
                                    <div className="shadow-[0_20px_40px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.1)] rounded-3xl">
                                        <BusinessProfileScreenshot 
                                            business={currentBusiness}
                                            variant="mobile"
                                        />
                                    </div>
                            </div>
                            {/* Desktop View */}
                            <div className="relative z-10 w-full max-w-9xl overflow-visible">
                                    <div 
                                        className="shadow-[0_25px_50px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.1)] rounded-2xl transition-transform duration-100 ease-out md:transform-none md:scale-100"
                                        style={{
                                            // Apply horizontal movement and scaling only on mobile (xs to md) with faster movement
                                            // Start positioned to the right, then move left as user scrolls
                                            // Use cubic-bezier for rounder movement curve
                                            // Only apply transform on mobile screens
                                            transform: isMobile 
                                                ? `translateX(${1200 + Math.pow(scrollProgress, 0.7) * -2000}px) scale(0.75)`
                                                : 'translateX(0px) scale(1)',
                                        }}
                                    >
                                        <BusinessProfileScreenshot 
                                            business={currentBusiness}
                                            variant="desktop"
                                        />
                                    </div>
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
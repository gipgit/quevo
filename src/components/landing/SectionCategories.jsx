// components/landing/SectionCategories.jsx
'use client'; // Needs client-side interactivity for parallax effect

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

export default function SectionCategories() {
    const t = useTranslations('Landing');
    const parallaxSectionRef = useRef(null); // Ref for the whole section
    const imageRefs = useRef([]);            // Array to store refs for all parallax images

    // Helper to add refs to the image elements
    const addImageRef = (el) => {
        if (el && !imageRefs.current.includes(el)) {
            imageRefs.current.push(el);
        }
    };

    useEffect(() => {
        const section = parallaxSectionRef.current;
        const images = imageRefs.current;

        if (!section || images.length === 0) {
            console.warn("SectionBusinessCategoriesParallax: Missing required DOM elements.");
            return;
        }

        const handleScroll = () => {
            const sectionRect = section.getBoundingClientRect();
            // Calculate scroll progress within the section's viewport visibility
            // 0 when section top is at viewport bottom, 1 when section bottom is at viewport top
            const viewportHeight = window.innerHeight;
            const scrollStart = sectionRect.top + sectionRect.height;
            const scrollEnd = sectionRect.top;

            // Normalize scroll to a 0-1 range based on section visibility
            // This can be adjusted based on desired parallax speed and entry/exit points
            let scrollProgress = (viewportHeight - sectionRect.top) / (viewportHeight + sectionRect.height);
            scrollProgress = Math.max(0, Math.min(1, scrollProgress)); // Clamp between 0 and 1

            // Apply parallax based on scrollProgress
            images.forEach((img, index) => {
                // Different speeds for a layered parallax effect
                // Adjust multipliers as needed for desired effect
                const speed = (index + 1) * 20; // Example: images further down move faster
                const translateY = (scrollProgress - 0.5) * speed; // Center the movement around 0

                img.style.transform = `translate3d(0, ${translateY}px, 0)`;
            });
        };

        // Attach scroll listener
        window.addEventListener('scroll', handleScroll);
        // Run once on mount to set initial positions
        handleScroll();

        // Cleanup: Remove event listener when component unmounts
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []); // Empty dependency array means this effect runs once after initial render

    return (
        <section className="container-x-lg py-8 lg:py-8 bg-gray-50" ref={parallaxSectionRef}>
            <div className="d-flex flex-col lg:flex-row gap-4 lg:gap-8 items-center">
                <div className="flex-grow flex-basis-80 text-center mx-auto" style={{ maxWidth: '600px' }}>
                    <p className="font-bold text-2xl lg:text-3xl mb-3 text-center">{t('Categories.title')}</p>
                    <p className="lg:text-md text-center">{t('Categories.subtitle')}</p>
                </div>

                <div className="flex-shrink categories-parallax-section" style={{ maxWidth: '100%' }}>
                    {/* Parallax Images */}
                    <img src="/assets/images/landing/hero/1.webp" alt="1" className="categories-parallax-image image-1" ref={addImageRef} />
                    <img src="/assets/images/landing/hero/2.webp" alt="2" className="categories-parallax-image image-2" ref={addImageRef} />
                    <img src="/assets/images/landing/hero/3.webp" alt="3" className="categories-parallax-image image-3" ref={addImageRef} />
                    <img src="/assets/images/landing/hero/4.webp" alt="4" className="categories-parallax-image image-4" ref={addImageRef} />
                    <img src="/assets/images/landing/hero/5.webp" alt="5" className="categories-parallax-image image-5" ref={addImageRef} />
                    <img src="/assets/images/landing/hero/6.webp" alt="6" className="categories-parallax-image image-6" ref={addImageRef} />
                    <img src="/assets/images/landing/hero/7.webp" alt="7" className="categories-parallax-image image-7" ref={addImageRef} />
                    <img src="/assets/images/landing/hero/8.webp" alt="8" className="categories-parallax-image image-8" ref={addImageRef} />

                    {/* Business Categories Lists */}
                    <div className="pill-list-section-wrapper">
                        <p className="business-examples-category text-center">Bellezza e Benessere:</p>
                        <div className="business-examples-scroll-container">
                            <ul className="pill-list">
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Saloni di parrucchieri</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Barber shop</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Saloni di bellezza/unghie</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Spa</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Massaggiatori</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Estetisti</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Tatuatori</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Agopunturisti</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Chiropratici</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Terapisti/Psicologi</li>
                            </ul>
                        </div>
                    </div>

                    <div className="pill-list-section-wrapper">
                        <p className="business-examples-category text-center">Fitness e Salute:</p>
                        <div className="business-examples-scroll-container">
                            <ul className="pill-list">
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Personal trainer</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Studi di yoga</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Studi di pilates</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Scuole di danza</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Palestre (per lezioni o sessioni di personal training)</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Nutrizionisti/Dietologi</li>
                            </ul>
                        </div>
                    </div>

                    <div className="pill-list-section-wrapper">
                        <p className="business-examples-category text-center">Servizi:</p>
                        <div className="business-examples-scroll-container">
                            <ul className="pill-list">
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Consulenti (aziendali, marketing, life coaching, ecc.)</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Fotografi</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Tutor / Insegnanti Privati</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Meccanici / Officine (per appuntamenti)</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Servizi di Edilizia e Ristrutturazione</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Servizi di Pulizia</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Artigiani/Impresari (per consultazioni/preventivi)</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Insegnanti/Scuole di arte, musica, danza</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Autoscuole</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Agenzie di viaggio</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Servizi di noleggio</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Chef Privato</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Babysitter</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Autolavaggi</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Lavanderie</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Sartorie</li>
                            </ul>
                        </div>
                    </div>

                    <div className="pill-list-section-wrapper">
                        <p className="business-examples-category text-center">Ristorazione:</p>
                        <div className="business-examples-scroll-container">
                            <ul className="pill-list">
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Caffetterie/Bar (per menu digitali e offerte speciali)</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Piccoli ristoranti/Bistrot (specialmente quelli con asporto/consegna)</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Food truck</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Pasticcerie (per torte personalizzate)</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Panetterie</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Gelaterie</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Negozi di alimentari</li>
                            </ul>
                        </div>
                    </div>

                    <div className="pill-list-section-wrapper">
                        <p className="business-examples-category text-center">Vendita al Dettaglio:</p>
                        <div className="business-examples-scroll-container">
                            <ul className="pill-list">
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Concessionarie Auto</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Agenzie di Viaggi</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Boutique (abbigliamento, regali, articoli per la casa)</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Fioristi</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Librerie</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Gioiellerie</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Gallerie d'arte (per esporre artisti/opere)</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Negozi di artigianato</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Negozi vintage</li>
                                <li className="border border-gray-100 px-3 py-1 text-sm rounded-full">Negozi di dischi</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
// components/landing/SectionBusinessCategoriesParallax.jsx
'use client'; // Needs client-side interactivity for parallax effect

import { useEffect, useRef } from 'react';

export default function SectionBusinessCategoriesParallax() {
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
        <section className="container-x-lg py-8 lg:py-8 bg-accent-azure" ref={parallaxSectionRef}>
            <div className="d-flex flex-col lg:flex-row gap-4 lg:gap-8 items-center">
                <div className="flex-grow flex-basis-80 text-center lg:text-left" style={{ minWidth: '50%' }}>
                    <p className="font-bold text-lg lg:text-xl mb-3">Pensato per tanti tipi di attività</p>
                    <p className="lg:text-md">Puoi usarlo in vari modi e c'è un piano sempre gratuito. Scopri come Queva può semplificare l'esperienza dei tuoi clienti, aiutarti a costruire la loro fedeltà e ricevere opinioni preziose direttamente da loro.</p>
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
                        <p className="business-examples-category">Bellezza e Benessere:</p>
                        <div className="business-examples-scroll-container">
                            <ul className="pill-list">
                                <li>Saloni di parrucchieri</li>
                                <li>Barber shop</li>
                                <li>Saloni di bellezza/unghie</li>
                                <li>Spa</li>
                                <li>Massaggiatori</li>
                                <li>Estetisti</li>
                                <li>Tatuatori</li>
                                <li>Agopunturisti</li>
                                <li>Chiropratici</li>
                                <li>Terapisti/Psicologi</li>
                            </ul>
                        </div>
                    </div>

                    <div className="pill-list-section-wrapper">
                        <p className="business-examples-category">Fitness e Salute:</p>
                        <div className="business-examples-scroll-container">
                            <ul className="pill-list">
                                <li>Personal trainer</li>
                                <li>Studi di yoga</li>
                                <li>Studi di pilates</li>
                                <li>Scuole di danza</li>
                                <li>Palestre (per lezioni o sessioni di personal training)</li>
                                <li>Nutrizionisti/Dietologi</li>
                            </ul>
                        </div>
                    </div>

                    <div className="pill-list-section-wrapper">
                        <p className="business-examples-category">Servizi:</p>
                        <div className="business-examples-scroll-container">
                            <ul className="pill-list">
                                <li>Consulenti (aziendali, marketing, life coaching, ecc.)</li>
                                <li>Fotografi</li>
                                <li>Tutor / Insegnanti Privati</li>
                                <li>Meccanici / Officine (per appuntamenti)</li>
                                <li>Servizi di Edilizia e Ristrutturazione</li>
                                <li>Servizi di Pulizia</li>
                                <li>Artigiani/Impresari (per consultazioni/preventivi)</li>
                                <li>Insegnanti/Scuole di arte, musica, danza</li>
                                <li>Autoscuole</li>
                                <li>Agenzie di viaggio</li>
                                <li>Servizi di noleggio</li>
                                <li>Chef Privato</li>
                                <li>Babysitter</li>
                                <li>Autolavaggi</li>
                                <li>Lavanderie</li>
                                <li>Sartorie</li>
                            </ul>
                        </div>
                    </div>

                    <div className="pill-list-section-wrapper">
                        <p className="business-examples-category">Ristorazione:</p>
                        <div className="business-examples-scroll-container">
                            <ul className="pill-list">
                                <li>Caffetterie/Bar (per menu digitali e offerte speciali)</li>
                                <li>Piccoli ristoranti/Bistrot (specialmente quelli con asporto/consegna)</li>
                                <li>Food truck</li>
                                <li>Pasticcerie (per torte personalizzate)</li>
                                <li>Panetterie</li>
                                <li>Gelaterie</li>
                                <li>Negozi di alimentari</li>
                            </ul>
                        </div>
                    </div>

                    <div className="pill-list-section-wrapper">
                        <p className="business-examples-category">Vendita al Dettaglio:</p>
                        <div className="business-examples-scroll-container">
                            <ul className="pill-list">
                                <li>Concessionarie Auto</li>
                                <li>Agenzie di Viaggi</li>
                                <li>Boutique (abbigliamento, regali, articoli per la casa)</li>
                                <li>Fioristi</li>
                                <li>Librerie</li>
                                <li>Gioiellerie</li>
                                <li>Gallerie d'arte (per esporre artisti/opere)</li>
                                <li>Negozi di artigianato</li>
                                <li>Negozi vintage</li>
                                <li>Negozi di dischi</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
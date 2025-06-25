// components/landing/SectionCta.jsx
'use client'; // Needs client-side interactivity for parallax effect

import { useEffect, useRef } from 'react';

export default function SectionCta() {
    const ctaSectionRef = useRef(null); // Ref for the main section to track its scroll position
    const ctaImageRef = useRef(null);   // Ref for the parallax image

    useEffect(() => {
        const section = ctaSectionRef.current;
        const image = ctaImageRef.current;

        if (!section || !image) {
            console.warn("SectionCta: Missing required DOM elements for parallax.");
            return;
        }

        const handleScroll = () => {
            const sectionRect = section.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // Calculate scroll progress within the section's viewport visibility
            // This setup makes the image move as the section scrolls into/out of view
            let scrollProgress = (viewportHeight - sectionRect.top) / (viewportHeight + sectionRect.height);
            scrollProgress = Math.max(0, Math.min(1, scrollProgress)); // Clamp between 0 and 1

            // Adjust the multiplier for the desired parallax speed.
            // A positive value will make it move down as you scroll down (appears fixed)
            // A negative value will make it move up as you scroll down (faster than scroll)
            const translateY = (scrollProgress - 0.5) * 80; // Example: 80px total movement

            image.style.transform = `translate3d(0, ${translateY}px, 0)`;
        };

        // Attach scroll listener
        window.addEventListener('scroll', handleScroll);
        // Run once on mount to set initial position
        handleScroll();

        // Cleanup: Remove event listener when component unmounts
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []); // Empty dependency array means this effect runs once after initial render

    return (
        <section className="cta-parallax-section p-7 lg:p-8" ref={ctaSectionRef}>
            <div className="cta-parallax-content rounded-lg">
                <p className="font-bold text-lg lg:text-xl mb-7">Inizia subito</p>

                <div className="d-flex flex-col lg:flex-row gap-2 items-stretch lg:gap-5 mb-5">
                    {/* First Card: Faccio in autonomia */}
                    <div className="flex-1 d-flex flex-col justify-between h-full gap-3 border rounded-lg p-8 md:p-8">
                        <div>
                            <p className="font-bold text-md md:text-md lg:text-md mb-2 leading-none">Faccio in autonomia</p>
                            <p className="text-sm">Crei tutto anche dal cellulare e in pochi minuti il tuo profilo è online.</p>
                        </div>
                        <div className="mt-auto">
                            <a href="/signup-business" className="button btn-md mobile-w-full btn-gradient-yellow">Crea il tuo account</a>
                        </div>
                    </div>

                    {/* Second Card: Non riesci? Lo creiamo noi per te. */}
                    <div className="flex-1 d-flex flex-col justify-between h-full gap-3 border rounded-lg p-8 md:p-8">
                        <div>
                            <p className="font-bold text-md md:text-md lg:text-md mb-2 leading-none">Non riesci? Lo creiamo noi per te.</p>
                            <p className="text-sm">Penseremo noi a creare il tuo profilo e te lo manderemo pronto.</p>
                        </div>
                        <div className="mt-auto">
                            <a href="/signup-business" className="button btn-md mobile-w-full btn-gradient-blue">Cosa ci serve</a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Parallax Image */}
            <img src="/assets/images/landing-screens/profile.png" alt="Profile Screen" className="cta-parallax-image image-1" ref={ctaImageRef} />
        </section>
    );
}
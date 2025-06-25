// components/landing/SectionHero.jsx
'use client'; // This component needs client-side interactivity (scroll event, useRef)

import { useRef, useEffect } from 'react';
import Link from 'next/link'; // For Next.js client-side routing

export default function SectionHero() {
    const heroSectionRef = useRef(null); // Ref for the main section
    const mainImageRef = useRef(null);   // Ref for the .image-main (smartphone)
    const heroTextRefs = useRef([]);     // Ref for the .hero-text elements (h3 and p)

    // Helper to add refs to multiple elements (like the hero-text elements)
    const addToHeroTextRefs = (el) => {
        if (el && !heroTextRefs.current.includes(el)) {
            heroTextRefs.current.push(el);
        }
    };

    useEffect(() => {
        const heroSection = heroSectionRef.current;
        const mainImage = mainImageRef.current;
        const heroTexts = heroTextRefs.current; // Get all collected hero text elements

        if (!heroSection || !mainImage || heroTexts.length === 0) {
            console.warn("SectionHero component: Missing required DOM elements.");
            return;
        }

        const totalParallaxMovement = 400; // From your JS
        const textFadeSpeedFactor = 6;    // From your JS

        const updateImagePositions = () => {
            const sectionRect = heroSection.getBoundingClientRect();

            // Calculate scroll progress based on the section's position in the viewport
            // 0 when the top of the section is at the top of the viewport
            // 1 when the bottom of the section is 100% scrolled out of view (or half its height scrolled out)
            let scrollProgress = -sectionRect.top / heroSection.offsetHeight;
            scrollProgress = Math.max(0, Math.min(1, scrollProgress)); // Clamp between 0 and 1

            // Apply parallax to the main image (smartphone)
            const translateY = scrollProgress * -totalParallaxMovement;
            mainImage.style.transform = `translate3d(0, ${translateY}px, 0)`;

            // Apply fade-out to hero text
            let textOpacity = 1 - (scrollProgress * textFadeSpeedFactor);
            textOpacity = Math.max(0, Math.min(1, textOpacity)); // Clamp between 0 and 1

            heroTexts.forEach(textEl => {
                textEl.style.opacity = textOpacity;
            });

            // Note: Your original JS only targets `.image-main` and `.hero-text` for parallax.
            // If the other `.hero-parallax-image` elements (image-1 to image-8) also have parallax,
            // we'd need to add refs for them and apply similar logic, perhaps with different speeds.
            // For now, I'm sticking to the provided JS, which only animates `image-main`.
        };

        // Attach scroll listener
        window.addEventListener('scroll', updateImagePositions);

        // Run once on mount to set initial positions
        updateImagePositions();

        // Cleanup: Remove event listener when component unmounts
        return () => {
            window.removeEventListener('scroll', updateImagePositions);
        };
    }, []); // Empty dependency array means this effect runs once after the initial render

    return (
        <section className="hero-parallax-section" ref={heroSectionRef}>
            <div className="hero-parallax-content">
                <h3 className="leading-none mb-2 hero-text" ref={addToHeroTextRefs}>
                    Migliora l'esperienza per i tuoi clienti
                </h3>
                <p className="text-lg mb-2 hero-text" ref={addToHeroTextRefs}>
                    Migliora l'esperienza per i tuoi clienti
                </p>
                {/* Note: 'd' is not a valid HTML tag. Assuming it was a typo for 'div'. */}
                <div className="d-flex flex-col lg:flex-row gap-2 items-center">
                    <p className="pill-my-link md:text-md lg:text-md">
                        <span className="domain">queva.com/</span>{' '}
                        <span className="urlname">tuonome</span>{' '}
                    </p>
                    {/* Use Link component for internal navigation */}
                    <Link href="/crea-il-tuo-sito" className="button btn-sm md:btn-md btn-border-w">
                        Crea il tuo sito
                    </Link>
                </div>
                {/* Use Link component for internal navigation */}
                <Link href="/signup" className="button btn-md btn-white">
                    Inizia
                </Link>
            </div>

            {/* These images will need styling (e.g., absolute positioning) to create the layered effect */}
            {/* If these also need parallax, we'd need to adjust the JS and add refs for them. */}
            <img src="/assets/images/landing/hero/8.webp" alt="1" className="hero-parallax-image image-1" />
            <img src="/assets/images/landing/hero/7.webp" alt="2" className="hero-parallax-image image-2" />
            <img src="/assets/images/landing/hero/6.webp" alt="3" className="hero-parallax-image image-3" />
            <img src="/assets/images/landing/hero/5.webp" alt="4" className="hero-parallax-image image-4" />
            <img src="/assets/images/landing/hero/4.webp" alt="5" className="hero-parallax-image image-5" />
            <img src="/assets/images/landing/hero/3.webp" alt="6" className="hero-parallax-image image-6" />
            <img src="/assets/images/landing/hero/2.webp" alt="7" className="hero-parallax-image image-7" />
            <img src="/assets/images/landing/hero/1.webp" alt="8" className="hero-parallax-image image-8" />

            <img src="/assets/images/landing-screens/profile.png" alt="Smartphone" className="image-main" ref={mainImageRef} />
        </section>
    );
}
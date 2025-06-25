// components/landing/SectionBenefitCards.jsx
'use client'; // This component uses useEffect and IntersectionObserver for animations

import { useEffect, useRef } from 'react';

export default function SectionBenefitCards() {
    const sectionRef = useRef(null); // Ref for the main section to observe

    useEffect(() => {
        const observerOptions = {
            root: null, // observe against the viewport
            rootMargin: '0px',
            threshold: 0.15 // Trigger when 15% of the element is visible
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const animatedElements = entry.target.querySelectorAll('.animated-element');
                    animatedElements.forEach((element, index) => {
                        element.style.transitionDelay = `${index * 0.15}s`; // 150ms delay per element
                        element.classList.add('is-visible');
                    });
                    observer.unobserve(entry.target); // Stop observing once animated
                }
            });
        }, observerOptions);

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []); // Runs once on mount

    return (
        <section className="container-x-lg py-8 lg:py-8 bg-gradient-blue" ref={sectionRef}>
            <div className="rounded-xl">
                <h5 className="text-center mb-2">Cosa puoi aumentare</h5>
                <p className="text-center mb-5">Alcuni modi in cui Queva può subito aiutare la tua attività</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3 items-center justify-between feature-cards-section">
                    {/* Card 1 */}
                    <div className="flex-1 flex-grow py-5 px-5 rounded-lg text-center animated-element bg-white">
                        <span className="rounded-full bg-white border font-bold p-3 d-inline-flex items-center justify-center" style={{ width: '30px', height: '30px' }}>+</span> 
                        <p className="mt-2 text-md font-bold mb-3 leading-none">Nuovi Clienti</p>
                        <p className="text-sm text-black-600">Con Queva, ogni visita al tuo Locale si trasforma in un'opportunità di guadagnare punti per vincere premi.</p>
                    </div>

                    {/* Card 2 */}
                    <div className="flex-1 flex-grow py-5 px-5 rounded-lg text-center animated-element bg-white">
                        <span className="rounded-full bg-white border font-bold p-3 d-inline-flex items-center justify-center" style={{ width: '30px', height: '30px' }}>+</span> 
                        <p className="mt-2 text-md font-bold mb-3 leading-none">Fedeltà dei Clienti Esistenti</p>
                        <p className="text-sm text-black-600">Con Queva, ogni visita al tuo Locale si trasforma in un'opportunità di guadagnare punti per vincere premi.</p>
                    </div>

                    {/* Card 3 */}
                    <div className="flex-1 flex-grow py-5 px-5 rounded-lg text-center animated-element bg-white">
                        <span className="rounded-full bg-white border font-bold p-3 d-inline-flex items-center justify-center" style={{ width: '30px', height: '30px' }}>+</span> 
                        <p className="mt-2 text-md font-bold mb-3 leading-none">Recensioni su Google</p>
                        <p className="text-sm text-black-600">Tutte le sezioni principali del tuo sito hanno sempre un pulsante per la recensione su Google a portata di dito.</p>
                    </div>

                    {/* Card 4 */}
                    <div className="flex-1 flex-grow py-5 px-5 rounded-lg text-center animated-element bg-white">
                        <span className="rounded-full bg-white border font-bold p-3 d-inline-flex items-center justify-center" style={{ width: '30px', height: '30px' }}>+</span> 
                        <p className="mt-2 text-md font-bold mb-3 leading-none">Conoscenza su come migliorare i tuoi servizi</p>
                        <p className="text-sm text-black-600">Creando promozioni sbloccabili con sondaggio, ottieni informazioni preziose direttamente dai clienti. </p>
                    </div>

                    {/* Card 5 */}
                    <div className="flex-1 flex-grow py-5 px-5 rounded-lg text-center animated-element bg-white">
                        <span className="rounded-full bg-white border font-bold p-3 d-inline-flex items-center justify-center" style={{ width: '30px', height: '30px' }}>+</span> 
                        <p className="mt-2 text-md font-bold mb-3 leading-none">Coinvolgimento e seguito sui social</p>
                        <p className="text-sm text-black-600">Alle tue promozioni, puoi anche aggiungere sfide come interagire con un tuo post sui social. </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
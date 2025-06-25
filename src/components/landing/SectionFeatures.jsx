// components/SectionFeatures.jsx
'use client'; // This component uses useEffect and IntersectionObserver for animations

import { useEffect, useRef } from 'react';

export default function SectionFeatures() {
    const sectionRef = useRef(null); // Ref for the main section to observe

    useEffect(() => {
        const observerOptions = {
            root: null, // observe against the viewport
            rootMargin: '0px',
            threshold: 0.15 // Trigger when 15% of the element is visible, as per your JS
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Get all child elements within this section that need to be animated
                    const animatedElements = entry.target.querySelectorAll('.animated-element');
                    animatedElements.forEach((element, index) => {
                        // Stagger the animations slightly
                        element.style.transitionDelay = `${index * 0.15}s`; // 150ms delay per element
                        element.classList.add('is-visible');
                    });
                    // Stop observing this section once it's animated to prevent re-triggering
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe the current section
        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        // Cleanup function
        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

    return (
        <section className="bg-white container-x-lg py-8 lg:py-8" ref={sectionRef}>
            <p className="font-bold text-center text-lg lg:text-xl mb-2">Un QR, un piano gratuito, tanti strumenti</p>

            <p className="text-center lg:text-md mb-2">Offri ai clienti varie funzionalità riunite nel tuo unico QR senza applicazioni.</p>
            <p className="text-center text-sm text-black-600 mb-7">Gestisci tutto comodamente dal tuo smartphone.</p>

            <div className="feature-cards-section">
                <div className="d-flex flex-col md:flex-row gap-4 lg:gap-2 items-start justify-between">
                    {/* Feature Card 1 */}
                    <div className="flex-1 py-2 px-2 rounded-lg text-center animated-element">
                        <div className="feature-cards-image">
                            <img src="/assets/images/landing-screens/profile.png" alt="Vetrina Prodotti e Servizi" />
                        </div>
                        <p className="mt-5 font-bold text-md mb-1">Vetrina Prodotti e Servizi</p>
                        <p className="text-black-600 mb-3">Il tuo menu Prodotti / Servizi digitale personalizzabile che puoi gestire comodamente dal tuo cellulare.</p>
                    </div>

                    {/* Feature Card 2 */}
                    <div className="flex-1 py-2 px-2 rounded-lg text-center animated-element">
                        <div className="feature-cards-image">
                            <img src="/assets/images/landing-screens/booking.png" alt="Prenotazioni Online" />
                        </div>
                        <p className="mt-5 font-bold text-md mb-1">Prenotazioni Online</p>
                        <p className="text-black-600">Offri la prenotazione per diversi servizi. Dal tuo celluare puoi confermarle, riprogrammarle, annullarle e trovare i contatti del cliente.</p>
                    </div>

                    {/* Feature Card 3 */}
                    <div className="flex-1 py-2 px-2 rounded-lg text-center animated-element">
                        <div className="feature-cards-image">
                            <img src="/assets/images/landing-screens/profile.png" alt="Raccolta Punti e Premi" />
                        </div>
                        <p className="mt-5 font-bold text-md mb-1">Raccolta Punti e Premi</p>
                        <p className="text-black-600">Crea un esperienza che premia i clienti per la loro fedeltà. Imposta i tuoi premi e fai guadagnare punti semplicemente scannerizzando il QR del cliente. </p>
                    </div>

                    {/* Feature Card 4 */}
                    <div className="flex-1 py-2 px-2 rounded-lg text-center animated-element">
                        <div className="feature-cards-image">
                            <img src="/assets/images/landing-screens/promotion-challenge.png" alt="Promozioni Sbloccabili" />
                        </div>
                        <p className="mt-5 font-bold text-md mb-1">Promozioni Sbloccabili</p>
                        <p className="text-black-600">Ottieni risposte a un breve sondaggio oppure un interazione sui social in cambio di una promozione. Puoi creare anche promozioni libere.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
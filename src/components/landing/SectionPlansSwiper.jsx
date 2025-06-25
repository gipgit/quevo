// components/landing/SectionPlansSwiper.jsx
'use client'; // Needs client-side interactivity for Swiper

import { useEffect, useRef } from 'react';
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules'; // Autoplay not needed for this Swiper based on HTML

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function SectionPlansSwiper() {
    const swiperRef = useRef(null);

    // Define the plan data directly within the component for now,
    // as it seems static. If these plans come from a database,
    // you'd pass them as props like with the business examples.
    const plans = [
        {
            name: "Basic",
            price: "Gratis",
            features: [
                "Gestione di 1 Business",
                "Profilo con link socials e recensioni Google",
                "Lista Prodotti/Servizi con immagini fino a 10 elementi",
                "Prenotazioni fino a 30 prenotazioni al mese",
                "Promozioni aperte e sbloccabili fino a 1 al mese",
                "Scarica il PDF con il tuo QR",
            ]
        },
        {
            name: "Economy",
            price: "", // Price not specified in HTML for Economy and Pro, adjust as needed
            features: [
                "Gestione di 1 Business",
                "Profilo con link socials e recensioni Google",
                "Lista Prodotti/Servizi con immagini fino a 10 elementi",
                "Prenotazioni fino a 30 prenotazioni al mese",
                "Promozioni aperte e sbloccabili fino a 1 al mese",
                "Scarica il PDF con il tuo QR",
            ]
        },
        {
            name: "Pro",
            price: "", // Price not specified in HTML for Economy and Pro, adjust as needed
            features: [
                "Gestione di 1 Business",
                "Profilo con link socials e recensioni Google",
                "Lista Prodotti/Servizi con immagini fino a 10 elementi",
                "Prenotazioni fino a 30 prenotazioni al mese",
                "Promozioni aperte e sbloccabili fino a 1 al mese",
                "Scarica il PDF con il tuo QR",
            ]
        },
    ];

    useEffect(() => {
        if (!swiperRef.current) { // Ensure Swiper is only initialized once
            swiperRef.current = new Swiper("#swiper-plans", {
                modules: [Navigation, Pagination],
                slidesPerView: 1, // Only one slide visible at a time for plans
                spaceBetween: 30,
                loop: false, // Plans usually don't loop
                // autoplay: { // Autoplay not in your original HTML for this Swiper
                //     delay: 4000,
                //     disableOnInteraction: false,
                // },
                pagination: {
                    el: ".swiper-pagination",
                    clickable: true,
                    // Use a custom class for the pagination container to prevent conflicts
                    // The original HTML has .swiper-navigation also containing .swiper-pagination
                    // This might need CSS adjustment depending on how you styled it.
                },
                navigation: {
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                },
                breakpoints: {
                    // You might want different settings for smaller screens
                    // e.g., if you want more than one slide on larger screens
                    // 768: {
                    //     slidesPerView: 2,
                    //     spaceBetween: 40,
                    // },
                    // 1024: {
                    //     slidesPerView: 3,
                    //     spaceBetween: 50,
                    // },
                },
            });
        }

        // Cleanup: Destroy Swiper instance when component unmounts
        return () => {
            if (swiperRef.current) {
                swiperRef.current.destroy();
                swiperRef.current = null; // Clear ref after destroying
            }
        };
    }, []); // Empty dependency array as plans data is static for now

    return (
        <section className="container-landing-plans bg-plans container-x-lg py-8">
            <div className="d-flex flex-col lg:flex-row gap-7 lg:gap-8 items-center justify-between">
                <div className="flex-grow text-center lg:text-left">
                    <p className="font-bold text-lg lg:text-xl mt-5 mb-2">Un piano SEMPRE GRATUITO</p>
                    <p className="text-md lg:text-lg mb-2">Annulli o cambia piano in qualsiasi momento.</p>
                    <p className="lg:text-md mb-4">Sì, il piano gratuito è senza vincoli e senza carte.</p>
                    <a href="/plans" className="mt-1 button btn-lg mobile-w-full btn-gradient-blue">Guarda i piani</a>
                </div>

                <div className="swiper-container bg-accent-blue rounded-xl p-3" style={{ maxWidth: '100%' }}>
                    <div className="swiper" id="swiper-plans" style={{ maxWidth: '520px' }}>
                        <div className="swiper-wrapper">
                            {plans.map((plan, index) => (
                                <div className="swiper-slide" key={index}> {/* Using index as key since no unique ID in data */}
                                    <div className="slide-content">
                                        <p className="font-bold text-lg">{plan.name}</p>
                                        {plan.price && <p>{plan.price}</p>} {/* Only render price if it exists */}
                                        <ul className="free-plan-list mt-6">
                                            {plan.features.map((feature, featureIndex) => (
                                                <li key={featureIndex}>{feature}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Note: The original HTML has swiper-pagination inside swiper-navigation.
                            This might require specific CSS to lay out correctly.
                            Standard Swiper structure usually has them as siblings to the .swiper div.
                            I'm keeping your original structure for now. */}
                        <div className="swiper-navigation">
                            <div className="swiper-button-prev"></div>
                            <div className="swiper-pagination"></div>
                            <div className="swiper-button-next"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
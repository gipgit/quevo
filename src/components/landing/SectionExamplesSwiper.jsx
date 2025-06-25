// components/landing/SectionExamplesSwiper.jsx
'use client'; // This component needs client-side interactivity (Swiper, QR Code generation)

import { useEffect, useRef, useState } from 'react';
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Assuming you have a way to import QRCode. If qrcode.js is not an npm module,
// you might need a different approach or consider a React-friendly QR library like 'qrcode.react'
// For this example, let's assume it's available globally or imported like so:
// import QRCode from 'path/to/qrcode.min.js'; // Adjust this path if qrcode.js is not an npm package
// Or, if it's globally available via a script tag in your layout:
// declare const QRCode: any; // Declare it to avoid TypeScript errors

// --- Mock Data ---
// In a real application, you would fetch this data from an API.
// For now, let's use some dummy data to simulate $all_ads.
const MOCK_ALL_ADS = [
    {
        business_public_uuid: 'uuid1',
        business_urlname: 'pizzeria-napoli',
        business_name: 'Pizzeria Napoli',
        business_descr: 'La migliore pizza tradizionale napoletana.',
    },
    {
        business_public_uuid: 'uuid2',
        business_urlname: 'gelateria-dolce-vita',
        business_name: 'Gelateria Dolce Vita',
        business_descr: 'Gelato artigianale con ingredienti freschi.',
    },
    {
        business_public_uuid: 'uuid3',
        business_urlname: 'caffe-centrale',
        business_name: 'Caffè Centrale',
        business_descr: 'Il tuo angolo di relax con caffè di alta qualità.',
    },
    {
        business_public_uuid: 'uuid4',
        business_urlname: 'beauty-salon-aura',
        business_name: 'Beauty Salon Aura',
        business_descr: 'Servizi di bellezza e benessere per corpo e mente.',
    },
    {
        business_public_uuid: 'uuid5',
        business_urlname: 'libreria-antica',
        business_name: 'Libreria Antica',
        business_descr: 'Un vasto assortimento di libri nuovi e usati.',
    },
];
// Base URL for profiles (replace with your actual domain)
const TWENTER_PROFILE_BASE = 'https://queva.com'; 

export default function SectionExamplesSwiper() {
    const swiperRef = useRef(null);
    const [allAds, setAllAds] = useState([]); // State to hold your business data

    useEffect(() => {
        // In a real application, you'd fetch data here
        // For now, use mock data
        setAllAds(MOCK_ALL_ADS);

        // Define a function to initialize QR codes.
        // This needs to be called after Swiper has rendered its slides.
        const initializeQRCodes = (swiperInstance) => {
            const qrPlaceholders = swiperInstance.el.querySelectorAll('.qr-code-placeholder');
            qrPlaceholders.forEach(placeholder => {
                const qrContent = placeholder.dataset.qrContent;

                if (qrContent && typeof QRCode !== 'undefined') { // Check if QRCode library is loaded
                    placeholder.innerHTML = ''; // Clear previous content
                    new QRCode(placeholder, {
                        text: qrContent,
                        width: 120,
                        height: 120,
                        colorDark: "#000000",
                        colorLight: "#ffffff",
                        correctLevel: QRCode.CorrectLevel.H
                    });
                } else if (qrContent) {
                    console.warn("QRCode library not found or qrContent missing for:", placeholder);
                    placeholder.textContent = "QR Error: Library Missing"; // Fallback text
                } else {
                    console.warn("QR Code placeholder found without data-qr-content attribute:", placeholder);
                    placeholder.textContent = "QR Error: Content Missing";
                }
            });
        };

        // Initialize Swiper after the component has rendered and data is available
        if (allAds.length > 0) { // Only initialize if there's data to display
            swiperRef.current = new Swiper("#swiper-business-examples", {
                modules: [Navigation, Pagination, Autoplay],
                slidesPerView: 1.2,
                spaceBetween: 30,
                centeredSlides: true,
                loop: true,
                autoplay: {
                    delay: 4000,
                    disableOnInteraction: false,
                },
                pagination: {
                    el: ".swiper-pagination",
                    clickable: true,
                },
                navigation: {
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                },
                breakpoints: {
                    0: {
                        slidesPerView: 1.3,
                        spaceBetween: 15,
                    },
                    640: {
                        slidesPerView: 1.4,
                        spaceBetween: 20,
                    },
                    768: {
                        slidesPerView: 1.6,
                        spaceBetween: 30,
                    },
                    1024: {
                        slidesPerView: 1.8,
                        spaceBetween: 40,
                    },
                },
                on: {
                    // Call the QR code initialization function when Swiper is ready
                    init: initializeQRCodes,
                    // Re-initialize QRs on slide change in case of loop or dynamic content
                    // (though QR codes usually only need to be generated once per slide)
                    // slideChangeTransitionEnd: initializeQRCodes, // Might not be needed if QR codes are static
                }
            });
        }

        // Cleanup: Destroy Swiper instance when component unmounts
        return () => {
            if (swiperRef.current) {
                swiperRef.current.destroy();
            }
        };
    }, [allAds]); // Re-run effect if allAds changes (e.g., after data fetch)

    return (
        <section className="py-8 lg:py-8">
            <div className="container-x-lg">
                <h2 className="font-bold text-lg lg:text-xl mb-3 text-center text-gray-800">Guarda esempi di pagine già online</h2>
                <p className="mb-5 lg:text-md text-center text-gray-600">Puoi già capire come può essere il tuo link e trovare ispirazione.</p>
            </div>

            <div className="swiper" id="swiper-business-examples">
                <div className="swiper-wrapper">
                    {/* Render slides based on fetched data */}
                    {allAds.length > 0 ? (
                        allAds.map((ad) => {
                            const qrUrl = `${TWENTER_PROFILE_BASE}/${encodeURIComponent(ad.business_urlname)}`;
                            const profilePicUrl = `/uploads/business/profile/${encodeURIComponent(ad.business_public_uuid)}.webp`;

                            return (
                                <div
                                    key={ad.business_public_uuid} // Unique key for list rendering
                                    className="swiper-slide"
                                    style={{ backgroundImage: `url('${profilePicUrl}')` }}
                                >
                                    <div className="slide-content">
                                        <img
                                            src={profilePicUrl}
                                            alt={`${ad.business_name} Profile`}
                                            className="profile-image"
                                            // Handle image loading errors in React
                                            onError={(e) => {
                                                e.currentTarget.onerror = null; // Prevent infinite loop
                                                e.currentTarget.src = 'https://placehold.co/100x100/cccccc/333333?text=No+Image';
                                            }}
                                        />
                                        <p className="font-bold text-md lg:text-md">{ad.business_name}</p>
                                        <p className="text-sm lg:text-md" style={{ display: 'none' }}>{ad.business_descr}</p>
                                        <div className="qr-code-placeholder" data-qr-content={qrUrl}></div>
                                        <button className="button card-button" onClick={() => window.open(qrUrl, '_blank')}>
                                            Apri Sito
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="swiper-slide">
                            <div className="slide-content">
                                <p className="text-gray-500 text-center">No featured clubs at the moment.</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="swiper-pagination"></div>
                <div className="swiper-button-next"></div>
                <div className="swiper-button-prev"></div>
            </div>
        </section>
    );
}
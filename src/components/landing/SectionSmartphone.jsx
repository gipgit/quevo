// components/SectionSmartphone.jsx
'use client'; // This component needs client-side interactivity (mouse events, useRef)

import { useRef, useEffect } from 'react';

export default function SectionSmartphone() {
    const mouseTrackingAreaRef = useRef(null); // Ref for the whole section (your original #smartphone-section)
    const smartphoneImageRef = useRef(null);   // Ref for the .smartphone-image

    useEffect(() => {
        const mouseTrackingArea = mouseTrackingAreaRef.current;
        const smartphoneImage = smartphoneImageRef.current;

        if (!mouseTrackingArea || !smartphoneImage) {
            console.warn("SectionSmartphone component: Missing required DOM elements.");
            return;
        }

        // Constants from your original JavaScript
        const initialRotateX = 5;
        const initialRotateY = 5;
        const initialRotateZ = 0; // Not used in provided JS transform string, but good to keep if intended

        const maxTiltX = 10;
        const maxTiltY = 25;
        const maxTiltZ = 5; // Not used in provided JS transform string, but good to keep if intended

        const handleMouseMove = (e) => {
            const trackingRect = mouseTrackingArea.getBoundingClientRect();

            const trackingCenterX = trackingRect.left + trackingRect.width / 2;
            const trackingCenterY = trackingRect.top + trackingRect.height / 2;

            const mouseX = e.clientX;
            const mouseY = e.clientY;

            const normalizedOffsetX = (mouseX - trackingCenterX) / (trackingRect.width / 2);
            const normalizedOffsetY = (mouseY - trackingCenterY) / (trackingRect.height / 2);

            const rotateY = normalizedOffsetX * maxTiltY;
            const rotateX = -normalizedOffsetY * maxTiltX;
            const rotateZ = normalizedOffsetX * maxTiltZ; // If you intended to use this for Z rotation

            // Only apply X and Y rotations based on your provided JS transform string
            smartphoneImage.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            // If you want Z rotation: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
        };

        const handleMouseLeave = () => {
            // Reset to initial tilt when mouse leaves
            smartphoneImage.style.transform = `rotateX(${initialRotateX}deg) rotateY(${initialRotateY}deg) rotateZ(${initialRotateZ}deg)`;
        };

        // Attach event listeners
        mouseTrackingArea.addEventListener('mousemove', handleMouseMove);
        mouseTrackingArea.addEventListener('mouseleave', handleMouseLeave);

        // Cleanup: Remove event listeners when component unmounts
        return () => {
            mouseTrackingArea.removeEventListener('mousemove', handleMouseMove);
            mouseTrackingArea.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []); // Empty dependency array means this effect runs once on mount

    return (
        <section id="smartphone-section" className="container-x-md py-8 lg:py-8 bg-gradient-purple text-white" ref={mouseTrackingAreaRef}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 lg:gap-8">
                <div className="text-center lg:text-left p-5">
                    <h2>Sempre più funzionalità nel tuo QR</h2>
                    <p className="lg:text-md mt-2 mb-5">Usa comodamente il tuo sito eliminando i costi di realizzazione, dominio e hosting, noi intanto continuiamo a migliorare le funzionalità e creare di nuove su misura per te.</p>
                </div>
                <div>
                    <div className="smartphone-display-section">
                        <div className="smartphone-container">
                            <img src="/assets/images/landing-screens/profile.png" alt="Smartphone" className="smartphone-image" ref={smartphoneImageRef} />
                            <div className="smartphone-screen-content"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
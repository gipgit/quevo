// components/landing/SectionHowPoints.jsx
'use client'; // This component needs client-side interactivity (state, useEffect for animation)

import { useState, useEffect, useRef } from 'react';

export default function SectionHowPoints() {
    const [activeStep, setActiveStep] = useState(1);
    const intervalRef = useRef(null);

    // This effect manages the auto-cycling of steps
    useEffect(() => {
        // Clear any existing interval to prevent duplicates
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
            setActiveStep((prevStep) => (prevStep % 3) + 1); // Cycles from 1 to 3
        }, 4000); // Change step every 4 seconds (4000ms)

        // Cleanup: Clear interval when component unmounts
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

    // This effect handles the animation of connecting bars and active card visibility
    useEffect(() => {
        // Update active dot classes
        document.querySelectorAll('.step-dot').forEach(dot => {
            if (parseInt(dot.dataset.step) === activeStep) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        // Update connecting bar animations
        document.querySelectorAll('.connecting-loading-bar').forEach(bar => {
            const barId = parseInt(bar.id.replace('connecting-bar-', ''));
            if (barId < activeStep) {
                bar.style.width = '100%'; // Previous bars are full
            } else if (barId === activeStep) {
                bar.style.width = '0%'; // Current bar starts empty and fills via CSS animation
                // Trigger reflow to restart CSS animation for current bar
                void bar.offsetWidth; // This forces a reflow
                bar.style.width = '100%';
            } else {
                bar.style.width = '0%'; // Future bars are empty
            }
        });

        // Update mobile step card visibility
        document.querySelectorAll('.mobile-step-card').forEach(card => {
            if (parseInt(card.id.replace('step-card-', '')) === activeStep) {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
                card.style.display = 'block'; // Make sure it's visible for animation
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                // Using a slight delay before setting display:none to allow fade-out
                setTimeout(() => {
                    if (parseInt(card.id.replace('step-card-', '')) !== activeStep) {
                         card.style.display = 'none';
                    }
                }, 300); // Match this to your CSS transition duration if any
            }
        });

    }, [activeStep]); // Re-run this effect whenever activeStep changes

    // Handlers for manual step changes (if you add clickability to dots)
    const handleDotClick = (step) => {
        setActiveStep(step);
        // Reset the interval so it doesn't immediately jump to the next step
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = setInterval(() => {
                setActiveStep((prevStep) => (prevStep % 3) + 1);
            }, 4000);
        }
    };

    return (
        <section className="bg-accent-azure container-x-md py-8 lg:py-8 text-center">
            <p className="text-lg lg:text-lg font-bold mb-5">Come funziona la raccolta dei punti</p>

            <div className="steps-navigation mb-3 d-flex justify-center items-center" style={{ marginLeft: '15%', marginRight: '15%' }}>
                <div className={`step-dot ${activeStep === 1 ? 'active' : ''}`} data-step="1" onClick={() => handleDotClick(1)}>1</div>
                <div className="connecting-loading-bar-container">
                    <div className="connecting-loading-bar" id="connecting-bar-1"></div>
                </div>
                <div className={`step-dot ${activeStep === 2 ? 'active' : ''}`} data-step="2" onClick={() => handleDotClick(2)}>2</div>
                <div className="connecting-loading-bar-container">
                    <div className="connecting-loading-bar" id="connecting-bar-2"></div>
                </div>
                <div className={`step-dot ${activeStep === 3 ? 'active' : ''}`} data-step="3" onClick={() => handleDotClick(3)}>3</div>
            </div>

            <div className="d-flex flex-col lg:flex-row gap-7 items-start">
                <div className="flex-1 rounded-lg p-3 mobile-step-card" id="step-card-1"
                     style={activeStep === 1 ? { opacity: 1, transform: 'translateY(0)', display: 'block' } : { opacity: 0, transform: 'translateY(20px)', display: 'none' }}>
                    <div className="steps-cards-image">
                        <img src="/assets/images/landing-screens/card.png" alt="Il cliente mostra il QR" />
                    </div>
                    <p className="mt-4 mb-4">Il cliente mostra il QR della sua carta virtuale (sempre gratuita).</p>
                    <p className="text-xs">Al cliente non servono documenti o carte di credito. Bastano i dati di base e una email.</p>
                </div>

                <div className="flex-1 rounded-lg p-3 mobile-step-card" id="step-card-2"
                     style={activeStep === 2 ? { opacity: 1, transform: 'translateY(0)', display: 'block' } : { opacity: 0, transform: 'translateY(20px)', display: 'none' }}>
                    <div className="steps-cards-image">
                        <img src="/assets/images/landing-screens/card.png" alt="Il gestore lo scannerizza" />
                    </div>
                    <p className="mt-4 mb-4">Il gestore lo scannerizza con un cellulare.</p>
                    <p className="text-xs">
                        {/* Empty in original, adding a non-breaking space for layout consistency if needed */}
                        &nbsp;
                    </p>
                </div>

                <div className="flex-1 rounded-lg p-3 mobile-step-card" id="step-card-3"
                     style={activeStep === 3 ? { opacity: 1, transform: 'translateY(0)', display: 'block' } : { opacity: 0, transform: 'translateY(20px)', display: 'none' }}>
                    <div className="steps-cards-image">
                        <img src="/assets/images/landing-screens/card.png" alt="I punti aumentano automaticamente" />
                    </div>
                    <p className="mt-4 mb-2">Fatto! I punti relativi a questo Business aumentano automaticamente.</p>
                    <p className="text-xs">Se un premio è stato aggiudicato, ti apparirà sullo schermo.</p>
                </div>
            </div>
        </section>
    );
}
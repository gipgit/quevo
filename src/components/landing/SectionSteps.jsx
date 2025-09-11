// components/landing/SectionSteps.jsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { getStepsData } from '@/lib/step-templates';

export default function SectionSteps({ locale }) {
  const t = useTranslations('Landing');
  const [visibleSteps, setVisibleSteps] = useState([]);
  const [timelineProgress, setTimelineProgress] = useState(0);
  const stepRefs = useRef([]);
  const timelineRef = useRef(null);

  // Add CSS animation for fade in slide effect
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInSlide {
        0% {
          opacity: 0;
          transform: translateY(10px) scale(0.95);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      @keyframes slideFromTop {
        0% {
          opacity: 0;
          transform: translateY(-20px) scale(0.95);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      @media (min-width: 1024px) {
        .timeline-dot-absolute {
          left: 50% !important;
          top: 50% !important;
          transform: translateX(-50%) !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Use the passed locale prop instead of detecting from URL
  const currentLocale = ['it', 'en', 'es', 'de', 'fr'].includes(locale) ? locale : 'it';
  const steps = getStepsData(currentLocale);

  // UI Simulation for each step
  const getUISimulation = (stepId) => {
    switch (stepId) {
      case 1:
        return <Step1Animation />;
      
      case 2:
        return <Step2Animation />;
      
      case 3:
        return <Step3Animation />;
      
      default:
        return (
          <div className="bg-gray-50 rounded p-2">
            <div className="text-xs text-gray-500 text-center">UI Preview</div>
          </div>
        );
    }
  };

  // Step 1: Cursor clicking button -> spinner loading
  const Step1Animation = () => {
    const [phase, setPhase] = useState(0); // 0: button, 1: loading

    useEffect(() => {
      const interval = setInterval(() => {
        setPhase(prev => (prev + 1) % 2);
      }, 2000);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="relative h-16 flex items-center justify-center">
        {phase === 0 ? (
          <div className="relative">
            {/* Cursor */}
            <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            {/* Button */}
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-medium shadow-lg transform transition-transform duration-200 hover:scale-105">
              Send Request
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-gray-600">Loading...</span>
          </div>
        )}
      </div>
    );
  };

  // Step 2: Smartphone browser with link and email notifications
  const Step2Animation = () => {
    const [topPhase, setTopPhase] = useState(0); // 0: smartphone, 1: redirecting

    useEffect(() => {
      // Top area alternates between smartphone and redirecting
      const topInterval = setInterval(() => {
        setTopPhase(prev => (prev + 1) % 2);
      }, 3000); // 3 seconds per phase

      return () => {
        clearInterval(topInterval);
      };
    }, []);

    return (
      <div className="space-y-3">
        {/* Top Area: Smartphone browser alternating with redirecting card */}
        {topPhase === 0 && (
          <div className="bg-gray-800 rounded-2xl p-2 w-full">
            <div className="flex items-center space-x-2">
              {/* Globe icon */}
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
              </svg>
              <div className="flex-1 bg-gray-700 rounded px-2 py-1 min-w-0">
                <div className="text-xs text-gray-300 truncate">
                  <span className="text-gray-400">flowia.io</span>/yourbusiness/s/SVDGDS
                </div>
              </div>
              {/* Refresh icon */}
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
        )}

        {topPhase === 1 && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-gray-600">Redirecting to Board</span>
            </div>
          </div>
        )}

        {/* Bottom Area: Notification card - appears with smartphone, disappears with redirecting */}
        {topPhase === 0 && (
          <div 
            className="bg-white border border-gray-200 rounded-2xl shadow-lg transform transition-all duration-700 ease-out"
            style={{
              animation: `slideFromTop 0.7s ease-out both`
            }}
          >
            <div className="p-3">
              <div className="flex items-start space-x-3">
                {/* Gmail icon */}
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h3.819v9.273L12 8.155l6.545 4.939V3.821h3.819c.904 0 1.636.732 1.636 1.636z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      Your Business Name
                    </span>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      Now
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Your service request link
                  </p>
                  <p className="text-xs text-gray-600">
                    Your service request has been processed and is ready for review
                  </p>
                </div>
                <div className="w-3 h-3 rounded-full flex-shrink-0 bg-blue-500"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Step 3: Smartphone browser with circular blue icon and pills
  const Step3Animation = () => {
    const [pills, setPills] = useState([]);

    useEffect(() => {
      const pillTypes = ['schedule appointment', 'payment request', 'document download'];
      const interval = setInterval(() => {
        setPills(prev => {
          const newPill = {
            id: Date.now(),
            text: pillTypes[Math.floor(Math.random() * pillTypes.length)],
            angle: Math.random() * 360
          };
          return [...prev.slice(-2), newPill]; // Reduced from 3 to 2 pills
        });
      }, 5000); // Increased interval from 3000 to 5000ms to stay longer

      return () => clearInterval(interval);
    }, []);

    return (
      <div className="relative h-28 w-full">
        {/* Smartphone browser top - mobile browser style */}
        <div className="bg-gray-800 rounded-2xl p-2 w-full">
          <div className="flex items-center space-x-2">
            {/* Globe icon */}
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
            </svg>
            <div className="flex-1 bg-gray-700 rounded px-2 py-1 min-w-0">
              <div className="text-xs text-gray-300 truncate">
                <span className="text-gray-400">flowia.io</span>/yourbusiness/s/SVDGDS
              </div>
            </div>
            {/* Refresh icon */}
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        </div>

        {/* Circular blue icon with + - positioned lower */}
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-lg font-bold">+</span>
        </div>

        {/* Pills around the icon - with fade in slide in animation */}
        {pills.map((pill, index) => {
          const angle = pill.angle;
          const radius = 35; // Increased radius from 25 to 35
          const x = Math.cos(angle * Math.PI / 180) * radius;
          const y = Math.sin(angle * Math.PI / 180) * radius;

          return (
            <div
              key={pill.id}
              className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-blue-100 border border-blue-300 rounded-full px-3 py-1.5 text-xs text-blue-700 shadow-sm"
              style={{
                transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                animation: `fadeInSlide 0.7s ease-out ${index * 400}ms both`
              }}
            >
              {pill.text}
            </div>
          );
        })}
      </div>
    );
  };

  // Scroll-based timeline progress calculation
  useEffect(() => {
    const handleScroll = () => {
      const timelineContainer = document.querySelector('[data-timeline-container]');
      if (!timelineContainer) return;
      
      const containerRect = timelineContainer.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate how much of the timeline container is visible
      const containerStart = containerRect.top;
      const containerEnd = containerRect.bottom;
      const containerHeight = containerEnd - containerStart;
      
      // Calculate progress based on how much of the container has been scrolled past
      const scrolledPast = Math.max(0, viewportHeight - containerStart);
      const progress = Math.min(1, Math.max(0, scrolledPast / (containerHeight + viewportHeight)));
      
      setTimelineProgress(progress);
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    // Initial calculation with a small delay to ensure DOM is ready
    setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, []);

  // Intersection Observer for step visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepIndex = parseInt(entry.target.dataset.stepIndex);
            const rect = entry.boundingClientRect;
            const viewportHeight = window.innerHeight;
            
            // Calculate how much of the step is visible
            const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
            const stepHeight = rect.height;
            const visibilityRatio = Math.max(0, Math.min(1, visibleHeight / stepHeight));
            
            // Show step content when it's 10% visible (much earlier)
            if (visibilityRatio > 0.1) {
              setVisibleSteps(prev => {
                if (!prev.includes(stepIndex)) {
                  return [...prev, stepIndex].sort((a, b) => a - b);
                }
                return prev;
              });
            }
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -200px 0px'
      }
    );

    stepRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      stepRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  return (
    <section className="min-h-screen bg-gray-50 py-16 overflow-x-hidden">
      <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
        
        <h2 className='text-center text-3xl lg:text-4xl font-bold mb-16'>{t('Steps.steps.processManagementTitle')}</h2>

        {/* Vertical Timeline Layout */}
        <div className="relative max-w-6xl mx-auto" data-timeline-container>
          {/* Timeline line - left for mobile, centered for lg+ */}
          <div className="absolute left-4 lg:left-1/2 lg:transform lg:-translate-x-1/2 top-0 bottom-0 w-1 bg-gray-300"></div>
          <div 
            ref={timelineRef}
            className="absolute left-4 lg:left-1/2 lg:transform lg:-translate-x-1/2 top-0 w-1 bg-gradient-to-b from-blue-500 via-blue-400 to-blue-300"
            style={{ 
              height: `${Math.max(10, timelineProgress * 100)}%`,
              maxHeight: '100%',
              transition: 'none'
            }}
          ></div>
          
          
          <div className="space-y-8 lg:space-y-10">
            {steps.map((step, index) => {
              const isVisible = visibleSteps.includes(index);
              const isEven = index % 2 === 0;
              const timelineReached = timelineProgress >= (index + 0.2) / steps.length;
              
              return (
                <div
                  key={step.id}
                  ref={(el) => (stepRefs.current[index] = el)}
                  data-step-index={index}
                  className={`relative flex items-center transition-all duration-1000 ease-out ${
                    isVisible 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-8'
                  }`}
                  style={{
                    transitionDelay: isVisible ? `${index * 150}ms` : '0ms'
                  }}
                >
                  {/* Timeline dot - positioned absolutely relative to timeline container */}
                  <div 
                    className={`timeline-dot-absolute absolute w-8 h-8 lg:w-12 lg:h-12 rounded-full shadow-lg z-10 transition-all duration-700 ease-out flex items-center justify-center text-white text-sm lg:text-lg font-bold ${
                      timelineReached 
                        ? 'bg-blue-500 scale-75 lg:scale-100 shadow-xl' 
                        : 'bg-gray-300 scale-75'
                    }`}
                    style={{
                      left: '0px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      transitionDelay: timelineReached ? `${index * 200}ms` : '0ms'
                    }}
                  >
                    {step.id}
                  </div>
                         
                  {/* Step content */}
                  <div className={`w-3/4 lg:w-5/12 max-w-[200px] lg:max-w-[350px] transition-all duration-800 ease-out ${
                    isEven ? 'ml-16 lg:ml-0 lg:pr-2 text-left lg:text-right' : 'ml-16 lg:ml-auto lg:pl-2 text-left'
                  } ${
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                  }`}
                  style={{
                    transitionDelay: isVisible ? `${index * 200 + 300}ms` : '0ms'
                  }}>
                    <div className="transition-all duration-500">
                      <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-2">
                             {step.title}
                           </h3>
                      <p className="text-gray-600 text-xs lg:text-sm leading-tight mb-4">
                         {step.description}
                       </p>
                      
                      {/* UI Simulation - No Card Container */}
                      <div className={`transition-all duration-600 ease-out ${
                        isEven ? 'ml-auto' : 'mr-auto'
                      } ${
                        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                      }`} 
                      style={{ 
                        transitionDelay: isVisible ? `${index * 200 + 500}ms` : '0ms'
                      }}>
                        {getUISimulation(step.id)}
          </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
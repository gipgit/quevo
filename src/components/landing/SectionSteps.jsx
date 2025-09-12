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
    const [phase, setPhase] = useState(0); // 0: timeline, 1: loading
    const [timelineProgress, setTimelineProgress] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        if (phase === 0) {
          // Timeline phase - progress through dots
          setTimelineProgress(prev => {
            if (prev >= 4) {
              // Reached last dot, switch to loading phase
              setPhase(1);
              return 0;
            }
            return prev + 1;
          });
        } else {
          // Loading phase - switch back to timeline
          setPhase(0);
          setTimelineProgress(0);
        }
      }, 800); // 800ms per dot progression
      return () => clearInterval(interval);
    }, [phase]);

    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4">
        <div className="relative h-16 flex items-center justify-center">
          {phase === 0 ? (
            <div className="flex flex-col items-center space-y-3">
              {/* Timeline with 5 dots - properly connected */}
              <div className="flex items-center">
                {[0, 1, 2, 3, 4].map((index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index <= timelineProgress 
                          ? 'bg-blue-500' 
                          : 'bg-gray-300'
                      }`}
                    />
                    {index < 4 && (
                      <div 
                        className={`w-4 h-0.5 transition-all duration-300 ${
                          index < timelineProgress 
                            ? 'bg-blue-500' 
                            : 'bg-gray-300'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              {/* Send Request Button */}
              <button 
                className={`px-4 py-2 rounded-lg text-xs font-medium shadow-lg transform transition-all duration-300 ${
                  timelineProgress >= 4
                    ? 'bg-blue-500 text-white hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Send Request
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-gray-600">Sending Request...</span>
            </div>
          )}
        </div>
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
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-2 w-full">
            <div className="flex items-center space-x-2">
              {/* Globe icon */}
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 text-gray-600">
                <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
                <ellipse cx="10" cy="10" rx="4" ry="9" stroke="currentColor" strokeWidth="2" />
                <line x1="1" y1="10" x2="19" y2="10" stroke="currentColor" strokeWidth="2" />
                <line x1="10" y1="1" x2="10" y2="19" stroke="currentColor" strokeWidth="2" />
              </svg>
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded px-2 py-1 min-w-0">
                <div className="text-xs text-gray-700 truncate">
                  <span className="text-gray-500">flowia.io</span>/yourbusiness/s/SVDGDS
                </div>
              </div>
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
                <div className="w-6 h-6 lg:w-8 lg:h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <svg className="w-3 h-3 lg:w-4 lg:h-4" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                    <g id="SVGRepo_iconCarrier"> 
                      <path d="M2 11.9556C2 8.47078 2 6.7284 2.67818 5.39739C3.27473 4.22661 4.22661 3.27473 5.39739 2.67818C6.7284 2 8.47078 2 11.9556 2H20.0444C23.5292 2 25.2716 2 26.6026 2.67818C27.7734 3.27473 28.7253 4.22661 29.3218 5.39739C30 6.7284 30 8.47078 30 11.9556V20.0444C30 23.5292 30 25.2716 29.3218 26.6026C28.7253 27.7734 27.7734 28.7253 26.6026 29.3218C25.2716 30 23.5292 30 20.0444 30H11.9556C8.47078 30 6.7284 30 5.39739 29.3218C4.22661 28.7253 3.27473 27.7734 2.67818 26.6026C2 25.2716 2 23.5292 2 20.0444V11.9556Z" fill="white"></path> 
                      <path d="M22.0515 8.52295L16.0644 13.1954L9.94043 8.52295V8.52421L9.94783 8.53053V15.0732L15.9954 19.8466L22.0515 15.2575V8.52295Z" fill="#EA4335"></path> 
                      <path d="M23.6231 7.38639L22.0508 8.52292V15.2575L26.9983 11.459V9.17074C26.9983 9.17074 26.3978 5.90258 23.6231 7.38639Z" fill="#FBBC05"></path> 
                      <path d="M22.0508 15.2575V23.9924H25.8428C25.8428 23.9924 26.9219 23.8813 26.9995 22.6513V11.459L22.0508 15.2575Z" fill="#34A853"></path> 
                      <path d="M9.94811 24.0001V15.0732L9.94043 15.0669L9.94811 24.0001Z" fill="#C5221F"></path> 
                      <path d="M9.94014 8.52404L8.37646 7.39382C5.60179 5.91001 5 9.17692 5 9.17692V11.4651L9.94014 15.0667V8.52404Z" fill="#C5221F"></path> 
                      <path d="M9.94043 8.52441V15.0671L9.94811 15.0734V8.53073L9.94043 8.52441Z" fill="#C5221F"></path> 
                      <path d="M5 11.4668V22.6591C5.07646 23.8904 6.15673 24.0003 6.15673 24.0003H9.94877L9.94014 15.0671L5 11.4668Z" fill="#4285F4"></path> 
                    </g>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs lg:text-sm font-medium text-gray-900">
                      Your Business Name
                    </span>
                    <span className="text-xs text-gray-500 flex-shrink-0" style={{ fontSize: '10px' }}>
                      Now
                    </span>
                  </div>
                  <p className="text-xs lg:text-sm font-medium text-gray-900 mb-1">
                    Your service request link
                  </p>
                  <p className="text-[10px] text-gray-600">
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
    const [animationPhase, setAnimationPhase] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setAnimationPhase(prev => (prev + 1) % 2);
      }, 3000); // 3 seconds per phase

      return () => clearInterval(interval);
    }, []);

    // Static pills that are always visible - positioned around the blue icon
    const staticPills = [
      { text: 'Schedule Appointment', angle: 240, color: 'blue' }, // Bottom-left
      { text: 'Payment Request', angle: 0, color: 'green' }, // Right side
      { text: 'Document Download', angle: 120, color: 'purple' } // Top-left
    ];

    return (
      <div className="relative h-32 w-full">
        {/* Circular blue icon with + - positioned at top */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-lg font-bold">+</span>
        </div>

        {/* Static pills around the icon - always visible with floating animation */}
        {staticPills.map((pill, index) => {
          const angle = pill.angle;
          const radius = 35; // Reduced radius for less vertical gap
          const x = Math.cos(angle * Math.PI / 180) * radius;
          const y = Math.sin(angle * Math.PI / 180) * radius + 20; // Move all pills down by 20px
          
          // Floating animation effect
          const floatOffset = animationPhase === 0 ? 0 : Math.sin(Date.now() * 0.002 + index) * 3;
          const scale = animationPhase === 0 ? 1 : 0.95 + Math.sin(Date.now() * 0.003 + index) * 0.05;

          // Color configuration for each pill
          const colorConfig = {
            blue: {
              border: 'border-blue-400',
              gradient: 'from-white to-blue-100',
              text: 'text-blue-800'
            },
            green: {
              border: 'border-green-400',
              gradient: 'from-white to-green-100',
              text: 'text-green-800'
            },
            purple: {
              border: 'border-purple-400',
              gradient: 'from-white to-purple-100',
              text: 'text-purple-800'
            }
          };

          const config = colorConfig[pill.color];

          return (
            <div
              key={index}
              className={`absolute top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-b ${config.gradient} border-2 ${config.border} rounded-full px-2 py-1 text-xs ${config.text} shadow-sm transition-all duration-1000 ease-in-out whitespace-nowrap`}
              style={{
                transform: `translate(${x}px, ${y + floatOffset}px) translate(-50%, -50%) scale(${scale})`,
                opacity: 0.8 + Math.sin(Date.now() * 0.001 + index) * 0.2
              }}
            >
              {pill.text}
            </div>
          );
        })}

        {/* Smartphone browser bottom - mobile browser style */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-2 w-full">
          <div className="flex items-center space-x-2">
            {/* Globe icon */}
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 text-gray-600">
              <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
              <ellipse cx="10" cy="10" rx="4" ry="9" stroke="currentColor" strokeWidth="2" />
              <line x1="1" y1="10" x2="19" y2="10" stroke="currentColor" strokeWidth="2" />
              <line x1="10" y1="1" x2="10" y2="19" stroke="currentColor" strokeWidth="2" />
            </svg>
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded px-2 py-1 min-w-0">
              <div className="text-xs text-gray-700 truncate">
                <span className="text-gray-500">flowia.io</span>/yourbusiness/s/SVDGDS
              </div>
            </div>
          </div>
        </div>
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
          
          
          <div className="space-y-8 lg:space-y-8">
            {steps.map((step, index) => {
              const isVisible = visibleSteps.includes(index);
              const isEven = index % 2 === 0;
              const timelineReached = timelineProgress >= (index + 0.1) / steps.length;
              
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
                    className={`timeline-dot-absolute absolute w-8 h-8 lg:w-12 lg:h-12 rounded-full shadow-lg z-10 transition-all duration-700 ease-out flex items-center justify-center text-white text-sm lg:text-lg ${
                      timelineReached 
                        ? 'bg-blue-500 scale-75 lg:scale-100 shadow-xl' 
                        : 'bg-gray-300 scale-75'
                    }`}
                    style={{
                      left: '0px',
                      top: '0%',
                      transform: 'translateY(-0%)',
                      transitionDelay: timelineReached ? `${index * 100}ms` : '0ms'
                    }}
                  >
                    {step.id}
                  </div>
                         
                  {/* Step content */}
                  <div className={`w-[85%] lg:w-5/12 max-w-[250px] lg:max-w-[380px] transition-all duration-800 ease-out ${
                    isEven ? 'ml-10 lg:ml-0 lg:pr-2 text-left lg:text-right' : 'ml-10 lg:ml-auto lg:pl-2 text-left'
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
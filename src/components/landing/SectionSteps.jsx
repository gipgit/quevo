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

  // Use the passed locale prop instead of detecting from URL
  const currentLocale = ['it', 'en', 'es', 'de', 'fr'].includes(locale) ? locale : 'it';
  const steps = getStepsData(currentLocale);

  // UI Simulation for each step
  const getUISimulation = (stepId) => {
    switch (stepId) {
      case 1:
        return (
          <div className="space-y-2">
            <div className="bg-blue-50 rounded p-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-blue-900">Richiesta Servizio</span>
              </div>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <div className="text-xs text-gray-600">Mario Rossi</div>
              <div className="text-xs text-gray-500">Consulenza legale</div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-2">
            <div className="bg-green-50 rounded p-2">
              <div className="text-xs font-medium text-green-900 mb-1">Calendario</div>
              <div className="grid grid-cols-7 gap-1">
                {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((day, i) => (
                  <div key={i} className="text-xs text-center text-gray-500">{day}</div>
                ))}
                {Array.from({ length: 7 }, (_, i) => (
                  <div key={i} className={`text-xs text-center py-1 rounded ${
                    i === 3 ? 'bg-green-500 text-white' : 'text-gray-400'
                  }`}>
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-2">
            <div className="bg-purple-50 rounded p-2">
              <div className="text-xs font-medium text-purple-900 mb-1">Preventivo</div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Consulenza (2h)</span>
                  <span className="font-medium">€120</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Analisi</span>
                  <span className="font-medium">€80</span>
                </div>
                <div className="border-t pt-1 flex justify-between text-xs font-bold">
                  <span>Totale</span>
                  <span className="text-purple-600">€200</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="bg-gray-50 rounded p-2">
            <div className="text-xs text-gray-500 text-center">UI Preview</div>
          </div>
        );
    }
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
    <section className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
        
        <h2 className='text-center text-3xl lg:text-4xl font-bold mb-16'>{t('Steps.steps.processManagementTitle')}</h2>

        {/* Vertical Timeline Layout */}
        <div className="relative max-w-6xl mx-auto" data-timeline-container>
          {/* Timeline line - centered with progressive growth */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 bg-gray-300"></div>
          <div 
            ref={timelineRef}
            className="absolute left-1/2 transform -translate-x-1/2 top-0 w-1 bg-gradient-to-b from-blue-500 via-blue-400 to-blue-300"
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
                  {/* Timeline dot with number - centered */}
                  <div className={`absolute left-1/2 transform -translate-x-1/2 w-12 h-12 lg:w-16 lg:h-16 rounded-full shadow-lg z-10 transition-all duration-700 ease-out flex items-center justify-center text-white text-lg lg:text-xl font-bold ${
                    timelineReached 
                      ? 'bg-blue-500 scale-75 lg:scale-100 shadow-xl' 
                      : 'bg-gray-300 scale-75'
                  }`}
                  style={{
                    transitionDelay: timelineReached ? `${index * 200}ms` : '0ms'
                  }}>
                           {step.id}
                         </div>
                         
                  {/* Step content */}
                  <div className={`w-5/12 transition-all duration-800 ease-out ${
                    isEven ? 'pr-1 lg:pr-8 text-right' : 'ml-auto pl-1 lg:pl-8 text-left'
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
                      
                      {/* UI Simulation Card */}
                      <div className={`bg-white rounded-lg shadow-md border border-gray-200 p-3 transition-all duration-600 ease-out ${
                        isEven ? 'ml-auto' : 'mr-auto'
                      } ${
                        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                      }`} 
                      style={{ 
                        width: '200px',
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
// components/landing/SectionSteps.jsx
'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getStepsData } from '@/lib/step-templates';

export default function SectionSteps({ locale }) {
  const t = useTranslations('Landing');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(3000); // 3 seconds per step

  // Use the passed locale prop instead of detecting from URL
  const currentLocale = ['it', 'en', 'es'].includes(locale) ? locale : 'it';
  const steps = getStepsData(currentLocale);

  // Auto-play slideshow
  useEffect(() => {
    if (!isAutoPlaying) {
      setTimeRemaining(5000);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 5000 - elapsed);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        setCurrentStepIndex((prev) => (prev + 1) % steps.length);
        setTimeRemaining(5000);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isAutoPlaying, currentStepIndex]);

  const handleStepSelect = (index) => {
    setCurrentStepIndex(index);
    setIsAutoPlaying(false);
    setTimeRemaining(5000);
    
    // Resume auto-play after 10 seconds of manual navigation
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const currentStep = steps[currentStepIndex];
  const progressPercentage = ((5000 - timeRemaining) / 5000) * 100;

  return (
    <section className="min-h-screen bg-gray-50 flex items-center">
      <div className="container mx-auto px-6 lg:px-12 py-16 max-w-7xl">
        
        <h2 className='text-center text-3xl lg:text-4xl font-bold mb-6'>{t('Steps.steps.processManagementTitle')}</h2>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Timeline Steps */}
          <div className="space-y-6 flex flex-col">
            {/* Timeline Steps */}
            <div className="space-y-6 flex-1">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`relative border-2 rounded-2xl transition-all duration-300 cursor-pointer ${
                    index === currentStepIndex
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleStepSelect(index)}
                >
                  {/* Timeline connector */}
                  {index < steps.length - 1 && (
                    <div className={`absolute left-6 top-full w-0.5 h-6 ${
                      index === currentStepIndex ? 'bg-blue-500' : 'bg-gray-300'
                    }`} />
                  )}

                   {/* Step Header */}
                   <div className="p-4 lg:px-6 lg:py-4">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2 lg:gap-4 flex-1">
                         {/* Step number circle */}
                         <div className={`flex-shrink-0 w-6 h-6 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-white text-sm lg:text-base ${
                           index === currentStepIndex 
                             ? 'bg-blue-500 shadow-lg' 
                             : 'bg-gray-400'
                         }`}>
                           {step.id}
                         </div>
                         
                         <div className="flex-1">
                           <h3 className={`text-lg font-semibold leading-tight ${
                             index === currentStepIndex ? 'text-blue-700' : 'text-gray-900'
                           }`}>
                             {step.title}
                           </h3>
                         </div>
                       </div>
                       
                       {/* Arrow icon */}
                       <svg 
                         className={`w-5 h-5 ml-4 transition-transform duration-300 ${
                           index === currentStepIndex ? 'rotate-180 text-blue-500' : 'text-gray-400'
                         }`}
                         fill="none" 
                         stroke="currentColor" 
                         viewBox="0 0 24 24"
                       >
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                       </svg>
                     </div>
                   </div>

                                                        {/* Step Details (expanded content) */}
                   {index === currentStepIndex && (
                     <div className="px-6 pb-4">
                       <p className="text-gray-700 text-sm lg:text-base leading-tight">
                         {step.description}
                       </p>
                     </div>
                   )}
                   
                   {/* Progress indicator as bottom border for active step */}
                   {index === currentStepIndex && isAutoPlaying && (
                     <div className="h-1 bg-gray-200 rounded-b-lg overflow-hidden">
                       <div 
                         className="h-full bg-blue-500 transition-all duration-50 ease-linear"
                         style={{ width: `${progressPercentage}%` }}
                       />
                     </div>
                   )}
                 </div>
              ))}
            </div>
          </div>

                     {/* Right Column - Step Image */}
           <div className="relative flex items-center justify-center">
             <div className="bg-gradient-to-t from-gray-100 to-gray-50 rounded-2xl shadow-2xl p-4 lg:p-8 w-full h-full flex flex-col items-center justify-center">
               {/* Step illustration */}
               <div className="relative w-[260px] lg:w-[280px] h-[450px] lg:h-[500px] bg-gray-800 rounded-2xl shadow-2xl p-2">
                {/* Image container with gradient overlay */}
                <div className={`relative w-full h-full rounded-xl overflow-hidden bg-gradient-to-br ${currentStep.gradient}`}>
                  <img 
                    src={currentStep.image}
                    alt={currentStep.title}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                    onLoad={(e) => {
                      e.target.style.display = 'block';
                      e.target.nextSibling.style.display = 'none';
                    }}
                  />
                  {/* Fallback content */}
                  <div 
                    className={`w-full h-full bg-gradient-to-br ${currentStep.gradient} hidden items-center justify-center`}
                    style={{ display: 'none', minWidth: '100%', minHeight: '400px' }}
                  >
                    <div className="text-center text-white">
                      <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
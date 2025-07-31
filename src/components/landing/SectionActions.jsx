// components/landing/SectionActions.jsx
'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { features, getFeatureData, getActionIconAndColor } from '@/lib/action-templates';

export default function SectionActions({ locale }) {
  const t = useTranslations('Landing');
  const tCommon = useTranslations('Common');
  const [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(4000); // 4 seconds per action

  // Use the passed locale prop instead of detecting from URL
  const currentLocale = ['it', 'en', 'es'].includes(locale) ? locale : 'it';

  // Auto-play slideshow
  useEffect(() => {
    if (!isAutoPlaying) {
      setTimeRemaining(4000);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 4000 - elapsed);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        setCurrentActionIndex((prev) => (prev + 1) % features.length);
        setTimeRemaining(4000);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isAutoPlaying, currentActionIndex]);

  const handleActionSelect = (index) => {
    setCurrentActionIndex(index);
    setIsAutoPlaying(false);
    setTimeRemaining(4000);
    
    // Resume auto-play after 8 seconds of manual navigation
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const currentAction = features[currentActionIndex];
  const progressPercentage = ((4000 - timeRemaining) / 4000) * 100;

  // Get localized action data
  const getLocalizedAction = (action) => {
    return getFeatureData(action.key, currentLocale);
  };

  const localizedCurrentAction = getLocalizedAction(currentAction);

  return (
    <section className="min-h-screen bg-white flex items-center">
      <div className="container mx-auto px-12 py-16 max-w-7xl">

        {/* Primary Title Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
            {t('Actions.title')}
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
            {t('Actions.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-stretch">
          
          
          
          <div className="space-y-6 flex flex-col">
           

              {/* Actions List */}
             <div className="space-y-2 flex-1">
               {features.map((action, index) => {
                 const localizedAction = getLocalizedAction(action);
                 return (
                   <div
                     key={action.id}
                     className={`border-2 rounded-xl transition-all duration-300 cursor-pointer ${
                       index === currentActionIndex
                         ? 'border-blue-500 bg-blue-50 shadow-lg'
                         : 'border-gray-200 hover:border-gray-300'
                     }`}
                     onClick={() => handleActionSelect(index)}
                   >
                     {/* Action Header */}
                     <div className="p-4">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4 flex-1">
                           {/* Action Icon */}
                           <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                             getActionIconAndColor(action.key).color
                           }`}>
                             <img 
                               src={getActionIconAndColor(action.key).icon}
                               alt={localizedAction.title}
                               className="w-5 h-5"
                               onError={(e) => {
                                 e.target.style.display = 'none';
                                 e.target.nextSibling.style.display = 'block';
                               }}
                             />
                             <svg 
                               className="w-5 h-5 text-gray-600"
                               style={{ display: 'none' }}
                               fill="currentColor" 
                               viewBox="0 0 20 20"
                             >
                               <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                             </svg>
                           </div>
                           
                           <div className="flex-1">
                             <h3 className={`text-lg font-semibold ${
                               index === currentActionIndex ? 'text-blue-700' : 'text-gray-900'
                             }`}>
                               {localizedAction.title}
                             </h3>
                           </div>
                         </div>
                         
                         {/* Arrow icon */}
                         <svg 
                           className={`w-5 h-5 ml-4 transition-transform duration-300 ${
                             index === currentActionIndex ? 'rotate-180 text-blue-500' : 'text-gray-400'
                           }`}
                           fill="none" 
                           stroke="currentColor" 
                           viewBox="0 0 24 24"
                         >
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                         </svg>
                       </div>
                     </div>

                     {/* Action Details (expanded content) */}
                     {index === currentActionIndex && (
                       <div className="px-4 pb-4">
                         <p className="text-gray-700 leading-tight">
                           {localizedAction.description}
                         </p>
                       </div>
                     )}

                     {/* Progress indicator at bottom of card */}
                     {index === currentActionIndex && isAutoPlaying && (
                       <div className="h-1 bg-blue-500 transition-all duration-50 ease-linear rounded-b-lg"
                            style={{ width: `${progressPercentage}%` }}>
                       </div>
                     )}
                  </div>
                );
              })}
            </div>
          </div>

                     {/* Right Column - Action Image */}
           <div className="relative flex items-center justify-center">
             <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-2xl p-8 w-full h-full flex flex-col items-center justify-center">
               {/* Static link pill */}
               <div className="text-center mb-8">
                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                   </svg>
                   <span>{tCommon('domainPrefix')}</span>
                 </div>
               </div>

               {/* Smartphone frame */}
               <div className="relative w-[360px] h-[600px] bg-gray-800 rounded-3xl shadow-2xl p-2">
                {/* Image container with gradient overlay */}
                <div className={`relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br ${localizedCurrentAction.gradient}`}>
                  <img 
                    src={localizedCurrentAction.image}
                    alt={localizedCurrentAction.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  {/* Fallback content */}
                  <div 
                    className={`w-full h-full bg-gradient-to-br ${localizedCurrentAction.gradient} hidden items-center justify-center`}
                    style={{ display: 'none' }}
                  >
                    <div className="text-center text-white">
                      <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                      <p className="text-lg font-semibold">{localizedCurrentAction.title}</p>
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
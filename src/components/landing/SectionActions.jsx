// components/landing/SectionActions.jsx
'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { features, getFeatureData, getActionIconAndColor } from '@/lib/unified-action-system';
import ActionCardScreenshot from './ActionCardScreenshot';

export default function SectionActions({ locale }) {
  const t = useTranslations('Landing');
  const tCommon = useTranslations('Common');
  const [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(4000); // 4 seconds per action

  // Use the passed locale prop instead of detecting from URL
  const currentLocale = ['it', 'en', 'es', 'de', 'fr'].includes(locale) ? locale : 'it';

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
      <div className="container mx-auto px-6 lg:px-12 py-16 max-w-7xl">

        {/* Primary Title Section */}
        <div className="text-center mb-8 lg:mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
            {t('Actions.title')}
          </h1>
          <p className="text-md lg:text-xl text-gray-600 leading-tight lg:leading-relaxed max-w-3xl mx-auto mb-8">
            {t('Actions.subtitle')}
          </p>
        </div>

        {/* Actions Cards Row - Moved above the preview */}
        <div className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 max-w-7xl mx-auto">
            {features.map((action, index) => {
              const localizedAction = getLocalizedAction(action);
              return (
                <div
                  key={action.id}
                  className={`border rounded-xl transition-all duration-300 cursor-pointer text-center ${
                    index === currentActionIndex
                      ? 'border-blue-400 bg-blue-50 shadow-md'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                  onClick={() => handleActionSelect(index)}
                >
                  {/* Action Header */}
                  <div className="p-2">
                    {/* Action Icon - Much bigger and centered, rounder */}
                    <div className={`flex-shrink-0 w-14 h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${
                      getActionIconAndColor(action.key).color
                    }`}>
                      <img 
                        src={getActionIconAndColor(action.key).icon}
                        alt={localizedAction.title}
                        className="w-7 h-7 lg:w-8 lg:h-8"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <svg 
                        className="w-7 h-7 lg:w-8 lg:h-8 text-gray-600"
                        style={{ display: 'none' }}
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    
                    {/* Action Title - Centered, not bold */}
                    <h3 className={`text-xs lg:text-sm font-normal leading-tight ${
                      index === currentActionIndex ? 'text-blue-700' : 'text-gray-900'
                    }`}>
                      {localizedAction.title}
                    </h3>

                    {/* Progress indicator at bottom of card */}
                    {index === currentActionIndex && isAutoPlaying && (
                      <div className="h-1 bg-blue-500 transition-all duration-50 ease-linear rounded-b-lg"
                           style={{ width: `${progressPercentage}%` }}>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Card Screenshot Preview - Now full width below the actions */}
        <div className="flex justify-center">
          <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-8 lg:p-12 overflow-hidden max-w-4xl w-full">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 lg:p-12">
              {/* Action Description - Added above the screenshot */}
              <div className="text-center mb-6">
                <h3 className="text-lg lg:text-xl font-medium text-gray-800 mb-3">
                  {localizedCurrentAction.title}
                </h3>
                <p className="text-sm lg:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
                  {localizedCurrentAction.description}
                </p>
              </div>
              
              {/* Action Card Screenshot */}
              <div className="flex justify-center">
                <ActionCardScreenshot 
                  action={{
                    title: localizedCurrentAction.title,
                    description: localizedCurrentAction.description,
                    iconData: getActionIconAndColor(currentAction.key),
                    gradient: localizedCurrentAction.gradient
                  }}
                  className="shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
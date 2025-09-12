// components/landing/SectionFeatures.jsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import FeaturePreview from './FeaturePreview';

export default function SectionFeatures({ locale }) {
  const t = useTranslations('Landing');
  const [selectedFeature, setSelectedFeature] = useState('serviceRequests');

  // Features data
  const featuresCards = [
    {
      id: 'serviceRequests',
      icon: "✓",
      title: t('Features.cards.serviceRequests.title'),
      description: t('Features.cards.serviceRequests.description')
    },
    {
      id: 'appointmentsScheduling',
      icon: "✓",
      title: t('Features.cards.appointmentsScheduling.title'),
      description: t('Features.cards.appointmentsScheduling.description')
    },
    {
      id: 'quoteSimulation',
      icon: "✓",
      title: t('Features.cards.quoteSimulation.title'),
      description: t('Features.cards.quoteSimulation.description')
    },
    
  ];

  return (
    <section className="min-h-screen bg-white flex items-center">
      <div className="container mx-auto px-6 lg:px-12 py-16 max-w-7xl">
        {/* Title Section */}
        <div className="text-center mb-8 lg:mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
            {t('Features.title')}
          </h2>
          <p className="text-base lg:text-xl text-gray-600 leading-tight lg:leading-relaxed max-w-3xl mx-auto mb-8">
            {t('Features.subtitle')}
          </p>
        </div>

        {/* Mobile Layout - Preview First, then Cards */}
        <div className="lg:hidden space-y-8">
          {/* Mobile Preview - Show first on mobile */}
          <div>
            <FeaturePreview featureType={selectedFeature} locale={locale} />
          </div>
          
          {/* Mobile Features List - Show below preview */}
          <div className="space-y-4">
            {featuresCards.map((card, index) => (
              <div
                key={index}
                onClick={() => setSelectedFeature(card.id)}
                className={`p-3 cursor-pointer transition-all duration-200 border-l-4 ${
                  selectedFeature === card.id 
                    ? 'border-blue-500 bg-blue-50/30' 
                    : 'border-transparent hover:border-gray-300 hover:bg-gray-50/50'
                }`}
              >
                <div className="flex flex-row gap-4 items-start">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    selectedFeature === card.id ? 'bg-blue-500' : 'bg-gray-200'
                  }`}>
                    <svg className={`w-4 h-4 ${
                      selectedFeature === card.id ? 'text-white' : 'text-gray-600'
                    }`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold mb-1 leading-tight ${
                      selectedFeature === card.id ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {card.title}
                    </h3>
                  </div>
                </div>
                {selectedFeature === card.id && (
                  <p className="text-xs lg:text-sm text-gray-600 leading-tight lg:leading-relaxed mt-2 ml-10">
                    {card.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Layout - 2-Column Layout */}
        <div className="hidden lg:grid grid-cols-5 gap-12 max-w-7xl mx-auto">
          {/* Left Column - Features List */}
          <div className="col-span-2 space-y-6">
            {featuresCards.map((card, index) => (
              <div
                key={index}
                onClick={() => setSelectedFeature(card.id)}
                className={`p-3 cursor-pointer transition-all duration-200 border-l-4 ${
                  selectedFeature === card.id 
                    ? 'border-blue-500 bg-blue-50/30' 
                    : 'border-transparent hover:border-gray-300 hover:bg-gray-50/50'
                }`}
              >
                <div className="flex flex-row gap-4 items-start">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    selectedFeature === card.id ? 'bg-blue-500' : 'bg-gray-200'
                  }`}>
                    <svg className={`w-4 h-4 ${
                      selectedFeature === card.id ? 'text-white' : 'text-gray-600'
                    }`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold mb-1 leading-tight ${
                      selectedFeature === card.id ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {card.title}
                    </h3>
                  </div>
                </div>
                {selectedFeature === card.id && (
                  <p className="text-xs lg:text-sm text-gray-600 leading-tight lg:leading-relaxed mt-2 ml-10">
                    {card.description}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Right Column - Feature Preview */}
          <div className="col-span-3">
            <FeaturePreview featureType={selectedFeature} locale={locale} />
          </div>
        </div>
      </div>
    </section>
  );
}
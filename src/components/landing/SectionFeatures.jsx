// components/landing/SectionFeatures.jsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import FeaturePreview from './FeaturePreview';

export default function SectionFeatures({ locale }) {
  const t = useTranslations('Landing');
  const [selectedFeature, setSelectedFeature] = useState('serviceRequests');

  // Features data with unique colors
  const featuresCards = [
    {
      id: 'serviceRequests',
      icon: "✓",
      title: t('Features.cards.serviceRequests.title'),
      description: t('Features.cards.serviceRequests.description'),
      color: {
        primary: '#8B5CF6', // violet-500
        shadow: '#A78BFA', // violet-400
        gradient: {
          from: '#DDD6FE', // violet-200
          via: '#C4B5FD', // violet-300
          to: '#A78BFA' // violet-400
        }
      }
    },
    {
      id: 'appointmentsScheduling',
      icon: "✓",
      title: t('Features.cards.appointmentsScheduling.title'),
      description: t('Features.cards.appointmentsScheduling.description'),
      color: {
        primary: '#10B981', // emerald-500
        shadow: '#34D399', // emerald-400
        gradient: {
          from: '#A7F3D0', // emerald-200
          via: '#6EE7B7', // emerald-300
          to: '#34D399' // emerald-400
        }
      }
    },
    {
      id: 'quoteSimulation',
      icon: "✓",
      title: t('Features.cards.quoteSimulation.title'),
      description: t('Features.cards.quoteSimulation.description'),
      color: {
        primary: '#F59E0B', // amber-500
        shadow: '#FBBF24', // amber-400
        gradient: {
          from: '#FDE68A', // amber-200
          via: '#FCD34D', // amber-300
          to: '#FBBF24' // amber-400
        }
      }
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

        {/* Mobile Layout - Features List First, then Preview */}
        <div className="lg:hidden space-y-8">
          {/* Mobile Features List - Show first on mobile */}
          <div className="space-y-2">
            {featuresCards.map((card, index) => (
              <div
                key={index}
                onClick={() => setSelectedFeature(card.id)}
                className={`relative p-3 pl-6 cursor-pointer transition-all duration-200 border-l-4 border-transparent ${
                  selectedFeature === card.id 
                    ? 'bg-gray-50/50' 
                    : 'hover:bg-gray-50/50'
                }`}
              >
                {/* Absolutely positioned checkmark icon with custom shadow */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2">
                  {/* Custom shadow layer */}
                  <div 
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl transition-all duration-300 ease-linear ${
                      selectedFeature === card.id 
                        ? 'w-10 h-10 opacity-60' 
                        : 'w-6 h-6 bg-gray-400 opacity-25'
                    }`}
                    style={selectedFeature === card.id ? { backgroundColor: card.color.shadow } : {}}
                  ></div>
                  
                  {/* Checkmark icon */}
                  <div 
                    className={`relative w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      selectedFeature === card.id 
                        ? 'border-2' 
                        : 'bg-white border-2 border-gray-300'
                    }`}
                    style={selectedFeature === card.id ? { 
                      backgroundColor: card.color.primary,
                      borderColor: card.color.primary
                    } : {}}
                  >
                    <svg className={`w-3 h-3 ${
                      selectedFeature === card.id ? 'text-white' : 'text-gray-400'
                    }`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                {/* Content */}
                <div>
                  <h3 className={`text-base lg:text-xl font-medium mb-1 leading-tight ${
                    selectedFeature === card.id ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {card.title}
                  </h3>
                  {selectedFeature === card.id && (
                    <p className="text-xs lg:text-sm text-gray-600 leading-tight lg:leading-relaxed mt-2">
                      {card.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Mobile Preview - Show below features list */}
          <div>
            <FeaturePreview 
              featureType={selectedFeature} 
              locale={locale}
              featureColor={featuresCards.find(f => f.id === selectedFeature)?.color}
            />
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
                className={`p-3 cursor-pointer transition-all duration-200 border-l-4 border-transparent ${
                  selectedFeature === card.id 
                    ? 'bg-gray-50/50' 
                    : 'hover:bg-gray-50/50'
                }`}
              >
                <div className="flex flex-row gap-4 items-start">
                  {/* Checkmark icon with custom shadow */}
                  <div className="flex-shrink-0 relative">
                    {/* Custom shadow layer */}
                    <div 
                      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl transition-all duration-300 ease-linear ${
                        selectedFeature === card.id 
                          ? 'w-12 h-12 opacity-60' 
                          : 'w-7 h-7 bg-gray-400 opacity-25'
                      }`}
                      style={selectedFeature === card.id ? { backgroundColor: card.color.shadow } : {}}
                    ></div>
                    
                    {/* Checkmark icon */}
                    <div 
                      className={`relative w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        selectedFeature === card.id 
                          ? 'border-2' 
                          : 'bg-white border-2 border-gray-300'
                      }`}
                      style={selectedFeature === card.id ? { 
                        backgroundColor: card.color.primary,
                        borderColor: card.color.primary
                      } : {}}
                    >
                      <svg className={`w-4 h-4 ${
                        selectedFeature === card.id ? 'text-white' : 'text-gray-400'
                      }`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-base lg:text-xl font-medium mb-1 leading-tight ${
                      selectedFeature === card.id ? 'text-gray-900' : 'text-gray-500'
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
            <FeaturePreview 
              featureType={selectedFeature} 
              locale={locale}
              featureColor={featuresCards.find(f => f.id === selectedFeature)?.color}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
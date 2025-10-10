// components/landing/SectionMarketingFeatures.jsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function SectionMarketingFeatures({ locale }) {
  const t = useTranslations('Landing');
  const [selectedFeature, setSelectedFeature] = useState('socialMedia');

  // Marketing features data with unique colors
  const marketingFeatures = [
    {
      id: 'socialMedia',
      icon: "📱",
      title: t('MarketingFeatures.cards.socialMedia.title'),
      description: t('MarketingFeatures.cards.socialMedia.description'),
      color: {
        primary: '#D946EF', // fuchsia-500
        shadow: '#E879F9' // fuchsia-400
      }
    },
    {
      id: 'emailMarketing',
      icon: "📧",
      title: t('MarketingFeatures.cards.emailMarketing.title'),
      description: t('MarketingFeatures.cards.emailMarketing.description'),
      color: {
        primary: '#F97316', // orange-500
        shadow: '#FB923C' // orange-400
      }
    }
  ];

  const renderFeaturePreview = () => {
    const currentFeature = marketingFeatures.find(f => f.id === selectedFeature);
    
    return (
      <div 
        className="rounded-3xl p-4 lg:p-8 w-full shadow-[0_4px_20px_rgba(148,163,184,0.15)] backdrop-blur-sm transition-all duration-300 ease-linear border"
        style={{
          background: `linear-gradient(to bottom right, #000000, ${currentFeature?.color.primary || '#9CA3AF'})`,
          borderColor: currentFeature?.color.primary || '#9CA3AF'
        }}
      >
        <div className="bg-white rounded-2xl p-8 lg:p-12 min-h-[300px] lg:min-h-[400px] flex items-center justify-center">
          <div className="text-center space-y-4">
            <h3 className="text-xl lg:text-2xl font-semibold text-gray-900">
              {currentFeature?.title}
            </h3>
            <p className="text-sm lg:text-base text-gray-600 max-w-md mx-auto">
              Preview coming soon
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section 
      className="min-h-screen flex items-center relative overflow-hidden"
      style={{ backgroundColor: 'rgb(17, 17, 17)' }}
    >
      {/* Gradient Layer 1 - Top Left */}
      <div 
        className="absolute pointer-events-none"
        style={{
          background: 'linear-gradient(143deg, rgb(139, 92, 246) 0%, rgb(168, 85, 247) 50%, rgb(192, 132, 252) 100%)',
          filter: 'blur(80px)',
          borderRadius: '100%',
          opacity: 0.24,
          height: '548px',
          left: '-246px',
          top: '-186px',
          width: '658px',
          zIndex: 1
        }}
      ></div>
      
      {/* Gradient Layer 2 - Bottom Right */}
      <div 
        className="absolute pointer-events-none"
        style={{
          background: 'linear-gradient(140deg, rgb(251, 146, 60) 0%, rgb(249, 115, 22) 60%, rgb(234, 88, 12) 100%)',
          filter: 'blur(80px)',
          borderRadius: '100%',
          opacity: 0.20,
          height: '548px',
          right: '-86px',
          bottom: '-100px',
          width: '658px',
          zIndex: 1
        }}
      ></div>
      
      {/* Center gradient accent layer */}
      <div 
        className="absolute pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgb(217, 70, 239) 0%, rgb(168, 85, 247) 40%, transparent 100%)',
          filter: 'blur(100px)',
          opacity: 0.18,
          height: '500px',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '900px',
          zIndex: 1
        }}
      ></div>
      
      <div className="container mx-auto px-6 lg:px-12 py-16 max-w-7xl relative z-10">
        {/* Title Section */}
        <div className="text-center mb-8 lg:mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold leading-tight mb-4 drop-shadow-lg">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">{t('MarketingFeatures.title.highlighted')}</span> <span className="text-white">{t('MarketingFeatures.title.rest')}</span>
          </h2>
          <p className="text-lg lg:text-xl text-gray-300 leading-tight lg:leading-relaxed max-w-3xl mx-auto mb-8 drop-shadow-md">
            {t('MarketingFeatures.subtitle')}
          </p>
        </div>

        {/* Mobile Layout - Features List First, then Preview */}
        <div className="lg:hidden space-y-8">
          {/* Mobile Features List - Show first on mobile */}
          <div className="space-y-2">
            {marketingFeatures.map((feature, index) => (
              <div
                key={index}
                onClick={() => setSelectedFeature(feature.id)}
                className={`relative p-3 pl-6 cursor-pointer transition-all duration-200 border-l-4 border-transparent rounded-r-lg ${
                  selectedFeature === feature.id 
                    ? 'bg-white/10 backdrop-blur-sm' 
                    : 'hover:bg-white/5'
                }`}
              >
                {/* Absolutely positioned checkmark icon with custom shadow */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2">
                  {/* Custom shadow layer */}
                  <div 
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl transition-all duration-300 ease-linear ${
                      selectedFeature === feature.id 
                        ? 'w-10 h-10 opacity-60' 
                        : 'w-6 h-6 bg-gray-400 opacity-25'
                    }`}
                    style={selectedFeature === feature.id ? { backgroundColor: feature.color.shadow } : {}}
                  ></div>
                  
                  {/* Checkmark icon */}
                  <div 
                    className={`relative w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      selectedFeature === feature.id 
                        ? 'border-2' 
                        : 'bg-white/20 border-2 border-transparent'
                    }`}
                    style={selectedFeature === feature.id ? { 
                      backgroundColor: feature.color.primary,
                      borderColor: feature.color.primary
                    } : {}}
                  >
                    <svg className={`w-3 h-3 ${
                      selectedFeature === feature.id ? 'text-white' : 'text-gray-300'
                    }`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                {/* Content */}
                <div>
                  <h3 className={`text-base lg:text-xl font-medium mb-1 leading-tight ${
                    selectedFeature === feature.id ? 'text-white' : 'text-gray-400'
                  }`}>
                    {feature.title}
                  </h3>
                  <p className="text-xs lg:text-sm text-gray-300 leading-tight lg:leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Mobile Preview - Show below features list */}
          <div className="flex justify-center">
            <div className="w-full max-w-xl">
              {renderFeaturePreview()}
            </div>
          </div>
        </div>

        {/* Desktop Layout - 2-Column Layout */}
        <div className="hidden lg:grid grid-cols-2 gap-6 lg:gap-12 max-w-7xl mx-auto">
          {/* Features List */}
          <div className="space-y-6">
            {marketingFeatures.map((feature, index) => (
              <div
                key={index}
                onClick={() => setSelectedFeature(feature.id)}
                className={`flex flex-row gap-4 p-3 items-start cursor-pointer transition-all duration-200 border-l-4 border-transparent rounded-r-lg ${
                  selectedFeature === feature.id 
                    ? 'bg-white/10 backdrop-blur-sm' 
                    : 'hover:bg-white/5'
                }`}
              >
                {/* Checkmark icon with custom shadow */}
                <div className="flex-shrink-0 relative">
                  {/* Custom shadow layer */}
                  <div 
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl transition-all duration-300 ease-linear ${
                      selectedFeature === feature.id 
                        ? 'w-12 h-12 opacity-60' 
                        : 'w-7 h-7 bg-gray-400 opacity-25'
                    }`}
                    style={selectedFeature === feature.id ? { backgroundColor: feature.color.shadow } : {}}
                  ></div>
                  
                  {/* Checkmark icon */}
                  <div 
                    className={`relative w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      selectedFeature === feature.id 
                        ? 'border-2' 
                        : 'bg-white/20 border-2 border-transparent'
                    }`}
                    style={selectedFeature === feature.id ? { 
                      backgroundColor: feature.color.primary,
                      borderColor: feature.color.primary
                    } : {}}
                  >
                    <svg className={`w-4 h-4 ${
                      selectedFeature === feature.id ? 'text-white' : 'text-gray-300'
                    }`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className={`text-base lg:text-xl font-medium mb-1 leading-tight ${
                    selectedFeature === feature.id ? 'text-white' : 'text-gray-400'
                  }`}>
                    {feature.title}
                  </h3>
                  <p className="text-xs lg:text-sm text-gray-300 leading-tight lg:leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Preview */}
          <div className="flex justify-center">
            <div className="w-full max-w-xl">
              {renderFeaturePreview()}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}



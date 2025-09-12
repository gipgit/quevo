// components/landing/SectionSupportFeatures.jsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function SectionSupportFeatures({ locale }) {
  const t = useTranslations('Landing');
  const [selectedFeature, setSelectedFeature] = useState('textCorrection');

  // Support features data
  const supportFeatures = [
    {
      id: 'aiTicketClassification',
      icon: "🤖",
      title: t('SupportFeatures.features.aiTicketClassification.title'),
      description: t('SupportFeatures.features.aiTicketClassification.description')
    },
    {
      id: 'smartResponseSuggestions',
      icon: "💡",
      title: t('SupportFeatures.features.smartResponseSuggestions.title'),
      description: t('SupportFeatures.features.smartResponseSuggestions.description')
    },
    {
      id: 'textCorrection',
      icon: "✏️",
      title: t('SupportFeatures.features.textCorrection.title'),
      description: t('SupportFeatures.features.textCorrection.description')
    }
  ];

  const renderFeaturePreview = () => {
    switch (selectedFeature) {
      case 'aiTicketClassification':
        return (
          <div 
            className="rounded-3xl p-4 lg:p-8 w-full shadow-[0_4px_20px_rgba(148,163,184,0.15)] backdrop-blur-sm"
            style={{
              background: 'linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)'
            }}
          >
            <div className="space-y-2">
              {/* Classification Results */}
              <div className="space-y-2">
                <div className="p-3 lg:p-4 bg-white rounded-2xl border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-normal text-gray-500">#SR-2024-001</span>
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">High Priority</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">"Website is down and customers can't place orders"</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">Technical Issue</span>
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">94% confidence</span>
                  </div>
                </div>

                <div className="p-3 lg:p-4 bg-white rounded-2xl border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-normal text-gray-500">#SR-2024-002</span>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Medium Priority</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">"How do I update my billing information?"</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">Account Support</span>
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">87% confidence</span>
                  </div>
                </div>

                <div className="p-3 lg:p-4 bg-white rounded-2xl border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-normal text-gray-500">#SR-2024-003</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Low Priority</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">"Feature request: Add dark mode to the app"</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">Feature Request</span>
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">91% confidence</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'smartResponseSuggestions':
        return (
          <div 
            className="rounded-3xl p-4 lg:p-8 w-full shadow-[0_4px_20px_rgba(148,163,184,0.15)] backdrop-blur-sm"
            style={{
              background: 'linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)'
            }}
          >
            <div className="space-y-2">
              {/* Customer Message */}
              <div className="p-3 lg:p-4 bg-white rounded-2xl border border-gray-200">
                <p className="text-sm text-gray-700">"Hi, I'm having trouble logging into my account. I keep getting an error message saying my password is incorrect, but I'm sure it's right."</p>
              </div>

              {/* AI Suggestions */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-gray-400">Suggested Responses:</h4>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-400">Recommended (95% match)</span>
                    </div>
                    <button className="px-2 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors">Use</button>
                  </div>
                  <div className="p-3 lg:p-4 bg-white rounded-2xl border-l-4 border-l-cyan-400">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mt-0.5">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <p className="text-xs text-gray-700 leading-normal">"Hi Sarah, I understand you're having trouble with your password. Let me help you reset it. I'll send you a secure password reset link to your registered email address. Please check your inbox and follow the instructions."</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs text-gray-400">Alternative (87% match)</span>
                    </div>
                    <button className="px-2 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors">Use</button>
                  </div>
                  <div className="p-3 lg:p-4 bg-white rounded-2xl border-l-4 border-l-blue-500">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mt-0.5">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <p className="text-xs text-gray-600 leading-normal">"Hello Sarah, I can help you with the login issue. Sometimes browsers save old passwords. Try clearing your browser cache or using an incognito window. If that doesn't work, I can reset your password."</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-xs text-gray-400">Escalation (82% match)</span>
                    </div>
                    <button className="px-2 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors">Use</button>
                  </div>
                  <div className="p-3 lg:p-4 bg-white rounded-2xl border-l-4 border-l-purple-500">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mt-0.5">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <p className="text-xs text-gray-600 leading-normal">"Hi Sarah, I'm escalating this to our technical team for immediate assistance. They'll investigate the login issue and get back to you within 15 minutes."</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'textCorrection':
        return (
          <div 
            className="rounded-3xl p-4 lg:p-8 w-full shadow-[0_4px_20px_rgba(148,163,184,0.15)] backdrop-blur-sm"
            style={{
              background: 'linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)'
            }}
          >
            <div className="space-y-2">
              {/* Text Correction Examples */}
              <div className="space-y-4">
                {/* Original Message */}
                <div className="space-y-2">
                  <div className="text-center">
                    <span className="text-xs font-normal text-gray-400">Original Message</span>
                    <span className="text-xs text-gray-400 ml-2">8 errors</span>
                    <span className="text-xs text-gray-400 ml-1">Poor readability</span>
                  </div>
                  <div className="p-3 lg:p-4 bg-white rounded-2xl border border-gray-200">
                    <p className="text-sm text-gray-700">"hi i hav a problem with my acount i cant login and i dont no why pls help me asap its urgent"</p>
                  </div>
                </div>

                {/* AI Enhanced Message */}
                <div className="space-y-2">
                  <div className="text-center">
                    <span className="text-xs font-normal text-gray-400">AI Enhanced Message</span>
                    <span className="text-xs text-gray-400 ml-2">8 fixes</span>
                    <span className="text-xs text-gray-400 ml-1">Excellent readability</span>
                  </div>
                  <div className="p-3 lg:p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-l-4 border-l-cyan-400">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mt-0.5">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-700">"Hi, I have a problem with my account. I can't login and I don't know why. Please help me as soon as possible, it's urgent."</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center relative overflow-hidden">
      {/* AI Pattern Overlay */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_75%_25%,rgba(148,163,184,0.06)_2px,transparent_2px)] bg-[length:30px_30px]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_25%_75%,rgba(255,255,255,0.04)_1.5px,transparent_1.5px)] bg-[length:25px_25px]"></div>
      </div>
      
      {/* Animated gradient orbs with shine effects */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-slate-600/15 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gray-600/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-slate-500/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      
      {/* Shine effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
      <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
      
      <div className="container mx-auto px-6 lg:px-12 py-16 max-w-7xl relative z-10">
        {/* Title Section */}
        <div className="text-center mb-8 lg:mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold leading-tight mb-4 drop-shadow-lg">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">{t('SupportFeatures.title.highlighted')}</span> <span className="text-white">{t('SupportFeatures.title.rest')}</span>
          </h2>
          <p className="text-lg lg:text-xl text-gray-300 leading-tight lg:leading-relaxed max-w-3xl mx-auto mb-8 drop-shadow-md">
            {t('SupportFeatures.subtitle')}
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 max-w-7xl mx-auto">
          {/* Mobile Preview - Show first on mobile */}
          <div className="lg:order-2 flex justify-center">
            <div className="w-full max-w-xl">
              {renderFeaturePreview()}
            </div>
          </div>

          {/* Features List - Show second on mobile */}
          <div className="lg:order-1 space-y-3 lg:space-y-6">
            {supportFeatures.map((feature, index) => (
              <div
                key={index}
                onClick={() => setSelectedFeature(feature.id)}
                className={`flex flex-row gap-4 p-3 items-start cursor-pointer transition-all duration-200 border-l-4 rounded-r-lg ${
                  selectedFeature === feature.id 
                    ? 'border-purple-400 bg-white/10 backdrop-blur-sm' 
                    : 'border-transparent hover:border-purple-300/50 hover:bg-white/5'
                }`}
              >
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                  selectedFeature === feature.id ? 'bg-purple-400' : 'bg-white/20'
                }`}>
                  <svg className={`w-4 h-4 ${
                    selectedFeature === feature.id ? 'text-white' : 'text-gray-300'
                  }`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold mb-1 leading-tight ${
                    selectedFeature === feature.id ? 'text-white' : 'text-gray-200'
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
        </div>
      </div>
    </section>
  );
}

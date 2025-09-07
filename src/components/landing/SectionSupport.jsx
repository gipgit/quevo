// components/landing/SectionSupport.jsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function SectionSupport({ locale }) {
  const t = useTranslations('Landing');
  const [selectedFeature, setSelectedFeature] = useState('textCorrection');

  // Support features data
  const supportFeatures = [
    {
      id: 'aiTicketClassification',
      icon: "🤖",
      title: "AI Ticket Classification",
      description: "Automatically categorize and prioritize support tickets using machine learning. Route tickets to the right team members and set appropriate urgency levels."
    },
    {
      id: 'smartResponseSuggestions',
      icon: "💡",
      title: "Smart Response Suggestions",
      description: "Get AI-powered response suggestions based on ticket content and customer history. Maintain consistent, professional communication across all support channels."
    },
    {
      id: 'textCorrection',
      icon: "✏️",
      title: "Text Correction & Enhancement",
      description: "AI automatically corrects grammar, spelling, and formatting in customer messages to make them easier to read and understand. Improves communication clarity."
    }
  ];

  const renderFeaturePreview = () => {
    switch (selectedFeature) {
      case 'aiTicketClassification':
        return (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 w-full shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-sm">
            <div className="space-y-2">
              {/* Classification Results */}
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">Ticket #SR-2024-001</span>
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">High Priority</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">"Website is down and customers can't place orders"</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Technical Issue</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">94% confidence</span>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">Ticket #SR-2024-002</span>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Medium Priority</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">"How do I update my billing information?"</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">Account Support</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">87% confidence</span>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">Ticket #SR-2024-003</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Low Priority</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">"Feature request: Add dark mode to the app"</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full">Feature Request</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">91% confidence</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'smartResponseSuggestions':
        return (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 w-full shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-sm">
            <div className="space-y-2">
              {/* Customer Message */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Sarah Johnson</span>
                  <span className="text-xs text-gray-500">2 minutes ago</span>
                </div>
                <p className="text-sm text-gray-700">"Hi, I'm having trouble logging into my account. I keep getting an error message saying my password is incorrect, but I'm sure it's right."</p>
              </div>

              {/* AI Suggestions */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900">Suggested Responses:</h4>
                
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Recommended (95% match)</span>
                    <button className="px-2 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors">Use</button>
                  </div>
                  <p className="text-xs text-gray-700">"Hi Sarah, I understand you're having trouble with your password. Let me help you reset it. I'll send you a secure password reset link to your registered email address. Please check your inbox and follow the instructions."</p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Alternative (87% match)</span>
                    <button className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-md hover:bg-gray-300 transition-colors">Use</button>
                  </div>
                  <p className="text-xs text-gray-600">"Hello Sarah, I can help you with the login issue. Sometimes browsers save old passwords. Try clearing your browser cache or using an incognito window. If that doesn't work, I can reset your password."</p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">Escalation (82% match)</span>
                    <button className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-md hover:bg-gray-300 transition-colors">Use</button>
                  </div>
                  <p className="text-xs text-gray-600">"Hi Sarah, I'm escalating this to our technical team for immediate assistance. They'll investigate the login issue and get back to you within 15 minutes."</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'textCorrection':
        return (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 w-full shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-sm">
            <div className="space-y-2">
              {/* Text Correction Examples */}
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">Original Message</span>
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">Before</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">"hi i hav a problem with my acount i cant login and i dont no why pls help me asap its urgent"</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-1.5 py-0.5 bg-gray-100/50 text-gray-600 rounded-full text-[10px]">8 errors</span>
                    <span className="px-1.5 py-0.5 bg-gray-100/50 text-gray-600 rounded-full text-[10px]">Poor readability</span>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">AI Enhanced Message</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">After</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">"Hi, I have a problem with my account. I can't login and I don't know why. Please help me as soon as possible, it's urgent."</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-1.5 py-0.5 bg-gray-100/50 text-gray-600 rounded-full text-[10px]">8 fixes</span>
                    <span className="px-1.5 py-0.5 bg-gray-100/50 text-gray-600 rounded-full text-[10px]">Excellent readability</span>
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
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold leading-tight mb-4 drop-shadow-lg">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">AI-Powered</span> <span className="text-white">Support Management</span>
          </h2>
          <p className="text-lg lg:text-xl text-gray-300 leading-tight lg:leading-relaxed max-w-3xl mx-auto mb-8 drop-shadow-md">
            Transform your customer support with intelligent automation, smart routing, and AI-driven insights
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {/* Mobile Preview - Show first on mobile */}
          <div className="lg:col-span-3 lg:order-2 flex justify-center">
            <div className="w-full max-w-xl">
              {renderFeaturePreview()}
            </div>
          </div>

          {/* Features List - Show second on mobile */}
          <div className="lg:col-span-2 lg:order-1 space-y-3 lg:space-y-6">
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

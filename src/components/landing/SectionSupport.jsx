// components/landing/SectionSupport.jsx
'use client';

import { useTranslations } from 'next-intl';
import { BookOpen, Clock, Globe, Zap, MessageSquare } from 'lucide-react';

export default function SectionSupport({ locale }) {
  const t = useTranslations('Landing');

  const supportFeatures = [
    {
      icon: BookOpen,
      title: t('Support.features.knowledgeBase.title'),
      description: t('Support.features.knowledgeBase.description'),
      badge: t('Support.features.knowledgeBase.badge'),
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: Clock,
      title: t('Support.features.premiumSupport.title'),
      description: t('Support.features.premiumSupport.description'),
      badge: t('Support.features.premiumSupport.badge'),
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      icon: Globe,
      title: t('Support.features.multiLanguage.title'),
      description: t('Support.features.multiLanguage.description'),
      badge: t('Support.features.multiLanguage.badge'),
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      icon: Zap,
      title: t('Support.features.fastResponse.title'),
      description: t('Support.features.fastResponse.description'),
      badge: t('Support.features.fastResponse.badge'),
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600'
    },
    {
      icon: MessageSquare,
      title: t('Support.features.multipleChannels.title'),
      description: t('Support.features.multipleChannels.description'),
      badge: t('Support.features.multipleChannels.badge'),
      iconBg: 'bg-pink-50',
      iconColor: 'text-pink-600'
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "CEO, TechStart Inc.",
      content: "The 24/7 support has been a game-changer. When we had a critical issue at 3 AM, they had us back online in 30 minutes.",
      rating: 5
    },
    {
      name: "Marco Rossi",
      role: "Operations Manager, RetailPlus",
      content: "The multi-language support is incredible. Being able to communicate in Italian made all the difference for our team.",
      rating: 5
    },
    {
      name: "Jennifer Kim",
      role: "CTO, DataFlow Solutions",
      content: "Our dedicated success manager has helped us optimize our workflows and prevented several potential issues.",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-slate-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.1)_2px,transparent_2px)] bg-[length:40px_40px]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_75%_75%,rgba(99,102,241,0.08)_1px,transparent_1px)] bg-[length:30px_30px]"></div>
      </div>

      <div className="container mx-auto px-6 lg:px-12 max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-6 lg:mb-12">
          <h2 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-6">
            {t('Support.title.prefix')} <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{t('Support.title.highlighted')}</span>
          </h2>
        </div>

        {/* Support Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 md:gap-3 lg:gap-2 mb-20">
          {supportFeatures.map((feature, index) => (
            <div
              key={index}
              className="group relative p-4 md:p-5 lg:p-6"
            >
              {/* Mobile: Absolutely positioned icon on left, vertically centered */}
              <div className="lg:hidden absolute left-0 top-1/2 -translate-y-1/2">
                <div className={`w-9 h-9 rounded-xl ${feature.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <feature.icon className={`w-4 h-4 ${feature.iconColor}`} />
                </div>
              </div>
              
              {/* Mobile: Content with minimal left padding */}
              <div className="lg:hidden pl-11">
                {/* Plan Badge - Only show for Pro+ */}
                {feature.badge === 'Pro+' && (
                  <div className="absolute top-1 left-10 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 rotate-[-8deg]">
                    {feature.badge}
                  </div>
                )}
                
                <h3 className="text-base font-medium text-gray-900 mb-1">
                  {feature.title}
                </h3>
                
                <p className="text-xs leading-tight text-gray-600">
                  {feature.description}
                </p>
              </div>
              
              {/* Desktop: Horizontal layout with icon on left */}
              <div className="hidden lg:flex lg:items-start lg:gap-3">
                <div className={`w-10 h-10 rounded-xl ${feature.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
                </div>
                
                <div className="flex-1 relative">
                  {/* Plan Badge - Only show for Pro+ */}
                  {feature.badge === 'Pro+' && (
                    <div className="absolute -top-2 left-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 rotate-[-8deg]">
                      {feature.badge}
                    </div>
                  )}
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  
                  <p className="text-sm leading-tight text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials Section - Hidden for now */}
        {/* 
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-gray-100">
          <div className="text-center mb-12">
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">
              {t('Support.testimonials.title')}
            </h3>
            <p className="text-gray-600 text-base lg:text-lg">
              {t('Support.testimonials.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        */}

      </div>
    </section>
  );
}
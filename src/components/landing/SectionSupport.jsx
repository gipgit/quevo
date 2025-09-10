// components/landing/SectionSupport.jsx
'use client';

import { useTranslations } from 'next-intl';

export default function SectionSupport({ locale }) {
  const t = useTranslations('Landing');

  const supportFeatures = [
    {
      icon: "📚",
      title: t('Support.features.knowledgeBase.title'),
      description: t('Support.features.knowledgeBase.description'),
      badge: t('Support.features.knowledgeBase.badge')
    },
    {
      icon: "🕐",
      title: t('Support.features.premiumSupport.title'),
      description: t('Support.features.premiumSupport.description'),
      badge: t('Support.features.premiumSupport.badge')
    },
    {
      icon: "🌍",
      title: t('Support.features.multiLanguage.title'),
      description: t('Support.features.multiLanguage.description'),
      badge: t('Support.features.multiLanguage.badge')
    },
    {
      icon: "⚡",
      title: t('Support.features.fastResponse.title'),
      description: t('Support.features.fastResponse.description'),
      badge: t('Support.features.fastResponse.badge')
    },
    {
      icon: "💬",
      title: t('Support.features.multipleChannels.title'),
      description: t('Support.features.multipleChannels.description'),
      badge: t('Support.features.multipleChannels.badge')
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
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.1)_2px,transparent_2px)] bg-[length:40px_40px]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_75%_75%,rgba(99,102,241,0.08)_1px,transparent_1px)] bg-[length:30px_30px]"></div>
      </div>

      <div className="container mx-auto px-6 lg:px-12 max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            {t('Support.title.prefix')} <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{t('Support.title.highlighted')}</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('Support.subtitle')}
          </p>
        </div>

        {/* Support Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-20">
          {supportFeatures.map((feature, index) => (
            <div
              key={index}
              className="group relative p-4 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              
              <h3 className="text-lg font-semibold mb-2 text-gray-900">
                {feature.title}
              </h3>
              
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-3 ${
                feature.badge === 'Pro+' 
                  ? 'bg-blue-100 text-blue-700' 
                  : feature.badge === 'Enterprise'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {feature.badge}
              </div>
              
              <p className="text-sm leading-relaxed text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Testimonials Section */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-gray-100">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              {t('Support.testimonials.title')}
            </h3>
            <p className="text-gray-600 text-lg">
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

      </div>
    </section>
  );
}
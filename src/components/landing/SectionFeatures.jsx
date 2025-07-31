// components/landing/SectionFeatures.jsx
'use client';

import { useTranslations } from 'next-intl';

export default function SectionFeatures({ locale }) {
  const t = useTranslations('Landing');

  // Features data
  const featuresCards = [
    {
      icon: "✓",
      title: t('Features.cards.serviceListing.title'),
      description: t('Features.cards.serviceListing.description')
    },
    {
      icon: "✓",
      title: t('Features.cards.serviceRequests.title'),
      description: t('Features.cards.serviceRequests.description')
    },
    {
      icon: "✓",
      title: t('Features.cards.appointmentsScheduling.title'),
      description: t('Features.cards.appointmentsScheduling.description')
    },
    {
      icon: "✓",
      title: t('Features.cards.quoteSimulation.title'),
      description: t('Features.cards.quoteSimulation.description')
    },
    {
      icon: "✓",
      title: t('Features.cards.qrWebsite.title'),
      description: t('Features.cards.qrWebsite.description')
    },
    {
      icon: "✓",
      title: t('Features.cards.digitalMenu.title'),
      description: t('Features.cards.digitalMenu.description')
    },
    {
      icon: "✓",
      title: t('Features.cards.mailingList.title'),
      description: t('Features.cards.mailingList.description')
    },
    {
      icon: "✓",
      title: t('Features.cards.fidelityCard.title'),
      description: t('Features.cards.fidelityCard.description')
    },
    {
      icon: "✓",
      title: t('Features.cards.surveys.title'),
      description: t('Features.cards.surveys.description')
    },
    {
      icon: "✓",
      title: t('Features.cards.promotions.title'),
      description: t('Features.cards.promotions.description')
    }
  ];

  return (
    <section className="min-h-screen bg-white flex items-center">
      <div className="container mx-auto px-12 py-16 max-w-7xl">
        {/* Title Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
            {t('Features.title')}
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
            {t('Features.subtitle')}
          </p>
        </div>

        {/* Features Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 lg:gap-4 max-w-7xl mx-auto mb-8">
          {featuresCards.map((card, index) => (
            <div
              key={index}
              className="flex flex-row lg:flex-col gap-4 lg:gap-0 rounded-2xl p-2 lg:p-4 items-start"
            >
              <div className="flex-shrink-0 w-8 h-8 lg:w-8 lg:h-8 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1 lg:mb-2 leading-tight">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
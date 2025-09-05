// components/landing/SectionMarketingFeatures.jsx
'use client';

import { useTranslations } from 'next-intl';

export default function SectionMarketingFeatures({ locale }) {
  const t = useTranslations('Landing');

  const marketingCards = [
    {
      icon: "📱",
      title: "Social Media Content Creator",
      description: "AI generates engaging social media posts for Facebook, Instagram, LinkedIn, Twitter, and TikTok. Includes posting schedules and optimal timing recommendations."
    },
    {
      icon: "📧",
      title: "Email Marketing Assistant",
      description: "Create targeted email campaigns with AI-generated content. Segment customers, schedule sends, and track engagement with professional email templates."
    }
  ];

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center relative overflow-hidden">
      {/* AI Pattern Overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,0,0.08)_1px,transparent_1px)] bg-[length:25px_25px]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_75%_25%,rgba(0,255,255,0.06)_2px,transparent_2px)] bg-[length:35px_35px]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_25%_75%,rgba(255,255,0,0.04)_1.5px,transparent_1.5px)] bg-[length:30px_30px]"></div>
      </div>
      
      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      
      <div className="container mx-auto px-6 lg:px-12 py-16 max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold leading-tight mb-4 drop-shadow-lg">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">AI-Powered</span> <span className="text-white">Marketing Features</span>
          </h2>
          <p className="text-lg lg:text-xl text-gray-300 leading-tight lg:leading-relaxed max-w-3xl mx-auto mb-8 drop-shadow-md">
            Transform your marketing strategy with intelligent automation, smart content generation, and AI-driven insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto mb-8">
          {marketingCards.map((card, index) => (
            <div
              key={index}
              className="flex flex-col gap-4 rounded-2xl p-6 items-center text-center bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
            >
              <div className="flex-shrink-0 w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/30 flex items-center justify-center mb-3 text-3xl lg:text-4xl">
                {card.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2 leading-tight drop-shadow-sm">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-300 leading-tight">
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



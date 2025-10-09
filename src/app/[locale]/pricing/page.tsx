"use client"

import React, { useEffect, useState } from "react"
import { useTranslations } from 'next-intl'
import { getPlanColors, capitalizePlanName } from "@/lib/plan-colors"
import { getAllPlans, PlanFeature } from "@/lib/plan-features"
import { useCheckout } from "@/hooks/useCheckout"
import PlanSelector from "@/components/pricing/PlanSelector"
import PricingHeader from "@/components/pricing/PricingHeader"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

interface Plan {
  plan_id: number;
  plan_name: string;
  display_price: string;
  display_frequency: string | null;
  plan_description?: string | null;
  stripe_price_id?: string | null;
  plan_features?: string[];
}

export default function PricingPage() {
  const t = useTranslations('Pricing')
  const [showPlanSelector, setShowPlanSelector] = useState(false)
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null)
  const [preSelectedPlan, setPreSelectedPlan] = useState<PlanFeature | null>(null)
  const { createCheckoutSession, loading, error } = useCheckout()
  
  // Debug logging
  console.log('PricingPage render - showPlanSelector:', showPlanSelector)
  
  // Get plans from static configuration
  const plans = getAllPlans()

  // Get gradient colors based on plan
  const getHeroGradients = (planName: string | null) => {
    if (!planName) {
      // Default gradients
      return {
        layer1: 'linear-gradient(143.241deg, rgb(147, 197, 253) 0%, rgb(196, 181, 253) 50%, rgb(167, 243, 208) 100%)',
        layer2: 'linear-gradient(140.017deg, rgb(221, 214, 254) 0%, rgb(147, 197, 253) 60%, rgb(129, 140, 248) 100%)',
        layer3: 'linear-gradient(90deg, rgb(186, 230, 253) 0%, rgb(191, 219, 254) 100%)'
      }
    }

    const planLower = planName.toLowerCase()
    
    if (planLower.includes('free')) {
      return {
        layer1: 'linear-gradient(143.241deg, rgb(209, 213, 219) 0%, rgb(156, 163, 175) 50%, rgb(107, 114, 128) 100%)',
        layer2: 'linear-gradient(140.017deg, rgb(229, 231, 235) 0%, rgb(209, 213, 219) 60%, rgb(156, 163, 175) 100%)',
        layer3: 'linear-gradient(90deg, rgb(243, 244, 246) 0%, rgb(229, 231, 235) 100%)'
      }
    } else if (planLower.includes('pro unlimited')) {
      return {
        layer1: 'linear-gradient(143.241deg, rgb(251, 191, 36) 0%, rgb(245, 158, 11) 50%, rgb(249, 115, 22) 100%)',
        layer2: 'linear-gradient(140.017deg, rgb(252, 211, 77) 0%, rgb(251, 146, 60) 60%, rgb(239, 68, 68) 100%)',
        layer3: 'linear-gradient(90deg, rgb(254, 215, 170) 0%, rgb(253, 186, 116) 100%)'
      }
    } else if (planLower.includes('pro plus')) {
      return {
        layer1: 'linear-gradient(143.241deg, rgb(168, 85, 247) 0%, rgb(236, 72, 153) 50%, rgb(239, 68, 68) 100%)',
        layer2: 'linear-gradient(140.017deg, rgb(192, 132, 252) 0%, rgb(236, 72, 153) 60%, rgb(244, 114, 182) 100%)',
        layer3: 'linear-gradient(90deg, rgb(233, 213, 255) 0%, rgb(251, 207, 232) 100%)'
      }
    } else if (planLower.includes('pro')) {
      return {
        layer1: 'linear-gradient(143.241deg, rgb(96, 165, 250) 0%, rgb(59, 130, 246) 50%, rgb(37, 99, 235) 100%)',
        layer2: 'linear-gradient(140.017deg, rgb(147, 197, 253) 0%, rgb(59, 130, 246) 60%, rgb(29, 78, 216) 100%)',
        layer3: 'linear-gradient(90deg, rgb(191, 219, 254) 0%, rgb(147, 197, 253) 100%)'
      }
    }

    return {
      layer1: 'linear-gradient(143.241deg, rgb(147, 197, 253) 0%, rgb(196, 181, 253) 50%, rgb(167, 243, 208) 100%)',
      layer2: 'linear-gradient(140.017deg, rgb(221, 214, 254) 0%, rgb(147, 197, 253) 60%, rgb(129, 140, 248) 100%)',
      layer3: 'linear-gradient(90deg, rgb(186, 230, 253) 0%, rgb(191, 219, 254) 100%)'
    }
  }

  const currentGradients = getHeroGradients(hoveredPlan)

  const handlePlanSelect = async (plan: PlanFeature) => {
    // For now, we'll need to get user and business info from the session
    // This should be updated to get the actual user and business data
    const userId = "placeholder-user-id" // TODO: Get from session
    const userEmail = "placeholder@email.com" // TODO: Get from session
    const businessId = "placeholder-business-id" // TODO: Get from current business
    
    await createCheckoutSession(plan, userId, userEmail, businessId)
  }

  const handleGetStarted = (plan: Plan) => {
    // Redirect to signup with plan selection
    console.log('handleGetStarted called with plan:', plan)
    const locale = window.location.pathname.split('/')[1] || 'it'
    window.location.href = `/${locale}/signup/business?plan=${plan.plan_id}`
  }

  const handleContactSales = () => {
    // Redirect to contact page or open email
    window.location.href = 'mailto:sales@quevo.com?subject=Enterprise Plan Inquiry'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" color="blue" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'rgb(249, 250, 251)' }}>
      {/* Page Background Gradient Layers - More at Bottom */}
      <div 
        className="absolute z-0"
        style={{
          background: 'linear-gradient(160deg, rgb(224, 242, 254) 0%, rgb(224, 231, 255) 100%)',
          filter: 'blur(100px)',
          borderRadius: '100%',
          opacity: 0.25,
          height: '600px',
          left: '-200px',
          top: '60%',
          width: '700px'
        }}
      ></div>
      
      <div 
        className="absolute z-0"
        style={{
          background: 'linear-gradient(200deg, rgb(243, 232, 255) 0%, rgb(219, 234, 254) 100%)',
          filter: 'blur(100px)',
          borderRadius: '100%',
          opacity: 0.25,
          height: '550px',
          right: '-150px',
          top: '70%',
          width: '650px'
        }}
      ></div>
      
      <div 
        className="absolute z-0"
        style={{
          background: 'linear-gradient(180deg, rgb(236, 254, 255) 0%, rgb(240, 253, 244) 100%)',
          filter: 'blur(80px)',
          borderRadius: '100%',
          opacity: 0.2,
          height: '500px',
          left: '50%',
          bottom: '50px',
          transform: 'translateX(-50%)',
          width: '600px'
        }}
      ></div>

      {/* Hero Header */}
      <header className="relative overflow-hidden z-10 pb-8 md:pb-12" style={{ backgroundColor: 'rgb(248, 250, 252)' }}>
        {/* Gradient Layer 1 - Bottom Left */}
        <div 
          className="absolute z-1 transition-all duration-700 ease-in-out"
          style={{
            background: currentGradients.layer1,
            filter: 'blur(60px)',
            borderRadius: '100%',
            opacity: 0.45,
            height: '400px',
            left: '-150px',
            bottom: '-200px',
            width: '500px'
          }}
        ></div>
        
        {/* Gradient Layer 2 - Bottom Right */}
        <div 
          className="absolute z-1 transition-all duration-700 ease-in-out"
          style={{
            background: currentGradients.layer2,
            filter: 'blur(60px)',
            borderRadius: '100%',
            opacity: 0.4,
            height: '350px',
            right: '-100px',
            bottom: '-180px',
            width: '450px'
          }}
        ></div>
        
        {/* Bottom Center Accent Layer */}
        <div 
          className="absolute z-1 transition-all duration-700 ease-in-out"
          style={{
            background: currentGradients.layer3,
            filter: 'blur(40px)',
            opacity: 0.35,
            height: '150px',
            bottom: '-100px',
            left: '0',
            width: '100%',
            borderRadius: '100%'
          }}
        ></div>

        <div className="relative z-10">
          <PricingHeader 
            locale={window.location.pathname.split('/')[1] || 'it'} 
            showBackToPlans={showPlanSelector}
            onBackToPlans={() => setShowPlanSelector(false)}
          />
          
          {!showPlanSelector && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              <div className="text-center mb-6 lg:mb-12">
                <h4 className="font-bold text-2xl lg:text-5xl mb-3 lg:mb-6">
                  {t('subtitle')}
                </h4>
                
                {/* 3 Horizontal List Items */}
                <div className="flex flex-wrap justify-center gap-1 lg:gap-6">
                  <div className="flex items-center gap-1 lg:gap-2 text-blue-500">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-blue-500 font-medium text-sm lg:text-base">{t('Hero.benefits.freePlan')}</span>
                  </div>
                  <div className="flex items-center gap-1 lg:gap-2 text-blue-500">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-blue-500 font-medium text-sm lg:text-base">{t('Hero.benefits.noPaymentDetails')}</span>
                  </div>
                  <div className="flex items-center gap-1 lg:gap-2 text-blue-500">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-blue-500 font-medium text-sm lg:text-base">{t('Hero.benefits.cancelAnytime')}</span>
                  </div>
                </div>
                
                {/* Stripe Badge */}
                <div className="flex items-center justify-center gap-2 mt-6 text-gray-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Managed and Secured by</span>
                  <div className="w-12 h-5 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-500">Stripe</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content with negative margin to overlap hero */}
      <div className="relative z-10 -mt-8 md:-mt-12">
        <div className={`max-w-[1400px] mx-auto pb-12 ${!showPlanSelector ? 'px-4 sm:px-6 lg:px-8' : 'md:px-4 lg:px-8'}`}>
        {!showPlanSelector ? (
          <>
            
            {/* Quick Plan Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-4 mb-12">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  onMouseEnter={() => setHoveredPlan(plan.name)}
                  onMouseLeave={() => setHoveredPlan(null)}
        className={`rounded-3xl border p-6 md:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-lg bg-white ${
          plan.name.toLowerCase().includes('pro unlimited')
            ? "border-gray-300 shadow-md"
            : "border-gray-200 shadow-sm"
        }`}
                >
                  <div>
                    <div className="mb-3 md:mb-6">
                      {(() => {
                        const planColors = getPlanColors(plan.name);
                        return (
                          <span 
                            className={`inline-flex px-3 py-1.5 md:px-4 md:py-2 text-base md:text-xl font-semibold rounded-lg shadow-md items-center gap-2 w-fit ${planColors.textColor}`}
                            style={planColors.style}
                          >
                            {planColors.showStar && (
                              <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            )}
                            {capitalizePlanName(plan.name)}
                          </span>
                        );
                      })()}
                    </div>
                    
                    <div className="flex items-center gap-1 mb-2 md:mb-4">
                      <span className="text-4xl md:text-3xl lg:text-4xl font-bold text-gray-900">{plan.display_price}</span>
                      <span className="text-base md:text-lg text-gray-500">/ {plan.display_frequency}</span>
                    </div>
                    
                    <p className="text-sm md:text-sm text-gray-600 mb-3 md:mb-6">{plan.description}</p>
                    
                    <button
                      className="w-full py-2.5 md:py-3 px-4 md:px-5 rounded-xl font-normal text-sm md:text-base transition-all duration-300 mb-3 md:mb-6 bg-black hover:bg-gray-800 text-white shadow-lg"
                      onClick={() => {
                        setPreSelectedPlan(plan)
                        setShowPlanSelector(true)
                      }}
                    >
                      {t('getStarted')}
                    </button>
                    
                    <ul className="space-y-1 md:space-y-2">
                      {plan.features.map((feature, index) => {
                        // Check if this is the first AI feature
                        const isFirstAI = feature.type === 'ai' && !plan.features.slice(0, index).some(f => f.type === 'ai');
                        
                        return (
                          <React.Fragment key={index}>
                            {/* Add AI Credits as regular list item before first AI feature */}
                            {isFirstAI && (
                              <>
                                {/* Visual separator between core and AI features */}
                                <li className="border-t border-gray-100 my-2"></li>
                                <li className="flex items-center gap-2 md:gap-3">
                                  <svg className="w-3.5 h-3.5 md:w-5 md:h-5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-sm md:text-sm text-gray-700 leading-tight">
                                    {typeof plan.ai_credits_included === 'number' 
                                      ? `${plan.ai_credits_included} AI Credits / month`
                                      : 'Unlimited AI Credits'
                                    }
                                  </span>
                                </li>
                              </>
                            )}
                            <li className="flex items-start gap-2 md:gap-3">
                              {feature.type === 'ai' ? (
                                <svg className="w-3.5 h-3.5 md:w-5 md:h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ) : feature.text === 'Remove Quevo Logo' && plan.name === 'FREE' ? (
                                <svg className="w-3.5 h-3.5 md:w-5 md:h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-3.5 h-3.5 md:w-5 md:h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                              )}
                              <div className="flex-1">
                                <span className="text-sm md:text-sm text-gray-700 leading-tight">{feature.text}</span>
                                {feature.description && (
                                  <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{feature.description}</div>
                                )}
                              </div>
                            </li>
                          </React.Fragment>
                        );
                      })}
                      {/* Visual separator before support */}
                      <li className="border-t border-gray-100 my-2"></li>
                      <li className="flex items-center gap-2 md:gap-3">
                        <svg className="w-3.5 h-3.5 md:w-5 md:h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm md:text-sm text-gray-700 leading-tight">Support: {plan.support}</span>
                        </li>
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            

            
            {/* Plans Comparison Table */}
            <div className="mt-20">
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">
                  Plans Comparison
                </h2>
                <p className="text-sm md:text-lg text-gray-600">
                  Compare all features across our plans
                </p>
              </div>
              
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="sticky left-0 z-10 bg-gray-50 px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-900">Features</th>
                        {plans.map((plan) => (
                          <th key={plan.id} className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm font-semibold text-gray-900">
                            {capitalizePlanName(plan.name)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="sticky left-0 z-10 bg-white px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-700 font-medium">Service Requests</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm text-gray-600">30/month</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm text-gray-600">300/month</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm text-gray-600">1000/month</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm text-gray-600">Unlimited</td>
                      </tr>
                      <tr>
                        <td className="sticky left-0 z-10 bg-white px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-700 font-medium">Appointments</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm text-gray-600">30/month</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm text-gray-600">300/month</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm text-gray-600">1000/month</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm text-gray-600">Unlimited</td>
                      </tr>
                      <tr>
                        <td className="sticky left-0 z-10 bg-white px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-700 font-medium">Board Duration</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm text-gray-600">1 week</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm text-gray-600">6 months</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm text-gray-600">2 years</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm text-gray-600">Unlimited</td>
                      </tr>
                      <tr>
                        <td className="sticky left-0 z-10 bg-white px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-700 font-medium">Operations per Board</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm text-gray-600">30</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm text-gray-600">50</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm text-gray-600">150</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm text-gray-600">Unlimited</td>
                      </tr>
                      <tr>
                        <td className="sticky left-0 z-10 bg-white px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-700 font-medium">AI Credits</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm text-gray-600">50 / month</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm text-gray-600">500 / month</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm text-gray-600">1,500 / month</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm text-gray-600">Unlimited</td>
                      </tr>
                      <tr>
                        <td className="sticky left-0 z-10 bg-white px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-700 font-medium">Support</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm text-gray-600">Email only</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm text-gray-600">Email + In-Dashboard</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm text-gray-600">Email + In-Dashboard</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm text-gray-600">24/7 Priority</td>
                      </tr>
                      <tr>
                        <td className="sticky left-0 z-10 bg-white px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-700 font-medium">Remove Logo</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-red-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </td>
                      </tr>
                      <tr>
                        <td className="sticky left-0 z-10 bg-white px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-700 font-medium">Email Automatiche</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-red-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </td>
                      </tr>
                      <tr>
                        <td className="sticky left-0 z-10 bg-white px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-700 font-medium">Automatic Appointment Reminders</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-red-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-red-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm text-gray-600">Email + SMS</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm text-gray-600">Email + SMS + Advanced</td>
                      </tr>
                      <tr>
                        <td className="sticky left-0 z-10 bg-white px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-700 font-medium">Video Covers</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-red-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-red-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </td>
                      </tr>
                      <tr>
                        <td className="sticky left-0 z-10 bg-white px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-700 font-medium">Document Upload/Download</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-red-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-red-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white/80 backdrop-blur-sm rounded-none md:rounded-3xl shadow-xl border-x-0 md:border-x border-y border-gray-200 p-0">
              <PlanSelector
                plans={plans}
                onPlanSelect={handlePlanSelect}
                onBack={() => setShowPlanSelector(false)}
                locale={window.location.pathname.split('/')[1] || 'it'}
                initialSelectedPlan={preSelectedPlan}
              />
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  )
} 
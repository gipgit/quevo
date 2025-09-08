"use client"

import { useEffect, useState } from "react"
import { useTranslations } from 'next-intl'
import { getPlanColors, capitalizePlanName } from "@/lib/plan-colors"
import { getAllPlans, PlanFeature } from "@/lib/plan-features"
import { getAllModules, AdditionalModule } from "@/lib/additional-modules"
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
  const { createCheckoutSession, loading, error } = useCheckout()
  
  // Debug logging
  console.log('PricingPage render - showPlanSelector:', showPlanSelector)
  
  // Get plans and modules from static configuration
  const plans = getAllPlans()
  const modules = getAllModules()

  const handlePlanSelect = async (plan: PlanFeature, selectedModules: AdditionalModule[]) => {
    await createCheckoutSession(plan, selectedModules)
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
    <div className="min-h-screen bg-gray-50">
      <PricingHeader 
        locale={window.location.pathname.split('/')[1] || 'it'} 
        showBackToPlans={showPlanSelector}
        onBackToPlans={() => setShowPlanSelector(false)}
      />
      
      <div className="py-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {!showPlanSelector ? (
          <>
            
            <div className="text-center mb-12">
              <p className="text-3xl text-gray-600 mb-6">
                {t('subtitle')}
              </p>
              
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
            </div>
            
            {/* Quick Plan Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 mb-12">
              {plans.map((plan) => (
                <div
                  key={plan.id}
        className={`rounded-3xl border p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-xl bg-white ${
          plan.name.toLowerCase().includes('pro plus') 
            ? "border-gray-300 shadow-2xl scale-105 ring-2 ring-gray-200" 
            : plan.name.toLowerCase().includes('pro unlimited')
            ? "border-gray-300 shadow-xl scale-102"
            : "border-gray-200 shadow-lg"
        }`}
                >
                  <div>
                    <div className="mb-6">
                      {(() => {
                        const planColors = getPlanColors(plan.name);
                        return (
                          <span 
                            className={`inline-flex px-4 py-2 text-xl font-semibold rounded-lg shadow-md items-center gap-2 w-fit ${planColors.textColor}`}
                            style={planColors.style}
                          >
                            {planColors.showStar && (
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            )}
                            {capitalizePlanName(plan.name)}
                          </span>
                        );
                      })()}
                    </div>
                    
                    <div className="flex items-center gap-1 mb-4">
                      <span className="text-3xl md:text-4xl font-bold text-gray-900">{plan.display_price}</span>
                      <span className="text-lg text-gray-500">/ {plan.display_frequency}</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-6">{plan.description}</p>
                    
                    <button
                      className="w-full py-3 px-5 rounded-xl font-semibold text-base transition-all duration-300 mb-6 bg-black hover:bg-gray-800 text-white shadow-lg"
                      onClick={() => setShowPlanSelector(true)}
                    >
                      {t('getStarted')}
                    </button>
                    
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-700 leading-tight">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Marketing Modules */}
            <div className="mt-20">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Marketing Modules
                </h2>
                <p className="text-lg text-gray-600">
                  Boost your marketing efforts with AI-powered tools
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.filter(module => 
                  ['email-marketing', 'ai-email-creator', 'ai-social-creator'].includes(module.id)
                ).map((module) => (
                  <div
                    key={module.id}
                    className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{module.icon}</span>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {module.name}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-1 mb-4">
                      <span className="text-2xl font-bold text-gray-900">{module.price}</span>
                      <span className="text-gray-500">/ {module.frequency}</span>
                    </div>
                    
                    <p className="text-gray-600 mb-4 flex-grow">{module.description}</p>
                    
                    <button 
                      className="w-full py-3 px-4 bg-black hover:bg-gray-800 text-white rounded-lg font-semibold transition-all duration-300 mb-4"
                      onClick={() => setShowPlanSelector(true)}
                    >
                      Add Module
                    </button>
                    
                    <div className="flex-grow">
                      <ul className="space-y-2 mb-4">
                        {module.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                            <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {module.aiCredits && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-600">🪙</span>
                            <span className="text-sm font-medium text-yellow-800">
                              {module.aiCredits}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Request / Support Management Modules */}
            <div className="mt-20">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Request / Support Management
                </h2>
                <p className="text-lg text-gray-600">
                  Streamline customer support and request handling
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.filter(module => 
                  ['ai-chat-assistant', 'ai-support-assistant', 'response-assistant'].includes(module.id)
                ).map((module) => (
                  <div
                    key={module.id}
                    className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{module.icon}</span>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {module.name}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-1 mb-4">
                      <span className="text-2xl font-bold text-gray-900">{module.price}</span>
                      <span className="text-gray-500">/ {module.frequency}</span>
                    </div>
                    
                    <p className="text-gray-600 mb-4 flex-grow">{module.description}</p>
                    
                    <button 
                      className="w-full py-3 px-4 bg-black hover:bg-gray-800 text-white rounded-lg font-semibold transition-all duration-300 mb-4"
                      onClick={() => setShowPlanSelector(true)}
                    >
                      Add Module
                    </button>
                    
                    <div className="flex-grow">
                      <ul className="space-y-2 mb-4">
                        {module.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                            <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {module.aiCredits && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-600">🪙</span>
                            <span className="text-sm font-medium text-yellow-800">
                              {module.aiCredits}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Plans Comparison Table */}
            <div className="mt-20">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Plans Comparison
                </h2>
                <p className="text-lg text-gray-600">
                  Compare all features across our plans
                </p>
              </div>
              
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Features</th>
                        {plans.map((plan) => (
                          <th key={plan.id} className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                            {capitalizePlanName(plan.name)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">Service Requests</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">30/month</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">300/month</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">1000/month</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">Unlimited</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">Appointments</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">30/month</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">300/month</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">1000/month</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">Unlimited</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">Board Duration</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">1 week</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">6 months</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">2 years</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">Unlimited</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">Operations per Board</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">30</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">50</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">150</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">Unlimited</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">Support</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">Email only</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">Email + Chat</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">Email + Chat + Phone</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">24/7 + Manager</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">Remove Logo</td>
                        <td className="px-6 py-4 text-center">
                          <svg className="w-5 h-5 text-red-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">Email Automatiche</td>
                        <td className="px-6 py-4 text-center">
                          <svg className="w-5 h-5 text-red-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">Automatic Appointment Reminders</td>
                        <td className="px-6 py-4 text-center">
                          <svg className="w-5 h-5 text-red-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <svg className="w-5 h-5 text-red-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">Email + SMS</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">Email + SMS + Advanced</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">Video Covers</td>
                        <td className="px-6 py-4 text-center">
                          <svg className="w-5 h-5 text-red-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <svg className="w-5 h-5 text-red-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">Document Upload/Download</td>
                        <td className="px-6 py-4 text-center">
                          <svg className="w-5 h-5 text-red-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <svg className="w-5 h-5 text-red-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
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
            
            <PlanSelector
              plans={plans}
              modules={modules}
              onPlanSelect={handlePlanSelect}
              onBack={() => setShowPlanSelector(false)}
              locale={window.location.pathname.split('/')[1] || 'it'}
            />
          </>
        )}
        </div>
      </div>
    </div>
  )
} 
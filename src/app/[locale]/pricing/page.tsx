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
  
  // Get plans and modules from static configuration
  const plans = getAllPlans()
  const modules = getAllModules()

  const handlePlanSelect = async (plan: PlanFeature, selectedModules: AdditionalModule[]) => {
    await createCheckoutSession(plan, selectedModules)
  }

  const handleGetStarted = (plan: Plan) => {
    // Redirect to signup with plan selection
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
      <PricingHeader locale={window.location.pathname.split('/')[1] || 'it'} />
      
      <div className="py-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {!showPlanSelector ? (
          <>
            <div className="text-center mb-12">
              <h1 className="text-lg font-bold text-gray-600 mb-4">
                {t('title')}
              </h1>
              <p className="text-3xl text-gray-600">
                {t('subtitle')}
              </p>
            </div>
            
            {/* Quick Plan Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 mb-12">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-3xl border p-8 bg-white flex flex-col justify-between transition-all duration-300 hover:shadow-xl ${
                    plan.name.toLowerCase().includes('pro plus') 
                      ? "border-purple-300 shadow-2xl scale-105 ring-2 ring-purple-200" 
                      : plan.name.toLowerCase().includes('pro unlimited')
                      ? "border-yellow-300 shadow-xl scale-102"
                      : "border-gray-200 shadow-lg"
                  }`}
                >
                  <div>
                    <div className="mb-6">
                      {(() => {
                        const planColors = getPlanColors(plan.name);
                        return (
                          <span 
                            className={`inline-block px-6 py-3 text-2xl font-semibold rounded-xl shadow-md flex items-center gap-2 w-fit ${planColors.textColor}`}
                            style={planColors.style}
                          >
                            {planColors.showStar && (
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
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
                    
                    <ul className="space-y-3 mb-8">
                      {plan.features.slice(0, 4).map((feature, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                      {plan.features.length > 4 && (
                        <li className="text-sm text-gray-500">
                          +{plan.features.length - 4} more features
                        </li>
                      )}
                    </ul>
                  </div>
                  
                  <button
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                      plan.name.toLowerCase().includes('unlimited')
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg"
                        : plan.name.toLowerCase().includes('pro plus')
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                        : plan.name.toLowerCase().includes('pro')
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
                        : "bg-gray-600 hover:bg-gray-700 text-white"
                    }`}
                    onClick={() => setShowPlanSelector(true)}
                  >
                    {t('getStarted')}
                  </button>
                </div>
              ))}
            </div>
            
            {/* Additional Modules Preview */}
            <div className="mt-20">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Additional Modules
                </h2>
                <p className="text-lg text-gray-600">
                  Enhance your business with powerful AI-powered tools
                </p>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-4">
                {modules.map((module) => (
                  <div
                    key={module.id}
                    className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex-shrink-0 w-80"
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
                    
                    <p className="text-gray-600 mb-4">{module.description}</p>
                    
                    <ul className="space-y-2 mb-6">
                      {module.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-green-500 mt-0.5">✅</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                      {module.features.length > 3 && (
                        <li className="text-sm text-gray-500">
                          +{module.features.length - 3} more features
                        </li>
                      )}
                    </ul>
                    
                    {module.aiCredits && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-600">🪙</span>
                          <span className="text-sm font-medium text-yellow-800">
                            {module.aiCredits}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <button 
                      className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-300"
                      onClick={() => setShowPlanSelector(true)}
                    >
                      Add Module
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <PlanSelector
            plans={plans}
            modules={modules}
            onPlanSelect={handlePlanSelect}
            onBack={() => setShowPlanSelector(false)}
            locale={window.location.pathname.split('/')[1] || 'it'}
          />
        )}
        </div>
      </div>
    </div>
  )
} 
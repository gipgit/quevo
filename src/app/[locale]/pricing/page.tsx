"use client"

import { useEffect, useState } from "react"
import { useTranslations } from 'next-intl'
import { getPlanColors, capitalizePlanName } from "@/lib/plan-colors"
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
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch plans from API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/plans')
        if (response.ok) {
          const data = await response.json()
          setPlans(data.plans)
        } else {
          setError('Failed to load plans')
        }
      } catch (err) {
        setError('Failed to load plans')
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [])

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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.plan_id}
              className={`rounded-3xl border p-8 bg-white flex flex-col justify-between transition-all duration-300 hover:shadow-xl ${
                plan.plan_name.toLowerCase().includes('pro') 
                  ? "border-gray-200 shadow-2xl scale-105" 
                  : "border-gray-200 shadow-lg"
              }`}
            >
              <div>
                <div className="mb-6">
                  {(() => {
                    const planColors = getPlanColors(plan.plan_name);
                    return (
                      <span className={`inline-block px-6 py-3 text-2xl font-semibold rounded-xl shadow-md flex items-center gap-2 w-fit ${planColors.gradient} ${planColors.textColor}`}>
                        {planColors.showStar && (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        )}
                        {capitalizePlanName(plan.plan_name)}
                      </span>
                    );
                  })()}
                </div>
                
                <div className="flex items-center gap-1 mb-4">
                  <span className="text-3xl md:text-4xl font-bold text-gray-900">{plan.display_price}</span>
                  {plan.display_frequency && (
                    <span className="text-lg text-gray-500">/ {plan.display_frequency}</span>
                  )}
                </div>
                
                {plan.plan_description && (
                  <p className="text-sm text-gray-600 mb-6">{plan.plan_description}</p>
                )}
                
                {plan.plan_features && plan.plan_features.length > 0 && (
                  <ul className="space-y-3 mb-8">
                    {plan.plan_features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <button
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  plan.plan_name.toLowerCase().includes('enterprise')
                    ? "bg-gray-900 hover:bg-gray-800 text-white"
                    : plan.plan_name.toLowerCase().includes('pro')
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
                onClick={() => 
                  plan.plan_name.toLowerCase().includes('enterprise') 
                    ? handleContactSales() 
                    : handleGetStarted(plan)
                }
              >
                {plan.plan_name.toLowerCase().includes('enterprise') 
                  ? t('contactSales') 
                  : t('getStarted')
                }
              </button>
            </div>
          ))}
        </div>
        
        {/* Additional Info Section */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {t('needHelp')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('needHelpDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                {t('contactSupport')}
              </button>
              <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                {t('viewDemo')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
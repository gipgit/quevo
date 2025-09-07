"use client"

import { useState } from "react"
import { PlanFeature } from "@/lib/plan-features"
import { AdditionalModule } from "@/lib/additional-modules"
import { getPlanColors, capitalizePlanName } from "@/lib/plan-colors"

interface PlanSelectorProps {
  plans: PlanFeature[]
  modules: AdditionalModule[]
  onPlanSelect: (plan: PlanFeature, selectedModules: AdditionalModule[]) => void
  onBack: () => void
  locale: string
}

export default function PlanSelector({ plans, modules, onPlanSelect, onBack, locale }: PlanSelectorProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanFeature | null>(null)
  const [selectedModules, setSelectedModules] = useState<AdditionalModule[]>([])

  const handlePlanSelect = (plan: PlanFeature) => {
    setSelectedPlan(plan)
  }

  const handleModuleToggle = (module: AdditionalModule) => {
    setSelectedModules(prev => {
      const isSelected = prev.some(m => m.id === module.id)
      if (isSelected) {
        return prev.filter(m => m.id !== module.id)
      } else {
        return [...prev, module]
      }
    })
  }

  const calculateTotalPrice = () => {
    if (!selectedPlan) return 0
    
    const planPrice = parseFloat(selectedPlan.display_price.replace('$', ''))
    const modulesPrice = selectedModules.reduce((total, module) => {
      const price = module.price.replace('$', '').replace('<', '')
      return total + parseFloat(price)
    }, 0)
    
    return planPrice + modulesPrice
  }

  const handleProceedToCheckout = () => {
    if (selectedPlan) {
      onPlanSelect(selectedPlan, selectedModules)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Plans
        </button>
      </div>
      
      {/* Shopify-style Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Plan and Module Selection */}
        <div className="lg:col-span-2">
          {/* Plan Selection */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Choose Your Plan
            </h2>
            <div className="space-y-4">
              {plans.map((plan) => {
                const isSelected = selectedPlan?.id === plan.id
                const planColors = getPlanColors(plan.name)
                return (
                  <div
                    key={plan.id}
                    className={`rounded-xl border p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      isSelected
                        ? "border-blue-500 shadow-lg ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handlePlanSelect(plan)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Selection Indicator - Moved to left */}
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        
                        {/* Plan Color Pill and Description */}
                        <div className="flex items-center gap-3">
                          <span 
                            className={`inline-block px-4 py-2 text-sm font-semibold rounded-lg shadow-sm flex items-center gap-2 ${planColors.textColor}`}
                            style={planColors.style}
                          >
                            {planColors.showStar && (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            )}
                            {capitalizePlanName(plan.name)}
                          </span>
                          
                          {/* Description in same line */}
                          <span className="text-sm text-gray-600">{plan.description}</span>
                        </div>
                      </div>
                      
                      {/* Price - Moved to right end */}
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">{plan.display_price}</div>
                        <div className="text-sm text-gray-500">/ {plan.display_frequency}</div>
                      </div>
                    </div>
                    
                    {/* Features - Only show when selected */}
                    {isSelected && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <ul className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Module Selection */}
          {selectedPlan && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Add Additional Modules (Optional)
              </h3>
              <div className="space-y-3">
                {modules.map((module) => {
                  const isSelected = selectedModules.some(m => m.id === module.id)
                  return (
                    <div
                      key={module.id}
                      className={`rounded-lg border p-4 cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                      }`}
                      onClick={() => handleModuleToggle(module)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Selection Indicator - Consistent with plan cards */}
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                          }`}>
                            {isSelected && (
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{module.icon}</span>
                              <h4 className="font-semibold text-gray-900">{module.name}</h4>
                              {/* Credits label in same line */}
                              {module.aiCredits && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                                  <span>🪙</span>
                                  {module.aiCredits}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{module.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">{module.price}</div>
                          <div className="text-sm text-gray-500">/ {module.frequency}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
              
              {selectedPlan ? (
                <>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">{selectedPlan.name} Plan</span>
                      <span className="font-semibold text-gray-900">{selectedPlan.display_price}/month</span>
                    </div>
                    
                    {selectedModules.map((module) => (
                      <div key={module.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">+ {module.name}</span>
                        <span className="font-medium text-gray-900">{module.price}/month</span>
                      </div>
                    ))}
                    
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">Total</span>
                        <span className="text-xl font-bold text-blue-600">${calculateTotalPrice()}/month</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Proceed to Checkout
                  </button>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">Select a plan to see your order summary</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

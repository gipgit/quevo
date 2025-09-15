"use client"

import React, { useState } from "react"
import { PlanFeature } from "@/lib/plan-features"
import { getPlanColors, capitalizePlanName } from "@/lib/plan-colors"

interface PlanSelectorProps {
  plans: PlanFeature[]
  onPlanSelect: (plan: PlanFeature) => void
  onBack: () => void
  locale: string
}

export default function PlanSelector({ plans, onPlanSelect, onBack, locale }: PlanSelectorProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanFeature | null>(null)

  const handlePlanSelect = (plan: PlanFeature) => {
    setSelectedPlan(plan)
  }

  const handleProceedToCheckout = () => {
    if (selectedPlan) {
      onPlanSelect(selectedPlan)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Shopify-style Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Plan and Module Selection */}
        <div className="lg:col-span-2">
          {/* Plan Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
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
                        ? "selected border-gray-400 shadow-lg ring-2 ring-gray-200 bg-white"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                    onClick={() => handlePlanSelect(plan)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Selection Indicator - Moved to left */}
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-gray-600 bg-gray-600' : 'border-gray-300'
                        }`}
>
                          {isSelected && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        
                        {/* Plan Color Pill and Description */}
                        <div className="flex items-center gap-3">
                          <span 
                            className={`inline-flex px-4 py-2 text-sm font-semibold rounded-lg shadow-sm items-center gap-2 ${planColors.textColor}`}
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
                  </div>
                )
              })}
            </div>
          </div>

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
                    
                    {/* AI Credits Display */}
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-sm font-semibold text-amber-800 bg-gradient-to-r from-amber-100 to-yellow-100 px-2 py-1 rounded-md">
                          {typeof selectedPlan.ai_credits_included === 'number' 
                            ? `${selectedPlan.ai_credits_included} AI Credits / month`
                            : 'Unlimited AI Credits'
                          }
                        </span>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">Total</span>
                        <span className="text-xl font-bold text-blue-600">{selectedPlan.display_price}/month</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Selected Plan Features */}
                  <div className="mb-6 bg-green-50 p-3 rounded border border-green-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Plan Features</h4>
                    <ul className="space-y-2">
                      {selectedPlan.features.map((feature, index) => {
                        // Check if this is the first AI feature
                        const isFirstAI = feature.type === 'ai' && !selectedPlan.features.slice(0, index).some(f => f.type === 'ai');
                        
                        return (
                          <React.Fragment key={index}>
                            {/* Add visual separator before first AI feature */}
                            {isFirstAI && (
                              <li className="border-t border-gray-100 my-2"></li>
                            )}
                            <li className="flex items-start gap-2 text-sm text-gray-700">
                              {feature.type === 'ai' ? (
                                <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ) : feature.text === 'Remove Quevo Logo' && selectedPlan.name === 'FREE' ? (
                                <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                              <div className="flex-1">
                                <span className="font-semibold">{feature.text}</span>
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
                      <li className="flex items-center gap-2 text-sm text-gray-700">
                        <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span>Support: {selectedPlan.support}</span>
                      </li>
                    </ul>
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

"use client"

import Link from 'next/link'

interface PricingHeaderProps {
  locale: string
  showBackToPlans?: boolean
  onBackToPlans?: () => void
}

export default function PricingHeader({ locale, showBackToPlans, onBackToPlans }: PricingHeaderProps) {
  
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 items-center h-16">
          {/* Left: Back to landing page and Back to Plans */}
          <div className="flex items-center gap-4">
            <Link 
              href={`/${locale}`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden md:inline">Back to landing page</span>
            </Link>
            {showBackToPlans && (
              <button
                onClick={onBackToPlans}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Plans
              </button>
            )}
          </div>
          
          {/* Center: Logo */}
          <div className="flex items-center justify-center">
            <Link href={`/${locale}`} className="flex items-center">
              <div className="text-2xl font-bold text-gray-900">
                Quevo
              </div>
            </Link>
          </div>
          
          {/* Right: Support button */}
          <div className="flex items-center justify-end">
            <button className="px-2 py-1.5 md:px-3 md:py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs md:text-xs font-medium border border-gray-300">
              <span className="hidden sm:inline">Support</span>
              <span className="sm:hidden">?</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}






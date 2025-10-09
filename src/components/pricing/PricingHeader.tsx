"use client"

import Link from 'next/link'

interface PricingHeaderProps {
  locale: string
  showBackToPlans?: boolean
  onBackToPlans?: () => void
}

export default function PricingHeader({ locale, showBackToPlans, onBackToPlans }: PricingHeaderProps) {
  
  return (
    <header className="sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: App name */}
          <div className="flex items-center gap-4">
            <Link href={`/${locale}`} className="flex items-center">
              <div className="text-lg md:text-2xl font-bold text-gray-900">
                Quevo
              </div>
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
          
          {/* Right: Back to landing page */}
          <div className="flex items-center gap-3">
            <Link 
              href={`/${locale}`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden md:inline">Back to landing page</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}






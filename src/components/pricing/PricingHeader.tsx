"use client"

import Link from 'next/link'

interface PricingHeaderProps {
  locale: string
}

export default function PricingHeader({ locale }: PricingHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Back to landing page */}
          <div className="flex items-center">
            <Link 
              href={`/${locale}`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to landing page
            </Link>
          </div>
          
          {/* Center: Logo */}
          <div className="flex items-center">
            <Link href={`/${locale}`} className="flex items-center">
              <div className="text-2xl font-bold text-gray-900">
                Quevo
              </div>
            </Link>
          </div>
          
          {/* Right: Support button */}
          <div className="flex items-center">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Support
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

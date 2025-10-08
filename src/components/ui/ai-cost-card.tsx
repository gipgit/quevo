'use client'

import React from 'react'

interface AICostCardProps {
  creditsRequired: number
  creditsRemaining?: number | string
  className?: string
}

export function AICostCard({ creditsRequired, creditsRemaining, className = '' }: AICostCardProps) {
  return (
    <div
      className={[
        'rounded-xl p-3 md:p-4',
        'relative overflow-hidden',
					'border border-[var(--dashboard-border-primary)] shadow-sm',
					'bg-[var(--dashboard-bg-card)]',
					'text-[var(--dashboard-text-primary)]',
        className
      ].join(' ')}
    >
      {/* subtle gradient accents */}
      <div
        className="pointer-events-none absolute -bottom-8 -left-8 w-32 h-32 rounded-full"
        style={{
						background: 'radial-gradient(circle, rgba(148,163,184,0.18) 0%, rgba(148,163,184,0) 60%)',
          filter: 'blur(16px)'
        }}
      />
      <div
        className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full"
        style={{
						background: 'radial-gradient(circle, rgba(100,116,139,0.16) 0%, rgba(100,116,139,0) 60%)',
          filter: 'blur(16px)'
        }}
      />

      <div className="relative z-10">
        {/* Single Row: Text on left, Credit badge on right */}
        <div className="flex items-center justify-between gap-2 md:gap-3">
          <div className="flex-1">
            <div className="text-xs md:text-sm font-medium text-[var(--dashboard-text-secondary)]">
              Credits required for this generation
            </div>
            {typeof creditsRemaining !== 'undefined' && (
              <div className="text-[10px] md:text-xs text-[var(--dashboard-text-secondary)] mt-1">
                {creditsRemaining} credits remaining
              </div>
            )}
          </div>
          <div className="flex-shrink-0">
            <div className="px-2 md:px-3 py-1 rounded-full bg-[var(--dashboard-bg-tertiary)] border border-[var(--dashboard-border-primary)] flex items-center justify-center gap-1 md:gap-1.5">
              {/* AI Coin Icon */}
              <svg className="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="coinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                    <stop offset="50%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 1 }} />
                  </linearGradient>
                  <linearGradient id="coinShine" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0 }} />
                    <stop offset="50%" style={{ stopColor: '#ffffff', stopOpacity: 0.4 }} />
                    <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0 }} />
                  </linearGradient>
                </defs>
                {/* Outer circle */}
                <circle cx="8" cy="8" r="7" fill="url(#coinGradient)" />
                {/* Inner circle */}
                <circle cx="8" cy="8" r="5.5" fill="none" stroke="white" strokeWidth="0.8" opacity="0.3" />
                {/* Shine effect */}
                <ellipse cx="8" cy="4" rx="4" ry="1.5" fill="url(#coinShine)" />
                {/* AI Sparkle */}
                <path d="M8 5 L8.3 6.5 L9.5 6.5 L8.6 7.2 L9 8.5 L8 7.8 L7 8.5 L7.4 7.2 L6.5 6.5 L7.7 6.5 Z" fill="white" opacity="0.8" />
              </svg>
              <div className="text-sm md:text-base font-bold text-[var(--dashboard-text-primary)]">{creditsRequired}</div>
              <div className="text-[10px] md:text-xs font-medium uppercase tracking-wide text-[var(--dashboard-text-secondary)]">
                credit{creditsRequired === 1 ? '' : 's'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AICostCard



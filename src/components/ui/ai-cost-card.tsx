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
        'rounded-xl p-4',
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

      <div className="relative z-10 flex flex-col items-center gap-1">
        {typeof creditsRemaining !== 'undefined' && (
					<div className="text-center">
						<div className="flex items-center justify-center gap-1.5">
							<span className="text-xs text-[var(--dashboard-text-primary)]">{creditsRemaining}</span>
							<span className="text-xs text-[var(--dashboard-text-secondary)]">credits remaining</span>
						</div>
					</div>
        )}

        <div className="flex flex-col items-center">
				<div className="text-sm font-medium mb-0.5 text-center text-[var(--dashboard-text-secondary)]">Credits required for this generation</div>
				<div className="px-3 py-0.5 rounded-full bg-[var(--dashboard-bg-tertiary)] border border-[var(--dashboard-border-primary)] flex items-center justify-center gap-1.5">
            {/* Placeholder icon circle */}
					<span className="w-2 h-2 rounded-full bg-[var(--dashboard-text-secondary)]/70" />
					<div className="text-base font-bold text-[var(--dashboard-text-primary)]">{creditsRequired}</div>
					<div className="text-[10px] font-bold uppercase tracking-wide text-[var(--dashboard-text-secondary)]">credit{creditsRequired === 1 ? '' : 's'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AICostCard



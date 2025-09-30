'use client'

import React from 'react'

interface AIActionButtonProps {
  text: string
  loadingText?: string
  isLoading?: boolean
  onClick?: () => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function AIActionButton({
  text,
  loadingText = 'Generating...',
  isLoading = false,
  onClick,
  disabled = false,
  size = 'md',
  className = ''
}: AIActionButtonProps) {
  const sizeClasses: Record<typeof size, string> = {
    sm: 'text-xs py-2 px-3',
    md: 'text-sm py-2.5 px-4',
    lg: 'text-base py-3 px-5'
  } as const

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={[
        'relative w-full rounded-lg font-medium transition-all duration-200',
        'ai-button-generate-gradient',
        // Only reduce opacity when truly disabled by prop, not while loading
        (!isLoading ? 'disabled:opacity-60' : ''),
        'disabled:cursor-not-allowed',
        'overflow-hidden',
        sizeClasses[size],
        // Hover animation (subtle glow only; no translate)
        !isLoading && !disabled ? 'hover:shadow-lg hover:shadow-fuchsia-500/20' : '',
        // Loading animation (glow/shine swipe)
        isLoading ? 'loading' : '',
        className
      ].join(' ')}
    >
      {/* Hover sheen */}
      {!isLoading && (
        <span
          className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
          style={{
            background:
              'radial-gradient(120px 60px at 10% -20%, rgba(255,255,255,0.25), transparent), radial-gradient(120px 60px at 90% 120%, rgba(255,255,255,0.12), transparent)'
          }}
        />
      )}

      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading && (
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              /* partial arc with a clear gap so rotation is visible */
              strokeDasharray="24 40"
              strokeDashoffset="0"
              fill="none"
            />
          </svg>
        )}
        <span>{isLoading ? loadingText : text}</span>
      </span>
    </button>
  )
}

export default AIActionButton



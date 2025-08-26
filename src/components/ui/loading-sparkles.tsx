'use client'

import React from 'react'
import { SparklesIcon } from 'lucide-react'

interface LoadingSparklesProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  text?: string
  subtext?: string
  showSpinner?: boolean
  className?: string
}

export function LoadingSparkles({
  size = 'lg',
  showText = true,
  text = 'Generating Content...',
  subtext = 'AI is crafting your perfect email',
  showSpinner = true,
  className = ''
}: LoadingSparklesProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-20 h-20',
    xl: 'w-24 h-24'
  }

  const iconSize = sizeClasses[size]

  return (
    <div className={`text-center space-y-6 ${className}`}>
      {/* Main Sparkles Icon - Bigger but not thicker */}
      <div className="relative">
        <div className="relative">
          {/* Base sparkle with color changing effect */}
          <SparklesIcon className={`${iconSize} text-purple-600 animate-pulse animate-[pulse_1s_ease-in-out_infinite] stroke-[1.5]`} />
          {/* Overlay sparkles with different colors and timing */}
          <SparklesIcon className={`absolute inset-0 ${iconSize} text-blue-500 animate-pulse animate-[pulse_1.5s_ease-in-out_infinite] stroke-[1.5]`} style={{ animationDelay: '0.3s' }} />
          <SparklesIcon className={`absolute inset-0 ${iconSize} text-fuchsia-500 animate-pulse animate-[pulse_2s_ease-in-out_infinite] stroke-[1.5]`} style={{ animationDelay: '0.6s' }} />
          <SparklesIcon className={`absolute inset-0 ${iconSize} text-emerald-500 animate-pulse animate-[pulse_2.5s_ease-in-out_infinite] stroke-[1.5]`} style={{ animationDelay: '0.9s' }} />
        </div>
      </div>
      
      {showText && (
        <div className="space-y-3">
          <p className="text-xl font-bold text-gray-900">{text}</p>
          {subtext && <p className="text-sm text-gray-600">{subtext}</p>}
          
          {/* Compact Spinner Below Text */}
          {showSpinner && (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <span className="text-xs text-gray-500">Processing...</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

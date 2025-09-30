'use client'

import React from 'react'

interface AIAssistantIconProps {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

export function AIAssistantIcon({ 
  size = 'md', 
  className = '' 
}: AIAssistantIconProps) {
  const sizeClasses = {
    xs: 'w-8 h-8',
    sm: 'w-12 h-12',
    md: 'w-20 h-20', 
    lg: 'w-24 h-24'
  }

  const iconSizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  const shadowSizeClasses = {
    xs: 'w-8 h-8',
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-24 h-24'
  }

  return (
    <div className={`relative ${className}`}>
      <style jsx>{`
        @keyframes floatLayer1 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.6;
          }
          25% {
            transform: translate(5px, -8px) scale(1.05);
            opacity: 0.7;
          }
          50% {
            transform: translate(-3px, -5px) scale(0.95);
            opacity: 0.5;
          }
          75% {
            transform: translate(-5px, 3px) scale(1.02);
            opacity: 0.65;
          }
        }
        
        @keyframes floatLayer2 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.5;
          }
          33% {
            transform: translate(-8px, 5px) scale(1.08);
            opacity: 0.6;
          }
          66% {
            transform: translate(5px, -3px) scale(0.92);
            opacity: 0.4;
          }
        }
        
        @keyframes pulseLayer3 {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
            opacity: 0.4;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2) rotate(180deg);
            opacity: 0.6;
          }
        }
        
        @keyframes shadowPulse { }
      `}</style>
      
      {/* Static Shadow */}
      <div 
        className={`absolute rounded-full ${shadowSizeClasses[size]}`}
        style={{
          background: 'linear-gradient(45deg, rgb(147, 51, 234) 0%, rgb(59, 130, 246) 50%, rgb(236, 72, 153) 100%)',
          filter: 'blur(16px)',
          opacity: 0.35,
          zIndex: 0
        }}
      ></div>
      
      {/* Main Icon Container */}
      <div 
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center border border-purple-400/40 relative overflow-hidden shadow-lg z-10`}
        style={{ backgroundColor: 'rgb(27, 12, 37)' }}
      >
        {/* Gradient Layer 1 - Top Left */}
        <div 
          className="absolute z-1"
          style={{
            background: 'linear-gradient(143.241deg, rgb(128, 169, 252) 0%, rgb(211, 123, 255) 31.087%, rgb(252, 171, 131) 70.4599%, rgb(255, 73, 212) 100%)',
            filter: 'blur(8px)',
            borderRadius: '100%',
            opacity: 0.6,
            height: '50%',
            left: '5%',
            top: '5%',
            width: '50%',
            animation: 'floatLayer1 6s ease-in-out infinite'
          }}
        ></div>
        
        {/* Gradient Layer 2 - Bottom Right */}
        <div 
          className="absolute z-1"
          style={{
            background: 'linear-gradient(140.017deg, rgb(239, 232, 246) 0%, rgb(213, 136, 251) 60.8266%, rgb(255, 73, 212) 100%)',
            filter: 'blur(8px)',
            borderRadius: '100%',
            opacity: 0.5,
            height: '45%',
            right: '5%',
            bottom: '5%',
            width: '45%',
            animation: 'floatLayer2 8s ease-in-out infinite'
          }}
        ></div>
        
        {/* Gradient Layer 3 - Center */}
        <div 
          className="absolute z-1"
          style={{
            background: 'linear-gradient(45deg, rgb(147, 51, 234) 0%, rgb(59, 130, 246) 50%, rgb(236, 72, 153) 100%)',
            filter: 'blur(6px)',
            borderRadius: '100%',
            opacity: 0.4,
            height: '35%',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '35%',
            animation: 'pulseLayer3 4s ease-in-out infinite'
          }}
        ></div>

        {/* Sparkles Icon */}
        <svg 
          className={`${iconSizeClasses[size]} text-white relative z-10`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          style={{ filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))' }}
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" 
          />
        </svg>
      </div>
    </div>
  )
}


import React from 'react'

interface LoadingAIGenerationProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function LoadingAIGeneration({ 
  size = 'md', 
  text = 'Generating...', 
  className = '' 
}: LoadingAIGenerationProps) {
  const iconSizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Base gradient card */}
      <div 
        className="absolute inset-0 rounded-2xl overflow-hidden"
        style={{ backgroundColor: 'rgb(27, 12, 37)' }}
      >
        {/* Gradient Layer 1 - Top Left - Floating Animation */}
        <div 
          className="absolute z-1"
          style={{
            background: 'linear-gradient(143.241deg, rgb(128, 169, 252) 0%, rgb(211, 123, 255) 31.087%, rgb(252, 171, 131) 70.4599%, rgb(255, 73, 212) 100%)',
            filter: 'blur(40px)',
            borderRadius: '100%',
            opacity: 0.3,
            height: '80%',
            left: '-25%',
            top: '-25%',
            width: '80%',
            animation: 'floatLayer1 6s ease-in-out infinite'
          }}
        ></div>
        
        {/* Gradient Layer 2 - Bottom Right - Floating Animation */}
        <div 
          className="absolute z-1"
          style={{
            background: 'linear-gradient(140.017deg, rgb(239, 232, 246) 0%, rgb(213, 136, 251) 60.8266%, rgb(255, 73, 212) 100%)',
            filter: 'blur(40px)',
            borderRadius: '100%',
            opacity: 0.25,
            height: '60%',
            right: '-15%',
            bottom: '-15%',
            width: '60%',
            animation: 'floatLayer2 8s ease-in-out infinite'
          }}
        ></div>
        
        {/* Gradient Layer 3 - Center - Pulsing Animation */}
        <div 
          className="absolute z-1"
          style={{
            background: 'linear-gradient(45deg, rgb(147, 51, 234) 0%, rgb(59, 130, 246) 50%, rgb(236, 72, 153) 100%)',
            filter: 'blur(30px)',
            borderRadius: '100%',
            opacity: 0.2,
            height: '40%',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '40%',
            animation: 'pulseLayer3 4s ease-in-out infinite'
          }}
        ></div>

              {/* Shade sweep effect on entire background */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                style={{
                  animation: 'shadeSweep 2s ease-in-out infinite',
                  transform: 'translateX(-100%)',
                  zIndex: 5
                }}
              ></div>

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center justify-center h-full p-4">
                {/* Big Icon in Center */}
                <div className="flex items-center justify-center mb-3">
                  <div className={`${iconSizeClasses[size]} relative`}>
                    <svg 
                      className="sparkle-icon gemini-sparkle"
                      style={{
                        width: '80%',
                        height: '80%',
                        filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))',
                        zIndex: 0
                      }}
                      viewBox="0 0 100 100"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <linearGradient id="sparkleGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="50%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        fill="url(#sparkleGradient)"
                      />
                    </svg>
                  </div>
                </div>
                
                {/* Small text at bottom with fade animation */}
                <span 
                  className={`${textSizeClasses[size]} font-medium text-white/80 text-center drop-shadow-sm`}
                  style={{
                    animation: 'textFade 3s ease-in-out infinite'
                  }}
                >
                  {text}
                </span>
              </div>
            </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes shadeSweep {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        @keyframes floatLayer1 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          25% {
            transform: translate(10px, -15px) scale(1.1);
            opacity: 0.4;
          }
          50% {
            transform: translate(-5px, -10px) scale(0.9);
            opacity: 0.2;
          }
          75% {
            transform: translate(-10px, 5px) scale(1.05);
            opacity: 0.35;
          }
        }
        
        @keyframes floatLayer2 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.25;
          }
          33% {
            transform: translate(-15px, 10px) scale(1.15);
            opacity: 0.35;
          }
          66% {
            transform: translate(10px, -5px) scale(0.85);
            opacity: 0.15;
          }
        }
        
        @keyframes pulseLayer3 {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
            opacity: 0.2;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.3) rotate(180deg);
            opacity: 0.4;
          }
        }
        
        .sparkle-icon {
          animation: sparkleGlow 3s ease-in-out infinite;
        }
        
        .gemini-sparkle {
          position: relative !important;
        }
        
        @keyframes sparkleGlow {
          0%, 100% {
            filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3)) brightness(1);
            transform: scale(1);
          }
          50% {
            filter: drop-shadow(0 0 16px rgba(255, 255, 255, 0.6)) brightness(1.2);
            transform: scale(1.05);
          }
        }

        @keyframes textFade {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}


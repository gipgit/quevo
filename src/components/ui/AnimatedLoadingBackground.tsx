import React from 'react'

interface AnimatedLoadingBackgroundProps {
  children: React.ReactNode
  className?: string
}

const AnimatedLoadingBackground: React.FC<AnimatedLoadingBackgroundProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <div className={`w-full h-screen relative overflow-hidden ${className}`}>
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-100 to-indigo-100">
        {/* Moving Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        
        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent transform -skew-x-12 animate-shine"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}

export default AnimatedLoadingBackground 
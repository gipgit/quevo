import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'gray' | 'white';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'blue',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    gray: 'border-gray-400',
    white: 'border-white'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <style jsx>{`
        @keyframes pulse-alternate-1 {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.95);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }
        
        @keyframes pulse-alternate-2 {
          0%, 100% {
            opacity: 1;
            transform: scale(1.05);
          }
          50% {
            opacity: 0.3;
            transform: scale(0.95);
          }
        }
        
        .pulse-blue {
          animation: pulse-alternate-1 2s ease-in-out infinite;
        }
        
        .pulse-purple {
          animation: pulse-alternate-2 2s ease-in-out infinite;
        }
      `}</style>
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Outer ring */}
        <div className={`absolute inset-0 rounded-full border-2 border-transparent ${colorClasses[color]} opacity-20`}></div>
        {/* Spinning ring */}
        <div className={`absolute inset-0 rounded-full border-2 border-transparent border-t-current ${colorClasses[color]} animate-spin`}></div>
        {/* Inner dot - Blue layer */}
        <div 
          className="absolute inset-3 rounded-full blur-sm pulse-blue"
          style={{
            background: 'radial-gradient(circle, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)'
          }}
        ></div>
        {/* Inner dot - Purple layer */}
        <div 
          className="absolute inset-3 rounded-full blur-sm pulse-purple"
          style={{
            background: 'radial-gradient(circle, #c084fc 0%, #a855f7 50%, #9333ea 100%)'
          }}
        ></div>
      </div>
    </div>
  );
};

export default LoadingSpinner; 
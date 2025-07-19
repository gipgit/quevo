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
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Outer ring */}
        <div className={`absolute inset-0 rounded-full border-2 border-transparent ${colorClasses[color]} opacity-20`}></div>
        {/* Spinning ring */}
        <div className={`absolute inset-0 rounded-full border-2 border-transparent border-t-current ${colorClasses[color]} animate-spin`}></div>
        {/* Inner dot */}
        <div className={`absolute inset-2 rounded-full bg-current ${colorClasses[color]} opacity-60 animate-pulse`}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner; 
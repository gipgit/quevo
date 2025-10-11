// components/board/BoardIconAction.tsx
'use client';

import { LucideIcon } from 'lucide-react';

/**
 * BoardIconAction - Icon component for board actions with gradient and glow effects
 * 
 * @param {Object} props
 * @param {LucideIcon} props.icon - Lucide React icon component
 * @param {string} props.color1 - Primary color for gradient start
 * @param {string} props.color2 - Middle color for gradient
 * @param {string} props.color3 - End color for gradient and shadows
 * @param {string} props.size - Size variant: 'xs', 'sm', 'md' (default: 'sm')
 * @param {boolean} props.isActive - Whether the action is selected/active
 * @param {string} props.className - Additional CSS classes
 */
interface BoardIconActionProps {
  icon: LucideIcon;
  color1: string;
  color2: string;
  color3: string;
  size?: 'xs' | 'sm' | 'md';
  isActive?: boolean;
  className?: string;
}

export default function BoardIconAction({ 
  icon: Icon, 
  color1, 
  color2, 
  color3,
  size = 'sm',
  isActive = false,
  className = '' 
}: BoardIconActionProps) {
  // Size configurations - smaller sizes for board modals
  const sizeConfig = {
    xs: {
      container: 'w-6 h-6',
      icon: 'w-3 h-3',
      shadowBlur: '8px',
      border: 'p-[1px]'
    },
    sm: {
      container: 'w-8 h-8',
      icon: 'w-4 h-4',
      shadowBlur: '12px',
      border: 'p-[1.5px]'
    },
    md: {
      container: 'w-12 h-12',
      icon: 'w-6 h-6',
      shadowBlur: '16px',
      border: 'p-[2px]'
    }
  };

  const config = sizeConfig[size] || sizeConfig.sm;
  
  // Check if absolute positioning is requested
  const isAbsolute = className.includes('absolute');
  const positionClass = isAbsolute ? '' : 'relative';
  const sizeClass = isAbsolute ? '' : config.container;

  return (
    <div className={`${positionClass} ${sizeClass} ${className}`}>
      {/* Glow shadow layer 1 - Outermost */}
      <div 
        className={`absolute inset-0 rounded-full blur-lg transition-opacity duration-300 ${
          isActive ? 'opacity-40' : 'opacity-15'
        }`}
        style={{
          background: `radial-gradient(circle, ${color1}, ${color2})`,
          filter: `blur(${config.shadowBlur})`
        }}
      />
      
      {/* Glow shadow layer 2 - Middle */}
      <div 
        className={`absolute inset-0 rounded-full blur-md transition-opacity duration-300 ${
          isActive ? 'opacity-50' : 'opacity-20'
        }`}
        style={{
          background: `radial-gradient(circle, ${color2}, ${color3})`,
          filter: 'blur(10px)'
        }}
      />

      {/* Main icon container with gradient border */}
      <div 
        className={`relative w-full h-full rounded-full ${config.border}`}
        style={{
          background: `linear-gradient(135deg, ${color1}, ${color2}, ${color3})`
        }}
      >
        {/* Inner background with gradient */}
        <div 
          className="w-full h-full rounded-full flex items-center justify-center relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${color1}DD, ${color2}EE, ${color3}DD)`
          }}
        >
          {/* Subtle gradient overlay for depth */}
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${color1}60, transparent 70%)`
            }}
          />
          
          {/* Icon */}
          {Icon && (
            <Icon 
              className={`${config.icon} relative z-10 text-white`}
              strokeWidth={2}
            />
          )}
        </div>
      </div>

      {/* Animated subtle pulse effect when active */}
      {isActive && (
        <div 
          className="absolute inset-0 rounded-full animate-pulse opacity-25"
          style={{
            background: `radial-gradient(circle, ${color2}, transparent 70%)`,
            animationDuration: '2s'
          }}
        />
      )}
    </div>
  );
}


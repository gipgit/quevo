// components/landing/LandingIconAction.jsx
'use client';

/**
 * LandingIconAction - A visually striking action icon component with gradient and shadow effects
 * 
 * @param {Object} props
 * @param {React.Component} props.icon - Lucide React icon component
 * @param {string} props.color1 - Primary color for gradient start (e.g., '#6366F1')
 * @param {string} props.color2 - Middle color for gradient (e.g., '#8B5CF6')
 * @param {string} props.color3 - End color for gradient and shadows (e.g., '#D946EF')
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg' (default: 'md')
 * @param {boolean} props.isActive - Whether the action is currently active (default: false)
 * @param {string} props.className - Additional CSS classes
 */
export default function LandingIconAction({ 
  icon: Icon, 
  color1, 
  color2, 
  color3,
  size = 'md',
  isActive = false,
  className = '' 
}) {
  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'w-12 h-12',
      icon: 'w-6 h-6',
      shadowBlur: '20px',
      shadowSpread: '15px'
    },
    md: {
      container: 'w-16 h-16',
      icon: 'w-8 h-8',
      shadowBlur: '30px',
      shadowSpread: '20px'
    },
    lg: {
      container: 'w-20 h-20',
      icon: 'w-10 h-10',
      shadowBlur: '40px',
      shadowSpread: '25px'
    }
  };

  const config = sizeConfig[size] || sizeConfig.md;
  
  // Check if absolute positioning is requested
  const isAbsolute = className.includes('absolute');
  const positionClass = isAbsolute ? '' : 'relative';
  const sizeClass = isAbsolute ? '' : config.container;

  return (
    <div className={`${positionClass} ${sizeClass} ${className}`}>
      {/* Glow shadow layer 1 - Outermost */}
      <div 
        className={`absolute inset-0 rounded-full blur-xl transition-opacity duration-300 ${
          isActive ? 'opacity-50' : 'opacity-15'
        }`}
        style={{
          background: `radial-gradient(circle, ${color1}, ${color2})`,
          filter: `blur(${isActive ? config.shadowBlur : '20px'})`
        }}
      />
      
      {/* Glow shadow layer 2 - Middle */}
      <div 
        className={`absolute inset-0 rounded-full blur-lg transition-opacity duration-300 ${
          isActive ? 'opacity-60' : 'opacity-20'
        }`}
        style={{
          background: `radial-gradient(circle, ${color2}, ${color3})`,
          filter: `blur(${isActive ? config.shadowSpread : '15px'})`
        }}
      />
      
      {/* Glow shadow layer 3 - Closest to icon */}
      <div 
        className={`absolute inset-0 rounded-full blur-md transition-opacity duration-300 ${
          isActive ? 'opacity-70' : 'opacity-25'
        }`}
        style={{
          background: color2,
          filter: `blur(${isActive ? '12px' : '8px'})`
        }}
      />

      {/* Main icon container with gradient border */}
      <div 
        className="relative w-full h-full rounded-full p-[2px]"
        style={{
          background: `linear-gradient(135deg, ${color1}, ${color2}, ${color3})`
        }}
      >
        {/* Inner background with gradient */}
        <div 
          className="w-full h-full rounded-full flex items-center justify-center relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${color1}15, ${color2}20, ${color3}15)`,
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Subtle gradient overlay for depth */}
          <div 
            className="absolute inset-0 opacity-50"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${color1}40, transparent 70%)`
            }}
          />
          
          {/* Icon */}
          {Icon && (
            <Icon 
              className={`${config.icon} relative z-10 text-white`}
              style={{
                filter: `drop-shadow(0 2px 4px ${color3}40)`
              }}
              strokeWidth={2}
            />
          )}
        </div>
      </div>

      {/* Animated pulse effect (optional, can be toggled) */}
      <div 
        className={`absolute inset-0 rounded-full transition-opacity duration-300 ${
          isActive ? 'animate-pulse opacity-30' : 'opacity-0'
        }`}
        style={{
          background: `radial-gradient(circle, ${color2}, transparent 70%)`,
          animationDuration: '3s'
        }}
      />
    </div>
  );
}


import React from 'react';

interface EmptyStateProfileProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText?: string;
  onButtonClick?: () => void;
  backgroundColor?: string;
  borderColor?: string;
  iconColor?: string;
  titleColor?: string;
  descriptionColor?: string;
  buttonBackgroundColor?: string;
  buttonHoverBackgroundColor?: string;
  buttonTextColor?: string;
  buttonBorderColor?: string;
}

const EmptyStateProfile: React.FC<EmptyStateProfileProps> = ({
  icon,
  title,
  description,
  buttonText,
  onButtonClick,
  backgroundColor = '',
  borderColor = 'border-gray-200',
  iconColor = 'text-gray-400',
  titleColor = '',
  descriptionColor = 'text-gray-600',
  buttonBackgroundColor = 'bg-blue-500',
  buttonHoverBackgroundColor = 'hover:bg-blue-600',
  buttonTextColor = 'text-white',
  buttonBorderColor = 'border-gray-300'
}) => {
  // Helper function to determine if a value is a CSS color (hex, rgb, etc.) or a Tailwind class
  const isCSSColor = (value: string) => {
    return value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl') || value.startsWith('var(');
  };

  // Helper function to get style object for CSS colors
  const getStyleObject = () => {
    const style: React.CSSProperties = {};
    
    if (backgroundColor && isCSSColor(backgroundColor)) {
      style.backgroundColor = backgroundColor;
    }
    
    if (borderColor && isCSSColor(borderColor)) {
      style.borderColor = borderColor;
    }
    
    return style;
  };

  // Helper function to get className string
  const getClassName = () => {
    const classes = ['w-full', 'min-h-[90vh]', 'border-[1px]', 'rounded-lg', 'flex', 'flex-col', 'items-center', 'justify-center', 'p-8'];
    
    if (backgroundColor && !isCSSColor(backgroundColor)) {
      classes.push(backgroundColor);
    }
    
    if (borderColor && !isCSSColor(borderColor)) {
      classes.push(borderColor);
    }
    
    return classes.join(' ');
  };

  return (
    <div className={getClassName()} style={getStyleObject()}>
      <div className={`${iconColor} mb-4`}>
        {icon}
      </div>
      <h3 
        className={`text-lg font-medium mb-2`}
        style={titleColor && isCSSColor(titleColor) ? { color: titleColor } : {}}
      >
        {title}
      </h3>
      <p className={`${descriptionColor} text-center max-w-md ${buttonText && onButtonClick ? 'mb-6' : ''}`}>
        {description}
      </p>
      {buttonText && onButtonClick && (
        <button
          onClick={onButtonClick}
          className={`${buttonBackgroundColor} ${buttonHoverBackgroundColor} ${buttonTextColor} px-4 py-2 rounded-lg transition-colors border ${buttonBorderColor}`}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default EmptyStateProfile;

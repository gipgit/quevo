// Plan color scheme configuration utility
export const getPlanColors = (planName: string) => {
  const planNameLower = planName.toLowerCase();
  
  if (planNameLower.includes('free')) {
    return {
      gradient: 'bg-gray-200',
      textColor: 'text-gray-900',
      showStar: false,
      style: {
        background: '#f3f4f6',
        border: '2px solid #9ca3af',
        boxShadow: 'none',
        textShadow: 'none',
        position: 'relative' as const,
        overflow: 'hidden' as const
      }
    };
  } else if (planNameLower.includes('starter')) {
    return {
      gradient: 'bg-green-500',
      textColor: 'text-white',
      showStar: false,
      style: {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        border: '2px solid #047857',
        boxShadow: 'none',
        textShadow: 'none',
        position: 'relative' as const,
        overflow: 'hidden' as const
      }
    };
  } else if (planNameLower.includes('growth')) {
    return {
      gradient: 'bg-blue-500',
      textColor: 'text-white',
      showStar: false,
      style: {
        background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 25%, #2563eb 50%, #1d4ed8 75%, #1e40af 100%)',
        border: '2px solid #2563eb',
        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4), 0 0 30px rgba(59, 130, 246, 0.2)',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
        position: 'relative' as const,
        overflow: 'hidden' as const
      }
    };
  } else if (planNameLower.includes('pro')) {
    return {
      gradient: 'bg-yellow-500',
      textColor: 'text-white',
      showStar: true,
      style: {
        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 25%, #f97316 50%, #ea580c 75%, #dc2626 100%)',
        border: '2px solid #f59e0b',
        boxShadow: '0 4px 15px rgba(251, 191, 36, 0.4), 0 0 30px rgba(251, 191, 36, 0.2)',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
        position: 'relative' as const,
        overflow: 'hidden' as const
      }
    };
  } else if (planNameLower.includes('premium')) {
    return {
      gradient: 'bg-purple-500',
      textColor: 'text-white',
      showStar: false,
      style: {
        background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #ef4444 100%)',
        border: '2px solid #9333ea',
        boxShadow: 'none',
        textShadow: 'none',
        position: 'relative' as const,
        overflow: 'hidden' as const
      }
    };
  } else {
    return {
      gradient: 'bg-gray-500',
      textColor: 'text-white',
      showStar: false,
      style: {
        background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
        border: '2px solid #6b7280',
        boxShadow: 'none',
        textShadow: 'none',
        position: 'relative' as const,
        overflow: 'hidden' as const
      }
    };
  }
};

// Helper function to capitalize plan names
export const capitalizePlanName = (planName: string) => {
  return planName.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}; 
// Plan color scheme configuration utility
export const getPlanColors = (planName: string) => {
  const planNameLower = planName.toLowerCase();
  
  if (planNameLower.includes('free')) {
    return {
      gradient: 'bg-gray-100 border border-gray-200',
      textColor: 'text-gray-900',
      showStar: false
    };
  } else if (planNameLower.includes('starter')) {
    return {
      gradient: 'bg-gradient-to-r from-blue-500 to-purple-600',
      textColor: 'text-white',
      showStar: false
    };
  } else if (planNameLower.includes('pro')) {
    return {
      gradient: 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500',
      textColor: 'text-white',
      showStar: true
    };
  } else if (planNameLower.includes('premium')) {
    return {
      gradient: 'bg-gradient-to-r from-purple-400 via-pink-500 to-red-500',
      textColor: 'text-white',
      showStar: false
    };
  } else {
    return {
      gradient: 'bg-gradient-to-r from-gray-500 to-gray-600',
      textColor: 'text-white',
      showStar: false
    };
  }
};

// Helper function to capitalize plan names
export const capitalizePlanName = (planName: string) => {
  return planName.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}; 
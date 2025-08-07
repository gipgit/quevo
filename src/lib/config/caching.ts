// Caching configuration for the application
// This allows easy toggling of caching features for development and production

export const CACHING_CONFIG = {
  // Enable/disable caching features
  ENABLE_CACHING: false, // Set to false to disable caching for development
  
  // Cache duration in seconds
  REVALIDATE_TIME: 300, // 5 minutes
};

// Helper function to get caching settings based on environment
export const getCachingSettings = () => {
  if (!CACHING_CONFIG.ENABLE_CACHING) {
    return {
      revalidate: 0, // No caching
      dynamic: 'auto', // Dynamic rendering
      fetchCache: 'force-no-store', // No fetch caching
    };
  }
  
  return {
    revalidate: CACHING_CONFIG.REVALIDATE_TIME,
    dynamic: 'force-static', // Static rendering
    fetchCache: 'force-cache', // Cache fetch requests
  };
}; 
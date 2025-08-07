// Caching configuration for the application
// This allows easy toggling of caching features for development and production

export const CACHING_CONFIG = {
  // Enable/disable caching features
  ENABLE_CACHING: false, // Set to false to disable caching for development
  
  // Cache duration in seconds
  REVALIDATE_TIME: 300, // 5 minutes
  
  // Cache strategies
  DYNAMIC_STRATEGY: 'force-static', // or 'auto' for dynamic content
  FETCH_CACHE_STRATEGY: 'force-cache', // or 'default' for fresh data
};

// Helper function to get caching settings based on environment
export const getCachingSettings = () => {
  if (!CACHING_CONFIG.ENABLE_CACHING) {
    return {
      revalidate: 0, // No caching
      dynamic: 'auto' as const, // Dynamic rendering
      fetchCache: 'default' as const, // No fetch caching
    };
  }
  
  return {
    revalidate: CACHING_CONFIG.REVALIDATE_TIME,
    dynamic: CACHING_CONFIG.DYNAMIC_STRATEGY as const,
    fetchCache: CACHING_CONFIG.FETCH_CACHE_STRATEGY as const,
  };
}; 
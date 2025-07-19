// Helper function to refresh usage after creating an item
export const refreshUsageAfterCreation = async (
  feature: 'businesses' | 'products' | 'services' | 'promos' | 'bookings',
  refreshFunction: () => Promise<void>
) => {
  try {
    await refreshFunction()
  } catch (error) {
    console.error(`Error refreshing usage for ${feature}:`, error)
  }
}

// Helper function to refresh usage after deleting an item
export const refreshUsageAfterDeletion = async (
  feature: 'businesses' | 'products' | 'services' | 'promos' | 'bookings',
  refreshFunction: () => Promise<void>
) => {
  try {
    await refreshFunction()
  } catch (error) {
    console.error(`Error refreshing usage for ${feature}:`, error)
  }
}

// Helper function to check if user can create more items
export const canCreateMore = (
  currentUsage: number,
  limit: number
): boolean => {
  return limit === -1 || currentUsage < limit
}

// Helper function to get usage percentage
export const getUsagePercentage = (
  currentUsage: number,
  limit: number
): number => {
  if (limit === -1) return 0
  return Math.min(100, (currentUsage / limit) * 100)
}

// Helper function to format usage display
export const formatUsageDisplay = (
  currentUsage: number,
  limit: number,
  unlimitedText: string = "∞"
): string => {
  if (limit === -1) return `${currentUsage} / ${unlimitedText}`
  return `${currentUsage} / ${limit}`
} 
export const BUSINESS_ID_COOKIE_NAME = 'current-business-id'

export function setCurrentBusinessIdCookie(businessId: string) {
  // This function is for client-side use
  if (typeof window !== 'undefined') {
    // Set cookie with more secure options and ensure it's set immediately
    document.cookie = `${BUSINESS_ID_COOKIE_NAME}=${businessId}; path=/; max-age=31536000; SameSite=Lax; secure=${window.location.protocol === 'https:'}`
    
    // Verify the cookie was set
    const cookies = document.cookie.split(';')
    const businessCookie = cookies.find(cookie => cookie.trim().startsWith(`${BUSINESS_ID_COOKIE_NAME}=`))
    
    if (!businessCookie) {
      console.warn('Failed to set business ID cookie, trying alternative method')
      // Fallback: try setting without secure flag
      document.cookie = `${BUSINESS_ID_COOKIE_NAME}=${businessId}; path=/; max-age=31536000; SameSite=Lax`
    }
  }
}

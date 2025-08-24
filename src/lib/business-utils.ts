export const BUSINESS_ID_COOKIE_NAME = 'current-business-id'

export function setCurrentBusinessIdCookie(businessId: string) {
  // This function is for client-side use
  if (typeof window !== 'undefined') {
    try {
      // Set cookie with more secure options and ensure it's set immediately
      const cookieValue = `${BUSINESS_ID_COOKIE_NAME}=${businessId}; path=/; max-age=31536000; SameSite=Lax; secure=${window.location.protocol === 'https:'}`
      document.cookie = cookieValue
      
      // Verify the cookie was set
      const cookies = document.cookie.split(';')
      const businessCookie = cookies.find(cookie => cookie.trim().startsWith(`${BUSINESS_ID_COOKIE_NAME}=`))
      
      if (!businessCookie) {
        console.warn('Failed to set business ID cookie, trying alternative method')
        // Fallback: try setting without secure flag
        document.cookie = `${BUSINESS_ID_COOKIE_NAME}=${businessId}; path=/; max-age=31536000; SameSite=Lax`
        
        // Verify again
        const cookiesRetry = document.cookie.split(';')
        const businessCookieRetry = cookiesRetry.find(cookie => cookie.trim().startsWith(`${BUSINESS_ID_COOKIE_NAME}=`))
        
        if (!businessCookieRetry) {
          console.error('Failed to set business ID cookie even with fallback method')
          throw new Error('Failed to set business ID cookie')
        }
      }
      
      console.log('Business ID cookie set successfully:', businessId)
    } catch (error) {
      console.error('Error setting business ID cookie:', error)
      throw error
    }
  }
}

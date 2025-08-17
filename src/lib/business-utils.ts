export const BUSINESS_ID_COOKIE_NAME = 'current-business-id'

export function setCurrentBusinessIdCookie(businessId: string) {
  // This function is for client-side use
  if (typeof window !== 'undefined') {
    document.cookie = `${BUSINESS_ID_COOKIE_NAME}=${businessId}; path=/; max-age=31536000; SameSite=Lax`
  }
}

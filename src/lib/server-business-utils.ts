import { cookies } from 'next/headers'

export const BUSINESS_ID_COOKIE_NAME = 'current-business-id'

export function getCurrentBusinessIdFromCookie(): string | null {
  const cookieStore = cookies()
  return cookieStore.get(BUSINESS_ID_COOKIE_NAME)?.value || null
}

export async function getBusinessFromContext() {
  // This function simulates getting business data from context
  // In a real implementation, you might use a different approach
  // For now, we'll use the cookie approach
  const currentBusinessId = getCurrentBusinessIdFromCookie()
  return { currentBusinessId }
}



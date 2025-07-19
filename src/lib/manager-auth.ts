// Simple JWT decode for Edge Runtime compatibility
// This is a basic implementation for middleware - for full JWT verification use API routes

const JWT_SECRET = process.env.JWT_SECRET || "changeme-super-secret-key"
const COOKIE_NAME = "manager_token"

// Simple base64 decode function for Edge Runtime
function base64UrlDecode(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const pad = base64.length % 4
  const padded = pad ? base64 + '='.repeat(4 - pad) : base64
  return atob(padded)
}

// Simple JWT decode (without verification for Edge Runtime)
function decodeJWT(token: string): any {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = parts[1]
    const decoded = JSON.parse(base64UrlDecode(payload))
    return decoded
  } catch {
    return null
  }
}

export function getManagerFromToken(token: string): null | { user_id: string; email: string; role: string } {
  try {
    const decoded = decodeJWT(token)
    if (
      decoded &&
      "user_id" in decoded &&
      "email" in decoded &&
      decoded.role === "manager"
    ) {
      return decoded as { user_id: string; email: string; role: string }
    }
    return null
  } catch {
    return null
  }
}

export function getManagerFromRequest(req: Request): null | { user_id: string; email: string; role: string } {
  const cookie = req.headers.get("cookie") || ""
  const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`))
  if (!match) return null
  return getManagerFromToken(match[1])
}

// For API routes that need full JWT verification, use this function
export async function verifyManagerToken(token: string): Promise<null | { user_id: string; email: string; role: string }> {
  // Dynamic import to avoid Edge Runtime issues
  const jwt = await import("jsonwebtoken")
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (
      typeof decoded === "object" &&
      decoded &&
      "user_id" in decoded &&
      "email" in decoded &&
      decoded.role === "manager"
    ) {
      return decoded as { user_id: string; email: string; role: string }
    }
    return null
  } catch {
    return null
  }
}

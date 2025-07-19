// Server-side JWT verification (for API routes only)
// This file should NOT be imported by middleware or other Edge Runtime code

const JWT_SECRET = process.env.JWT_SECRET || "changeme-super-secret-key"

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
import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"
import { NextRequest, NextResponse } from "next/server"

const intlMiddleware = createMiddleware(routing)

export function middleware(req: NextRequest) {
  // Only run next-intl i18n middleware
  // NextAuth will handle authentication in the dashboard layout
  return intlMiddleware(req)
}

export const config = {
  // Match all pathnames except for:
  // - API routes (/api)
  // - tRPC routes (/trpc)
  // - Next.js internal files (/_next)
  // - Vercel specific internal files (/_vercel)
  // - Files with a dot (e.g., favicon.ico, images, etc.)
  // - Auth-related routes
  matcher: "/((?!api|trpc|_next|_vercel|auth|signin|signup|.*\\..*).*)",
}

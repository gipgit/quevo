import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"
import { NextRequest, NextResponse } from "next/server"
import { getManagerFromToken } from "@/lib/manager-auth"

const intlMiddleware = createMiddleware(routing)

export function middleware(req: NextRequest) {
  // First, run next-intl i18n middleware
  const intlResult = intlMiddleware(req)
  if (intlResult instanceof Response) {
    // If i18n middleware returns a redirect/response, return it immediately
    return intlResult
  }

  // Then, dashboard authentication logic (after locale is resolved)
  const url = req.nextUrl
  // The locale will be in the pathname, e.g. /en/dashboard
  const isDashboard = /^\/(it|en|es)\/dashboard/.test(url.pathname)
  if (isDashboard) {
    const token = req.cookies.get("manager_token")?.value
    const manager = token ? getManagerFromToken(token) : null
    if (!manager) {
      // Redirect to the correct locale sign-in page
      const locale = url.pathname.split("/")[1] || "en"
      const loginUrl = new URL(`/${locale}/signin/manager`, req.url)
      return NextResponse.redirect(loginUrl)
    }
  }
  return NextResponse.next()
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

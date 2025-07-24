import createMiddleware from "next-intl/middleware"
import { routing, locales, defaultLocale } from "./i18n/routing"
import { NextRequest, NextResponse } from "next/server"

const intlMiddleware = createMiddleware(routing)

// Map countries to locales
const countryToLocale: Record<string, string> = {
  'IT': 'it',
  'US': 'en',
  'GB': 'en',
  'CA': 'en',
  'AU': 'en',
  'ES': 'es',
  'MX': 'es',
  'AR': 'es',
  'CO': 'es',
  'PE': 'es',
  'VE': 'es',
  'CL': 'es',
  'EC': 'es',
  'GT': 'es',
  'CU': 'es',
  'BO': 'es',
  'DO': 'es',
  'HN': 'es',
  'PY': 'es',
  'SV': 'es',
  'NI': 'es',
  'CR': 'es',
  'PA': 'es',
  'UY': 'es',
  'GQ': 'es',
}

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  
  // Skip middleware for API routes, static files, etc.
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel') ||
    pathname.startsWith('/auth') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check if the pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) {
    // Path already has locale, use next-intl middleware
    return intlMiddleware(req)
  }

  // No locale in pathname, detect and redirect
  let detectedLocale = defaultLocale

  // Check for Accept-Language header
  const acceptLanguage = req.headers.get('accept-language')
  if (acceptLanguage) {
    const preferredLanguage = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim().toLowerCase())
      .find(lang => locales.includes(lang))
    
    if (preferredLanguage) {
      detectedLocale = preferredLanguage
    }
  }

  // Check for country-based detection (if Accept-Language didn't work)
  if (detectedLocale === defaultLocale) {
    const country = req.geo?.country
    if (country && countryToLocale[country]) {
      detectedLocale = countryToLocale[country]
    }
  }

  // Redirect to detected locale
  const newUrl = new URL(`/${detectedLocale}${pathname}`, req.url)
  return NextResponse.redirect(newUrl)
}

export const config = {
  // Match all pathnames except for:
  // - API routes (/api)
  // - tRPC routes (/trpc)
  // - Next.js internal files (/_next)
  // - Vercel specific internal files (/_vercel)
  // - Files with a dot (e.g., favicon.ico, images, etc.)
  // - Auth-related routes
  matcher: [
    // Match all pathnames except for the ones starting with:
    // - api (API routes)
    // - _next (Next.js internals)
    // - _vercel (Vercel internals)
    // - auth (auth routes)
    // - . (files with extensions)
    '/((?!api|_next|_vercel|auth|.*\\..*).*)',
  ],
}

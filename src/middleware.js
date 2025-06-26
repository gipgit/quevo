// src/middleware.js
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n'; // Assuming i18n exports these

// Create your next-intl middleware instance
const nextIntlMiddleware = createMiddleware({
  locales,        // ['en', 'it']
  defaultLocale,  // 'it'
  localePrefix: 'always' // This is correct for the desired redirect
});

export default function middleware(request) {
  // Optional: Add console logs here to debug the request
  console.log('--- Middleware running for pathname:', request.nextUrl.pathname, '---');
  // At this point, request.nextUrl.locale might still be undefined if no locale is prefixed
  // or it might be the detected locale by Next.js itself if localeDetection is active.

  return nextIntlMiddleware(request); // Pass the request to next-intl's middleware
}

export const config = {
  // This matcher will now capture paths like /nutrizionista_equilibrio
  // It matches all pathnames except for:
  // - /api (API routes)
  // - /_next (Next.js internal files)
  // - Files with a dot (e.g., .ico, .png, .jpg) - these are usually static assets
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
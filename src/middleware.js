// src/middleware.js
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing'; // Import routing config from your src/i18n directory

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for:
  // - API routes (/api)
  // - tRPC routes (/trpc) - if you use them
  // - Next.js internal files (/_next)
  // - Vercel specific internal files (/_vercel) - if deployed on Vercel
  // - Files with a dot (e.g., favicon.ico, images, etc.)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
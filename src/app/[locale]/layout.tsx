// src/app/[locale]/layout.tsx
import '../styles/global.css'; // Keep your global styles import

// Import necessary components/functions for the new setup
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation'; // For handling unsupported locales
import { routing } from '@/i18n/routing'; // Import your routing config for locales
import { ToasterProvider } from '@/components/ui/ToasterProvider';
import { ThemeProvider } from '@/contexts/ThemeContext';

export const metadata = {
  title: 'Quevo App',
  description: 'Quevo Profile Application',
};

// This function is required by Next.js App Router for static rendering.
// It uses the `locales` array defined in your `src/i18n/routing.js`.
export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string }; // Next.js typically provides `locale` as a string here
}) {
  // Extract locale from params.
  const { locale } = params;

  // Ensure that the incoming `locale` from the URL is valid based on your routing configuration.
  // If it's not a supported locale, Next.js will show a 404 page.
  if (!hasLocale(routing.locales, locale)) {
    console.error(`[layout.tsx] Invalid locale received: ${locale}. Not found in supported locales: ${routing.locales.join(', ')}`);
    notFound();
  }

  // Console logs for debugging (you can remove these later if you wish)
  console.log(`[layout.tsx] RootLayout received locale from params: ${locale}. Validating...`);
  console.log(`[layout.tsx] Locale is valid.`);

  // In this new setup, `NextIntlClientProvider` implicitly gets messages and locale
  // from the configuration defined in `src/i18n/request.js` via the `next-intl` plugin.
  // We do NOT call `getRequestConfig` directly here, and `NextIntlClientProvider`
  // does NOT need `messages` or `locale` props when using this setup.

  return (
    <html lang={locale}> {/* Use the validated locale for the HTML lang attribute */}
      <body>
        {/* The messages and locale are automatically provided to the client context
            by the next-intl plugin configured in next.config.js pointing to src/i18n/request.js */}
        <NextIntlClientProvider>
          <ThemeProvider>
            <ToasterProvider>
            {children}
            </ToasterProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
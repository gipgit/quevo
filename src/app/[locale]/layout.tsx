// src/app/layout.tsx
import '../styles/global.css';

import getRequestConfig from '@/i18n';
import { NextIntlClientProvider } from 'next-intl';

import { locales, defaultLocale } from '@/i18n';

export const metadata = {
  title: 'Quevo App',
  description: 'Quevo Profile Application',
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params: { locale = defaultLocale }
}: {
  children: React.ReactNode;
  params: { locale?: string };
}) {
  console.log(`[layout.tsx] RootLayout received locale from params: ${locale}`);

  const config = await getRequestConfig({ locale: locale as string });

  console.log(`[layout.tsx] getRequestConfig returned locale: ${config.locale}`);

  // FIX 1: Safely access config.messages for Object.keys
  console.log(`[layout.tsx] Messages for NextIntlClientProvider (keys): ${Object.keys(config.messages || {}).join(', ')}`);

  // FIX 2: Safely access config.messages.Common
  if (config.messages && config.messages.Common) {
    console.log(`[layout.tsx] Common.products from config: "${config.messages.Common.products}"`);
    console.log(`[layout.tsx] Common.promotions from config: "${config.messages.Common.promotions}"`);
    console.log(`[layout.tsx] Common.rewards from config: "${config.messages.Common.rewards}"`);
  } else {
    // Optional: Add a log if messages or Common is missing, for debugging
    console.warn(`[layout.tsx] config.messages or config.messages.Common is missing for locale: ${config.locale}`);
  }


  return (
    <html lang={config.locale}>
      <body>
        {/* The NextIntlClientProvider expects 'messages' to be an object,
            so ensure it's not null/undefined here as well.
            The 'getRequestConfig' function should ideally guarantee 'messages'
            is at least an empty object if no specific messages are found. */}
        <NextIntlClientProvider messages={config.messages || {}}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
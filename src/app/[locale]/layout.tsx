// src/app/[locale]/layout.tsx
import '../styles/global.css';

// Import the default export (getRequestConfig setup) and also 'locales' from your i18n file
import getRequestConfig, { locales } from '@/i18n'; // Import 'locales' here for generateStaticParams
import { NextIntlClientProvider } from 'next-intl';

// No need to import defaultLocale here if not directly used
// import { defaultLocale } from '@/i18n'; // Can be removed if not directly used

export const metadata = {
  title: 'Quevo App',
  description: 'Quevo Profile Application',
};

// This function tells Next.js which locales to build static pages for.
// It uses the 'locales' array directly from your i18n.js.
export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params: { locale } // 'locale' is provided by Next.js based on the [locale] folder
}: {
  children: React.ReactNode;
  params: { locale: string }; // 'locale' will be a string (e.g., 'en', 'it')
}) {
  console.log(`[layout.tsx] RootLayout received locale from params: ${locale}`);

  // THIS IS THE KEY CHANGE:
  // Call getRequestConfig directly without passing any arguments.
  // next-intl will internally use the 'locale' from params.
  const config = await getRequestConfig();

  console.log(`[layout.tsx] getRequestConfig returned locale: ${config.locale}`);
  console.log(`[layout.tsx] Messages for NextIntlClientProvider (keys): ${Object.keys(config.messages).join(', ')}`);

  // Your existing conditional console logs for messages
  if (config.messages.Common && config.messages.Common.products) {
    console.log(`[layout.tsx] Common.products from config: "${config.messages.Common.products}"`);
    console.log(`[layout.tsx] Common.promotions from config: "${config.messages.Common.promotions}"`);
    console.log(`[layout.tsx] Common.rewards from config: "${config.messages.Common.rewards}"`);
  }

  return (
    <html lang={config.locale}>
      <body>
        <NextIntlClientProvider messages={config.messages} locale={config.locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
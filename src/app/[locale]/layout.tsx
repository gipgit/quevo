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

  const config = await getRequestConfig({ locale });

  console.log(`[layout.tsx] getRequestConfig returned locale: ${config.locale}`);
  console.log(`[layout.tsx] Messages for NextIntlClientProvider (keys): ${Object.keys(config.messages).join(', ')}`);
  if (config.messages.Common && config.messages.Common.products) {
    console.log(`[layout.tsx] Common.products from config: "${config.messages.Common.products}"`);
    console.log(`[layout.tsx] Common.promotions from config: "${config.messages.Common.promotions}"`);
    console.log(`[layout.tsx] Common.rewards from config: "${config.messages.Common.rewards}"`);
  }

  return (
    <html lang={config.locale}>
      <body>
        <NextIntlClientProvider messages={config.messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
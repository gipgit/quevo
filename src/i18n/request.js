// src/i18n/request.js
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing'; // Import routing config from the same directory

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;

  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  console.log(`[i18n/request.js] Processing locale: ${requested}. Resolved to: ${locale}`);

  try {
    const messages = (await import(`../../messages/${locale}.json`)).default;
    console.log(`[i18n/request.js] Successfully loaded messages for ${locale}.`);
    return {
      locale, // Return the resolved locale
      messages: messages
    };
  } catch (error) {
    console.error(`[i18n/request.js] Failed to load messages for ${locale}. Error:`, error.message);
    const defaultMessages = (await import(`../../messages/${routing.defaultLocale}.json`)).default;
    console.warn(`[i18n/request.js] Falling back to default locale messages (${routing.defaultLocale}).`);
    return {
      locale: routing.defaultLocale,
      messages: defaultMessages
    };
  }
});
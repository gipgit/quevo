// src/i18n/request.js
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing'; // Import routing config from the same directory

// Static imports for all locales - this is more reliable for 8-10 locales
import itMessages from '../../messages/it.json';
import enMessages from '../../messages/en.json';
import esMessages from '../../messages/es.json';

const messages = {
  it: itMessages,
  en: enMessages,
  es: esMessages
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;

  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  console.log(`[i18n/request.js] Processing locale: ${requested}. Resolved to: ${locale}`);

  try {
    const localeMessages = messages[locale];
    if (!localeMessages) {
      throw new Error(`Messages not found for locale: ${locale}`);
    }
    
    console.log(`[i18n/request.js] Successfully loaded messages for ${locale}.`);
    return {
      locale, // Return the resolved locale
      messages: localeMessages
    };
  } catch (error) {
    console.error(`[i18n/request.js] Failed to load messages for ${locale}. Error:`, error.message);
    const defaultMessages = messages[routing.defaultLocale];
    console.warn(`[i18n/request.js] Falling back to default locale messages (${routing.defaultLocale}).`);
    return {
      locale: routing.defaultLocale,
      messages: defaultMessages
    };
  }
}); 
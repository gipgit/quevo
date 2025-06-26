// src/i18n.js
import { getRequestConfig } from 'next-intl/server';

// Define and EXPORT these constants here.
// This makes them available for import by other files like middleware.js and layout.tsx.
export const locales = ['en', 'it'];
export const defaultLocale = 'it';

export default getRequestConfig(async ({ locale }) => {
  // Use the provided locale if it's valid, otherwise fall back to the defaultLocale.
  // This ensures 'locale' is never undefined when used in the import path.
  const resolvedLocale = locales.includes(locale) ? locale : defaultLocale;

  console.log(`[i18n.js] Attempting to load messages for locale: ${locale}. Resolved locale: ${resolvedLocale}`);

  try {
    const messages = (await import(`../messages/${resolvedLocale}.json`)).default;
    console.log(`[i18n.js] Successfully loaded messages for ${resolvedLocale}. Top-level keys: ${Object.keys(messages).join(', ')}`);
    if (messages.Common && messages.Common.products) {
      console.log(`[i18n.js] Common.products in ${resolvedLocale}: "${messages.Common.products}"`);
      console.log(`[i18n.js] Common.promotions in ${resolvedLocale}: "${messages.Common.promotions}"`);
      console.log(`[i18n.js] Common.rewards in ${resolvedLocale}: "${messages.Common.rewards}"`);
    } else {
      console.log(`[i18n.js] Common namespace or 'products' key not found in messages for ${resolvedLocale}.`);
    }

    return {
      locale: resolvedLocale,
      messages: messages
    };
  } catch (error) {
    console.error(`[i18n.js] Failed to load messages for ${resolvedLocale}. Error:`, error.message);
    // Fallback in case of error (e.g., if a locale.json is truly missing/corrupt)
    return {
      locale: defaultLocale, // Ensure a default locale is returned even on error
      messages: (await import(`../messages/${defaultLocale}.json`)).default
    };
  }
});
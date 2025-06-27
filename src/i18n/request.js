// src/i18n/request.js
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing'; // Import routing config from the same directory

export default getRequestConfig(async ({ requestLocale }) => {
  // The locale segment from the URL (e.g., 'en' from /en/about)
  const requested = await requestLocale;

  // Determine the actual locale to use, falling back to default if requested is not supported
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // Console logs for debugging (you can remove these later if you wish)
  console.log(`[i18n/request.js] Processing locale: ${requested}. Resolved to: ${locale}`);

  try {
    // Dynamically import the messages for the determined locale.
    // The path `../../messages/${locale}.json` goes up two levels from `src/i18n/`
    // to your project root, then into the `messages` folder.
    const messages = (await import(`../../messages/${locale}.json`)).default;
    console.log(`[i18n/request.js] Successfully loaded messages for ${locale}.`);
    return {
      locale, // Return the resolved locale
      messages: messages
    };
  } catch (error) {
    console.error(`[i18n/request.js] Failed to load messages for ${locale}. Error:`, error.message);
    // In case of error (e.g., missing file), throw a notFound() or return default messages
    // For strict adherence to docs, often notFound() is used here if the file is expected to exist.
    const defaultMessages = (await import(`../../messages/${routing.defaultLocale}.json`)).default;
    console.warn(`[i18n/request.js] Falling back to default locale messages (${routing.defaultLocale}).`);
    return {
      locale: routing.defaultLocale,
      messages: defaultMessages
    };
  }
});
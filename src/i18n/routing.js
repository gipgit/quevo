// src/i18n/routing.js
import { defineRouting } from 'next-intl/routing';

// Define your supported locales and default locale here.
// This will be the single source of truth for your locales in this new setup.
export const locales = ['it', 'en', 'es'];
export const defaultLocale = 'it';

export const routing = defineRouting({
  locales,
  defaultLocale
});
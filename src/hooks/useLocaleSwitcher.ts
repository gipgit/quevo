'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { locales } from '@/i18n/routing';

export const useLocaleSwitcher = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Get current locale from pathname
  const getCurrentLocale = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    return pathSegments[0] || 'it';
  };

  // Get the path without locale
  const getPathWithoutLocale = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    return pathSegments.slice(1).join('/');
  };

  // Switch to a new locale
  const switchLocale = (newLocale: string) => {
    const pathWithoutLocale = getPathWithoutLocale();
    const newPath = pathWithoutLocale ? `/${newLocale}/${pathWithoutLocale}` : `/${newLocale}`;
    router.push(newPath);
    setIsModalOpen(false);
  };

  // Available locales with labels - these will be displayed in their native language
  const getAvailableLocales = () => {
    const localeLabels = {
      it: 'Italiano',
      en: 'English', 
      es: 'Español'
    };
    
    return [
      { code: 'it', label: localeLabels.it },
      { code: 'en', label: localeLabels.en },
      { code: 'es', label: localeLabels.es }
    ];
  };

  return {
    isModalOpen,
    setIsModalOpen,
    currentLocale: getCurrentLocale(),
    availableLocales: getAvailableLocales(),
    switchLocale
  };
}; 
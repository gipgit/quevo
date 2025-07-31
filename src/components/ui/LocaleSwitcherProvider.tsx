'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { locales } from '@/i18n/routing';

interface LocaleSwitcherContextType {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  currentLocale: string;
  availableLocales: Array<{ code: string; label: string }>;
  switchLocale: (newLocale: string) => void;
}

const LocaleSwitcherContext = createContext<LocaleSwitcherContextType | undefined>(undefined);

export const useLocaleSwitcher = () => {
  const context = useContext(LocaleSwitcherContext);
  if (!context) {
    throw new Error('useLocaleSwitcher must be used within a LocaleSwitcherProvider');
  }
  return context;
};

interface LocaleSwitcherProviderProps {
  children: ReactNode;
}

export const LocaleSwitcherProvider: React.FC<LocaleSwitcherProviderProps> = ({ children }) => {
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

  const value = {
    isModalOpen,
    setIsModalOpen,
    currentLocale: getCurrentLocale(),
    availableLocales: getAvailableLocales(),
    switchLocale
  };

  return (
    <LocaleSwitcherContext.Provider value={value}>
      {children}
    </LocaleSwitcherContext.Provider>
  );
}; 
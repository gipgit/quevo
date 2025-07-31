'use client';

import React from 'react';
import LocaleSelectModal from './LocaleSelectModal';
import { useLocaleSwitcher } from './LocaleSwitcherProvider';

export default function LocaleModalWrapper() {
  const { isModalOpen, setIsModalOpen, currentLocale, availableLocales, switchLocale } = useLocaleSwitcher();

  return (
    <LocaleSelectModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      currentLocale={currentLocale}
      availableLocales={availableLocales}
      onLocaleSelect={switchLocale}
    />
  );
} 
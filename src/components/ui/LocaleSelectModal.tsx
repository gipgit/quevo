import React from 'react';
import { useTranslations } from 'next-intl';

interface LocaleSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocale: string;
  availableLocales: Array<{ code: string; label: string }>;
  onLocaleSelect: (locale: string) => void;
}

// Flag icon component
const FlagIcon = ({ locale }: { locale: string }) => {
  const flags: { [key: string]: string } = {
    it: '🇮🇹',
    en: '🇺🇸',
    es: '🇪🇸',
    de: '🇩🇪',
    fr: '🇫🇷'
  };
  
  return (
    <span className="text-2xl" role="img" aria-label={`${locale} flag`}>
      {flags[locale] || '🌐'}
    </span>
  );
};

export const LocaleSelectModal: React.FC<LocaleSelectModalProps> = ({
  isOpen,
  onClose,
  currentLocale,
  availableLocales,
  onLocaleSelect
}) => {
  const t = useTranslations('Common');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('selectLanguage')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={t('close')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Language Grid */}
        <div className="grid grid-cols-1 gap-3 mb-6">
          {availableLocales.map((locale) => (
            <button
              key={locale.code}
              onClick={() => onLocaleSelect(locale.code)}
              className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                locale.code === currentLocale
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <FlagIcon locale={locale.code} />
              <span className="font-medium">{locale.label}</span>
              {locale.code === currentLocale && (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-auto text-blue-500">
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fill="currentColor"/>
                </svg>
              )}
            </button>
          ))}
        </div>

        {/* Request Language Button */}
        <div className="border-t pt-4">
          <a
            href="mailto:support@quevo.com?subject=Language Request"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200 hover:border-gray-300"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18 8.118l-8 4-8-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {t('requestLanguage')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default LocaleSelectModal; 
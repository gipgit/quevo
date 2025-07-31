import React from 'react';
import { useTranslations } from 'next-intl';

interface LocaleSwitcherButtonProps {
  onClick: () => void;
  className?: string;
}

export const LocaleSwitcherButton: React.FC<LocaleSwitcherButtonProps> = ({ onClick, className }) => {
  const t = useTranslations('Common');
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition ${className || ''}`}
      aria-label={t('language')}
    >
      {/* Inline globe SVG icon */}
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
        <ellipse cx="10" cy="10" rx="4" ry="9" stroke="currentColor" strokeWidth="2" />
        <line x1="1" y1="10" x2="19" y2="10" stroke="currentColor" strokeWidth="2" />
        <line x1="10" y1="1" x2="10" y2="19" stroke="currentColor" strokeWidth="2" />
      </svg>
      <span className="hidden sm:inline">{t('language')}</span>
    </button>
  );
};

export default LocaleSwitcherButton; 
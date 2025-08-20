"use client";

import React from 'react';

interface AIChatSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
  themeColors: {
    background: string;
    text: string;
    button: string;
  };
}

export default function AIChatSuggestions({ onSuggestionClick, themeColors }: AIChatSuggestionsProps) {
  const suggestions = [
    {
      icon: '🔧',
      text: 'Mostrami i servizi'
    },
    {
      icon: '📅',
      text: 'Prenota un servizio'
    },
    {
      icon: '📅',
      text: 'Controlla Disponibilità'
    },
    {
      icon: '💰',
      text: 'Voglio un preventivo'
    },
    {
      icon: '📞',
      text: 'Contatti'
    },
    {
      icon: '🛍️',
      text: 'Mostrami i prodotti'
    },
    {
      icon: '🎉',
      text: 'Promozioni attive'
    },
    {
      icon: '🏆',
      text: 'Programma premi'
    }
  ];

  return (
    <div className="p-4 border-t relative z-10" style={{ borderColor: themeColors.text + '20' }}>
      
      <div className="flex flex-wrap gap-1 lg:gap-2 justify-center relative z-10">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion.text)}
            className="inline-flex items-center gap-1 lg:gap-2 px-2 py-1 lg:px-3 lg:py-2 rounded-3xl transition-all whitespace-nowrap"
            style={{
              backgroundColor: themeColors.background,
              border: `1px solid ${themeColors.text + '40'}`,
            }}
          >
            <span className="text-base lg:text-lg">{suggestion.icon}</span>
            <span 
              className="text-xs font-medium"
              style={{ color: themeColors.text }}
            >
              {suggestion.text}
            </span>
          </button>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <p 
          className="text-xs opacity-60"
          style={{ color: themeColors.text }}
        >
          Oppure scrivi liberamente quello che ti serve!
        </p>
      </div>
    </div>
  );
}

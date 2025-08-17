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
    <div className="p-4 border-t" style={{ borderColor: themeColors.text + '20' }}>
      
      <div className="flex flex-wrap gap-2 justify-center">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion.text)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-3xl transition-all whitespace-nowrap"
            style={{
              backgroundColor: themeColors.text + '5',
              border: `1px solid ${themeColors.text + '40'}`,
            }}
          >
            <span className="text-lg">{suggestion.icon}</span>
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

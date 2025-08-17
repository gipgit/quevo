"use client";

import React from 'react';
import { createWhatsAppLink } from '@/lib/utils/contacts';

interface AIChatFallbackSuggestionsProps {
  data: {
    type: 'fallback_suggestions';
    suggestions: Array<{ text: string; icon: string }>;
    contacts: {
      phones: string[];
      emails: string[];
    };
  };
  themeColors: {
    background: string;
    text: string;
    button: string;
  };
  onSuggestionClick: (suggestion: string) => void;
}

export default function AIChatFallbackSuggestions({ data, themeColors, onSuggestionClick }: AIChatFallbackSuggestionsProps) {
  const handleCopy = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(message);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Impossibile copiare il testo.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Interactive Suggestions */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm opacity-70">Cosa posso fare per te?</h4>
        <div className="flex flex-wrap gap-2">
          {data.suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:shadow-md"
              style={{
                backgroundColor: themeColors.text + '10',
                color: themeColors.text,
                border: `1px solid ${themeColors.text + '20'}`
              }}
              onClick={() => onSuggestionClick(suggestion.text)}
            >
              <span className="text-lg">{suggestion.icon}</span>
              <span>{suggestion.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contact Information */}
      {(data.contacts.phones.length > 0 || data.contacts.emails.length > 0) && (
        <div className="space-y-3">
          <h4 className="font-semibold text-sm opacity-70">📞 Contatti diretti</h4>
          
          {/* Phones */}
          {data.contacts.phones.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs opacity-60">Telefoni</div>
              <div className="flex flex-wrap gap-2">
                {data.contacts.phones.map((phone, index) => (
                  <div key={index} className="flex gap-1">
                    <a
                      href={`tel:${phone}`}
                      className="px-3 py-1 rounded-lg text-xs inline-flex items-center gap-1 transition-colors"
                      style={{ backgroundColor: 'rgb(45, 205, 82)', color: '#fff' }}
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                      </svg>
                      Chiama
                    </a>
                    <a
                      href={createWhatsAppLink(phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-lg text-xs inline-flex items-center gap-1 transition-colors"
                      style={{ backgroundColor: '#25d366', color: '#fff' }}
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      WhatsApp
                    </a>
                    <button
                      className="px-3 py-1 rounded-lg text-xs inline-flex items-center gap-1 transition-colors"
                      style={{ backgroundColor: '#6c757d', color: '#fff' }}
                      onClick={() => handleCopy(phone, 'Telefono copiato!')}
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                      </svg>
                      Copia
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emails */}
          {data.contacts.emails.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs opacity-60">Email</div>
              <div className="flex flex-wrap gap-2">
                {data.contacts.emails.map((email, index) => (
                  <div key={index} className="flex gap-1">
                    <a
                      href={`mailto:${email}`}
                      className="px-3 py-1 rounded-lg text-xs inline-flex items-center gap-1 transition-colors"
                      style={{ backgroundColor: 'rgb(15, 107, 255)', color: '#fff' }}
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                      Invia Email
                    </a>
                    <button
                      className="px-3 py-1 rounded-lg text-xs inline-flex items-center gap-1 transition-colors"
                      style={{ backgroundColor: '#6c757d', color: '#fff' }}
                      onClick={() => handleCopy(email, 'Email copiata!')}
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                      </svg>
                      Copia Email
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

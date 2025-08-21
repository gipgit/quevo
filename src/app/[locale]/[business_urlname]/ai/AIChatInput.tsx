"use client";

import React, { useState, useRef, useEffect } from 'react';

interface AIChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  themeColors: {
    background: string;
    text: string;
    button: string;
  };
}

export default function AIChatInput({ onSendMessage, isLoading, themeColors }: AIChatInputProps) {
  const [message, setMessage] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Validation constants (same as API)
  const MAX_INPUT_LENGTH = 100;
  const MIN_INPUT_LENGTH = 3;
  const MAX_REPEATED_CHARS = 5;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Validate message function
  const validateMessage = (msg: string): { isValid: boolean; error?: string } => {
    // Check length
    if (msg.length > MAX_INPUT_LENGTH) {
      return { isValid: false, error: `Messaggio troppo lungo (max ${MAX_INPUT_LENGTH} caratteri)` };
    }
    
    if (msg.length < MIN_INPUT_LENGTH) {
      return { isValid: false, error: `Messaggio troppo corto (min ${MIN_INPUT_LENGTH} caratteri)` };
    }

    // Check for repeated characters (spam/gibberish detection)
    const repeatedChars = msg.match(/(.)\1{4,}/g);
    if (repeatedChars && repeatedChars.some(seq => seq.length > MAX_REPEATED_CHARS)) {
      return { isValid: false, error: "Troppi caratteri ripetuti" };
    }

    // Check for excessive special characters
    const specialCharRatio = (msg.match(/[^a-zA-Z0-9\s]/g) || []).length / msg.length;
    if (specialCharRatio > 0.5) {
      return { isValid: false, error: "Troppi caratteri speciali" };
    }

    return { isValid: true };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const validation = validateMessage(message.trim());
    if (!validation.isValid) {
      setValidationError(validation.error || 'Messaggio non valido');
      return;
    }

    setValidationError(null);
    onSendMessage(message.trim());
    setMessage('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Clear validation error when message changes
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div 
      className="max-w-[800px] w-full mx-auto border-t px-2 lg:px-4 py-4 relative"
      style={{ borderColor: themeColors.text + '20' }}
    >
      {/* Gradient overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(to top, ${themeColors.background}, transparent)`,
        }}
      />
      
             <div className="relative z-10">
         <form onSubmit={handleSubmit} className="relative">
            {/* Input wrapper that looks like a single textarea */}
            <div 
              className="rounded-2xl shadow-lg transition-all focus-within:ring-2 focus-within:ring-opacity-50"
              style={{
                backgroundColor: themeColors.background,
                border: `1px solid ${themeColors.text + '20'}`,
                boxShadow: `0 4px 20px ${themeColors.text + '15'}`,
              }}
            >
              {/* Textarea without border/styling */}
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={handleMessageChange}
                  onKeyPress={handleKeyPress}
                  placeholder={`Scrivi un messaggio (max ${MAX_INPUT_LENGTH} caratteri)...`}
                  disabled={isLoading}
                  className={`w-full resize-none text-sm leading-relaxed focus:outline-none transition-all bg-transparent py-3 px-4 pr-16 ${validationError ? 'border-red-300' : ''}`}
                  style={{
                    color: themeColors.text,
                    minHeight: '64px',
                    maxHeight: '160px',
                  }}
                  rows={1}
                  maxLength={MAX_INPUT_LENGTH}
                />
                
                {/* Send button inside the wrapper */}
                <button
                  type="submit"
                  disabled={!message.trim() || isLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                  style={{
                    backgroundColor: message.trim() && !isLoading ? themeColors.button : themeColors.text + '30',
                    color: '#FFFFFF',
                    boxShadow: `0 2px 10px ${themeColors.text + '20'}`,
                  }}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Quick action pills below textarea - only when no message */}
              {!message.trim() && (
                <div className="px-4 pb-3 pt-2 border-t" style={{ borderColor: themeColors.text + '10' }}>
                  <div className="flex gap-1 md:gap-1.5 pointer-events-none overflow-x-auto">
                                     <button
                       onClick={() => onSendMessage('Mostrami i servizi')}
                       disabled={isLoading}
                       className="text-xs px-2 md:px-2.5 py-1 md:py-1.5 rounded-full transition-all disabled:opacity-50 pointer-events-auto hover:scale-105 flex-shrink-0"
                       style={{
                         backgroundColor: themeColors.background,
                         color: themeColors.text,
                         border: `1px solid ${themeColors.text + '30'}`,
                       }}
                     >
                       Servizi
                     </button>
                                     <button
                       onClick={() => onSendMessage('Voglio un preventivo')}
                       disabled={isLoading}
                       className="text-xs px-2 md:px-2.5 py-1 md:py-1.5 rounded-full transition-all disabled:opacity-50 pointer-events-auto hover:scale-105 flex-shrink-0"
                       style={{
                         backgroundColor: themeColors.background,
                         color: themeColors.text,
                         border: `1px solid ${themeColors.text + '30'}`,
                       }}
                     >
                       Preventivo
                     </button>
                                     <button
                       onClick={() => onSendMessage('Contatti')}
                       disabled={isLoading}
                       className="text-xs px-2 md:px-2.5 py-1 md:py-1.5 rounded-full transition-all disabled:opacity-50 pointer-events-auto hover:scale-105 flex-shrink-0"
                       style={{
                         backgroundColor: themeColors.background,
                         color: themeColors.text,
                         border: `1px solid ${themeColors.text + '30'}`,
                       }}
                     >
                       Contatti
                     </button>
                                     <button
                       onClick={() => onSendMessage('Controlla disponibilità')}
                       disabled={isLoading}
                       className="text-xs px-2 md:px-2.5 py-1 md:py-1.5 rounded-full transition-all disabled:opacity-50 pointer-events-auto hover:scale-105 flex-shrink-0"
                       style={{
                         backgroundColor: themeColors.background,
                         color: themeColors.text,
                         border: `1px solid ${themeColors.text + '30'}`,
                       }}
                     >
                       Disponibilità
                     </button>
                  </div>
                </div>
                             )}
            </div>
          </form>
          
          {/* Validation error and character counter */}
          <div className="flex justify-between items-center mt-2 px-2">
            <div className="text-xs">
              {validationError ? (
                <span className="text-red-500">⚠️ {validationError}</span>
              ) : (
                <span style={{ color: themeColors.text + '60' }}>
                  {message.length}/{MAX_INPUT_LENGTH} caratteri
                </span>
              )}
            </div>
            {message.length > MAX_INPUT_LENGTH * 0.8 && (
              <div className="text-xs" style={{ color: themeColors.text + '60' }}>
                {MAX_INPUT_LENGTH - message.length} rimanenti
              </div>
            )}
          </div>
        </div>
    </div>
  );
}

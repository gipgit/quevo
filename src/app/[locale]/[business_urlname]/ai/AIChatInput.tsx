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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
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
      className="max-w-[800px] mx-auto border-t p-4 relative"
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
        <form onSubmit={handleSubmit} className="flex items-end relative z-10">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Scrivi un messaggio..."
              disabled={isLoading}
              className={`w-full resize-none rounded-2xl pr-16 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all shadow-lg relative z-10 ${!message.trim() ? 'pt-12 pb-3' : 'py-3'} px-4`}
                             style={{
                 backgroundColor: themeColors.background,
                 color: themeColors.text,
                 border: `1px solid ${themeColors.text + '20'}`,
                 minHeight: '64px',
                 maxHeight: '160px',
                 boxShadow: `0 4px 20px ${themeColors.text + '15'}`,
               }}
              rows={1}
            />
            
            {/* Send button inside textarea */}
            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="absolute right-3 bottom-3 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:scale-105 relative z-10"
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
            
            {/* Quick action pills inside textarea - only when no message */}
            {!message.trim() && (
              <div className="absolute top-3 left-4 flex gap-2 pointer-events-none">
                                 <button
                   onClick={() => onSendMessage('Mostrami i servizi')}
                   disabled={isLoading}
                   className="text-xs px-3 py-1 rounded-full transition-all disabled:opacity-50 pointer-events-auto hover:scale-105"
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
                   className="text-xs px-3 py-1 rounded-full transition-all disabled:opacity-50 pointer-events-auto hover:scale-105"
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
                   className="text-xs px-3 py-1 rounded-full transition-all disabled:opacity-50 pointer-events-auto hover:scale-105"
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
                   className="text-xs px-3 py-1 rounded-full transition-all disabled:opacity-50 pointer-events-auto hover:scale-105"
                   style={{
                     backgroundColor: themeColors.background,
                     color: themeColors.text,
                     border: `1px solid ${themeColors.text + '30'}`,
                   }}
                 >
                   Disponibilità
                 </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

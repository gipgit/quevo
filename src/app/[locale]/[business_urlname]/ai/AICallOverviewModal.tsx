"use client";

import React from 'react';

interface AICallOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    prompt?: {
      systemPrompt: string;
      userMessage: string;
      business: string;
      servicesCount: number;
    };
    response?: {
      content: string;
      inputTokens: number;
      outputTokens: number;
      cost: number;
      inputCost: number;
      outputCost: number;
    };
    error?: string;
  };
  themeColors: {
    background: string;
    text: string;
    button: string;
  };
}

export default function AICallOverviewModal({ isOpen, onClose, data, themeColors }: AICallOverviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-xl shadow-2xl"
        style={{
          backgroundColor: themeColors.background,
          border: `1px solid ${themeColors.text + '20'}`,
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: themeColors.text + '20' }}
        >
          <h2 
            className="text-lg font-semibold"
            style={{ color: themeColors.text }}
          >
            🤖 AI Call Overview
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-opacity-10 transition-all"
            style={{ 
              color: themeColors.text,
              backgroundColor: themeColors.text + '10'
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(85vh-100px)]">
          <div className="space-y-4">
            
            {/* Error Section */}
            {data.error && (
              <div className="p-3 rounded-lg border-2 border-red-300 bg-red-50">
                <h3 className="text-base font-semibold text-red-800 mb-1">❌ Error</h3>
                <p className="text-sm text-red-700">{data.error}</p>
              </div>
            )}

            {/* Prompt Section */}
            {data.prompt && (
              <div className="space-y-3">
                <h3 
                  className="text-base font-semibold"
                  style={{ color: themeColors.text }}
                >
                  📤 Prompt Sent to OpenAI
                </h3>
                
                <div className="space-y-2">
                  <div>
                    <h4 className="font-medium mb-1 text-sm" style={{ color: themeColors.text + '80' }}>
                      Business Context
                    </h4>
                    <div className="flex gap-4 text-xs">
                      <span style={{ color: themeColors.text + '60' }}>
                        Business: <span style={{ color: themeColors.text }}>{data.prompt.business}</span>
                      </span>
                      <span style={{ color: themeColors.text + '60' }}>
                        Services: <span style={{ color: themeColors.text }}>{data.prompt.servicesCount}</span>
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-1 text-sm" style={{ color: themeColors.text + '80' }}>
                      System Prompt
                    </h4>
                    <pre 
                      className="p-2 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap max-h-32"
                      style={{
                        backgroundColor: themeColors.text + '05',
                        color: themeColors.text,
                        border: `1px solid ${themeColors.text + '15'}`,
                      }}
                    >
                      {data.prompt.systemPrompt}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-medium mb-1 text-sm" style={{ color: themeColors.text + '80' }}>
                      User Message
                    </h4>
                    <pre 
                      className="p-2 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap max-h-20"
                      style={{
                        backgroundColor: themeColors.text + '05',
                        color: themeColors.text,
                        border: `1px solid ${themeColors.text + '15'}`,
                      }}
                    >
                      {data.prompt.userMessage}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Response Section */}
            {data.response && (
              <div className="space-y-3">
                <h3 
                  className="text-base font-semibold"
                  style={{ color: themeColors.text }}
                >
                  📥 Response from OpenAI
                </h3>
                
                <div className="space-y-2">
                  <div>
                    <h4 className="font-medium mb-1 text-sm" style={{ color: themeColors.text + '80' }}>
                      Generated Content
                    </h4>
                    <pre 
                      className="p-2 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap max-h-32"
                      style={{
                        backgroundColor: themeColors.text + '05',
                        color: themeColors.text,
                        border: `1px solid ${themeColors.text + '15'}`,
                      }}
                    >
                      {data.response.content}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-medium mb-1 text-sm" style={{ color: themeColors.text + '80' }}>
                      Token Usage & Cost
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="p-2 rounded-lg text-center" style={{ backgroundColor: themeColors.text + '05' }}>
                        <div className="text-lg font-bold" style={{ color: themeColors.text }}>
                          {data.response.inputTokens}
                        </div>
                        <div className="text-xs" style={{ color: themeColors.text + '60' }}>
                          Input Tokens
                        </div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ backgroundColor: themeColors.text + '05' }}>
                        <div className="text-lg font-bold" style={{ color: themeColors.text }}>
                          {data.response.outputTokens}
                        </div>
                        <div className="text-xs" style={{ color: themeColors.text + '60' }}>
                          Output Tokens
                        </div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ backgroundColor: themeColors.text + '05' }}>
                        <div className="text-lg font-bold" style={{ color: themeColors.text }}>
                          ${data.response.cost.toFixed(6)}
                        </div>
                        <div className="text-xs" style={{ color: themeColors.text + '60' }}>
                          Total Cost
                        </div>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ backgroundColor: themeColors.text + '05' }}>
                        <div className="text-lg font-bold" style={{ color: themeColors.text }}>
                          ${data.response.inputCost.toFixed(6)}
                        </div>
                        <div className="text-xs" style={{ color: themeColors.text + '60' }}>
                          Input Cost
                        </div>
                      </div>
                    </div>
                    <div className="mt-1 text-xs" style={{ color: themeColors.text + '60' }}>
                      Output Cost: ${data.response.outputCost.toFixed(6)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div 
          className="flex justify-end p-4 border-t"
          style={{ borderColor: themeColors.text + '20' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium transition-all text-sm"
            style={{
              backgroundColor: themeColors.button,
              color: '#FFFFFF',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

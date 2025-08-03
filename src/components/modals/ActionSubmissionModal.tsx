"use client";

import React from 'react';
import { useTranslations } from 'next-intl';

interface ActionSubmissionModalProps {
  show: boolean;
  onClose: () => void;
  isSuccess: boolean;
  message: string;
  technicalDetails?: string;
  boardUrl?: string;
  onCopyLink?: () => void;
  isCopied?: boolean;
  onShare?: () => void;
}

export default function ActionSubmissionModal({
  show,
  onClose,
  isSuccess,
  message,
  technicalDetails,
  boardUrl,
  onCopyLink,
  isCopied,
  onShare
}: ActionSubmissionModalProps) {
  const t = useTranslations("ServiceBoard");

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1"></div>
            <div className="flex-1 flex justify-end">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            {isSuccess ? (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>

          {/* Message */}
          <div className="text-center mb-6">
            <h2 className="text-xl  text-gray-900 text-center flex-1 mb-2">
              {isSuccess ? t('actionSubmitted') : t('actionSubmissionError')}
            </h2>
            <p className={`text-sm lg:text-base ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
              {message}
            </p>
          </div>

          {/* Technical Details (for errors) */}
          {!isSuccess && technicalDetails && (
            <div className="mb-6">
              <details className="bg-gray-50 rounded-lg p-4">
                <summary className="text-sm font-medium text-gray-700 cursor-pointer mb-2">
                  {t('technicalDetails')}
                </summary>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                  {technicalDetails}
                </pre>
              </details>
            </div>
          )}

          {/* Share Pill Link (for success) */}
          {isSuccess && boardUrl && (
            <div className="mb-6">
              <h3 className="text-xs text-gray-500 mb-2 text-center">
                {t('shareBoardLink')}
              </h3>
              <div className="flex items-center justify-between gap-2 px-4 py-2 rounded-full border-2 bg-gray-100 border-gray-300">
                <div className='flex items-center gap-2'>
                  {/* Globe Icon */}
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  {/* URL Text */}
                  <span className="text-xs text-gray-600 font-medium truncate max-w-[250px]">
                    {boardUrl.replace(/^https?:\/\//, '')}
                  </span>
                </div>
                <div className="flex gap-1">
                  {/* Copy Button */}
                  <button
                    onClick={onCopyLink}
                    className={`p-1 rounded-full transition-all duration-200 ${
                      isCopied 
                        ? 'bg-green-600 text-white' 
                        : 'hover:bg-gray-300 text-gray-500'
                    }`}
                    title={isCopied ? t('copied') : t('copyLink')}
                  >
                    {isCopied ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                  
                  {/* Share Button */}
                  <button
                    onClick={onShare}
                    className="p-1 rounded-full hover:bg-gray-300 text-gray-500 transition-all duration-200"
                    title={t('share')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isSuccess 
                  ? 'bg-gray-700 text-white hover:bg-gray-700' 
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {t('close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
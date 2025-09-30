"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface DashboardSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
}

export default function DashboardSupportModal({
  isOpen,
  onClose,
  businessId
}: DashboardSupportModalProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const t = useTranslations('dashboard');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    if (message.length > 1000) {
      setError('Message must be 1000 characters or less');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/dashboard/support-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: businessId,
          message: message.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to submit request' }));
        throw new Error(errorData.error || 'Failed to submit support request');
      }
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setMessage('');
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit support request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setMessage('');
      setError(null);
      setSuccess(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl shadow-xl bg-white dark:bg-zinc-800">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            disabled={isSubmitting}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('support.title') || 'Support Request'}
            </h2>
            <div className="mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 dark:bg-zinc-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-600">
                {t('support.expectedReplyTime') || 'Expected reply: ~2h'}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
                {t('support.success.title') || 'Request Submitted'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('support.success.message') || "Thank you! We'll get back to you soon."}
              </p>
            </div>
                     ) : (
             <>
               {/* Message Textarea */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  {t('support.message') || 'Message'} *
                </label>
                                 <textarea
                   value={message}
                   onChange={(e) => setMessage(e.target.value)}
                   rows={4}
                   maxLength={1000}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                  placeholder={t('support.messagePlaceholder') || "Describe your issue or question..."}
                  disabled={isSubmitting}
                                 />
                 <div className="flex justify-between items-center mt-1">
                   <span className="text-xs text-gray-500 dark:text-gray-400">
                     {message.length}/1000 {t('support.characters') || 'characters'}
                   </span>
                   {error && (
                     <span className="text-xs text-red-500">{error}</span>
                   )}
                 </div>
               </div>
              {/* Helpful links under textarea */}
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Guides</a>
                <span className="mx-2 text-gray-400">·</span>
                <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Faqs</a>
                <span className="mx-2 text-gray-400">·</span>
                <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Updates</a>
              </div>
             </>
           )}
        </form>

        {/* Footer */}
        {!success && (
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-zinc-700"
              disabled={isSubmitting}
            >
              {t('support.cancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('support.submitting') || 'Submitting...'}
                </div>
              ) : (
                t('support.submit') || 'Submit Request'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

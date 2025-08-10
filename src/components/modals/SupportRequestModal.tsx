"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

interface SupportRequestModalProps {
  show: boolean;
  onClose: () => void;
  actions: Array<{ action_id: string; action_title: string; action_type: string }>;
  businessId: string;
  boardRef: string;
  customerId?: string;
  themeColorText?: string;
  themeColorBackground?: string;
  themeColorButton?: string;
  themeColorBackgroundCard?: string;
}

export default function SupportRequestModal({
  show,
  onClose,
  actions,
  businessId,
  boardRef,
  customerId,
  themeColorText = '#000000',
  themeColorBackground = '#ffffff',
  themeColorButton = '#000000',
  themeColorBackgroundCard = '#ffffff'
}: SupportRequestModalProps) {
  const [message, setMessage] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const t = useTranslations('Common');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    if (message.length > 500) {
      setError('Message must be 500 characters or less');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/support-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: businessId,
          board_ref: boardRef,
          customer_id: customerId || null,
          message: message.trim(),
          related_action_id: selectedAction || null,
          email: email.trim() || null,
          category: category
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
        setSelectedAction('');
        setEmail('');
        setCategory('general');
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
      setSelectedAction('');
      setEmail('');
      setError(null);
      setSuccess(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-md rounded-2xl shadow-xl"
        style={{ backgroundColor: themeColorBackground }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: `${themeColorText}20` }}>
          <h2 className="text-xl font-semibold" style={{ color: themeColorText }}>
            Support Request
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2" style={{ color: themeColorText }}>
                Request Submitted
              </h3>
              <p className="text-gray-600">
                Thank you! We'll get back to you soon.
              </p>
            </div>
          ) : (
            <>
              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: themeColorText }}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ 
                    borderColor: `${themeColorText}30`,
                    backgroundColor: themeColorBackgroundCard,
                    color: themeColorText
                  }}
                  disabled={isSubmitting}
                >
                  <option value="general">General</option>
                  <option value="technical">Technical Issue</option>
                  <option value="account">Account Issue</option>
                </select>
              </div>

              {/* Message Textarea */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: themeColorText }}>
                  Message *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ 
                    borderColor: `${themeColorText}30`,
                    backgroundColor: themeColorBackgroundCard,
                    color: themeColorText
                  }}
                  placeholder="Describe your issue or question..."
                  disabled={isSubmitting}
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500">
                    {message.length}/500 characters
                  </span>
                  {error && (
                    <span className="text-xs text-red-500">{error}</span>
                  )}
                </div>
              </div>

              {/* Related Action Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: themeColorText }}>
                  Related to Action (Optional)
                </label>
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ 
                    borderColor: `${themeColorText}30`,
                    backgroundColor: themeColorBackgroundCard,
                    color: themeColorText
                  }}
                  disabled={isSubmitting}
                >
                  <option value="">Select an action (optional)</option>
                  {actions.map((action) => (
                    <option key={action.action_id} value={action.action_id}>
                      {action.action_title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: themeColorText }}>
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ 
                    borderColor: `${themeColorText}30`,
                    backgroundColor: themeColorBackgroundCard,
                    color: themeColorText
                  }}
                  placeholder="your@email.com"
                  disabled={isSubmitting}
                />
              </div>
            </>
          )}
        </form>

        {/* Footer */}
        {!success && (
          <div className="flex justify-end gap-3 p-6 border-t" style={{ borderColor: `${themeColorText}20` }}>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{ 
                color: themeColorText,
                border: `1px solid ${themeColorText}30`
              }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
              style={{ backgroundColor: themeColorButton }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </div>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

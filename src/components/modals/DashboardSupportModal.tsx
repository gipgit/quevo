"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { 
  X as XMarkIcon,
  Bug,
  Lightbulb,
  HelpCircle,
  User,
  CreditCard,
  MessageSquare,
  AlertCircle
} from 'lucide-react'

interface DashboardSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
}

type IssueCategory = 'bug' | 'feature' | 'question' | 'account' | 'billing' | 'other'
type Section = 'dashboard' | 'services' | 'service-requests' | 'service-boards' | 'appointments' | 'clients' | 'profile' | 'marketing' | 'ai-features' | 'billing' | 'other'

export default function DashboardSupportModal({
  isOpen,
  onClose,
  businessId
}: DashboardSupportModalProps) {
  const [category, setCategory] = useState<IssueCategory | ''>('');
  const [section, setSection] = useState<Section | ''>('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const t = useTranslations('dashboard');

  const issueCategories = [
    { id: 'bug' as IssueCategory, label: 'Bug', icon: Bug, color: 'red' },
    { id: 'feature' as IssueCategory, label: 'Feature', icon: Lightbulb, color: 'blue' },
    { id: 'question' as IssueCategory, label: 'Question', icon: HelpCircle, color: 'purple' },
    { id: 'account' as IssueCategory, label: 'Account', icon: User, color: 'orange' },
    { id: 'billing' as IssueCategory, label: 'Billing', icon: CreditCard, color: 'green' },
    { id: 'other' as IssueCategory, label: 'Other', icon: MessageSquare, color: 'gray' },
  ]

  const sections = [
    { id: 'dashboard' as Section, label: 'Dashboard' },
    { id: 'services' as Section, label: 'Services' },
    { id: 'service-requests' as Section, label: 'Requests' },
    { id: 'service-boards' as Section, label: 'Boards' },
    { id: 'appointments' as Section, label: 'Appointments' },
    { id: 'clients' as Section, label: 'Clients' },
    { id: 'profile' as Section, label: 'Profile' },
    { id: 'marketing' as Section, label: 'Marketing' },
    { id: 'ai-features' as Section, label: 'AI Features' },
    { id: 'billing' as Section, label: 'Billing' },
    { id: 'other' as Section, label: 'Other' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!category) {
      setError('Please select an issue type');
      return;
    }
    
    if (!section) {
      setError('Please select a section');
      return;
    }
    
    if (!subject.trim()) {
      setError('Please enter a subject');
      return;
    }
    
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    if (message.length > 5000) {
      setError('Message must be 5000 characters or less');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create FormData to match the support API
      const formData = new FormData();
      formData.append('category', category);
      formData.append('section', section);
      formData.append('priority', 'medium');
      formData.append('subject', subject.trim());
      formData.append('description', message.trim());

      const response = await fetch('/api/support', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to submit request' }));
        throw new Error(errorData.message || 'Failed to submit support request');
      }
      
      setSuccess(true);
      setTimeout(() => {
        handleClose();
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
      setCategory('');
      setSection('');
      setSubject('');
      setMessage('');
      setError(null);
      setSuccess(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 lg:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl shadow-xl bg-[var(--dashboard-bg-card)] text-[var(--dashboard-text-primary)]">
        {/* Header */}
        <div className="relative p-6 border-b border-[var(--dashboard-border-primary)]">
          <button
            onClick={handleClose}
            className="absolute right-6 top-6 text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] transition-colors"
            disabled={isSubmitting}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
          <div className="text-center">
            <h2 className="text-lg font-medium text-[var(--dashboard-text-primary)]">
              {t('support.title') || 'Support Request'}
            </h2>
            <div className="mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)] border border-[var(--dashboard-border-primary)]">
                {t('support.expectedReplyTime') || 'Expected reply: ~2h'}
              </span>
            </div>
            {/* Helpful links in header */}
            <div className="mt-3 text-xs text-[var(--dashboard-text-secondary)]">
              <a href="/guide" target="_blank" className="text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:underline">Guide</a>
              <span className="mx-2 text-gray-400">·</span>
              <a href="/status" target="_blank" className="text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:underline">Status</a>
              <span className="mx-2 text-gray-400">·</span>
              <a href="/support" target="_blank" className="text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:underline">Full Form</a>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2 text-[var(--dashboard-text-primary)]">
                {t('support.success.title') || 'Request Submitted'}
              </h3>
              <p className="text-[var(--dashboard-text-secondary)]">
                {t('support.success.message') || "Thank you! We'll get back to you soon."}
              </p>
            </div>
          ) : (
            <>
              {/* Issue Type - Compact Cards */}
              <div>
                <label className="block text-xs font-medium mb-2 text-[var(--dashboard-text-secondary)]">
                  Issue Type *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {issueCategories.map((cat) => {
                    const Icon = cat.icon
                    const isSelected = category === cat.id
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`p-2 border rounded-lg text-xs transition-all flex flex-col items-center gap-1 ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-[var(--dashboard-border-primary)] hover:border-[var(--dashboard-border-secondary)] bg-[var(--dashboard-bg-tertiary)]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-medium">{cat.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Section Dropdown */}
              <div>
                <label className="block text-xs font-medium mb-2 text-[var(--dashboard-text-secondary)]">
                  Section *
                </label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value as Section)}
                  className="w-full px-3 py-2 border border-[var(--dashboard-border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--dashboard-ring-primary)] bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-primary)] text-sm"
                  disabled={isSubmitting}
                >
                  <option value="">Select a section...</option>
                  {sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Input */}
              <div>
                <label className="block text-xs font-medium mb-2 text-[var(--dashboard-text-secondary)]">
                  Subject *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={255}
                  className="w-full px-3 py-2 border border-[var(--dashboard-border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--dashboard-ring-primary)] bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-primary)] text-sm"
                  placeholder="Brief summary..."
                  disabled={isSubmitting}
                />
              </div>

              {/* Message Textarea */}
              <div>
                <label className="block text-xs font-medium mb-2 text-[var(--dashboard-text-secondary)]">
                  Description *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  maxLength={5000}
                  className="w-full px-3 py-2 border border-[var(--dashboard-border-primary)] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--dashboard-ring-primary)] bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-primary)] text-sm"
                  placeholder="Describe your issue in detail..."
                  disabled={isSubmitting}
                />
                <div className="mt-1 flex justify-between items-center">
                  <span className="text-xs text-[var(--dashboard-text-secondary)]">
                    {message.length}/5000
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
                </div>
              )}
            </>
          )}
        </form>

        {/* Footer */}
        {!success && (
          <div className="p-6 border-t border-[var(--dashboard-border-primary)]">
            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--dashboard-button-primary-bg)',
                color: 'var(--dashboard-button-primary-text)',
                border: '1px solid var(--dashboard-button-primary-border)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--dashboard-button-primary-bg-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--dashboard-button-primary-bg)';
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
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

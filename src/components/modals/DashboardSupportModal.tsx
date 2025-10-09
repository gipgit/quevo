"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getPlanColors, capitalizePlanName } from '@/lib/plan-colors';
import { 
  X as XMarkIcon,
  ShieldAlert,
  HelpCircle,
  User,
  CreditCard,
  MessageSquare,
  AlertCircle,
  BookOpen,
  FileText,
  BarChart3,
  Calendar,
  Users,
  Settings,
  Zap,
  Activity
} from 'lucide-react'

interface DashboardSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
}

type IssueCategory = 'bug' | 'question' | 'account' | 'billing' | 'other'
type Section = 'dashboard' | 'services' | 'service-requests' | 'service-boards' | 'appointments' | 'clients' | 'profile' | 'marketing' | 'ai-features' | 'billing' | 'other'

export default function DashboardSupportModal({
  isOpen,
  onClose,
  businessId
}: DashboardSupportModalProps) {
  const [category, setCategory] = useState<IssueCategory | ''>('');
  const [section, setSection] = useState<Section | ''>('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [planName, setPlanName] = useState<string | null>(null);

  const t = useTranslations('dashboard');

  // Fetch user's business plan
  useEffect(() => {
    const fetchBusinessPlan = async () => {
      try {
        const response = await fetch('/api/user/business-plan')
        if (response.ok) {
          const data = await response.json()
          if (data.planName) {
            setPlanName(data.planName)
          }
        }
      } catch (error) {
        console.error('Error fetching business plan:', error)
      }
    }

    if (isOpen) {
      fetchBusinessPlan()
    }
  }, [isOpen])

  const getIconColor = (color: string) => {
    const colors = {
      red: 'text-red-500',
      blue: 'text-blue-500',
      purple: 'text-purple-500',
      orange: 'text-orange-500',
      green: 'text-green-500',
      gray: 'text-gray-500',
    }
    return colors[color as keyof typeof colors] || colors.gray
  }

  const issueCategories = [
    { id: 'bug' as IssueCategory, label: 'Bug Report', icon: ShieldAlert, description: 'Something is not working correctly', color: 'red' },
    { id: 'question' as IssueCategory, label: 'Question', icon: HelpCircle, description: 'I have a question about how to use something', color: 'purple' },
    { id: 'account' as IssueCategory, label: 'Account Issue', icon: User, description: 'Problem with my account or login', color: 'orange' },
    { id: 'billing' as IssueCategory, label: 'Billing', icon: CreditCard, description: 'Questions about payments or subscriptions', color: 'green' },
    { id: 'other' as IssueCategory, label: 'Other', icon: MessageSquare, description: 'Something else', color: 'gray' },
  ]

  const sections = [
    { id: 'dashboard' as Section, label: 'Dashboard', icon: BarChart3 },
    { id: 'services' as Section, label: 'Services', icon: BookOpen },
    { id: 'service-requests' as Section, label: 'Service Requests', icon: FileText },
    { id: 'service-boards' as Section, label: 'Service Boards', icon: BarChart3 },
    { id: 'appointments' as Section, label: 'Appointments', icon: Calendar },
    { id: 'clients' as Section, label: 'Clients', icon: Users },
    { id: 'profile' as Section, label: 'Profile', icon: User },
    { id: 'marketing' as Section, label: 'Marketing', icon: MessageSquare },
    { id: 'ai-features' as Section, label: 'AI Features', icon: Zap },
    { id: 'billing' as Section, label: 'Billing & Plans', icon: CreditCard },
    { id: 'other' as Section, label: 'Other', icon: Settings },
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
      // Create FormData to match the dashboard support-requests API
      const formData = new FormData();
      formData.append('business_id', businessId);
      formData.append('category', category);
      formData.append('section', section);
      formData.append('message', message.trim());

      const response = await fetch('/api/app-support-requests', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to submit request' }));
        throw new Error(errorData.error || 'Failed to submit support request');
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
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl bg-[var(--dashboard-bg-card)] text-[var(--dashboard-text-primary)]">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--dashboard-bg-card)] border-b border-[var(--dashboard-border-primary)]">
          <div className="relative p-4 md:p-6 pr-12 md:pr-16">
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 md:right-6 md:top-6 text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] transition-colors"
              disabled={isSubmitting}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <div className="flex items-center justify-between gap-4">
              {/* Left: Title */}
              <h2 className="text-lg md:text-2xl font-medium text-[var(--dashboard-text-primary)]">
                How can we help?
              </h2>
              {/* Right: Helpful links */}
              <div className="text-xs text-[var(--dashboard-text-secondary)] hidden md:flex items-center gap-3">
                <a href="/guide" target="_blank" className="flex items-center gap-1 text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:underline whitespace-nowrap">
                  <BookOpen className="w-3.5 h-3.5" />
                  Guide
                </a>
                <a href="/status" target="_blank" className="flex items-center gap-1 text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:underline whitespace-nowrap">
                  <Activity className="w-3.5 h-3.5" />
                  Status
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
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
                <label className="block text-sm font-medium mb-3 text-[var(--dashboard-text-primary)]">
                  What type of issue are you experiencing? *
                </label>
                <div className="flex flex-wrap lg:flex-nowrap gap-3">
                  {issueCategories.map((cat) => {
                    const Icon = cat.icon
                    const isSelected = category === cat.id
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`flex-1 min-w-[calc(50%-0.375rem)] sm:min-w-[calc(33.333%-0.5rem)] lg:min-w-0 p-4 border-2 rounded-lg text-left transition-all flex flex-col justify-between ${
                          isSelected 
                            ? 'border-gray-900 bg-gray-100 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div>
                          <Icon className={`w-5 h-5 mb-2 ${getIconColor(cat.color)}`} />
                          <div className="font-medium text-sm">{cat.label}</div>
                        </div>
                        <div className="text-xs font-normal text-gray-500">{cat.description}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Section */}
              <div>
                <label className="block text-sm font-medium mb-3 text-[var(--dashboard-text-primary)]">
                  Which section of the app is this related to? *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {sections.map((sec) => {
                    const Icon = sec.icon
                    const isSelected = section === sec.id
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => setSection(sec.id)}
                        className={`p-3 border-2 rounded-lg text-left transition-all flex items-center gap-2 ${
                          isSelected 
                            ? 'border-gray-900 bg-gray-100 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        disabled={isSubmitting}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-xs md:text-sm">{sec.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Message Textarea */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2 text-[var(--dashboard-text-primary)]">
                  Message *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  maxLength={5000}
                  className="w-full px-3 py-2 border border-[var(--dashboard-border-primary)] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--dashboard-ring-primary)] bg-white text-[var(--dashboard-text-primary)] text-sm"
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
          <div className="p-4 md:p-6 border-t border-[var(--dashboard-border-primary)]">
            <div className="flex items-center justify-between">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-3">
                {/* Plan Badge */}
                {planName && (
                  <div 
                    className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 py-0.5 md:px-3 md:py-1 rounded-lg text-xs md:text-sm font-semibold"
                    style={getPlanColors(planName).style}
                  >
                    {getPlanColors(planName).showStar && (
                      <span className="text-yellow-300 text-xs md:text-sm">★</span>
                    )}
                    <span>{capitalizePlanName(planName)} Plan</span>
                  </div>
                )}
                {/* Expected Reply Time */}
                <span className="text-xs text-[var(--dashboard-text-secondary)]">
                  {t('support.expectedReplyTime') || 'Expected reply: ~2h'}
                </span>
              </div>
              
              <button
                type="submit"
                onClick={handleSubmit}
                className="px-6 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>
        )}
      </div>
    </div>
  );
}

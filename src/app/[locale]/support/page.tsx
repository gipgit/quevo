'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  BookOpen, 
  Activity, 
  Send, 
  AlertCircle, 
  Lightbulb, 
  Bug, 
  HelpCircle,
  Settings,
  Users,
  Calendar,
  FileText,
  BarChart3,
  User,
  MessageSquare,
  CreditCard,
  Zap,
  Upload,
  X,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

type IssueCategory = 'bug' | 'feature' | 'question' | 'account' | 'billing' | 'other'
type Priority = 'low' | 'medium' | 'high' | 'urgent'
type Section = 'dashboard' | 'services' | 'service-requests' | 'service-boards' | 'appointments' | 'clients' | 'profile' | 'marketing' | 'ai-features' | 'billing' | 'other'

export default function SupportPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    category: '' as IssueCategory | '',
    section: '' as Section | '',
    priority: 'medium' as Priority,
    subject: '',
    description: '',
    email: '',
    screenshot: null as File | null
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const issueCategories = [
    { id: 'bug' as IssueCategory, label: 'Bug Report', icon: Bug, description: 'Something is not working correctly', color: 'red' },
    { id: 'feature' as IssueCategory, label: 'Feature Request', icon: Lightbulb, description: 'Suggest a new feature or improvement', color: 'blue' },
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

  const priorities = [
    { id: 'low' as Priority, label: 'Low', description: 'Minor issue, can wait', color: 'bg-gray-100 text-gray-700 border-gray-300' },
    { id: 'medium' as Priority, label: 'Medium', description: 'Normal priority', color: 'bg-blue-50 text-blue-700 border-blue-300' },
    { id: 'high' as Priority, label: 'High', description: 'Important issue', color: 'bg-orange-50 text-orange-700 border-orange-300' },
    { id: 'urgent' as Priority, label: 'Urgent', description: 'Critical, needs immediate attention', color: 'bg-red-50 text-red-700 border-red-300' },
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, screenshot: 'File size must be less than 5MB' })
        return
      }
      // Check file type
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, screenshot: 'Only image files are allowed' })
        return
      }
      setFormData({ ...formData, screenshot: file })
      setErrors({ ...errors, screenshot: '' })
    }
  }

  const removeScreenshot = () => {
    setFormData({ ...formData, screenshot: null })
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.category) {
      newErrors.category = 'Please select an issue category'
    }
    if (!formData.section) {
      newErrors.section = 'Please select the section where you found the issue'
    }
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (!session && !formData.email.trim()) {
      newErrors.email = 'Email is required when not logged in'
    }
    if (!session && formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    if (!session) {
      setSubmitError('You must be logged in to submit a support request')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      // Create FormData for file upload
      const submitData = new FormData()
      submitData.append('category', formData.category)
      submitData.append('section', formData.section)
      submitData.append('priority', formData.priority)
      submitData.append('subject', formData.subject)
      submitData.append('description', formData.description)
      if (formData.screenshot) {
        submitData.append('screenshot', formData.screenshot)
      }

      const response = await fetch('/api/support', {
        method: 'POST',
        body: submitData,
      })

      if (response.ok) {
        setSubmitSuccess(true)
        // Reset form
        setFormData({
          category: '',
          section: '',
          priority: 'medium',
          subject: '',
          description: '',
          email: '',
          screenshot: null
        })
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      } else {
        const data = await response.json()
        setSubmitError(data.message || 'Failed to submit support request. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting support request:', error)
      setSubmitError('An error occurred. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCategoryColor = (color: string) => {
    const colors = {
      red: 'border-red-200 hover:border-red-300 hover:bg-red-50',
      blue: 'border-blue-200 hover:border-blue-300 hover:bg-blue-50',
      purple: 'border-purple-200 hover:border-purple-300 hover:bg-purple-50',
      orange: 'border-orange-200 hover:border-orange-300 hover:bg-orange-50',
      green: 'border-green-200 hover:border-green-300 hover:bg-green-50',
      gray: 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
    }
    return colors[color as keyof typeof colors] || colors.gray
  }

  const getSelectedCategoryColor = (color: string) => {
    const colors = {
      red: 'border-red-500 bg-red-50',
      blue: 'border-blue-500 bg-blue-50',
      purple: 'border-purple-500 bg-purple-50',
      orange: 'border-orange-500 bg-orange-50',
      green: 'border-green-500 bg-green-50',
      gray: 'border-gray-500 bg-gray-50',
    }
    return colors[color as keyof typeof colors] || colors.gray
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for contacting us. We've received your support request and will get back to you as soon as possible.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
              <p className="text-gray-600 mt-1">We're here to help you</p>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Status Card */}
          <Link
            href="/status"
            className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-lg transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">System Status</h3>
                <p className="text-gray-600 text-sm">
                  Check if all systems are operational and view any ongoing incidents
                </p>
              </div>
            </div>
          </Link>

          {/* Guide Card */}
          <Link
            href="/guide"
            className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-lg transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Documentation</h3>
                <p className="text-gray-600 text-sm">
                  Browse our comprehensive guide to learn how to use all features
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Support Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit a Support Request</h2>
            <p className="text-gray-600">
              Fill out the form below with as much detail as possible to help us resolve your issue quickly.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Issue Category */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                What type of issue are you experiencing? *
              </label>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {issueCategories.map((category) => {
                  const Icon = category.icon
                  const isSelected = formData.category === category.id
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: category.id })}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        isSelected 
                          ? getSelectedCategoryColor(category.color)
                          : `border-gray-200 ${getCategoryColor(category.color)}`
                      }`}
                    >
                      <Icon className="w-5 h-5 mb-2" />
                      <div className="font-medium text-sm mb-1">{category.label}</div>
                      <div className="text-xs text-gray-600">{category.description}</div>
                    </button>
                  )
                })}
              </div>
              {errors.category && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.category}
                </p>
              )}
            </div>

            {/* Section */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Which section of the app is this related to? *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {sections.map((section) => {
                  const Icon = section.icon
                  const isSelected = formData.section === section.id
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, section: section.id })}
                      className={`p-3 border-2 rounded-lg text-left transition-all flex items-center gap-2 ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium">{section.label}</span>
                    </button>
                  )
                })}
              </div>
              {errors.section && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.section}
                </p>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Priority Level
              </label>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {priorities.map((priority) => {
                  const isSelected = formData.priority === priority.id
                  return (
                    <button
                      key={priority.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: priority.id })}
                      className={`p-3 border-2 rounded-lg text-left transition-all ${
                        isSelected 
                          ? priority.color
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-sm mb-1">{priority.label}</div>
                      <div className="text-xs opacity-75">{priority.description}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-900 mb-2">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.subject ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Brief summary of your issue"
              />
              {errors.subject && (
                <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Please provide as much detail as possible about your issue. Include steps to reproduce if applicable."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Email (for non-logged in users) */}
            {!session && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                  Your Email *
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            )}

            {/* Screenshot Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Screenshot (optional)
              </label>
              <div className="text-sm text-gray-600 mb-3">
                Upload a screenshot to help us understand your issue better
              </div>
              
              {!formData.screenshot ? (
                <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </span>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{formData.screenshot.name}</p>
                    <p className="text-xs text-gray-600">
                      {(formData.screenshot.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeScreenshot}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
              {errors.screenshot && (
                <p className="mt-1 text-sm text-red-600">{errors.screenshot}</p>
              )}
            </div>

            {/* Auth Warning */}
            {!session && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> You must be logged in to submit a support request.{' '}
                    <Link href="/signin/business" className="underline font-medium">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </div>
            )}

            {/* Submit Error */}
            {submitError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{submitError}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                * Required fields
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !session}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

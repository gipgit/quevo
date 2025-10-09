'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getPlanColors, capitalizePlanName } from '@/lib/plan-colors'
import { 
  BookOpen, 
  Activity, 
  Send, 
  AlertCircle, 
  ShieldAlert, 
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
  AlertTriangle,
  ArrowLeft,
  LogIn
} from 'lucide-react'

type IssueCategory = 'bug' | 'question' | 'account' | 'billing' | 'other'
type Section = 'dashboard' | 'services' | 'service-requests' | 'service-boards' | 'appointments' | 'clients' | 'profile' | 'marketing' | 'ai-features' | 'billing' | 'other'

export default function SupportPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    category: '' as IssueCategory | '',
    section: '' as Section | '',
    message: '',
    email: '',
    screenshot: null as File | null
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [planName, setPlanName] = useState<string | null>(null)

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setErrors({})
    setSubmitError('')
  }

  // Fetch user's business plan
  useEffect(() => {
    const fetchBusinessPlan = async () => {
      if (!session?.user?.email) return

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

    fetchBusinessPlan()
  }, [session])

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
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
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
      submitData.append('message', formData.message)
      if (formData.screenshot) {
        submitData.append('screenshot', formData.screenshot)
      }

      const response = await fetch('/api/app-support-requests', {
        method: 'POST',
        body: submitData,
      })

      if (response.ok) {
        setSubmitSuccess(true)
        // Reset form
        setFormData({
          category: '',
          section: '',
          message: '',
          email: '',
          screenshot: null
        })
        
        // Close modal and redirect after 2 seconds
        setTimeout(() => {
          handleCloseModal()
          setSubmitSuccess(false)
          router.push('/dashboard')
        }, 2000)
      } else {
        const data = await response.json()
        setSubmitError(data.error || data.message || 'Failed to submit support request. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting support request:', error)
      setSubmitError('An error occurred. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

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

    return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'rgb(249, 250, 251)' }}>
      {/* Page Background Gradient Layers */}
      <div 
        className="absolute z-0"
        style={{
          background: 'linear-gradient(160deg, rgb(224, 242, 254) 0%, rgb(224, 231, 255) 100%)',
          filter: 'blur(100px)',
          borderRadius: '100%',
          opacity: 0.4,
          height: '600px',
          left: '-200px',
          top: '300px',
          width: '700px'
        }}
      ></div>
      
      <div 
        className="absolute z-0"
        style={{
          background: 'linear-gradient(200deg, rgb(243, 232, 255) 0%, rgb(219, 234, 254) 100%)',
          filter: 'blur(100px)',
          borderRadius: '100%',
          opacity: 0.35,
          height: '550px',
          right: '-150px',
          top: '500px',
          width: '650px'
        }}
      ></div>
      
      <div 
        className="absolute z-0"
        style={{
          background: 'linear-gradient(180deg, rgb(236, 254, 255) 0%, rgb(240, 253, 244) 100%)',
          filter: 'blur(80px)',
          borderRadius: '100%',
          opacity: 0.3,
          height: '500px',
          left: '50%',
          bottom: '100px',
          transform: 'translateX(-50%)',
          width: '600px'
        }}
      ></div>

      {/* Hero Header */}
      <header className="relative overflow-hidden z-10 h-64 md:h-80" style={{ backgroundColor: 'rgb(248, 250, 252)' }}>
        {/* Gradient Layer 1 - Top Left */}
        <div 
          className="absolute z-1"
          style={{
            background: 'linear-gradient(143.241deg, rgb(147, 197, 253) 0%, rgb(196, 181, 253) 50%, rgb(167, 243, 208) 100%)',
            filter: 'blur(60px)',
            borderRadius: '100%',
            opacity: 0.3,
            height: '400px',
            left: '-150px',
            top: '-100px',
            width: '500px'
          }}
        ></div>
        
        {/* Gradient Layer 2 - Top Right */}
        <div 
          className="absolute z-1"
          style={{
            background: 'linear-gradient(140.017deg, rgb(221, 214, 254) 0%, rgb(147, 197, 253) 60%, rgb(129, 140, 248) 100%)',
            filter: 'blur(60px)',
            borderRadius: '100%',
            opacity: 0.25,
            height: '350px',
            right: '-100px',
            top: '-80px',
            width: '450px'
          }}
        ></div>
        
        {/* Bottom Accent Layer */}
        <div 
          className="absolute z-1"
          style={{
            background: 'linear-gradient(90deg, rgb(186, 230, 253) 0%, rgb(191, 219, 254) 100%)',
            filter: 'blur(40px)',
            opacity: 0.2,
            height: '100px',
            bottom: '-50px',
            left: '0',
            width: '100%',
            borderRadius: '100%'
          }}
        ></div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            {/* Left: Logo + Title */}
            <div className="flex items-center gap-1.5 md:gap-3">
              {/* Logo Placeholder */}
              <div className="w-7 h-7 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm md:text-xl">Q</span>
              </div>
              <h1 className="text-sm md:text-xl font-bold text-gray-900">Support Center</h1>
            </div>

            {/* Right: Back Button + User Status */}
            <div className="flex items-center gap-1.5 md:gap-3">
              {/* Back to Dashboard Button */}
              <Link
                href="/dashboard"
                className="flex items-center gap-1 md:gap-1.5 px-2 py-1 md:px-4 md:py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-white/40 transition-all text-xs md:text-sm font-medium"
              >
                <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Link>

              {/* User Status */}
              {session ? (
                <div className="flex items-center gap-1.5 md:gap-2 px-2 py-1 md:px-3 md:py-1.5 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200">
                  <span className="text-[10px] md:text-xs font-medium text-gray-700 max-w-[80px] md:max-w-none truncate">
                    {session.user?.name || session.user?.email}
                  </span>
                  <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" />
                  </div>
                </div>
              ) : (
                <Link
                  href="/signin/business"
                  className="flex items-center gap-1 md:gap-2 px-2 py-1 md:px-3 md:py-1.5 bg-blue-50/80 backdrop-blur-sm border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-all text-[10px] md:text-xs font-medium"
                >
                  <LogIn className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  <span className="hidden md:inline">Login to send message</span>
                  <span className="md:hidden">Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-40 md:-mt-48 pb-8">
        {/* Simplified Support Section - No Card */}
        <div className="mb-4 md:mb-6">
          <div className="mb-3 md:mb-4 text-center">
            <h2 className="text-2xl md:text-5xl font-bold text-gray-900">How can we help?</h2>
          </div>

          {/* Enhanced Textarea - Opens Modal on Focus */}
          <div>
            <div className="relative">
              <textarea
                onFocus={() => setIsModalOpen(true)}
                onClick={() => setIsModalOpen(true)}
                rows={5}
                className="w-full px-6 py-4 text-base md:text-lg bg-gradient-to-br from-white to-blue-50/30 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer resize-none hover:border-blue-300 hover:shadow-lg transition-all shadow-md"
                placeholder="Describe your issue or question..."
                readOnly
              />
            </div>
            
            {/* Plan Badge - Below Textarea */}
            {planName && session && (
              <div className="mt-3 md:mt-4 flex justify-center">
                <div 
                  className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 py-0.5 md:px-3 md:py-1 rounded-lg text-xs md:text-sm font-semibold"
                  style={getPlanColors(planName).style}
                >
                  {getPlanColors(planName).showStar && (
                    <span className="text-yellow-300 text-xs md:text-sm">★</span>
                  )}
                  <span>{capitalizePlanName(planName)} Plan</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Support Request Modal */}
        {isModalOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-2 lg:p-4 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseModal}
          >
            <div 
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
                <h3 className="text-lg md:text-2xl font-medium text-gray-900">How can we help?</h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  type="button"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
        </div>

              {/* Modal Content */}
              <div className="p-4 md:p-6">
                {submitSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-2 text-gray-900">Request Submitted!</h3>
            <p className="text-gray-600">
                      Thank you for contacting us. We'll get back to you as soon as possible.
            </p>
          </div>
                ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Issue Category */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                What type of issue are you experiencing? *
              </label>
              <div className="flex flex-wrap lg:flex-nowrap gap-3">
                {issueCategories.map((category) => {
                  const Icon = category.icon
                  const isSelected = formData.category === category.id
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: category.id })}
                      className={`flex-1 min-w-[calc(50%-0.375rem)] sm:min-w-[calc(33.333%-0.5rem)] lg:min-w-0 p-4 border-2 rounded-lg text-left transition-all flex flex-col justify-between ${
                        isSelected 
                          ? 'border-gray-900 bg-gray-100 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <Icon className={`w-5 h-5 mb-2 ${getIconColor(category.color)}`} />
                        <div className="font-medium text-sm">{category.label}</div>
                      </div>
                      <div className="text-xs font-normal text-gray-500">{category.description}</div>
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
                          ? 'border-gray-900 bg-gray-100 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs md:text-sm">{section.label}</span>
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

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={6}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.message ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Please provide as much detail as possible about your issue. Include steps to reproduce if applicable."
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-600">{errors.message}</p>
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
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium text-gray-900">
                  Screenshot (optional)
                </label>
                <span className="text-xs text-gray-500">
                  Upload a screenshot to help us understand your issue better
                </span>
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
            <div className="flex items-center justify-end pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                {/* Plan Badge */}
                {planName && session && (
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
            </div>
          </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {/* Status Card */}
          <Link
            href="/status"
            className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200 p-4 md:p-6 hover:border-gray-300 hover:shadow-lg transition-all group"
          >
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                <Activity className="w-4 h-4 md:w-6 md:h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">System Status</h3>
                <p className="text-gray-600 text-xs md:text-sm">
                  Check if all systems are operational and view any ongoing incidents
                </p>
              </div>
            </div>
          </Link>

          {/* Guide Card */}
          <Link
            href="/guide"
            className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200 p-4 md:p-6 hover:border-gray-300 hover:shadow-lg transition-all group"
          >
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                <BookOpen className="w-4 h-4 md:w-6 md:h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">Documentation</h3>
                <p className="text-gray-600 text-xs md:text-sm">
                  Browse our comprehensive guide to learn how to use all features
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

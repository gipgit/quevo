'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Menu, X, ChevronRight, BookOpen, Home, Users, Calendar, FileText, Settings, Zap, MessageSquare, BarChart3, CreditCard, Search, Lightbulb, CheckCircle, AlertTriangle, Bot, Target, Lock, Gift, Star, Link as LinkIcon, Layout, Building, FileText as FileTextIcon, DollarSign, HelpCircle, ThumbsUp, MapPin, ClipboardList, Upload, Activity, MessageCircleQuestion, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function GuidePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const modalSearchInputRef = useRef<HTMLInputElement>(null)

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Home,
      subsections: [
        { id: 'introduction', title: 'What is Quevo?' },
        { id: 'signup', title: 'Create Your Account' },
        { id: 'onboarding', title: 'Business Onboarding' },
        { id: 'dashboard-overview', title: 'Dashboard Overview' },
      ]
    },
    {
      id: 'business-profile',
      title: 'Business Profile',
      icon: Settings,
      subsections: [
        { id: 'profile-info', title: 'Profile Information' },
        { id: 'profile-images', title: 'Images & Branding' },
        { id: 'profile-colors', title: 'Colors & Fonts' },
        { id: 'social-links', title: 'Social Media Links' },
        { id: 'payment-methods', title: 'Payment Methods' },
        { id: 'profile-settings', title: 'Profile Settings' },
      ]
    },
    {
      id: 'services',
      title: 'Services Management',
      icon: BookOpen,
      subsections: [
        { id: 'create-service', title: 'Creating a Service' },
        { id: 'service-details', title: 'Service Details & Pricing' },
        { id: 'service-items', title: 'Service Items & Extras' },
        { id: 'service-questions', title: 'Custom Questions' },
        { id: 'service-requirements', title: 'Requirements & Instructions' },
        { id: 'service-events', title: 'Appointments & Events' },
      ]
    },
    {
      id: 'service-requests',
      title: 'Service Requests',
      icon: FileText,
      subsections: [
        { id: 'view-requests', title: 'Viewing Requests' },
        { id: 'manage-requests', title: 'Managing Request Status' },
        { id: 'ai-responses', title: 'AI-Powered Responses' },
        { id: 'create-board', title: 'Create Service Board' },
      ]
    },
    {
      id: 'service-boards',
      title: 'Service Boards',
      icon: BarChart3,
      subsections: [
        { id: 'what-is-board', title: 'What is a Service Board?' },
        { id: 'create-board-manual', title: 'Creating a Board' },
        { id: 'board-actions', title: 'Adding Actions' },
        { id: 'share-board', title: 'Sharing with Customers' },
        { id: 'board-status', title: 'Tracking Progress' },
      ]
    },
    {
      id: 'appointments',
      title: 'Appointments',
      icon: Calendar,
      subsections: [
        { id: 'view-calendar', title: 'Calendar View' },
        { id: 'manage-appointments', title: 'Managing Appointments' },
      ]
    },
    {
      id: 'clients',
      title: 'Client Management',
      icon: Users,
      subsections: [
        { id: 'view-clients', title: 'View Client List' },
        { id: 'client-details', title: 'Client Information' },
      ]
    },
    {
      id: 'ai-features',
      title: 'AI Features',
      icon: Zap,
      subsections: [
        { id: 'ai-chat', title: 'AI Chat Assistant' },
        { id: 'ai-marketing', title: 'Marketing Content Generator' },
        { id: 'ai-quotations', title: 'Quotation Generator' },
      ]
    },
    {
      id: 'customer-experience',
      title: 'Customer Experience',
      icon: MessageSquare,
      subsections: [
        { id: 'public-profile', title: 'Your Public Profile' },
        { id: 'customer-requests', title: 'How Customers Request Services' },
        { id: 'customer-boards', title: 'Customer Service Boards' },
      ]
    },
    {
      id: 'subscription',
      title: 'Plans & Billing',
      icon: CreditCard,
      subsections: [
        { id: 'plans', title: 'Understanding Plans' },
        { id: 'upgrade', title: 'Upgrading Your Plan' },
        { id: 'usage-limits', title: 'Usage & Limits' },
      ]
    },
  ]

  // Filter sections based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) {
      return sections
    }

    const query = searchQuery.toLowerCase()
    
    return sections.map(section => {
      const sectionMatches = section.title.toLowerCase().includes(query)
      const matchingSubsections = section.subsections.filter(sub => 
        sub.title.toLowerCase().includes(query) || sub.id.toLowerCase().includes(query)
      )

      if (sectionMatches || matchingSubsections.length > 0) {
        return {
          ...section,
          subsections: sectionMatches ? section.subsections : matchingSubsections,
          isMatch: true
        }
      }
      return null
    }).filter(Boolean) as typeof sections
  }, [searchQuery, sections])

  // Auto-expand sections when searching
  useEffect(() => {
    if (searchQuery.trim()) {
      const newExpanded = new Set<string>()
      filteredSections.forEach(section => {
        newExpanded.add(section.id)
      })
      setExpandedSections(newExpanded)
    }
  }, [searchQuery, filteredSections])

  // Keyboard shortcuts for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open search modal
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchModalOpen(true)
      }
      // Escape to close modal
      if (e.key === 'Escape' && searchModalOpen) {
        e.preventDefault()
        setSearchModalOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [searchModalOpen])

  // Focus modal search input when modal opens
  useEffect(() => {
    if (searchModalOpen) {
      setTimeout(() => {
        modalSearchInputRef.current?.focus()
      }, 100)
    }
  }, [searchModalOpen])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setSidebarOpen(false)
      setSearchModalOpen(false)
    }
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  const openSearchModal = () => {
    setSearchModalOpen(true)
  }

  const closeSearchModal = () => {
    setSearchModalOpen(false)
    setSearchQuery('')
  }

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark>
        : part
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="flex items-center gap-3">
                {/* App Logo Placeholder */}
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">Q</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-lg md:text-2xl font-bold text-gray-900">Quevo</div>
                  <span className="text-xs md:text-sm text-gray-500">Documentation</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link 
                href="/dashboard"
                className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Link>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <Link 
                href="/status" 
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Status</span>
              </Link>
              <Link 
                href="/support" 
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <MessageCircleQuestion className="w-4 h-4" />
                <span className="hidden sm:inline">Support</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto">
        <div className="flex">
          {/* Sidebar */}
          <aside className={`
            fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto z-30
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <nav className="p-4 space-y-1">
              {/* Search Bar */}
              <div className="mb-4">
                <button
                  onClick={openSearchModal}
                  className="relative w-full px-3 py-2 text-left border border-gray-300 rounded-lg hover:border-gray-400 transition-colors bg-white"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Search className="w-4 h-4" />
                      <span className="text-sm">Search...</span>
                    </div>
                    <kbd className="px-1.5 py-0.5 text-xs text-gray-500 bg-gray-100 border border-gray-300 rounded">
                      ⌘K
                    </kbd>
                  </div>
                </button>
              </div>

              {sections.map((section) => {
                const Icon = section.icon
                const isExpanded = expandedSections.has(section.id)
                
                return (
                  <div key={section.id} className="mb-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>
                      <button
                        onClick={() => scrollToSection(section.id)}
                        className="flex items-center gap-2 flex-1 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{section.title}</span>
                      </button>
                    </div>
                    {isExpanded && (
                      <div className="ml-6 mt-1 space-y-1">
                        {section.subsections.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => scrollToSection(sub.id)}
                            className="flex items-center gap-2 w-full px-3 py-1.5 text-sm font-normal text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                          >
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-left">{sub.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>
          </aside>

          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
            <div>
              {/* Hero Section */}
              <div className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-5xl font-bold text-gray-900 mb-4">
                    Quevo Guide
                  </h1>
                  <p className="text-base md:text-xl text-gray-600">
                    Everything you need to know to manage your business with Quevo
                  </p>
                </div>
                
                {/* Quick Links */}
                <div>
                  <Link 
                    href="/support"
                    className="flex items-center gap-4 text-gray-700 hover:text-gray-900 transition-colors group"
                  >
                    <div className="flex items-center relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg z-10 relative">
                        <span className="text-white font-bold text-2xl">Q</span>
                      </div>
                      <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0 -ml-4 shadow-md">
                        <MessageCircleQuestion className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <div className="text-base font-medium text-gray-900">Get Support</div>
                      <div className="text-sm text-gray-500">Contact us for help</div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Getting Started */}
              <section id="getting-started" className="mb-16 scroll-mt-20">
                <h2 className="text-base md:text-xl font-bold text-gray-900 uppercase mb-8 pb-3 border-b border-gray-200">
                  Getting Started
                </h2>

                <div id="introduction" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">What is Quevo?</h3>
                  <p className="text-gray-700 mb-4">
                    Quevo is a comprehensive business management platform that helps you:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Create and manage a professional business profile</li>
                    <li>Showcase your services to customers</li>
                    <li>Receive and manage service requests</li>
                    <li>Organize projects with interactive service boards</li>
                    <li>Schedule and manage appointments</li>
                    <li>Track clients and their information</li>
                    <li>Generate marketing content with AI</li>
                    <li>Communicate with customers through AI chat</li>
                  </ul>
                </div>

                <div id="signup" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">Create Your Account</h3>
                  <p className="text-gray-700 mb-4">
                    Follow these steps to create your Quevo account:
                  </p>
                  <ol className="list-decimal list-inside space-y-3 text-gray-700 ml-4">
                    <li><strong>Visit the signup page:</strong> Navigate to the business signup page</li>
                    <li><strong>Enter your name:</strong> Provide your first name (2-50 characters)</li>
                    <li><strong>Enter your email:</strong> Use a valid email address - it will be checked for availability</li>
                    <li><strong>Create a password:</strong> Your password must:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li>Be at least 8 characters long</li>
                        <li>Contain at least one lowercase letter</li>
                        <li>Contain at least one uppercase letter</li>
                        <li>Contain at least one number</li>
                        <li>Contain at least one special character (@$!%*?&)</li>
                      </ul>
                    </li>
                    <li><strong>Click "Create Account":</strong> Submit the form</li>
                    <li><strong>Check your email:</strong> You'll receive an activation link</li>
                    <li><strong>Activate your account:</strong> Click the link in the email to activate</li>
                  </ol>
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span><strong>Tip:</strong> The email availability is checked automatically as you type, so you'll know immediately if the email is available.</span>
                    </p>
                  </div>
                </div>

                <div id="onboarding" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">Business Onboarding</h3>
                  <p className="text-gray-700 mb-4">
                    After activating your account, you'll go through a 10-step onboarding process to set up your business profile:
                  </p>
                  <ol className="list-decimal list-inside space-y-4 text-gray-700 ml-4">
                    <li><strong>Business Information:</strong> Enter your business name and description</li>
                    <li><strong>Profile Link:</strong> Choose a unique URL for your public profile (e.g., quevo.app/your-business)</li>
                    <li><strong>Location:</strong> Add your business address for customers to find you</li>
                    <li><strong>Contact Information:</strong> Provide phone number and email for customer contact</li>
                    <li><strong>Images:</strong> Upload your profile image and cover images (mobile & desktop)</li>
                    <li><strong>Profile Settings:</strong> Configure what information to show on your public profile</li>
                    <li><strong>Colors & Font:</strong> Customize your profile's look with colors and font selection</li>
                    <li><strong>Social Media:</strong> Select which social platforms you want to display</li>
                    <li><strong>Social Links:</strong> Add URLs to your social media accounts</li>
                    <li><strong>Confirmation:</strong> Review everything and create your business profile</li>
                  </ol>
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span><strong>Real-time Preview:</strong> As you fill in the information, you'll see a live preview of your business profile on the right side of the screen.</span>
                    </p>
                  </div>
                </div>

                <div id="dashboard-overview" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">Dashboard Overview</h3>
                  <p className="text-gray-700 mb-4">
                    Your dashboard is the central hub for managing your business. Here's what you'll find:
                  </p>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm md:text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Usage Summary
                      </h4>
                      <p className="text-gray-700">Track your current usage across all features with visual progress bars showing your limits.</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm md:text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" />
                        Public Profile Link
                      </h4>
                      <p className="text-gray-700">Quick access to copy and share your public profile URL with customers.</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm md:text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Layout className="w-4 h-4" />
                        Management Cards
                      </h4>
                      <p className="text-gray-700">Quick access to all main features: Profile, Services, Service Requests, Support Requests, Service Boards, Appointments, Clients, and Promotions.</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm md:text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Business Switcher
                      </h4>
                      <p className="text-gray-700">If you manage multiple businesses, easily switch between them or add a new one.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Business Profile */}
              <section id="business-profile" className="mb-16 scroll-mt-20">
                <h2 className="text-base md:text-xl font-bold text-gray-900 uppercase mb-8 pb-3 border-b border-gray-200">
                  Business Profile
                </h2>

                <div id="profile-info" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">Profile Information</h3>
                  <p className="text-gray-700 mb-4">
                    Keep your business information up to date:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                    <li>Go to <strong>Dashboard → Profile</strong></li>
                    <li>Click on the <strong>"Info"</strong> tab</li>
                    <li>Edit the following fields:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li><strong>Business Name:</strong> Your business's official name</li>
                        <li><strong>Description:</strong> A brief description of what you offer</li>
                        <li><strong>Phone Number:</strong> Your contact phone</li>
                        <li><strong>Email:</strong> Your business email</li>
                        <li><strong>Website:</strong> Your website URL (optional)</li>
                        <li><strong>Address:</strong> Your physical location</li>
                      </ul>
                    </li>
                    <li>Click <strong>"Save"</strong> to update your information</li>
                  </ol>
                </div>

                <div id="profile-images" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">Images & Branding</h3>
                  <p className="text-gray-700 mb-4">
                    Upload images to make your profile stand out:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                    <li>Go to <strong>Dashboard → Profile → Images</strong></li>
                    <li><strong>Profile Image:</strong> Upload a square logo or photo (recommended: 400x400px)</li>
                    <li><strong>Cover Images:</strong> Upload both:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li><strong>Mobile Cover:</strong> For mobile devices (recommended: 800x600px)</li>
                        <li><strong>Desktop Cover:</strong> For desktop view (recommended: 1920x600px)</li>
                      </ul>
                    </li>
                    <li>Use the built-in cropper to adjust your images perfectly</li>
                    <li>Click <strong>"Save"</strong> to apply the changes</li>
                  </ol>
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span><strong>Note:</strong> Images should be in WebP, JPG, or PNG format. Maximum file size: 5MB per image.</span>
                    </p>
                  </div>
                </div>

                <div id="profile-colors" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">Colors & Fonts</h3>
                  <p className="text-gray-700 mb-4">
                    Customize your profile's appearance to match your brand:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                    <li>Go to <strong>Dashboard → Profile → Appearance</strong></li>
                    <li>Customize the following:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li><strong>Background Color:</strong> The main background of your profile</li>
                        <li><strong>Text Color:</strong> Primary text color</li>
                        <li><strong>Button Color:</strong> Color for call-to-action buttons</li>
                        <li><strong>Font Style:</strong> Choose from available font options</li>
                      </ul>
                    </li>
                    <li>Preview changes in real-time on the right side</li>
                    <li>Click <strong>"Save"</strong> when satisfied</li>
                  </ol>
                </div>

                <div id="social-links" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">Social Media Links</h3>
                  <p className="text-gray-700 mb-4">
                    Connect your social media accounts to your profile:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                    <li>Go to <strong>Dashboard → Profile → Links</strong></li>
                    <li>Add links for any of these platforms:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li>Facebook</li>
                        <li>Instagram</li>
                        <li>Twitter/X</li>
                        <li>LinkedIn</li>
                        <li>YouTube</li>
                        <li>TikTok</li>
                        <li>WhatsApp</li>
                        <li>Telegram</li>
                      </ul>
                    </li>
                    <li>Toggle visibility for each link (shown/hidden)</li>
                    <li>Click <strong>"Save"</strong> to update</li>
                  </ol>
                </div>

                <div id="payment-methods" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">Payment Methods</h3>
                  <p className="text-gray-700 mb-4">
                    Let customers know how they can pay you:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                    <li>Go to <strong>Dashboard → Profile → Payment Methods</strong></li>
                    <li>Select payment methods you accept:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li>Cash</li>
                        <li>Credit Card</li>
                        <li>Bank Transfer</li>
                        <li>PayPal</li>
                        <li>Stripe</li>
                        <li>And many more...</li>
                      </ul>
                    </li>
                    <li>Add specific details (e.g., PayPal email, bank account info)</li>
                    <li>Toggle visibility for each method</li>
                    <li>Click <strong>"Save"</strong></li>
                  </ol>
                </div>

                <div id="profile-settings" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">Profile Settings</h3>
                  <p className="text-gray-700 mb-4">
                    Configure what appears on your public profile:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                    <li>Go to <strong>Dashboard → Profile → Settings</strong></li>
                    <li>Choose your <strong>Default Page</strong> (what visitors see first):
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li>Services</li>
                        <li>Products</li>
                        <li>Promotions</li>
                        <li>Rewards</li>
                      </ul>
                    </li>
                    <li>Toggle visibility for:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li>Address</li>
                        <li>Website</li>
                        <li>Social media links</li>
                        <li>Booking button</li>
                        <li>Payment button</li>
                        <li>Review button</li>
                        <li>Phone button</li>
                        <li>Email button</li>
                      </ul>
                    </li>
                    <li>Click <strong>"Save"</strong> to apply settings</li>
                  </ol>
                </div>
              </section>

              {/* Services Management */}
              <section id="services" className="mb-16 scroll-mt-20">
                <h2 className="text-base md:text-xl font-bold text-gray-900 uppercase mb-8 pb-3 border-b border-gray-200">
                  Services Management
                </h2>

                <div id="create-service" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">Creating a Service</h3>
                  <p className="text-gray-700 mb-4">
                    Services are the core of what you offer to customers. Here's how to create one:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                    <li>Go to <strong>Dashboard → Services</strong></li>
                    <li>Click the <strong>"+ Add Service"</strong> button</li>
                    <li>Fill in the basic information:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li><strong>Service Name:</strong> Clear, descriptive name</li>
                        <li><strong>Category:</strong> Choose or create a category</li>
                        <li><strong>Description:</strong> Detailed explanation of what the service includes</li>
                        <li><strong>Duration:</strong> Estimated time required (optional)</li>
                      </ul>
                    </li>
                    <li>Click <strong>"Next"</strong> to continue to additional setup</li>
                  </ol>
                </div>

                <div id="service-details" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">Service Details & Pricing</h3>
                  <p className="text-gray-700 mb-4">
                    Set up pricing and service details:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                    <li>Choose a <strong>Pricing Type</strong>:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li><strong>Fixed Price:</strong> One set price for the service</li>
                        <li><strong>Starting From:</strong> Minimum price, actual cost varies</li>
                        <li><strong>Custom Quote:</strong> Price determined individually</li>
                        <li><strong>Free:</strong> No charge</li>
                      </ul>
                    </li>
                    <li>Enter the <strong>Base Price</strong> (if applicable)</li>
                    <li>Add a <strong>Service Image</strong> (optional):
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li>Upload your own image, or</li>
                        <li>Use AI to generate a relevant image</li>
                      </ul>
                    </li>
                    <li>Set service <strong>Visibility</strong> (active/inactive)</li>
                  </ol>
                </div>

                <div id="service-items" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">Service Items & Extras</h3>
                  <p className="text-gray-700 mb-4">
                    Add selectable options to your service:
                  </p>
                  
                  <h4 className="text-sm md:text-base font-semibold text-gray-900 mt-4 mb-2">Service Items (Main Options):</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                    <li>Click <strong>"Add Service Item"</strong></li>
                    <li>Enter:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li><strong>Item Name:</strong> e.g., "Basic Package", "Premium Package"</li>
                        <li><strong>Description:</strong> What's included</li>
                        <li><strong>Price:</strong> Individual item price</li>
                      </ul>
                    </li>
                    <li>Add multiple items if you offer different tiers or options</li>
                  </ol>

                  <h4 className="text-sm md:text-base font-semibold text-gray-900 mt-6 mb-2">Service Extras (Add-ons):</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                    <li>Click <strong>"Add Extra"</strong></li>
                    <li>Enter:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li><strong>Extra Name:</strong> e.g., "Express Delivery", "Additional Revision"</li>
                        <li><strong>Description:</strong> What the extra provides</li>
                        <li><strong>Price:</strong> Additional cost</li>
                      </ul>
                    </li>
                    <li>Customers can select multiple extras when requesting the service</li>
                  </ol>
                </div>

                <div id="service-questions" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">Custom Questions</h3>
                  <p className="text-gray-700 mb-4">
                    Collect specific information from customers when they request your service:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                    <li>Click <strong>"Add Question"</strong></li>
                    <li>Enter the <strong>Question Text</strong></li>
                    <li>Select a <strong>Question Type</strong>:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li><strong>Short Text:</strong> One-line text input</li>
                        <li><strong>Long Text:</strong> Multi-line text area</li>
                        <li><strong>Multiple Choice:</strong> Select one option from a list</li>
                        <li><strong>Checkboxes:</strong> Select multiple options</li>
                        <li><strong>Yes/No:</strong> Simple boolean choice</li>
                      </ul>
                    </li>
                    <li>For multiple choice/checkboxes, add the available options</li>
                    <li>Mark as <strong>Required</strong> if the customer must answer</li>
                    <li>Save the question</li>
                  </ol>
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span><strong>Example Questions:</strong> "What is your preferred start date?", "Do you have any specific requirements?", "What is your budget range?"</span>
                    </p>
                  </div>
                </div>

                <div id="service-requirements" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">Requirements & Instructions</h3>
                  <p className="text-gray-700 mb-4">
                    Add requirement blocks to specify what customers need to provide:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                    <li>Click <strong>"Add Requirement Block"</strong></li>
                    <li>Enter:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li><strong>Title:</strong> e.g., "Documents Needed", "Before We Start"</li>
                        <li><strong>Requirements Text:</strong> Detailed list or instructions</li>
                      </ul>
                    </li>
                    <li>Mark as <strong>Required</strong> if customers must acknowledge it</li>
                    <li>Use rich text formatting for better clarity</li>
                  </ol>
                </div>

                <div id="service-events" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">Appointments & Events</h3>
                  <p className="text-gray-700 mb-4">
                    If your service requires scheduling, set up events:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                    <li>Click <strong>"Add Event"</strong></li>
                    <li>Configure the event:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li><strong>Event Name:</strong> e.g., "Initial Consultation", "Service Delivery"</li>
                        <li><strong>Event Type:</strong> In-person, online, or phone</li>
                        <li><strong>Duration:</strong> How long the event takes (in minutes)</li>
                        <li><strong>Buffer Time:</strong> Time needed between events</li>
                      </ul>
                    </li>
                    <li>Set <strong>Availability</strong>:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li>Select days of the week</li>
                        <li>Set time ranges (e.g., 9:00 AM - 5:00 PM)</li>
                        <li>Add multiple time slots for the same day if needed</li>
                        <li>Set effective dates (when availability starts/ends)</li>
                      </ul>
                    </li>
                    <li>Mark as <strong>Required</strong> if customers must book this event</li>
                    <li>Save the event</li>
                  </ol>
                </div>
              </section>

              {/* Service Requests */}
              <section id="service-requests" className="mb-16 scroll-mt-20">
                <h2 className="text-base md:text-xl font-bold text-gray-900 uppercase mb-8 pb-3 border-b border-gray-200">
                  Service Requests
                </h2>

                <div id="view-requests" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">Viewing Requests</h3>
                  <p className="text-gray-700 mb-4">
                    Access all service requests from customers:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                    <li>Go to <strong>Dashboard → Service Requests</strong></li>
                    <li>You'll see a list of all requests with:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li>Request reference number</li>
                        <li>Customer name and contact info</li>
                        <li>Service requested</li>
                        <li>Request date</li>
                        <li>Current status</li>
                        <li>Priority level</li>
                      </ul>
                    </li>
                    <li>Click on any request to view full details including:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li>Selected items and extras</li>
                        <li>Answers to custom questions</li>
                        <li>Customer notes</li>
                        <li>Pricing breakdown</li>
                        <li>Selected date/time (if applicable)</li>
                      </ul>
                    </li>
                  </ol>
                </div>

                <div id="manage-requests" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">Managing Request Status</h3>
                  <p className="text-gray-700 mb-4">
                    Keep track of request progress:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                    <li>Open a service request</li>
                    <li>Update the <strong>Status</strong>:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li><strong>Pending:</strong> Just received, not yet reviewed</li>
                        <li><strong>In Progress:</strong> Currently working on it</li>
                        <li><strong>Completed:</strong> Service delivered</li>
                        <li><strong>Cancelled:</strong> Request cancelled</li>
                      </ul>
                    </li>
                    <li>Mark as <strong>Handled</strong> once you've addressed it</li>
                    <li>Set <strong>Priority</strong> (Low, Medium, High, Urgent)</li>
                    <li>Add internal <strong>Notes</strong> for your team</li>
                    <li>Send <strong>Messages</strong> to the customer directly from the request</li>
                  </ol>
                </div>

                <div id="ai-responses" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">AI-Powered Responses</h3>
                  <p className="text-gray-700 mb-4">
                    Use AI to generate professional responses to service requests:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                    <li>Open a service request</li>
                    <li>Click the <strong>"Generate AI Response"</strong> button</li>
                    <li>The AI will analyze:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li>The service requested</li>
                        <li>Customer's requirements and questions</li>
                        <li>Your business information</li>
                        <li>Pricing details</li>
                      </ul>
                    </li>
                    <li>Review the generated response</li>
                    <li>Edit as needed to personalize it</li>
                    <li>Click <strong>"Send"</strong> to deliver the response to the customer</li>
                  </ol>
                  <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-purple-800 flex items-start gap-2">
                      <Bot className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span><strong>AI Tip:</strong> The AI considers your business tone and style to generate responses that match your brand voice.</span>
                    </p>
                  </div>
                </div>

                <div id="create-board" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">Create Service Board</h3>
                  <p className="text-gray-700 mb-4">
                    Turn a service request into an interactive service board for better project management:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                    <li>Open a service request</li>
                    <li>Click <strong>"Create Service Board"</strong></li>
                    <li>The system automatically creates a board with:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li>Customer information</li>
                        <li>Service details</li>
                        <li>Request reference</li>
                      </ul>
                    </li>
                    <li>You can now add actions and share it with the customer</li>
                    <li>The board is linked to the original request</li>
                  </ol>
                </div>
              </section>

              {/* Service Boards */}
              <section id="service-boards" className="mb-16 scroll-mt-20">
                <h2 className="text-base md:text-xl font-bold text-gray-900 uppercase mb-8 pb-3 border-b border-gray-200">
                  Service Boards
                </h2>

                <div id="what-is-board" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">What is a Service Board?</h3>
                  <p className="text-gray-700 mb-4">
                    A Service Board is an interactive, shareable workspace where you can:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Track the progress of a service or project</li>
                    <li>Add various types of actions (tasks, payments, documents, etc.)</li>
                    <li>Share updates with customers in real-time</li>
                    <li>Collect information, approvals, or payments from customers</li>
                    <li>Collaborate transparently throughout the service delivery</li>
                  </ul>
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span><strong>Think of it as:</strong> A customizable dashboard for each customer project that both you and your customer can access and interact with.</span>
                    </p>
                  </div>
                </div>

                <div id="create-board-manual" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">Creating a Board</h3>
                  <p className="text-gray-700 mb-4">
                    Create a new service board:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                    <li>Go to <strong>Dashboard → Service Boards</strong></li>
                    <li>Click <strong>"+ Create Board"</strong></li>
                    <li>Fill in:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li><strong>Board Title:</strong> Descriptive name for the project</li>
                        <li><strong>Customer:</strong> Select existing customer or add new</li>
                        <li><strong>Description:</strong> Brief overview of the project</li>
                      </ul>
                    </li>
                    <li>Click <strong>"Create"</strong></li>
                    <li>A unique reference code is automatically generated</li>
                  </ol>
                </div>

                <div id="board-actions" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">Adding Actions</h3>
                  <p className="text-gray-700 mb-4">
                    Actions are the building blocks of a service board. Add different types based on what you need:
                  </p>
                  
                  <div className="space-y-4 mt-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm md:text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <FileTextIcon className="w-4 h-4" />
                        Text Block
                      </h4>
                      <p className="text-gray-700 text-sm">Display information, instructions, or updates to the customer</p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm md:text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Checklist
                      </h4>
                      <p className="text-gray-700 text-sm">Create a list of tasks or requirements that can be checked off</p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm md:text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        File Upload
                      </h4>
                      <p className="text-gray-700 text-sm">Request or share files with the customer</p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm md:text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Payment Request
                      </h4>
                      <p className="text-gray-700 text-sm">Add a payment that needs to be made</p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm md:text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        Question
                      </h4>
                      <p className="text-gray-700 text-sm">Ask the customer a question and collect their response</p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm md:text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <ThumbsUp className="w-4 h-4" />
                        Approval
                      </h4>
                      <p className="text-gray-700 text-sm">Request customer approval for something (design, plan, etc.)</p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm md:text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Date Selection
                      </h4>
                      <p className="text-gray-700 text-sm">Let customer choose a date/time for an appointment or deadline</p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm md:text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Address
                      </h4>
                      <p className="text-gray-700 text-sm">Collect or display an address</p>
                    </div>
                  </div>

                  <p className="text-gray-700 mt-4 mb-2">To add an action:</p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                    <li>Open a service board</li>
                    <li>Click <strong>"+ Add Action"</strong></li>
                    <li>Select the action type</li>
                    <li>Fill in the required details</li>
                    <li>Set if it requires customer action</li>
                    <li>Set priority and due date (optional)</li>
                    <li>Click <strong>"Save"</strong></li>
                  </ol>
                </div>

                <div id="share-board" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">Sharing with Customers</h3>
                  <p className="text-gray-700 mb-4">
                    Give customers access to their service board:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                    <li>Open the service board</li>
                    <li>Click the <strong>"Share"</strong> button</li>
                    <li>You'll get a unique shareable link like: <code className="bg-gray-100 px-2 py-1 rounded">quevo.app/your-business/s/BOARD-REF</code></li>
                    <li>Share this link with your customer via:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li>Email</li>
                        <li>WhatsApp</li>
                        <li>SMS</li>
                        <li>Any messaging platform</li>
                      </ul>
                    </li>
                    <li>Customer can access the board without creating an account</li>
                    <li>They can interact with actions that require their input</li>
                  </ol>
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 flex items-start gap-2">
                      <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span><strong>Privacy:</strong> Each board has a unique reference code. Only people with the link can access it.</span>
                    </p>
                  </div>
                </div>

                <div id="board-status" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">Tracking Progress</h3>
                  <p className="text-gray-700 mb-4">
                    Monitor the status of service boards:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                    <li>View all boards in <strong>Dashboard → Service Boards</strong></li>
                    <li>Each board shows:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li><strong>Status:</strong> Active, Completed, Archived</li>
                        <li><strong>Action Count:</strong> Number of actions in the board</li>
                        <li><strong>Pending Actions:</strong> Actions awaiting customer response</li>
                        <li><strong>Last Updated:</strong> Most recent activity</li>
                      </ul>
                    </li>
                    <li>Update board status as the project progresses</li>
                    <li>Archive completed boards to keep your list clean</li>
                  </ol>
                </div>
              </section>

              {/* Appointments */}
              <section id="appointments" className="mb-16 scroll-mt-20">
                <h2 className="text-base md:text-xl font-bold text-gray-900 uppercase mb-8 pb-3 border-b border-gray-200">
                  Appointments
                </h2>

                <div id="view-calendar" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">Calendar View</h3>
                  <p className="text-gray-700 mb-4">
                    Manage all your appointments in one place:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                    <li>Go to <strong>Dashboard → Appointments</strong></li>
                    <li>View appointments in different formats:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li><strong>Month View:</strong> See the whole month at a glance</li>
                        <li><strong>Week View:</strong> Detailed weekly schedule</li>
                        <li><strong>Day View:</strong> Hourly breakdown of a single day</li>
                        <li><strong>List View:</strong> Chronological list of all appointments</li>
                      </ul>
                    </li>
                    <li>Click on any appointment to see full details</li>
                    <li>Use filters to view specific types of appointments</li>
                  </ol>
                </div>

                <div id="manage-appointments" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">Managing Appointments</h3>
                  <p className="text-gray-700 mb-4">
                    Handle appointment requests and changes:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                    <li>When a customer books a service with an event, it appears in your calendar</li>
                    <li>Click on the appointment to:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li><strong>Confirm:</strong> Accept the appointment</li>
                        <li><strong>Reschedule:</strong> Propose a different time</li>
                        <li><strong>Cancel:</strong> Cancel the appointment with a reason</li>
                        <li><strong>Mark as Completed:</strong> After the appointment is done</li>
                      </ul>
                    </li>
                    <li>View customer details and contact information</li>
                    <li>See linked service board (if applicable)</li>
                    <li>Add notes about the appointment</li>
                  </ol>
                </div>
              </section>

              {/* Clients */}
              <section id="clients" className="mb-16 scroll-mt-20">
                <h2 className="text-base md:text-xl font-bold text-gray-900 uppercase mb-8 pb-3 border-b border-gray-200">
                  Client Management
                </h2>

                <div id="view-clients" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">View Client List</h3>
                  <p className="text-gray-700 mb-4">
                    Access your complete customer database:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                    <li>Go to <strong>Dashboard → Clients</strong></li>
                    <li>See all customers who have:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li>Requested a service</li>
                        <li>Booked an appointment</li>
                        <li>Interacted with your business</li>
                      </ul>
                    </li>
                    <li>Use search to find specific clients</li>
                    <li>Sort by name, email, or date added</li>
                  </ol>
                </div>

                <div id="client-details" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">Client Information</h3>
                  <p className="text-gray-700 mb-4">
                    View detailed information about each client:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                    <li>Click on a client to open their profile</li>
                    <li>View:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li><strong>Contact Information:</strong> Name, email, phone</li>
                        <li><strong>Service History:</strong> All service requests</li>
                        <li><strong>Appointments:</strong> Past and upcoming appointments</li>
                        <li><strong>Service Boards:</strong> Active and completed projects</li>
                        <li><strong>Communication History:</strong> Messages and interactions</li>
                      </ul>
                    </li>
                    <li>Add notes about the client</li>
                    <li>Export client information if needed</li>
                  </ol>
                </div>
              </section>

              {/* AI Features */}
              <section id="ai-features" className="mb-16 scroll-mt-20">
                <h2 className="text-base md:text-xl font-bold text-gray-900 uppercase mb-8 pb-3 border-b border-gray-200">
                  AI Features
                </h2>

                <div id="ai-chat" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">AI Chat Assistant</h3>
                  <p className="text-gray-700 mb-4">
                    Your customers can interact with an AI assistant on your public profile:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>The AI assistant is automatically available at: <code className="bg-gray-100 px-2 py-1 rounded">quevo.app/your-business/ai</code></li>
                    <li>The AI can help customers:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li>Learn about your services</li>
                        <li>Get pricing estimates</li>
                        <li>Find your contact information</li>
                        <li>View products and promotions</li>
                        <li>Get answers about your business</li>
                      </ul>
                    </li>
                    <li>The AI is trained on your business information</li>
                    <li>Conversations are context-aware and personalized</li>
                    <li>Available 24/7 to answer customer questions</li>
                  </ul>
                  <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-purple-800 flex items-start gap-2">
                      <Bot className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span><strong>Pro Tip:</strong> Keep your services and business information up-to-date so the AI can provide accurate responses.</span>
                    </p>
                  </div>
                </div>

                <div id="ai-marketing" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">Marketing Content Generator</h3>
                  <p className="text-gray-700 mb-4">
                    Generate professional marketing content for your services:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                    <li>Go to <strong>Dashboard → Marketing</strong></li>
                    <li>Select a service to promote</li>
                    <li>Choose content type:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li><strong>Social Media Post:</strong> For Facebook, Instagram, LinkedIn</li>
                        <li><strong>Email Campaign:</strong> Newsletter or promotional email</li>
                        <li><strong>Ad Copy:</strong> For advertising campaigns</li>
                        <li><strong>Blog Post:</strong> Detailed article about your service</li>
                      </ul>
                    </li>
                    <li>Select platform and tone (professional, casual, friendly, etc.)</li>
                    <li>Click <strong>"Generate"</strong></li>
                    <li>Review and edit the AI-generated content</li>
                    <li>Copy and use it in your marketing channels</li>
                  </ol>
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span><strong>Use Cases:</strong> Promote new services, announce special offers, create engaging content for social media, or write email newsletters.</span>
                    </p>
                  </div>
                </div>

                <div id="ai-quotations" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">Quotation Generator</h3>
                  <p className="text-gray-700 mb-4">
                    Create professional quotations quickly:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                    <li>Go to <strong>Dashboard → Quotation Generator</strong></li>
                    <li>Select services to include in the quote</li>
                    <li>Add items, quantities, and prices</li>
                    <li>The AI can help:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li>Format the quotation professionally</li>
                        <li>Add terms and conditions</li>
                        <li>Generate descriptions for line items</li>
                        <li>Calculate totals and taxes</li>
                      </ul>
                    </li>
                    <li>Customize the design and branding</li>
                    <li>Download as PDF or share via link</li>
                  </ol>
                </div>
              </section>

              {/* Customer Experience */}
              <section id="customer-experience" className="mb-16 scroll-mt-20">
                <h2 className="text-base md:text-xl font-bold text-gray-900 uppercase mb-8 pb-3 border-b border-gray-200">
                  Customer Experience
                </h2>

                <div id="public-profile" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">Your Public Profile</h3>
                  <p className="text-gray-700 mb-4">
                    Your public profile is what customers see. It's accessible at:
                  </p>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                    <code className="text-blue-800 font-mono">https://quevo.app/your-business-urlname</code>
                  </div>
                  <p className="text-gray-700 mb-4">Your profile includes:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li><strong>Header:</strong> Profile image, cover image, business name</li>
                    <li><strong>Navigation:</strong> Tabs for Services, Products, Promotions, Rewards</li>
                    <li><strong>Action Buttons:</strong> Contact, booking, payment options</li>
                    <li><strong>Business Info:</strong> Description, address, contact details</li>
                    <li><strong>Social Links:</strong> Links to your social media profiles</li>
                    <li><strong>Services Section:</strong> All your active services with categories</li>
                    <li><strong>AI Chat Button:</strong> Quick access to AI assistant</li>
                  </ul>
                </div>

                <div id="customer-requests" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">How Customers Request Services</h3>
                  <p className="text-gray-700 mb-4">
                    Understanding the customer's journey helps you design better services:
                  </p>
                  <ol className="list-decimal list-inside space-y-3 text-gray-700 ml-4">
                    <li><strong>Browse Services:</strong> Customer visits your public profile and views available services</li>
                    <li><strong>Select a Service:</strong> Clicks on a service to see details</li>
                    <li><strong>Click "Request Service":</strong> Opens the service request form</li>
                    <li><strong>Multi-Step Form:</strong> Customer goes through steps:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li><strong>Overview:</strong> Service summary and pricing</li>
                        <li><strong>Items & Extras:</strong> Select options and add-ons</li>
                        <li><strong>Questions:</strong> Answer your custom questions</li>
                        <li><strong>Requirements:</strong> Review and acknowledge requirements</li>
                        <li><strong>Date/Time:</strong> Book appointment (if required)</li>
                        <li><strong>Customer Details:</strong> Provide contact information</li>
                        <li><strong>Confirmation:</strong> Review and submit</li>
                      </ul>
                    </li>
                    <li><strong>Submission:</strong> Request is sent to you immediately</li>
                    <li><strong>Confirmation:</strong> Customer receives a confirmation with a reference number</li>
                  </ol>
                </div>

                <div id="customer-boards" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">Customer Service Boards</h3>
                  <p className="text-gray-700 mb-4">
                    When you share a service board with a customer, they can:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li><strong>Access Without Login:</strong> View the board using the unique link</li>
                    <li><strong>See Progress:</strong> Track the status of their project</li>
                    <li><strong>Interact with Actions:</strong>
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li>Upload requested files</li>
                        <li>Answer questions</li>
                        <li>Provide approvals</li>
                        <li>Select dates/times</li>
                        <li>Make payments</li>
                        <li>Fill in information</li>
                      </ul>
                    </li>
                    <li><strong>Receive Updates:</strong> See new actions as you add them</li>
                    <li><strong>Password Protection:</strong> Some boards may require a password for extra security</li>
                  </ul>
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 flex items-start gap-2">
                      <Target className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span><strong>Customer Benefit:</strong> Service boards provide transparency and keep customers informed every step of the way, reducing questions and improving satisfaction.</span>
                    </p>
                  </div>
                </div>
              </section>

              {/* Subscription */}
              <section id="subscription" className="mb-16 scroll-mt-20">
                <h2 className="text-base md:text-xl font-bold text-gray-900 uppercase mb-8 pb-3 border-b border-gray-200">
                  Plans & Billing
                </h2>

                <div id="plans" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">Understanding Plans</h3>
                  <p className="text-gray-700 mb-4">
                    Quevo offers different plans to suit your business needs:
                  </p>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <h4 className="text-sm md:text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Gift className="w-4 h-4" />
                        Free Plan
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4">
                        <li>Basic features to get started</li>
                        <li>Limited services and requests per month</li>
                        <li>Perfect for testing the platform</li>
                        <li>No credit card required</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="text-sm md:text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        Premium Plans
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4">
                        <li>Unlimited or higher limits on features</li>
                        <li>Advanced AI capabilities</li>
                        <li>Priority support</li>
                        <li>Custom branding options</li>
                        <li>Analytics and insights</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div id="upgrade" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">Upgrading Your Plan</h3>
                  <p className="text-gray-700 mb-4">
                    Upgrade when you need more features:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                    <li>Go to <strong>Dashboard → Plan</strong></li>
                    <li>View your current plan and usage</li>
                    <li>Click <strong>"Upgrade Plan"</strong></li>
                    <li>Compare available plans</li>
                    <li>Select the plan that fits your needs</li>
                    <li>Enter payment information</li>
                    <li>Confirm the upgrade</li>
                    <li>Your new limits take effect immediately</li>
                  </ol>
                </div>

                <div id="usage-limits" className="mb-10 scroll-mt-20">
                  <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4">Usage & Limits</h3>
                  <p className="text-gray-700 mb-4">
                    Keep track of your feature usage:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li><strong>Dashboard Overview:</strong> See usage summary on your main dashboard</li>
                    <li><strong>Feature Limits:</strong> Each plan has limits on:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li>Number of services (global)</li>
                        <li>Service requests per month</li>
                        <li>Appointments per month</li>
                        <li>Active service boards (global)</li>
                        <li>Products (global)</li>
                        <li>AI generation tokens</li>
                      </ul>
                    </li>
                    <li><strong>Usage Reset:</strong> Monthly limits reset at the start of each billing cycle</li>
                    <li><strong>Approaching Limits:</strong> You'll see warnings when approaching your limits</li>
                  </ul>
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 flex items-start gap-2">
                      <BarChart3 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span><strong>Monitor Your Usage:</strong> Check your dashboard regularly to ensure you're within limits and upgrade before reaching them if needed.</span>
                    </p>
                  </div>
                </div>
              </section>

              {/* Footer */}
              <div className="mt-16 pt-8 border-t border-gray-200">
                <div className="text-center text-gray-600">
                  <p className="mb-2">Need more help?</p>
                  <Link href="/dashboard/support-requests" className="text-blue-600 hover:text-blue-700 font-medium">
                    Contact Support →
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Search Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={closeSearchModal}
          />
          
          {/* Modal */}
          <div className="absolute inset-x-0 top-0 mx-auto max-w-2xl mt-20 px-4">
            <div className="relative bg-white rounded-lg shadow-2xl">
              {/* Search Input */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    ref={modalSearchInputRef}
                    type="text"
                    placeholder="Search documentation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 text-base border-0 focus:outline-none focus:ring-0"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      title="Clear search"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Search Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {!searchQuery ? (
                  <div className="p-8 text-center">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">Start typing to search documentation</p>
                    <p className="text-sm text-gray-400">Try searching for "service", "profile", "AI", or "customer"</p>
                  </div>
                ) : filteredSections.length === 0 ? (
                  <div className="p-8 text-center">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-700 mb-2">No results found for "{searchQuery}"</p>
                    <button
                      onClick={clearSearch}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <div className="py-2">
                    {filteredSections.map((section) => {
                      const Icon = section.icon
                      return (
                        <div key={section.id} className="mb-2">
                          {/* Section Header */}
                          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {highlightText(section.title, searchQuery)}
                          </div>
                          
                          {/* Subsection Results */}
                          <div className="space-y-1">
                            {section.subsections.map((sub) => (
                              <button
                                key={sub.id}
                                onClick={() => scrollToSection(sub.id)}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 group"
                              >
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                                    {highlightText(sub.title, searchQuery)}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    {section.title}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">↑</kbd>
                      <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">↓</kbd>
                      <span className="ml-1">Navigate</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">ESC</kbd>
                      <span className="ml-1">Close</span>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    {filteredSections.length > 0 && searchQuery && (
                      <span>{filteredSections.reduce((acc, s) => acc + s.subsections.length, 0)} results</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

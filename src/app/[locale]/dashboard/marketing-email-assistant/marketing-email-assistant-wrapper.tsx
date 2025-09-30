'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  createEmailCampaign, 
  sendEmailCampaign, 
  getEmailRateLimitStatus,
  getAIContentGenerationRateLimitStatus,
  type CreateCampaignData,
  type SendCampaignData
} from './actions'
import { generateMarketingEmailContent } from './generate-email-content'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { AIAssistantIcon } from '@/components/ui/ai-assistant-icon'
import { 
  CalendarIcon, 
  MailIcon, 
  UsersIcon, 
  SparklesIcon,
  Save,
  Send,
  ClockIcon,
  BarChart3Icon,
  FileTextIcon,
  Plus,
  Eye,
  Edit,
  Trash2,
  Info
} from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { LoadingSparkles } from '@/components/ui/loading-sparkles'
import { useTheme } from "@/contexts/ThemeProvider"
import AIActionButton from "@/components/ui/ai-action-button"
import { AICostCard } from "@/components/ui/ai-cost-card"
import { LoadingAIGeneration } from '@/components/ui/loading-ai-generation'

interface Customer {
  id: string
  name_first: string
  name_last: string
  email: string
  phone: string
  date_created: Date
  active: boolean
  requests: any[]
  boards: any[]
  lastActivity: Date
}

// Updated Service interface without duration_minutes and buffer_minutes - FIXED
interface Service {
  service_id: string
  service_name: string
  description: string | null
  price_base: any
  price_type: string | null
  has_items: boolean | null
  active_booking: boolean | null
  active_quotation: boolean | null
  is_active: boolean | null
  display_order: number | null
  servicecategory: {
    category_name: string
  } | null
  servicequestion: any[]
  servicerequirementblock: any[]
  serviceitem: any[]
}

interface Campaign {
  id: number
  campaign_name: string
  subject: string
  content: string
  from_name: string
  from_email: string
  reply_to: string | null
  recipient_category: string
  sent_count: number
  failed_count: number
  opened_count: number
  clicked_count: number
  status: string
  campaign_type: string
  scheduled_at: Date | null
  sent_at: Date | null
  created_at: Date
  updated_at: Date
}

interface MarketingEmailAssistantWrapperProps {
  currentBusiness: {
    business_id: string
    business_name: string
    business_descr: string | null
  }
  services: Service[]
  activeCustomers: Customer[]
  pastCustomers: Customer[]
  uncommittedCustomers: Customer[]
  campaigns: Campaign[]
  usage: any
  planLimits: any[]
  rateLimitStatus: any
  aiContentGenerationRateLimitStatus: any
  locale: string
}

export default function MarketingEmailAssistantWrapper({
  currentBusiness,
  services,
  activeCustomers,
  pastCustomers,
  uncommittedCustomers,
  campaigns,
  usage,
  planLimits,
  rateLimitStatus,
  aiContentGenerationRateLimitStatus,
  locale
}: MarketingEmailAssistantWrapperProps) {
  const router = useRouter()
  const { theme } = useTheme()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [showRecipientsModal, setShowRecipientsModal] = useState(false)
  const [showAIGenerationModal, setShowAIGenerationModal] = useState(false)
  const [isManualMode, setIsManualMode] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)

  // AI Generation settings state
  const [aiGenerationSettings, setAiGenerationSettings] = useState({
    businessQualities: [] as string[],
    includePromotion: false,
    promotionType: '',
    tone: 'professional' as 'professional' | 'friendly' | 'casual' | 'formal',
    callToAction: 'book_appointment' as 'book_appointment' | 'learn_more' | 'contact_us' | 'custom'
  })

  // Section description toggle states
  const [showRecipientsDesc, setShowRecipientsDesc] = useState(false)
  const [showCampaignNameDesc, setShowCampaignNameDesc] = useState(false)
  const [showFromReplyDesc, setShowFromReplyDesc] = useState(false)
  const [showEmailContentDesc, setShowEmailContentDesc] = useState(false)
  const [showScheduleDesc, setShowScheduleDesc] = useState(false)

  // Campaign form state
  const [campaignData, setCampaignData] = useState<CreateCampaignData>({
    campaign_name: '',
    subject: '',
    content: '',
    from_name: currentBusiness.business_name,
    from_email: '',
    reply_to: '',
    recipient_category: 'past_customers',
    campaign_type: 'general',
    scheduled_at: undefined
  })

  // Structured email template state
  const [emailTemplate, setEmailTemplate] = useState({
    title: '',
    image_url: '',
    main_text: '',
    secondary_text: '',
    action_button_text: '',
    action_button_url: ''
  })



  // Recipient selection state
  const [recipientType, setRecipientType] = useState<'past_customers' | 'uncommitted_customers' | 'all_customers' | 'custom'>('past_customers')

  useEffect(() => {
    // Set default from email based on business name
    if (currentBusiness.business_name) {
      const domain = currentBusiness.business_name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
      setCampaignData(prev => ({
        ...prev,
        from_email: `noreply@${domain}.com`
      }))
    }
  }, [currentBusiness.business_name])

  const handleGenerateContent = async (campaignType: 'past_customers' | 'uncommitted_customers' | 'general') => {
    setGenerationError(null)
    setShowAIGenerationModal(true)
  }

  const handleConfirmAIGeneration = async () => {
    setIsGenerating(true)
    setGenerationError(null)
    
    try {
      const result = await generateMarketingEmailContent(
        recipientType, 
        locale, 
        aiGenerationSettings,
        currentBusiness
      )
      
      if (result.success && result.data) {
        setCampaignData(prev => ({
          ...prev,
          subject: result.data!.subject,
          content: result.data!.body,
          campaign_type: recipientType === 'custom' ? 'general' : recipientType
        }))
        
        // Also populate structured template fields
        setEmailTemplate({
          title: result.data!.subject || '',
          image_url: '',
          main_text: result.data!.body || '',
          secondary_text: '',
          action_button_text: result.data!.actionButtonText || 'Learn More',
          action_button_url: result.data!.actionButtonUrl || ''
        })
        
        // Switch to manual mode to show the generated content
        setIsManualMode(true)
        
        // Close modal after successful generation
        setShowAIGenerationModal(false)
      } else {
        setGenerationError(result.error || 'Failed to generate content')
      }
    } catch (error) {
      setGenerationError('Error generating content')
      console.error('Error generating content:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveCampaign = async () => {
    if (!campaignData.campaign_name || !campaignData.subject || !campaignData.content) {
      alert('Please fill in all required fields')
      return
    }

    setIsSaving(true)
    try {
      const result = await createEmailCampaign(campaignData)
      
      if (result.success) {
        alert('Campaign saved successfully!')
        // Reset form
        setCampaignData({
          campaign_name: '',
          subject: '',
          content: '',
          from_name: currentBusiness.business_name,
          from_email: campaignData.from_email,
          reply_to: '',
          recipient_category: 'past_customers',
          campaign_type: 'general',
          scheduled_at: undefined
        })
        router.refresh()
      } else {
        alert(result.message)
      }
    } catch (error) {
      alert('Error saving campaign')
      console.error('Error saving campaign:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSendCampaign = async () => {
    if (selectedRecipients.length === 0) {
      alert('Please select recipients')
      return
    }

    if (!campaignData.campaign_name || !campaignData.subject || !campaignData.content) {
      alert('Please fill in all required fields')
      return
    }

    setIsSending(true)
    try {
      // First save the campaign
      const saveResult = await createEmailCampaign(campaignData)
      
      if (!saveResult.success) {
        alert(saveResult.message)
        return
      }

      // Then send it
      const sendResult = await sendEmailCampaign({
        campaign_id: saveResult.campaignId!,
        recipient_ids: selectedRecipients
      })

      if (sendResult.success) {
        alert(sendResult.message)
        setSelectedRecipients([])
        setCampaignData({
          campaign_name: '',
          subject: '',
          content: '',
          from_name: currentBusiness.business_name,
          from_email: campaignData.from_email,
          reply_to: '',
          recipient_category: 'past_customers',
          campaign_type: 'general',
          scheduled_at: undefined
        })
        router.refresh()
      } else {
        alert(sendResult.message)
      }
    } catch (error) {
      alert('Error sending campaign')
      console.error('Error sending campaign:', error)
    } finally {
      setIsSending(false)
    }
  }



  const handleRecipientTypeChange = (type: 'past_customers' | 'uncommitted_customers' | 'all_customers' | 'custom') => {
    setRecipientType(type)
    
    // Auto-select all customers for the selected type
    let allRecipients: string[] = []
    
    switch (type) {
      case 'past_customers':
        allRecipients = pastCustomers.map(c => c.id)
        break
      case 'uncommitted_customers':
        allRecipients = uncommittedCustomers.map(c => c.id)
        break
      case 'all_customers':
        allRecipients = [...pastCustomers, ...uncommittedCustomers, ...activeCustomers].map(c => c.id)
        break
      case 'custom':
        allRecipients = [] // Don't auto-select for custom
        break
    }
    
    setSelectedRecipients(allRecipients)
  }

  const handleRecipientSelection = (customerId: string, selected: boolean) => {
    if (selected) {
      setSelectedRecipients(prev => [...prev, customerId])
    } else {
      setSelectedRecipients(prev => prev.filter(id => id !== customerId))
    }
  }

  const handleSelectAllRecipients = () => {
    let allRecipients: string[] = []
    
    switch (recipientType) {
      case 'past_customers':
        allRecipients = pastCustomers.map(c => c.id)
        break
      case 'uncommitted_customers':
        allRecipients = uncommittedCustomers.map(c => c.id)
        break
      case 'all_customers':
        allRecipients = [...pastCustomers, ...uncommittedCustomers, ...activeCustomers].map(c => c.id)
        break
    }
    
    setSelectedRecipients(allRecipients)
  }

  const handleClearRecipients = () => {
    setSelectedRecipients([])
  }

  const getRecipientsForType = () => {
    switch (recipientType) {
      case 'past_customers':
        return pastCustomers
      case 'uncommitted_customers':
        return uncommittedCustomers
      case 'all_customers':
        return [...pastCustomers, ...uncommittedCustomers, ...activeCustomers]
      default:
        return []
    }
  }



  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled' },
      sending: { color: 'bg-yellow-100 text-yellow-800', label: 'Sending' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
      paused: { color: 'bg-orange-100 text-orange-800', label: 'Paused' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    return <Badge className={config.color}>{config.label}</Badge>
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        {/* Top Navbar (simulated) */}
        <div className="sticky top-0 z-10 px-6 py-4 lg:py-2 rounded-2xl mb-3 bg-[var(--dashboard-bg-primary)] border border-[var(--dashboard-border-primary)]">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-medium text-[var(--dashboard-text-primary)]">Email Assistant</p>
            </div>
          </div>
        </div>

        {/* Content Wrapper with Background */}
        <div className="bg-[var(--dashboard-bg-primary)] rounded-2xl border border-[var(--dashboard-border-primary)] p-6">
          <div className="space-y-6">
            {/* Header with AI accent gradient layers */}
            <div className="mb-6 relative overflow-visible">
              {/* Accent Color Layers */}
              <div
                className="absolute z-0"
                style={{
                  background: 'var(--ai-panel-accent-1)',
                  filter: 'blur(40px)',
                  opacity: 0.2,
                  height: '140px',
                  width: '140px',
                  top: '-20px',
                  left: 'calc(50% - 164px)',
                  borderRadius: '24px'
                }}
              ></div>
              <div
                className="absolute z-0"
                style={{
                  background: 'var(--ai-panel-accent-2)',
                  filter: 'blur(40px)',
                  opacity: 0.2,
                  height: '140px',
                  width: '140px',
                  top: '-20px',
                  left: 'calc(50% + 24px)',
                  borderRadius: '24px'
                }}
              ></div>

              <div className="relative z-10 flex flex-col items-center text-center">
                <AIAssistantIcon size="md" className="mb-4" />
                <h1 className="text-2xl lg:text-3xl font-medium text-[var(--dashboard-text-primary)] mb-2">
                  Marketing Email Assistant
                </h1>
              </div>
            </div>

        {/* Main Content */}
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* Main Content - Campaign Builder */}
          <div className="space-y-6">
            {/* Email Content Section - Moved before Recipients */}
            <div className="border-b-2 border-gray-300 pb-6">
              <div className="flex flex-col items-center mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <MailIcon className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Email Content</h3>
                  <button
                    onClick={() => setShowEmailContentDesc(!showEmailContentDesc)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  {showEmailContentDesc && (
                    <span className="text-sm text-gray-600">Create your email content with AI-powered generation</span>
                  )}
                </div>
                <button
                  onClick={() => setIsManualMode(!isManualMode)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                >
                  {isManualMode ? 'Switch to AI Generation' : 'Switch to Manual Input'}
                </button>
              </div>
              
              {!isManualMode ? (
                // AI Generation Settings
                <div className="space-y-4">
                  {/* Business Qualities */}
                  <div>
                    <div className="mb-3">
                      <div className="flex items-center justify-center space-x-2 mb-3">
                        <Label className="text-xs xs:text-xs sm:text-xs md:text-sm font-medium opacity-70">Business Qualities</Label>
                        <button
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="Select the qualities that best represent your business"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {[
                          'Professional Service',
                          'Quality Work',
                          'Reliable & Trustworthy',
                          'Competitive Pricing',
                          'Fast Response Time',
                          'Customer Satisfaction',
                          'Experience & Expertise',
                          'Modern Technology',
                          'Local Business',
                          'Personalized Service',
                          '24/7 Support',
                          'Eco-Friendly'
                        ].map((quality) => (
                          <div
                            key={quality}
                            className={`border rounded-full cursor-pointer transition-colors px-3 py-1 text-center whitespace-nowrap ${
                              aiGenerationSettings.businessQualities.includes(quality)
                                ? theme === 'dark' 
                                  ? 'border-gray-400 bg-white/20'
                                  : 'border-gray-400 bg-gray-200'
                                : theme === 'dark'
                                  ? 'border-white/10 hover:bg-white/10'
                                  : 'border-gray-200/60 hover:bg-gray-100'
                            }`}
                            onClick={() => {
                              if (aiGenerationSettings.businessQualities.includes(quality)) {
                                setAiGenerationSettings(prev => ({
                                  ...prev,
                                  businessQualities: prev.businessQualities.filter(q => q !== quality)
                                }))
                              } else {
                                setAiGenerationSettings(prev => ({
                                  ...prev,
                                  businessQualities: [...prev.businessQualities, quality]
                                }))
                              }
                            }}
                          >
                            <span className={`text-xs font-medium ${
                              theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                            }`}>{quality}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tone Selection */}
                  <div>
                    <div className="mb-3">
                      <div className="flex items-center justify-center space-x-2 mb-3">
                        <Label className="text-xs xs:text-xs sm:text-xs md:text-sm font-medium opacity-70">Email Tone</Label>
                        <button
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="Choose the tone that matches your brand voice"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {[
                          { value: 'professional', label: 'Professional' },
                          { value: 'friendly', label: 'Friendly' },
                          { value: 'casual', label: 'Casual' },
                          { value: 'formal', label: 'Formal' }
                        ].map((tone) => (
                          <label key={tone.value} className="cursor-pointer">
                            <input
                              type="radio"
                              name="tone"
                              value={tone.value}
                              checked={aiGenerationSettings.tone === tone.value}
                              onChange={(e) => setAiGenerationSettings(prev => ({ ...prev, tone: e.target.value as any }))}
                              className="sr-only"
                            />
                            <div className={`border rounded-full px-3 py-1 text-center transition-colors whitespace-nowrap ${
                              aiGenerationSettings.tone === tone.value 
                                ? theme === 'dark' 
                                  ? 'border-gray-400 bg-white/20' 
                                  : 'border-gray-400 bg-gray-200'
                                : theme === 'dark'
                                  ? 'border-white/10 hover:bg-white/10'
                                  : 'border-gray-200/60 hover:bg-gray-100'
                            }`}>
                              <div className={`font-medium text-xs ${
                                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                              }`}>{tone.label}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div>
                    <div className="mb-3">
                      <div className="flex items-center justify-center space-x-2 mb-3">
                        <Label className="text-xs xs:text-xs sm:text-xs md:text-sm font-medium opacity-70">Call to Action</Label>
                        <button
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="What action do you want recipients to take?"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {[
                          { value: 'book_appointment', label: 'Book Appointment' },
                          { value: 'learn_more', label: 'Learn More' },
                          { value: 'contact_us', label: 'Contact Us' },
                          { value: 'custom', label: 'Custom' }
                        ].map((cta) => (
                          <label key={cta.value} className="cursor-pointer">
                            <input
                              type="radio"
                              name="cta"
                              value={cta.value}
                              checked={aiGenerationSettings.callToAction === cta.value}
                              onChange={(e) => setAiGenerationSettings(prev => ({ ...prev, callToAction: e.target.value as any }))}
                              className="sr-only"
                            />
                            <div className={`border rounded-full px-3 py-1 text-center transition-colors whitespace-nowrap ${
                              aiGenerationSettings.callToAction === cta.value 
                                ? theme === 'dark' 
                                  ? 'border-gray-400 bg-white/20' 
                                  : 'border-gray-400 bg-gray-200'
                                : theme === 'dark'
                                  ? 'border-white/10 hover:bg-white/10'
                                  : 'border-gray-200/60 hover:bg-gray-100'
                            }`}>
                              <div className={`font-medium text-xs ${
                                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                              }`}>{cta.label}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Promotion Settings - Separate row */}
                  <div>
                    <div className="mb-3">
                      <div className="flex items-center justify-center space-x-2 mb-3">
                        <Label className="text-xs xs:text-xs sm:text-xs md:text-sm font-medium opacity-70">Include Promotion</Label>
                        <button
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="Add a special offer to encourage engagement"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex flex-col space-y-3 items-center">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={aiGenerationSettings.includePromotion}
                            onChange={(e) => setAiGenerationSettings(prev => ({ ...prev, includePromotion: e.target.checked }))}
                            className="rounded"
                          />
                          <span className="text-sm">Include a promotional offer</span>
                        </div>
                        
                        {aiGenerationSettings.includePromotion && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Type:</span>
                            <Select
                              value={aiGenerationSettings.promotionType}
                              onValueChange={(value) => setAiGenerationSettings(prev => ({ ...prev, promotionType: value }))}
                            >
                              <SelectTrigger className="w-auto min-w-[140px]">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="discount">Percentage Discount</SelectItem>
                                <SelectItem value="fixed_discount">Fixed Amount Discount</SelectItem>
                                <SelectItem value="free_service">Free Service</SelectItem>
                                <SelectItem value="limited_time">Limited Time Offer</SelectItem>
                                <SelectItem value="referral_bonus">Referral Bonus</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <div className="pt-4">
                    <AIActionButton
                      text="Generate Email Content"
                      loadingText="Generating content..."
                      isLoading={isGenerating}
                      disabled={aiGenerationSettings.businessQualities.length === 0}
                      onClick={() => handleGenerateContent('general')}
                      size="lg"
                    />
                  </div>
                </div>
              ) : (
                // Manual Input Fields
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Subject Line *</Label>
                    <Input
                      id="subject"
                      value={campaignData.subject}
                      onChange={(e) => setCampaignData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Enter email subject"
                    />
                  </div>

                  {/* Structured Email Template */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email_title">Email Title *</Label>
                      <Input
                        id="email_title"
                        value={emailTemplate.title}
                        onChange={(e) => setEmailTemplate(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter email title"
                      />
                    </div>

                    <div>
                      <Label htmlFor="image_url">Image URL (Optional)</Label>
                      <Input
                        id="image_url"
                        value={emailTemplate.image_url}
                        onChange={(e) => setEmailTemplate(prev => ({ ...prev, image_url: e.target.value }))}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div>
                      <Label htmlFor="main_text">Main Text *</Label>
                      <Textarea
                        id="main_text"
                        value={emailTemplate.main_text}
                        onChange={(e) => setEmailTemplate(prev => ({ ...prev, main_text: e.target.value }))}
                        placeholder="Enter your main message..."
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="secondary_text">Secondary Text (Optional)</Label>
                      <Textarea
                        id="secondary_text"
                        value={emailTemplate.secondary_text}
                        onChange={(e) => setEmailTemplate(prev => ({ ...prev, secondary_text: e.target.value }))}
                        placeholder="Enter additional information..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="action_button_text">Action Button Text (Optional)</Label>
                        <Input
                          id="action_button_text"
                          value={emailTemplate.action_button_text}
                          onChange={(e) => setEmailTemplate(prev => ({ ...prev, action_button_text: e.target.value }))}
                          placeholder="e.g., Learn More, Book Now"
                        />
                      </div>
                      <div>
                        <Label htmlFor="action_button_url">Action Button URL (Optional)</Label>
                        <Input
                          id="action_button_url"
                          value={emailTemplate.action_button_url}
                          onChange={(e) => setEmailTemplate(prev => ({ ...prev, action_button_url: e.target.value }))}
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Email Preview - Moved from right column */}
            <div className="border-b-2 border-gray-300 pb-6">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Eye className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Email Preview</h3>
              </div>
              
              {/* Email Preview */}
              <Card className="bg-transparent border-0 shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-center text-base font-normal text-gray-600">
                    Email Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {/* Smartphone Frame */}
                  <div className="mx-auto w-full max-w-[320px]">
                    {/* Phone Frame */}
                    <div className="relative bg-black rounded-[12px] p-1 shadow-2xl">
                      {/* Screen */}
                      <div className="bg-white rounded-[8px] overflow-hidden min-h-[500px]">
                        
                        {/* Email App Header */}
                        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">Mail</h3>
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">M</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Email Content */}
                        <div className="p-4 space-y-4">
                          {/* Email Header Info */}
                          <div className="space-y-2 pb-4 border-b border-gray-200">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-gray-600 text-xs font-bold">
                                  {campaignData.from_name ? campaignData.from_name.charAt(0).toUpperCase() : 'S'}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {campaignData.from_name || 'Sender Name'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {campaignData.from_email || 'sender@example.com'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-900">
                                To: {selectedRecipients.length} recipients
                              </p>
                              <p className="text-sm font-semibold text-gray-900">
                                {campaignData.subject || 'No subject'}
                              </p>
                            </div>
                          </div>
                          
                          {/* Email Body */}
                          <div className="space-y-2">
                            {emailTemplate.title && (
                              <h2 className="text-base font-bold text-gray-900 leading-tight">
                                {emailTemplate.title}
                              </h2>
                            )}
                            
                            {emailTemplate.image_url && (
                              <div className="text-center">
                                <img 
                                  src={emailTemplate.image_url} 
                                  alt="Email image" 
                                  className="w-full h-24 object-cover rounded-lg"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              </div>
                            )}
                            
                            {emailTemplate.main_text && (
                              <div className="text-gray-800 text-xs leading-relaxed">
                                {emailTemplate.main_text}
                              </div>
                            )}
                            
                            {emailTemplate.secondary_text && (
                              <div className="text-gray-600 text-xs leading-relaxed pt-1 border-t border-gray-100">
                                {emailTemplate.secondary_text}
                              </div>
                            )}
                            
                            {emailTemplate.action_button_text && emailTemplate.action_button_url && (
                              <div className="text-center pt-2">
                                <a 
                                  href={emailTemplate.action_button_url}
                                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-xs hover:bg-blue-700 transition-colors"
                                >
                                  {emailTemplate.action_button_text}
                                </a>
                              </div>
                            )}
                            
                            {!emailTemplate.title && !emailTemplate.main_text && (
                              <div className="text-gray-400 text-xs text-center py-6">
                                Email content will appear here...
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recipients Selection - Moved after Email Content */}
            <div className="border-b-2 border-gray-300 pb-6">
              <div className="flex flex-col items-center mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <UsersIcon className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Recipients</h3>
                  <button
                    onClick={() => setShowRecipientsDesc(!showRecipientsDesc)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  {showRecipientsDesc && (
                    <span className="text-sm text-gray-600">Choose who will receive your email campaign</span>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex space-x-4">
                    <button 
                      onClick={handleSelectAllRecipients}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                    >
                      Select All
                    </button>
                    <button 
                      onClick={handleClearRecipients}
                      className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedRecipients.length} selected / {getRecipientsForType().length} total
                  </div>
                </div>
              </div>
              
              {/* Recipient Type Selection */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div 
                    className={`border-2 rounded-lg cursor-pointer transition-colors min-h-[60px] flex items-center justify-center ${
                      recipientType === 'past_customers' 
                        ? theme === 'dark' 
                          ? 'ring-2 ring-blue-500 bg-blue-900/20 border-blue-200' 
                          : 'ring-2 ring-blue-500 bg-blue-50 border-blue-200'
                        : theme === 'dark'
                          ? 'border-gray-600 hover:border-gray-500'
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleRecipientTypeChange('past_customers')}
                  >
                    <div className="text-center p-2">
                      <UsersIcon className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                      <p className={`font-semibold text-xs ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                      }`}>Past Customers</p>
                    </div>
                  </div>
                  
                  <div 
                    className={`border-2 rounded-lg cursor-pointer transition-colors min-h-[60px] flex items-center justify-center ${
                      recipientType === 'uncommitted_customers' ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleRecipientTypeChange('uncommitted_customers')}
                  >
                    <div className="text-center p-2">
                      <UsersIcon className="w-4 h-4 mx-auto mb-1 text-orange-600" />
                      <p className={`font-semibold text-xs ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                      }`}>Uncommitted</p>
                    </div>
                  </div>
                  
                  <div 
                    className={`border-2 rounded-lg cursor-pointer transition-colors min-h-[60px] flex items-center justify-center ${
                      recipientType === 'all_customers' ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleRecipientTypeChange('all_customers')}
                  >
                    <div className="text-center p-2">
                      <UsersIcon className="w-4 h-4 mx-auto mb-1 text-green-600" />
                      <p className={`font-semibold text-xs ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                      }`}>All Customers</p>
                    </div>
                  </div>
                  
                  <div 
                    className={`border-2 rounded-lg cursor-pointer transition-colors min-h-[60px] flex items-center justify-center ${
                      recipientType === 'custom' ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleRecipientTypeChange('custom')}
                  >
                    <div className="text-center p-2">
                      <UsersIcon className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                      <p className={`font-semibold text-xs ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                      }`}>Custom Selection</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recipients Summary and Manage Button */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedRecipients.length} recipients selected
                    </p>
                    <p className="text-xs text-gray-600">
                      {recipientType === 'past_customers' && 'Past customers'}
                      {recipientType === 'uncommitted_customers' && 'Uncommitted customers'}
                      {recipientType === 'all_customers' && 'All customers'}
                      {recipientType === 'custom' && 'Custom selection'}
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowRecipientsModal(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <UsersIcon className="w-4 h-4" />
                    <span>Manage Recipients</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* From/Reply To Section - Moved after Email Content */}
            <div className="border-b-2 border-gray-300 pb-6">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <MailIcon className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">From & Reply To</h3>
                <button
                  onClick={() => setShowFromReplyDesc(!showFromReplyDesc)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Info className="w-4 h-4" />
                </button>
                {showFromReplyDesc && (
                  <span className="text-sm text-gray-600">Set the sender information for your campaign</span>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="from_name">From Name *</Label>
                  <Input
                    id="from_name"
                    value={campaignData.from_name}
                    onChange={(e) => setCampaignData(prev => ({ ...prev, from_name: e.target.value }))}
                    placeholder="Sender name"
                  />
                </div>
                <div>
                  <Label htmlFor="from_email">From Email *</Label>
                  <Input
                    id="from_email"
                    type="email"
                    value={campaignData.from_email}
                    onChange={(e) => setCampaignData(prev => ({ ...prev, from_email: e.target.value }))}
                    placeholder="sender@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="reply_to">Reply To (Optional)</Label>
                  <Input
                    id="reply_to"
                    type="email"
                    value={campaignData.reply_to}
                    onChange={(e) => setCampaignData(prev => ({ ...prev, reply_to: e.target.value }))}
                    placeholder="reply@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Schedule Campaign */}
            <div className="border-b-2 border-gray-300 pb-6">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <ClockIcon className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Schedule</h3>
                <button
                  onClick={() => setShowScheduleDesc(!showScheduleDesc)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Info className="w-4 h-4" />
                </button>
                {showScheduleDesc && (
                  <span className="text-sm text-gray-600">Set when to send your campaign</span>
                )}
              </div>
              
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
                
                {showDatePicker && (
                  <div className="absolute top-full left-0 z-50 mt-2 rounded-md border border-gray-300 bg-white shadow-lg">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date) {
                          setSelectedDate(date)
                          setCampaignData(prev => ({ ...prev, scheduled_at: date }))
                          setShowDatePicker(false)
                        }
                      }}
                      initialFocus
                    />
                  </div>
                )}
              </div>
              {selectedDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedDate(undefined)
                    setCampaignData(prev => ({ ...prev, scheduled_at: undefined }))
                  }}
                  className="mt-2"
                >
                  Clear Schedule
                </Button>
              )}
            </div>

            {/* Campaign Name Section - Moved to end */}
            <div className="border-b-2 border-gray-300 pb-6">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <MailIcon className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Campaign Name</h3>
                <button
                  onClick={() => setShowCampaignNameDesc(!showCampaignNameDesc)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Info className="w-4 h-4" />
                </button>
                {showCampaignNameDesc && (
                  <span className="text-sm text-gray-600">Give your campaign a descriptive name</span>
                )}
              </div>
              
              <div>
                <Label htmlFor="campaign_name">Campaign Name *</Label>
                <Input
                  id="campaign_name"
                  value={campaignData.campaign_name}
                  onChange={(e) => setCampaignData(prev => ({ ...prev, campaign_name: e.target.value }))}
                  placeholder="Enter campaign name"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <Button
                onClick={handleSaveCampaign}
                disabled={isSaving}
                variant="outline"
                className="flex-1 h-10 text-sm font-normal rounded-2xl"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={handleSendCampaign}
                disabled={isSending || selectedRecipients.length === 0}
                className="flex-1 h-10 text-sm font-normal bg-green-600 hover:bg-green-700 rounded-2xl"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Campaign
              </Button>
            </div>
          </div>
        </div>

                 {/* AI Generation Confirmation Modal */}
        {showAIGenerationModal && (
          <div className={`fixed inset-0 ${theme === 'dark' ? 'bg-black/50' : 'bg-black/30'} backdrop-blur-sm flex items-center justify-center z-50 p-4`}>
            <div className={`rounded-2xl w-full max-w-md relative overflow-visible p-0`} style={{ background: 'var(--ai-modal-bg-base)', backgroundImage: 'var(--ai-modal-bg-gradient)', minWidth: '360px' }}>
              {/* Accent Color Layers */}
              <div 
                className="absolute z-0"
                style={{
                  background: 'var(--ai-panel-accent-1)',
                  filter: 'blur(40px)',
                  opacity: 0.2,
                  height: '80px',
                  bottom: '-40px',
                  left: '0',
                  width: '50%',
                  borderRadius: '100%'
                }}
              ></div>
              <div 
                className="absolute z-0"
                style={{
                  background: 'var(--ai-panel-accent-2)',
                  filter: 'blur(40px)',
                  opacity: 0.2,
                  height: '80px',
                  bottom: '-40px',
                  right: '0',
                  width: '50%',
                  borderRadius: '100%'
                }}
              ></div>

              <div className="p-6 text-center relative z-10">
                {!isGenerating && (
                  <>
                    <h3 className="text-lg font-medium ai-panel-text mb-4">Confirm AI Generation</h3>
                    <div className="flex justify-center mb-4">
                      <AIAssistantIcon size="md" />
                    </div>
                  </>
                )}

                {isGenerating ? (
                  <div className="relative z-30 mb-2">
                    <div className="w-full h-48 relative rounded-lg overflow-hidden">
                      <LoadingAIGeneration size="lg" text="Generating your AI content..." />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Scrollable Content Container */}
                    <div className="max-h-64 overflow-y-auto mb-2 text-center">
                      {/* Settings Summary */}
                      <div className="mb-4 pb-4 border-b border-white/10">
                        <h4 className="text-sm font-medium ai-panel-text-secondary mb-2">Generation Settings</h4>
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="ai-panel-text-secondary">Business Qualities:</span>
                            <div className="flex flex-wrap gap-1 mt-1 justify-center">
                              {aiGenerationSettings.businessQualities.map((quality) => (
                                <span key={quality} className="px-2 py-0.5 rounded-full border text-[10px] ai-panel-text" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
                                  {quality}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="ai-panel-text-secondary">Tone:</span>
                            <span className="ai-panel-text ml-2 capitalize">{aiGenerationSettings.tone}</span>
                          </div>
                          <div>
                            <span className="ai-panel-text-secondary">Call to Action:</span>
                            <span className="ai-panel-text ml-2 capitalize">{aiGenerationSettings.callToAction.replace('_', ' ')}</span>
                          </div>
                          {aiGenerationSettings.includePromotion && (
                            <div>
                              <span className="ai-panel-text-secondary">Promotion:</span>
                              <span className="ai-panel-text ml-2 capitalize">{aiGenerationSettings.promotionType.replace('_', ' ')}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Credits Summary */}
                      <div className="mb-1 flex justify-center">
                        <AICostCard 
                          creditsRequired={1}
                          creditsRemaining={aiContentGenerationRateLimitStatus.generationsAvailable}
                        />
                      </div>

                      {/* Error */}
                      {generationError && (
                        <div className="mt-3">
                          <div className="text-xs font-medium text-red-300">{generationError}</div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 mt-2">
                      <AIActionButton
                        text="Confirm & Generate"
                        loadingText="Generating..."
                        isLoading={isGenerating}
                        disabled={isGenerating || aiContentGenerationRateLimitStatus.generationsAvailable <= 0}
                        onClick={handleConfirmAIGeneration}
                        size="md"
                      />
                      <button
                        onClick={() => setShowAIGenerationModal(false)}
                        className="text-sm ai-panel-text-secondary hover:ai-panel-text transition-colors underline"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Recipients Modal */}
        <Dialog open={showRecipientsModal} onOpenChange={setShowRecipientsModal}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Manage Recipients</DialogTitle>
              <DialogDescription>
                Select or deselect recipients for your email campaign
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Recipient Type Selection */}
              <div className="flex space-x-2">
                <Button
                  variant={recipientType === 'past_customers' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleRecipientTypeChange('past_customers')}
                >
                  Past Customers ({pastCustomers.length})
                </Button>
                <Button
                  variant={recipientType === 'uncommitted_customers' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleRecipientTypeChange('uncommitted_customers')}
                >
                  Uncommitted ({uncommittedCustomers.length})
                </Button>
                <Button
                  variant={recipientType === 'all_customers' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleRecipientTypeChange('all_customers')}
                >
                  All Customers ({pastCustomers.length + uncommittedCustomers.length + activeCustomers.length})
                </Button>
                <Button
                  variant={recipientType === 'custom' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleRecipientTypeChange('custom')}
                >
                  Custom
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Button onClick={handleSelectAllRecipients} variant="outline" size="sm">
                    Select All
                  </Button>
                  <Button onClick={handleClearRecipients} variant="outline" size="sm">
                    Clear All
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  {selectedRecipients.length} selected / {getRecipientsForType().length} total
                </div>
              </div>

              {/* Recipients List */}
              <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-4">
                {getRecipientsForType().map((customer) => (
                  <div
                    key={customer.id}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedRecipients.includes(customer.id)
                        ? 'bg-blue-50 border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleRecipientSelection(
                      customer.id,
                      !selectedRecipients.includes(customer.id)
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedRecipients.includes(customer.id)}
                        onChange={(e) => handleRecipientSelection(customer.id, e.target.checked)}
                        className="rounded"
                      />
                      <div>
                        <p className="font-medium text-sm">
                          {customer.name_first} {customer.name_last}
                        </p>
                        <p className="text-xs text-gray-600">{customer.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {customer.boards.some((b: any) => b.status === 'completed') ? 'Past' : 
                       customer.boards.some((b: any) => b.status === 'active' || b.status === 'in_progress') ? 'Active' : 'Uncommitted'}
                    </Badge>
                  </div>
                ))}
                
                {getRecipientsForType().length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No customers found for this selection
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowRecipientsModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setShowRecipientsModal(false)}
                >
                  Done ({selectedRecipients.length} selected)
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

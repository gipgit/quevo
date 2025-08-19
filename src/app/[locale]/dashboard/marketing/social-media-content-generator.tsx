'use client'

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useTheme } from "@/contexts/ThemeContext"
import { 
  DocumentDuplicateIcon,
  SparklesIcon,
  CheckIcon,
  BoltIcon,
  UserGroupIcon,
  CalendarIcon,
  CurrencyEuroIcon,
  StarIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  ClockIcon,
  HeartIcon,
  CogIcon,
  LightBulbIcon,
  TruckIcon,
  HomeIcon
} from "@heroicons/react/24/outline"
import { 
  FacebookIcon, 
  InstagramIcon, 
  LinkedInIcon, 
  TwitterIcon, 
  TikTokIcon 
} from "@/components/ui/social-media-icons"

interface ServiceQuestion {
  question_id: number
  question_text: string
  question_type: string
  is_required: boolean | null
}

interface ServiceRequirement {
  requirement_block_id: number
  title: string | null
  requirements_text: string
}

interface ServiceItem {
  service_item_id: number
  item_name: string
  item_description: string | null
  price_base: number | null
  price_type: string
  price_unit: string | null
}

interface Service {
  service_id: number
  service_name: string
  description: string | null
  duration_minutes: number | null
  buffer_minutes: number | null
  price_base: number | null
  price_type: string
  has_items: boolean | null
  date_selection: boolean | null
  quotation_available: boolean | null
  is_active: boolean | null
  display_order: number | null
  servicecategory: {
    category_name: string
  } | null
  servicequestion: ServiceQuestion[]
  servicerequirementblock: ServiceRequirement[]
  serviceitem: ServiceItem[]
}

interface Business {
  business_id: string
  business_name: string
  business_descr: string | null
}

interface SocialMediaContent {
  platform: string
  title: string
  description: string
  hashtags: string[]
  callToAction: string
}

interface SocialMediaContentGeneratorProps {
  business: Business
  services: Service[]
  locale: string
}

const SOCIAL_PLATFORMS = [
  {
    id: 'facebook/instagram',
    name: 'Facebook & Instagram',
    icon: FacebookIcon,
    color: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700',
    borderColor: 'border-blue-600',
    textColor: 'text-blue-600'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: LinkedInIcon,
    color: 'bg-blue-700',
    hoverColor: 'hover:bg-blue-800',
    borderColor: 'border-blue-700',
    textColor: 'text-blue-700'
  },
  {
    id: 'twitter/x',
    name: 'Twitter/X',
    icon: TwitterIcon,
    color: 'bg-black',
    hoverColor: 'hover:bg-gray-800',
    borderColor: 'border-black',
    textColor: 'text-black'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: TikTokIcon,
    color: 'bg-pink-600',
    hoverColor: 'hover:bg-pink-700',
    borderColor: 'border-pink-600',
    textColor: 'text-pink-600'
  }
]

const BUSINESS_QUALITIES = [
  {
    id: 'speed',
    name: 'Speed & Efficiency',
    description: 'Fast service delivery and quick turnaround times',
    icon: BoltIcon,
    color: 'bg-yellow-500',
    hoverColor: 'hover:bg-yellow-600',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-600'
  },
  {
    id: 'assistance',
    name: 'Customer Support',
    description: 'Excellent customer service and support',
    icon: UserGroupIcon,
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-600'
  },
  {
    id: 'bookings',
    name: 'Easy Booking',
    description: 'Simple online booking and appointment system',
    icon: CalendarIcon,
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600',
    borderColor: 'border-green-500',
    textColor: 'text-green-600'
  },
  {
    id: 'prices',
    name: 'Competitive Prices',
    description: 'Affordable rates and great value for money',
    icon: CurrencyEuroIcon,
    color: 'bg-emerald-500',
    hoverColor: 'hover:bg-emerald-600',
    borderColor: 'border-emerald-500',
    textColor: 'text-emerald-600'
  },
  {
    id: 'quality',
    name: 'High Quality',
    description: 'Premium quality work and materials',
    icon: StarIcon,
    color: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-600'
  },
  {
    id: 'experience',
    name: 'Experience',
    description: 'Years of experience and expertise',
    icon: AcademicCapIcon,
    color: 'bg-indigo-500',
    hoverColor: 'hover:bg-indigo-600',
    borderColor: 'border-indigo-500',
    textColor: 'text-indigo-600'
  },
  {
    id: 'reliability',
    name: 'Reliability',
    description: 'Trustworthy and dependable service',
    icon: ShieldCheckIcon,
    color: 'bg-teal-500',
    hoverColor: 'hover:bg-teal-600',
    borderColor: 'border-teal-500',
    textColor: 'text-teal-600'
  },
  {
    id: 'availability',
    name: '24/7 Availability',
    description: 'Round-the-clock service availability',
    icon: ClockIcon,
    color: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-600'
  },
  {
    id: 'care',
    name: 'Personal Care',
    description: 'Personalized attention and care',
    icon: HeartIcon,
    color: 'bg-pink-500',
    hoverColor: 'hover:bg-pink-600',
    borderColor: 'border-pink-500',
    textColor: 'text-pink-600'
  },
  {
    id: 'technology',
    name: 'Modern Technology',
    description: 'Latest technology and innovative solutions',
    icon: CogIcon,
    color: 'bg-gray-500',
    hoverColor: 'hover:bg-gray-600',
    borderColor: 'border-gray-500',
    textColor: 'text-gray-600'
  },
  {
    id: 'innovation',
    name: 'Innovation',
    description: 'Creative and innovative approaches',
    icon: LightBulbIcon,
    color: 'bg-amber-500',
    hoverColor: 'hover:bg-amber-600',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-600'
  },
  {
    id: 'delivery',
    name: 'Fast Delivery',
    description: 'Quick delivery and logistics',
    icon: TruckIcon,
    color: 'bg-red-500',
    hoverColor: 'hover:bg-red-600',
    borderColor: 'border-red-500',
    textColor: 'text-red-600'
  },
  {
    id: 'local',
    name: 'Local Business',
    description: 'Local expertise and community support',
    icon: HomeIcon,
    color: 'bg-lime-500',
    hoverColor: 'hover:bg-lime-600',
    borderColor: 'border-lime-500',
    textColor: 'text-lime-600'
  }
]

export default function SocialMediaContentGenerator({ 
  business, 
  services, 
  locale 
}: SocialMediaContentGeneratorProps) {
  const t = useTranslations("marketing")
  const { theme } = useTheme()
  
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [selectedQualities, setSelectedQualities] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<SocialMediaContent[]>([])
  const [copiedContent, setCopiedContent] = useState<string | null>(null)
  const [rawResponse, setRawResponse] = useState<string>('')

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    )
  }

  const handleQualityToggle = (qualityId: string) => {
    setSelectedQualities(prev => 
      prev.includes(qualityId)
        ? prev.filter(id => id !== qualityId)
        : [...prev, qualityId]
    )
  }

  const handleGenerateContent = async () => {
    if (selectedPlatforms.length === 0) {
      alert('Please select at least one social media platform')
      return
    }

    if (services.length === 0) {
      alert('No services available for content generation')
      return
    }

    setIsGenerating(true)
    
    try {
      const { generateSocialMediaContentAction } = await import('./actions')
      
      const result = await generateSocialMediaContentAction(
        business,
        services,
        selectedPlatforms,
        selectedQualities,
        locale
      )

      if (result.success) {
        setGeneratedContent(result.data)
        setRawResponse(result.rawResponse || '')
        console.log("📄 [handleGenerateContent] Generated content:", result.data)
        console.log("📄 [handleGenerateContent] Raw response length:", result.rawResponse?.length || 0)
      } else {
        alert(`Error: ${result.message}`)
      }
    } catch (error) {
      console.error('Error generating social media content:', error)
      alert('Error generating social media content')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (content: SocialMediaContent) => {
    const fullContent = `${content.title}\n\n${content.description}\n\n${content.hashtags.join(' ')}\n\n${content.callToAction}`
    
    try {
      await navigator.clipboard.writeText(fullContent)
      setCopiedContent(content.platform)
      setTimeout(() => setCopiedContent(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      alert('Failed to copy content')
    }
  }

  const getPlatformConfig = (platformId: string) => {
    return SOCIAL_PLATFORMS.find(p => p.id === platformId) || SOCIAL_PLATFORMS[0]
  }

  const getQualityConfig = (qualityId: string) => {
    return BUSINESS_QUALITIES.find(q => q.id === qualityId) || BUSINESS_QUALITIES[0]
  }

  return (
    <div className="space-y-8">
      {/* Business Qualities Selection */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Select Business Qualities to Highlight
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Choose the qualities that best represent your business. These will be emphasized in the generated content.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {BUSINESS_QUALITIES.map((quality) => {
            const Icon = quality.icon
            const isSelected = selectedQualities.includes(quality.id)
            
            return (
              <button
                key={quality.id}
                onClick={() => handleQualityToggle(quality.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 relative text-left ${
                  isSelected
                    ? `${quality.borderColor} ${quality.color} text-white`
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <Icon className={`w-6 h-6 mt-1 ${isSelected ? 'text-white' : quality.textColor}`} />
                  <div className="flex-1">
                    <div className="font-medium">{quality.name}</div>
                    <div className={`text-xs mt-1 ${isSelected ? 'text-white opacity-90' : 'text-gray-600 dark:text-gray-400'}`}>
                      {quality.description}
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <CheckIcon className="w-5 h-5 absolute top-2 right-2 text-white" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Platform Selection */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Select Social Media Platforms
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SOCIAL_PLATFORMS.map((platform) => {
            const Icon = platform.icon
            const isSelected = selectedPlatforms.includes(platform.id)
            
            return (
              <button
                key={platform.id}
                onClick={() => handlePlatformToggle(platform.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 relative ${
                  isSelected
                    ? `${platform.borderColor} ${platform.color} text-white`
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon platform={platform.id} className="w-6 h-6" />
                  <span className="font-medium">{platform.name}</span>
                </div>
                {isSelected && (
                  <CheckIcon className="w-5 h-5 absolute top-2 right-2" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center">
        <button
          onClick={handleGenerateContent}
          disabled={isGenerating || selectedPlatforms.length === 0}
          className={`flex items-center space-x-3 px-8 py-4 rounded-lg text-white font-semibold text-lg transition-all duration-200 ${
            isGenerating || selectedPlatforms.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 shadow-lg'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Generating Content...</span>
            </>
          ) : (
            <>
              <SparklesIcon className="w-6 h-6" />
              <span>Generate AI Content</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Content */}
      {generatedContent.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Generated Content ({generatedContent.length} platforms)
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {generatedContent.map((content) => {
              const platformConfig = getPlatformConfig(content.platform)
              const Icon = platformConfig.icon
              
              return (
                <div
                  key={content.platform}
                  className={`bg-white dark:bg-gray-800 rounded-lg border-2 ${platformConfig.borderColor} overflow-hidden`}
                >
                  {/* Platform Header */}
                  <div className={`${platformConfig.color} text-white p-4 flex items-center justify-between`}>
                    <div className="flex items-center space-x-3">
                      <Icon platform={content.platform} className="w-6 h-6" />
                      <span className="font-semibold capitalize">
                        {content.platform.replace('/', ' & ')}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(content)}
                      className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg px-3 py-1 transition-colors"
                    >
                      {copiedContent === content.platform ? (
                        <CheckIcon className="w-4 h-4" />
                      ) : (
                        <DocumentDuplicateIcon className="w-4 h-4" />
                      )}
                      <span className="text-sm">
                        {copiedContent === content.platform ? 'Copied!' : 'Copy'}
                      </span>
                    </button>
                  </div>

                  {/* Content Body */}
                  <div className="p-6 space-y-4">
                    {/* Title */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Title
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        {content.title}
                      </p>
                    </div>

                    {/* Description */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Description
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {content.description}
                      </p>
                    </div>

                    {/* Hashtags */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Hashtags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {content.hashtags.map((hashtag, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 rounded-full text-sm ${platformConfig.textColor} bg-gray-100 dark:bg-gray-700`}
                          >
                            {hashtag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Call to Action */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Call to Action
                      </h3>
                      <p className={`font-medium ${platformConfig.textColor}`}>
                        {content.callToAction}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* No Services Warning */}
      {services.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200">
            No services available. Please add some services to your business to generate social media content.
          </p>
        </div>
      )}

      {/* Debug Info */}
      {generatedContent.length === 0 && !isGenerating && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-blue-800 dark:text-blue-200">
            Debug: No content generated yet. Selected platforms: {selectedPlatforms.join(', ')} | Selected qualities: {selectedQualities.join(', ')}
          </p>
        </div>
      )}

      {/* Raw Response Card */}
      {rawResponse && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Raw AI Response
          </h2>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Complete AI Response
              </h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(rawResponse)
                  setCopiedContent('raw')
                  setTimeout(() => setCopiedContent(null), 2000)
                }}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1 transition-colors"
              >
                {copiedContent === 'raw' ? (
                  <CheckIcon className="w-4 h-4" />
                ) : (
                  <DocumentDuplicateIcon className="w-4 h-4" />
                )}
                <span className="text-sm">
                  {copiedContent === 'raw' ? 'Copied!' : 'Copy Raw'}
                </span>
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 p-4 rounded border overflow-x-auto">
              {rawResponse}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

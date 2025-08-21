'use client'

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useTheme } from "@/contexts/ThemeContext"
import AILoading from "@/components/ui/ai-loading"
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
  price_type: string | null
  price_unit: string | null
}

interface Service {
  service_id: string
  service_name: string
  description: string | null
  duration_minutes: number | null
  buffer_minutes: number | null
  price_base: number | null
  price_type: string | null
  has_items: boolean | null
  available_booking: boolean | null
  available_quotation: boolean | null
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
    id: 'facebook',
    name: 'Facebook',
    icon: FacebookIcon,
    color: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700',
    borderColor: 'border-blue-600',
    textColor: 'text-blue-600'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: InstagramIcon,
    color: 'bg-pink-500',
    hoverColor: 'hover:bg-pink-600',
    borderColor: 'border-pink-500',
    textColor: 'text-pink-500'
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
  },
  {
    id: 'certification',
    name: 'Certified & Licensed',
    description: 'Professional certifications and licenses',
    icon: ShieldCheckIcon,
    color: 'bg-cyan-500',
    hoverColor: 'hover:bg-cyan-600',
    borderColor: 'border-cyan-500',
    textColor: 'text-cyan-600'
  },
  {
    id: 'sustainability',
    name: 'Eco-Friendly',
    description: 'Environmentally conscious practices',
    icon: SparklesIcon,
    color: 'bg-green-600',
    hoverColor: 'hover:bg-green-700',
    borderColor: 'border-green-600',
    textColor: 'text-green-700'
  },
  {
    id: 'flexibility',
    name: 'Flexible Solutions',
    description: 'Adaptable and customizable services',
    icon: CogIcon,
    color: 'bg-violet-500',
    hoverColor: 'hover:bg-violet-600',
    borderColor: 'border-violet-500',
    textColor: 'text-violet-600'
  }
]

export default function SocialMediaContentGenerator({ 
  business, 
  services, 
  locale 
}: SocialMediaContentGeneratorProps) {
  const t = useTranslations("marketing")
  const { theme } = useTheme()
  
  // Post types data structure
  const postTypesData = {
    "post_types_by_purpose": [
      {
        "category": "Engaging & Community-Building",
        "description": "These posts are designed to spark conversation, build a sense of community, and foster a relationship with your audience.",
        "posts": [
          {
            "title": "Questions",
            "description": "Simple, open-ended questions that encourage comments and interaction.",
            "examples": [
              "What's the biggest challenge you're facing with [topic] right now?",
              "What's your favorite thing about [industry]?"
            ]
          },
          {
            "title": "Polls",
            "description": "Easy-to-answer questions with multiple-choice options for quick feedback or starting a debate.",
            "examples": [
              "Which new product feature should we launch next?",
              "Are you a morning person or a night owl?"
            ]
          },
          {
            "title": "User-Generated Content (UGC)",
            "description": "Sharing content created by your customers or followers with their permission.",
            "examples": [
              "Tag us in your photos for a chance to be featured!",
              "Customer spotlight: Thanks to [username] for this amazing photo!"
            ]
          }
        ]
      },
      {
        "category": "Informative & Educational",
        "description": "These posts establish your brand as a helpful authority and provide value to your audience.",
        "posts": [
          {
            "title": "Tips & Tricks",
            "description": "Short, actionable advice related to your product, service, or industry.",
            "examples": [
              "3 ways to improve your [skill].",
              "A quick tip to make your [task] easier."
            ]
          },
          {
            "title": "How-To Guides",
            "description": "Step-by-step instructions presented in a video, carousel, or infographic format.",
            "examples": [
              "How to properly use [product].",
              "A step-by-step guide to [process]."
            ]
          },
          {
            "title": "Industry News",
            "description": "Sharing and commenting on relevant news or trends to show you're an industry expert.",
            "examples": [
              "What does the new [legislation] mean for your business?",
              "Our take on the latest [industry] report."
            ]
          }
        ]
      },
      {
        "category": "Promotional & Conversion-Focused",
        "description": "These posts are designed to drive specific actions, like making a purchase or signing up for a newsletter.",
        "posts": [
          {
            "title": "Product/Service Showcases",
            "description": "High-quality photos, videos, or carousels that highlight your products or services.",
            "examples": [
              "Introducing our new [product]!",
              "Learn how [service] can change the way you work."
            ]
          },
          {
            "title": "Testimonials & Reviews",
            "description": "Screenshots or text quotes from satisfied customers to build social proof.",
            "examples": [
              "We love hearing from you! Check out what [customer name] had to say.",
              "Another 5-star review! Thanks for your support."
            ]
          },
          {
            "title": "Exclusive Offers",
            "description": "Promotions, discount codes, or special announcements for your social media followers.",
            "examples": [
              "Use code SOCIAL10 for 10% off your next purchase!",
              "Don't miss our exclusive Flash Sale for followers."
            ]
          }
        ]
      },
      {
        "category": "Relational & Brand-Building",
        "description": "These posts focus on strengthening your brand identity and making a personal connection with your audience.",
        "posts": [
          {
            "title": "Behind-the-Scenes (BTS)",
            "description": "A look at your team, your process, or your company culture to humanize your brand.",
            "examples": [
              "A glimpse into our production process.",
              "Meet the team: This is [employee name], our lead designer!"
            ]
          },
          {
            "title": "Company Milestones",
            "description": "Celebrating anniversaries, awards, or other achievements to build brand pride.",
            "examples": [
              "Happy 5-year anniversary to our amazing company!",
              "We're honored to have won the [award]!"
            ]
          },
          {
            "title": "Live Videos",
            "description": "Hosting live Q&As, product launches, or webinars to interact with your audience in real-time.",
            "examples": [
              "Join us for a live Q&A about our new product.",
              "Going live in 5 minutes to announce a big change!"
            ]
          }
        ]
      }
    ],
    "general_principles": [
      "A successful strategy uses a mix of these post types.",
      "Follow the 80/20 rule: 80% of your content should be value-driven, and 20% should be promotional."
    ]
  }

  const [selectedServices, setSelectedServices] = useState<string[]>(services.map(s => s.service_id.toString()))
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [selectedQualities, setSelectedQualities] = useState<string[]>([])
  const [selectedFrequency, setSelectedFrequency] = useState<string>('optimal')
  const [selectedPostTypes, setSelectedPostTypes] = useState<string[]>(() => {
    // Initialize with all post types selected by default
    const allPostTypes: string[] = []
    postTypesData.post_types_by_purpose.forEach(category => {
      category.posts.forEach(post => {
        allPostTypes.push(post.title)
      })
    })
    return allPostTypes
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<SocialMediaContent[]>([])
  const [copiedContent, setCopiedContent] = useState<string | null>(null)
  const [rawResponse, setRawResponse] = useState<string>('')
  const [showSelections, setShowSelections] = useState(true)
  const [showDebugModal, setShowDebugModal] = useState(false)
  const [tokenUsage, setTokenUsage] = useState<{
    inputTokens: number
    outputTokens: number
    totalTokens: number
    estimatedCost: number
  } | null>(null)

  // Static social media frequency and timing data
  const socialMediaFrequencyData = {
    "social_media_frequency_and_times": [
      {
        "platform": "Facebook",
        "minimal_frequency": {
          "posts_per_week": "3-5",
          "average_posts_per_day": "Less than 1 (on scheduled days)"
        },
        "low_frequency": {
          "posts_per_week": "5-7",
          "average_posts_per_day": "1 (on scheduled days)"
        },
        "medium_frequency": {
          "posts_per_week": "7-10",
          "average_posts_per_day": "1-1.5"
        },
        "high_frequency": {
          "posts_per_week": "10-14",
          "average_posts_per_day": "1.5-2"
        },
        "optimal_frequency": {
          "posts_per_week": "7-14",
          "average_posts_per_day": "1-2"
        },
        "optimal_times": {
          "days": "Weekdays",
          "time_windows": [
            "9:00 AM - 4:00 PM"
          ],
          "best_days": "Tuesday, Wednesday, and Friday"
        }
      },
      {
        "platform": "Instagram",
        "minimal_frequency": {
          "posts_per_week": "2-3",
          "average_posts_per_day": "Less than 1 (on scheduled days)"
        },
        "low_frequency": {
          "posts_per_week": "3-4",
          "average_posts_per_day": "Less than 1 (on scheduled days)"
        },
        "medium_frequency": {
          "posts_per_week": "4-5",
          "average_posts_per_day": "Less than 1 (on scheduled days)"
        },
        "high_frequency": {
          "posts_per_week": "5-7",
          "average_posts_per_day": "1 (on scheduled days)"
        },
        "optimal_frequency": {
          "posts_per_week": "3-5",
          "average_posts_per_day": "Less than 1 (on scheduled days)"
        },
        "optimal_times": {
          "days": "Weekdays",
          "time_windows": [
            "10:00 AM - 3:00 PM"
          ],
          "best_days": "Wednesday and Thursday"
        }
      },
      {
        "platform": "X (formerly Twitter)",
        "minimal_frequency": {
          "posts_per_week": "7-21",
          "average_posts_per_day": "1-3"
        },
        "low_frequency": {
          "posts_per_week": "14-21",
          "average_posts_per_day": "2-3"
        },
        "medium_frequency": {
          "posts_per_week": "21-28",
          "average_posts_per_day": "3-4"
        },
        "high_frequency": {
          "posts_per_week": "28-35",
          "average_posts_per_day": "4-5"
        },
        "optimal_frequency": {
          "posts_per_week": "21-35",
          "average_posts_per_day": "3-5"
        },
        "optimal_times": {
          "days": "Weekdays",
          "time_windows": [
            "9:00 AM - 11:00 AM"
          ],
          "best_days": "Tuesday, Wednesday, and Thursday"
        }
      },
      {
        "platform": "LinkedIn",
        "minimal_frequency": {
          "posts_per_week": "2-3",
          "average_posts_per_day": "Less than 1 (on scheduled days)"
        },
        "low_frequency": {
          "posts_per_week": "3-4",
          "average_posts_per_day": "Less than 1 (on scheduled days)"
        },
        "medium_frequency": {
          "posts_per_week": "4-5",
          "average_posts_per_day": "Less than 1 (on scheduled days)"
        },
        "high_frequency": {
          "posts_per_week": "5-7",
          "average_posts_per_day": "1 (on scheduled days)"
        },
        "optimal_frequency": {
          "posts_per_week": "3-5",
          "average_posts_per_day": "Less than 1 (on scheduled days)"
        },
        "optimal_times": {
          "days": "Weekdays",
          "time_windows": [
            "8:00 AM - 12:00 PM"
          ],
          "best_days": "Tuesday, Wednesday, and Thursday"
        }
      },
      {
        "platform": "TikTok",
        "minimal_frequency": {
          "posts_per_week": "3-5",
          "average_posts_per_day": "Less than 1 (on scheduled days)"
        },
        "low_frequency": {
          "posts_per_week": "5-10",
          "average_posts_per_day": "1-1.5"
        },
        "medium_frequency": {
          "posts_per_week": "10-20",
          "average_posts_per_day": "1.5-3"
        },
        "high_frequency": {
          "posts_per_week": "20-28",
          "average_posts_per_day": "3-4"
        },
        "optimal_frequency": {
          "posts_per_week": "7-28",
          "average_posts_per_day": "1-4"
        },
        "optimal_times": {
          "days": "Varies by day, but generally mid-day and evening",
          "time_windows": [
            "6:00 AM - 10:00 AM",
            "1:00 PM - 5:00 PM",
            "7:00 PM - 10:00 PM"
          ],
          "best_days": "Tuesday and Thursday"
        }
      }
    ],
    "general_principles": [
      "All times are in the user's local time zone, which you should verify with your own analytics.",
      "Quality and consistency are more important than quantity.",
      "Use platform analytics to find your specific audience's optimal times.",
      "The 'best' frequency is the one you can sustain without sacrificing content quality.",
      "The data above is a general guideline; tailor your strategy to your specific audience and business."
    ]
  }

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => {
      const newSelection = prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
      
      // Ensure at least one service is selected
      if (newSelection.length === 0) {
        return [serviceId]
      }
      
      return newSelection
    })
  }

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

    if (selectedServices.length === 0) {
      alert('Please select at least one service')
      return
    }

    if (selectedPostTypes.length === 0) {
      alert('Please select at least one post type')
      return
    }

    setIsGenerating(true)
    
    try {
      const { generateSocialMediaContentAction } = await import('./actions')
      
      // Filter services based on selection
      const filteredServices = services.filter(service => 
        selectedServices.includes(service.service_id.toString())
      )
      
      // Calculate total posts needed based on frequency
      const totalPostsNeeded = calculateTotalPostsNeeded(selectedFrequency, selectedPlatforms)
      
      const result = await generateSocialMediaContentAction(
        business,
        filteredServices,
        selectedPlatforms,
        selectedQualities,
        selectedPostTypes,
        selectedFrequency,
        totalPostsNeeded,
        locale
      )

      if (result.success) {
        console.log("Generated content for", result.data.length, "platforms")
        console.log("AI Response:", result.rawResponse)
        setGeneratedContent(result.data)
        setRawResponse(result.rawResponse || '')
        setTokenUsage(result.tokenUsage || null)
        setShowSelections(false)
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

  const copyToClipboard = async (text: string, identifier?: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedContent(identifier || 'content')
      setTimeout(() => setCopiedContent(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      alert('Failed to copy content')
    }
  }

  const copyFullContent = async (content: SocialMediaContent) => {
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

  // Calculate total posts needed based on frequency and platforms
  const calculateTotalPostsNeeded = (frequency: string, platforms: string[]) => {
    let totalPosts = 0
    
    platforms.forEach(platformId => {
      const platformData = socialMediaFrequencyData.social_media_frequency_and_times.find(
        p => p.platform.toLowerCase() === platformId.toLowerCase()
      )
      
      if (platformData) {
        const frequencyKey = `${frequency}_frequency` as keyof typeof platformData
        const frequencyData = platformData[frequencyKey] as { posts_per_week: string, average_posts_per_day: string }
        
        if (frequencyData) {
          const [minPosts, maxPosts] = frequencyData.posts_per_week.split('-').map(Number)
          const avgPostsPerWeek = Math.round((minPosts + maxPosts) / 2)
          totalPosts += avgPostsPerWeek * 4 // 4 weeks
        }
      }
    })
    
    return totalPosts
  }

  // Database-ready timeline structure
  interface TimelinePost {
    id: string
    platform: string
    postType: string
    title: string
    description: string
    hashtags: string[]
    callToAction: string
    scheduledDate: Date
    scheduledTime: string
    postedFlag: boolean
    createdAt: Date
    updatedAt: Date
  }

  // Post structure for timeline display
  interface TimelineDisplayPost {
    platform: string
    timeRange: string
    timeWindow: string
    platformColor: string
    timelinePost: TimelinePost
  }

  // Function to generate unified 1-month posting timeline
  const generateUnifiedPostingTimeline = (frequency: string) => {
    // Calculate total posts needed for this frequency
    const totalPostsNeeded = calculateTotalPostsNeeded(frequency, selectedPlatforms)
    const timeline = []
    const startDate = new Date()
    
    // Only include selected platforms
    const selectedPlatformData = socialMediaFrequencyData.social_media_frequency_and_times.filter(platformData => 
      selectedPlatforms.includes(platformData.platform.toLowerCase())
    )
    
    // Create a pool of AI-generated content to use
    const contentPool: SocialMediaContent[] = []
    
    // Distribute AI content across platforms
    selectedPlatforms.forEach(platformId => {
      const platformContent = generatedContent.filter(content => 
        content.platform.toLowerCase() === platformId.toLowerCase()
      )
      
      // If we have AI content for this platform, add it to the pool
      if (platformContent.length > 0) {
        contentPool.push(...platformContent)
      }
    })
    
    console.log(`📊 Content pool created with ${contentPool.length} AI-generated posts`)
    console.log(`📊 Expected posts needed: ${totalPostsNeeded}`)
    
    // Generate 4 weeks of posts
    for (let week = 0; week < 4; week++) {
      const weekStart = new Date(startDate)
      weekStart.setDate(startDate.getDate() + (week * 7))
      
      const weekDays: any[] = []
      
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(weekStart)
        currentDate.setDate(weekStart.getDate() + day)
        
        const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
        const isWeekend = dayName === 'saturday' || dayName === 'sunday'
        
        // Get all platforms that should post on this day
        const dayPosts: any[] = []
        
        selectedPlatformData.forEach(platformData => {
          const frequencyKey = `${frequency}_frequency` as keyof typeof platformData
          const frequencyData = platformData[frequencyKey] as { posts_per_week: string, average_posts_per_day: string }
          
          if (!frequencyData) return
          
          const postsPerWeek = frequencyData.posts_per_week
          const [minPosts, maxPosts] = postsPerWeek.split('-').map(Number)
          
          // Calculate if this platform should post on this day
          const bestDays = platformData.optimal_times.best_days.toLowerCase()
          const isGoodDay = bestDays.includes(dayName) || 
                           (!isWeekend && dayName !== 'saturday' && dayName !== 'sunday')
          
          if (isGoodDay) {
            // Determine if this platform posts on this specific day based on frequency
            const postsPerWeekForPlatform = Math.floor(Math.random() * (maxPosts - minPosts + 1)) + minPosts
            const shouldPostToday = Math.random() < (postsPerWeekForPlatform / 7) // Probability based on frequency
            
            if (shouldPostToday) {
              // Generate posting time for this platform
              const timeWindows = platformData.optimal_times.time_windows
              const timeWindow = timeWindows[Math.floor(Math.random() * timeWindows.length)]
              const [startTime, endTime] = timeWindow.split(' - ')
              
              // Generate a 2-hour range with round times
              const [startHour] = startTime.split(':').map(Number)
              const [endHour] = endTime.split(' ')[0].split(':').map(Number)
              
              // Create a 2-hour range starting from a round hour
              const rangeStartHour = Math.floor(Math.random() * (endHour - startHour - 1)) + startHour
              const rangeEndHour = rangeStartHour + 2
              
              const timeRange = `${rangeStartHour}:00 - ${rangeEndHour}:00`
              
              // Find AI-generated content for this specific platform
              const aiContent = contentPool.find(content => 
                content.platform.toLowerCase() === platformData.platform.toLowerCase()
              )
              
              // Remove the used content from pool to prevent duplicates
              if (aiContent) {
                const contentIndex = contentPool.indexOf(aiContent)
                if (contentIndex > -1) {
                  contentPool.splice(contentIndex, 1)
                }
              }
              
              // Create database-ready post structure using AI content if available
              const timelinePost: TimelinePost = {
                id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                platform: platformData.platform,
                postType: selectedPostTypes[Math.floor(Math.random() * selectedPostTypes.length)],
                title: aiContent?.title || `Generated ${platformData.platform} Post`,
                description: aiContent?.description || `This is a sample post for ${platformData.platform}`,
                hashtags: aiContent?.hashtags || [`#${platformData.platform.toLowerCase()}`, '#business', '#marketing'],
                callToAction: aiContent?.callToAction || `Visit our website to learn more!`,
                scheduledDate: currentDate,
                scheduledTime: timeRange,
                postedFlag: false,
                createdAt: new Date(),
                updatedAt: new Date()
              }
              
              dayPosts.push({
                platform: platformData.platform,
                timeRange: timeRange,
                timeWindow: timeWindow,
                platformColor: getPlatformConfig(platformData.platform.toLowerCase()).color,
                timelinePost: timelinePost
              })
            }
          }
        })
        
        // Sort posts by time range for this day
        dayPosts.sort((a, b) => {
          const aStart = parseInt(a.timeRange.split(':')[0])
          const bStart = parseInt(b.timeRange.split(':')[0])
          return aStart - bStart
        })
        
        if (dayPosts.length > 0) {
          weekDays.push({
            date: currentDate,
            dayName: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
            posts: dayPosts
          })
        }
      }
      
      timeline.push({
        week: week + 1,
        days: weekDays
      })
    }
    
    console.log(`📊 Timeline generated with ${timeline.reduce((total, week) => total + week.days.reduce((dayTotal, day) => dayTotal + day.posts.length, 0), 0)} total posts`)
    
    return timeline
  }

  return (
    <div className="space-y-6">
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }
      `}</style>
      {/* Selection Sections - Hidden after generation */}
      {showSelections && !isGenerating && (
        <>
          {/* Service Selection */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Select Services to Include
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 md:gap-4">
              {services.map((service) => {
                const isSelected = selectedServices.includes(service.service_id.toString())
                
                return (
                  <button
                    key={service.service_id}
                    onClick={() => handleServiceToggle(service.service_id.toString())}
                    className={`p-2 md:p-4 rounded-lg border-2 transition-all duration-200 relative text-center ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                        : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="font-medium text-sm md:text-base">{service.service_name}</div>
                    {isSelected && (
                      <CheckIcon className="w-4 h-4 md:w-5 md:h-5 absolute top-1 right-1 md:top-2 md:right-2 text-blue-600 dark:text-blue-400" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 md:gap-4">
              {SOCIAL_PLATFORMS.map((platform) => {
                const Icon = platform.icon
                const isSelected = selectedPlatforms.includes(platform.id)
                
                return (
                  <button
                    key={platform.id}
                    onClick={() => handlePlatformToggle(platform.id)}
                    className={`p-2 md:p-4 rounded-lg border-2 transition-all duration-200 relative ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                        : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <div className={`p-1.5 md:p-2 rounded-full ${isSelected ? 'bg-blue-600' : platform.color}`}>
                        <Icon platform={platform.id} className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </div>
                      <span className="font-medium text-sm md:text-base">{platform.name}</span>
                    </div>
                    {isSelected && (
                      <CheckIcon className="w-4 h-4 md:w-5 md:h-5 absolute top-1 right-1 md:top-2 md:right-2 text-blue-600 dark:text-blue-400" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

      {/* Business Qualities Selection */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Select Business Qualities to Highlight
        </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4">
          {BUSINESS_QUALITIES.map((quality) => {
            const Icon = quality.icon
            const isSelected = selectedQualities.includes(quality.id)
            
            return (
              <button
                key={quality.id}
                onClick={() => handleQualityToggle(quality.id)}
                    className={`group p-2 md:p-4 rounded-lg border-2 transition-all duration-200 relative ${
                  isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                    title={quality.description}
                  >
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <Icon className={`w-5 h-5 md:w-6 md:h-6 ${isSelected ? 'text-blue-600 dark:text-blue-400' : quality.textColor}`} />
                      <div className="font-medium text-xs md:text-sm">{quality.name}</div>
                    </div>
                {isSelected && (
                      <CheckIcon className="w-4 h-4 md:w-5 md:h-5 absolute top-1 right-1 md:top-2 md:right-2 text-blue-600 dark:text-blue-400" />
                )}
              </button>
            )
          })}
                  </div>
                </div>

       {/* Post Types Selection */}
       <div>
         <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
           Select Types of Posts to Include
         </h2>
         <div className="space-y-2">
           {postTypesData.post_types_by_purpose.map((category, categoryIndex) => (
             <div key={categoryIndex} className="space-y-3">
               <div className="bg-gray-50 dark:bg-gray-700 rounded-lg">
                 <p 
                   className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-2 cursor-help"
                   title={category.description}
                 >
                   {category.category}
                 </p>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                   {category.posts.map((post, postIndex) => {
                     const isSelected = selectedPostTypes.includes(post.title)
                     
                     return (
                       <button
                         key={postIndex}
                         onClick={() => {
                           setSelectedPostTypes(prev => {
                             const newSelection = prev.includes(post.title)
                               ? prev.filter(type => type !== post.title)
                               : [...prev, post.title]
                             
                             // Ensure at least one post type is selected
                             if (newSelection.length === 0) {
                               return [post.title]
                             }
                             
                             return newSelection
                           })
                         }}
                         className={`p-3 rounded-lg border-2 transition-all duration-200 text-left relative ${
                           isSelected
                             ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                             : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                         }`}
                         title={post.description}
                       >
                         <div className="font-medium text-sm">{post.title}</div>
                {isSelected && (
                           <CheckIcon className="w-4 h-4 absolute top-2 right-2 text-blue-600 dark:text-blue-400" />
                )}
              </button>
            )
          })}
                 </div>
               </div>
             </div>
           ))}
        </div>
      </div>

       {/* Posting Frequency Selection */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Select Posting Frequency
        </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 md:gap-4">
              {[
                { id: 'minimal', name: 'Minimal', description: 'Conservative approach', color: 'bg-red-500', textColor: 'text-red-600' },
                { id: 'low', name: 'Low', description: 'Light engagement', color: 'bg-orange-500', textColor: 'text-orange-600' },
                { id: 'medium', name: 'Medium', description: 'Balanced approach', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
                { id: 'high', name: 'High', description: 'Active engagement', color: 'bg-green-500', textColor: 'text-green-600' },
                { id: 'optimal', name: 'Optimal', description: 'Maximum engagement', color: 'bg-blue-500', textColor: 'text-blue-600' }
              ].map((frequency) => {
                const isSelected = selectedFrequency === frequency.id
            
            return (
              <button
                    key={frequency.id}
                    onClick={() => setSelectedFrequency(frequency.id)}
                    className={`p-2 md:p-4 rounded-lg border-2 transition-all duration-200 relative text-center ${
                  isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                    title={frequency.description}
                  >
                    <div className="flex flex-col items-center space-y-1 md:space-y-2">
                      <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full ${isSelected ? 'bg-blue-600' : frequency.color}`}></div>
                      <div className="font-medium text-xs md:text-sm">{frequency.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{frequency.description}</div>
                </div>
                {isSelected && (
                      <CheckIcon className="w-4 h-4 md:w-5 md:h-5 absolute top-1 right-1 md:top-2 md:right-2 text-blue-600 dark:text-blue-400" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex flex-col items-center space-y-4">
        <button
          onClick={handleGenerateContent}
              disabled={isGenerating || selectedPlatforms.length === 0 || selectedServices.length === 0}
              className={`flex items-center space-x-3 px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all duration-200 shadow-lg ${
                isGenerating || selectedPlatforms.length === 0 || selectedServices.length === 0
                  ? 'bg-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 transform hover:scale-105 hover:shadow-xl'
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
                  <span>Generate AI ✨</span>
            </>
          )}
        </button>
        
        {/* Token Usage Estimation */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-2">
          <div className="flex items-center justify-center space-x-4">
            <span>Estimated tokens: ~{Math.round((business.business_name.length + (business.business_descr?.length || 0) + selectedServices.length * 200 + selectedPlatforms.length * 100 + selectedQualities.length * 50 + selectedPostTypes.length * 30) / 3.5)}</span>
            <span>•</span>
            <span>Cost: ~${((Math.round((business.business_name.length + (business.business_descr?.length || 0) + selectedServices.length * 200 + selectedPlatforms.length * 100 + selectedQualities.length * 50 + selectedPostTypes.length * 30) / 3.5) / 1000000) * 0.00015).toFixed(6)}</span>
          </div>
        </div>
      </div>
        </>
      )}

      {/* AI Loading State */}
      {isGenerating && (
        <AILoading 
          title="AI is Generating Your Content"
          subtitle="Creating unique posts and building your timeline"
          showPostCount={true}
          postCount={calculateTotalPostsNeeded(selectedFrequency, selectedPlatforms)}
        />
      )}

      {/* Compact Parameters Bar - Shown after generation */}
      {!showSelections && !isGenerating && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">Services:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedServices.length} selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">Platforms:</span>
                                 <div className="flex items-center space-x-1">
                   {selectedPlatforms.map((platformId) => {
                     const platform = SOCIAL_PLATFORMS.find(p => p.id === platformId)
                     const Icon = platform?.icon
                     if (!Icon) return null
                     return (
                       <div key={platformId} className={`p-1 rounded-full ${platform?.color || 'bg-gray-500'}`}>
                         <Icon platform={platformId} className="w-3 h-3 text-white" />
                       </div>
                     )
                   })}
                 </div>
              </div>
                             <div className="flex items-center space-x-2">
                 <span className="text-gray-500 dark:text-gray-400">Qualities:</span>
                 <span className="font-medium text-gray-900 dark:text-gray-100">
                   {selectedQualities.length} selected
                 </span>
               </div>
                               <div className="flex items-center space-x-2">
                  <span className="text-gray-500 dark:text-gray-400">Post Types:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {selectedPostTypes.length} selected
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500 dark:text-gray-400">Frequency:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                    {selectedFrequency}
                  </span>
                </div>
            </div>
            <button
              onClick={() => setShowSelections(true)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors"
            >
              Change Selections
            </button>
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

             {/* Social Media Frequency & Timing Suggestions */}
      {generatedContent.length > 0 && (
        <div className="space-y-6">
           {/* Unified Posting Timeline */}
           <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in-up">
             <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 text-gray-900 dark:text-gray-100 p-4">
               <h3 className="text-lg font-semibold">
                 📅 Unified 1-Month Posting Timeline ({selectedFrequency} frequency)
               </h3>
             </div>
             
             <div className="p-6">
               <div className="relative">
                 {/* Timeline Line */}
                 <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
                 
                 <div className="space-y-8">
                   {generateUnifiedPostingTimeline(selectedFrequency).map((week, weekIndex) => (
                     <div key={weekIndex} className="space-y-6">
                       <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2 ml-16">
                         Week {week.week}
                       </h4>
                       
                       {week.days.map((day, dayIndex) => (
                         <div key={dayIndex} className="relative">
                           {/* Timeline Dot */}
                           <div className="absolute left-6 top-6 w-4 h-4 bg-blue-500 rounded-full border-4 border-white dark:border-gray-800 shadow-lg z-10"></div>
                           
                           {/* Day Content */}
                           <div className="ml-16 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
                               <h5 className="font-medium text-gray-900 dark:text-gray-100 text-lg">
                                 {day.dayName}, {day.date.toLocaleDateString('en-US', { 
                                   month: 'short', 
                                   day: 'numeric' 
                                 })}
                               </h5>
                               <span className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-600 px-3 py-1 rounded-full">
                                 {day.posts.length} post{day.posts.length !== 1 ? 's' : ''}
                               </span>
                             </div>
                             
                             {/* Post Cards Grid */}
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                               {day.posts.map((post: TimelineDisplayPost, postIndex: number) => {
                                 const platformConfig = getPlatformConfig(post.platform.toLowerCase())
              const Icon = platformConfig.icon
                                 
                                 // Use the database-ready timeline post structure
                                 const timelinePost = post.timelinePost
              
              return (
                <div
                                     key={postIndex}
                                     className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Platform Header */}
                                     <div className="bg-black text-white p-3 flex items-center justify-between">
                                       <div className="flex items-center space-x-2">
                                         <div className={`p-1.5 rounded-full ${platformConfig.color}`}>
                                           <Icon platform={post.platform.toLowerCase()} className="w-4 h-4 text-white" />
                                         </div>
                                         <div>
                                           <span className="font-semibold capitalize text-sm">
                                             {post.platform}
                      </span>
                                           <div className="text-xs text-gray-300">
                                             {post.timeRange}
                                           </div>
                                         </div>
                    </div>
                    <button
                                         onClick={() => copyFullContent(timelinePost)}
                                         className="flex items-center space-x-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded px-2 py-1 transition-colors"
                    >
                                         {copiedContent === timelinePost.platform ? (
                                           <CheckIcon className="w-3 h-3" />
                      ) : (
                                           <DocumentDuplicateIcon className="w-3 h-3" />
                      )}
                                         <span className="text-xs">
                                           {copiedContent === timelinePost.platform ? 'Copied!' : 'Copy'}
                      </span>
                    </button>
                  </div>

                  {/* Content Body */}
                                     <div className="p-3 space-y-2">
                                                           {/* Title */}
                                       <div>
                                         <div className="flex items-center space-x-2 mb-1">
                                           <h3 className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                                             Title
                                           </h3>
                                           <button
                                             onClick={() => copyToClipboard(timelinePost.title, `${timelinePost.platform}-title`)}
                                             className="flex items-center space-x-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded px-1.5 py-0.5 transition-colors"
                                           >
                                             {copiedContent === `${timelinePost.platform}-title` ? (
                                               <CheckIcon className="w-2.5 h-2.5 text-green-600" />
                                             ) : (
                                               <DocumentDuplicateIcon className="w-2.5 h-2.5 text-gray-600 dark:text-gray-400" />
                                             )}
                                             <span className="text-gray-600 dark:text-gray-400 text-xs">
                                               {copiedContent === `${timelinePost.platform}-title` ? 'Copied!' : 'Copy'}
                                             </span>
                                           </button>
                                         </div>
                                         <p className="text-gray-700 dark:text-gray-300 font-bold text-sm">
                                           {timelinePost.title}
                      </p>
                    </div>

                                                           {/* Description */}
                                       <div>
                                         <div className="flex items-center space-x-2 mb-1">
                                           <h3 className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                                             Description
                                           </h3>
                                           <button
                                             onClick={() => copyToClipboard(timelinePost.description, `${timelinePost.platform}-description`)}
                                             className="flex items-center space-x-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded px-1.5 py-0.5 transition-colors"
                                           >
                                             {copiedContent === `${timelinePost.platform}-description` ? (
                                               <CheckIcon className="w-2.5 h-2.5 text-green-600" />
                                             ) : (
                                               <DocumentDuplicateIcon className="w-2.5 h-2.5 text-gray-600 dark:text-gray-400" />
                                             )}
                                             <span className="text-gray-600 dark:text-gray-400 text-xs">
                                               {copiedContent === `${timelinePost.platform}-description` ? 'Copied!' : 'Copy'}
                                             </span>
                                           </button>
                                         </div>
                                         <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-xs">
                                           {timelinePost.description}
                      </p>
                    </div>

                                                           {/* Hashtags */}
                                       <div>
                                         <div className="flex items-center space-x-2 mb-1">
                                           <h3 className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                                             Hashtags
                                           </h3>
                                           <button
                                             onClick={() => copyToClipboard(timelinePost.hashtags.join(' '), `${timelinePost.platform}-hashtags`)}
                                             className="flex items-center space-x-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded px-1.5 py-0.5 transition-colors"
                                           >
                                             {copiedContent === `${timelinePost.platform}-hashtags` ? (
                                               <CheckIcon className="w-2.5 h-2.5 text-green-600" />
                                             ) : (
                                               <DocumentDuplicateIcon className="w-2.5 h-2.5 text-gray-600 dark:text-gray-400" />
                                             )}
                                             <span className="text-gray-600 dark:text-gray-400 text-xs">
                                               {copiedContent === `${timelinePost.platform}-hashtags` ? 'Copied!' : 'Copy'}
                                             </span>
                                           </button>
                                         </div>
                                         <div className="flex flex-wrap gap-1">
                                           {timelinePost.hashtags.map((hashtag: string, index: number) => (
                          <span
                            key={index}
                                               className="px-1.5 py-0.5 rounded-full text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700"
                          >
                            {hashtag}
                          </span>
                        ))}
                      </div>
                    </div>

                                                           {/* Call to Action */}
                                       <div>
                                         <div className="flex items-center space-x-2 mb-1">
                                           <h3 className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                                             Call to Action
                                           </h3>
                                           <button
                                             onClick={() => copyToClipboard(timelinePost.callToAction, `${timelinePost.platform}-cta`)}
                                             className="flex items-center space-x-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded px-1.5 py-0.5 transition-colors"
                                           >
                                             {copiedContent === `${timelinePost.platform}-cta` ? (
                                               <CheckIcon className="w-2.5 h-2.5 text-green-600" />
                                             ) : (
                                               <DocumentDuplicateIcon className="w-2.5 h-2.5 text-gray-600 dark:text-gray-400" />
                                             )}
                                             <span className="text-gray-600 dark:text-gray-400 text-xs">
                                               {copiedContent === `${timelinePost.platform}-cta` ? 'Copied!' : 'Copy'}
                                             </span>
                                           </button>
                                         </div>
                                         <p className="font-medium text-gray-700 dark:text-gray-300 text-xs">
                                           {timelinePost.callToAction}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
                             </div>
                           </div>
                         </div>
                       ))}
                     </div>
                   ))}
                 </div>
               </div>
             </div>
           </div>

           <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
             📅 Posting Frequency & Timing Guide
           </h2>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {socialMediaFrequencyData.social_media_frequency_and_times
               .filter(platformData => selectedPlatforms.includes(platformData.platform.toLowerCase()))
               .map((platformData, index) => {
               const platformConfig = getPlatformConfig(platformData.platform.toLowerCase())
               const Icon = platformConfig.icon
               
               return (
                 <div
                   key={platformData.platform}
                   className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in-up"
                   style={{
                     animationDelay: `${(index + generatedContent.length) * 150}ms`,
                     animationFillMode: 'both'
                   }}
                 >
                   {/* Platform Header */}
                   <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-4 flex items-center justify-between">
                     <div className="flex items-center space-x-3">
                       <div className={`p-2 rounded-full ${platformConfig.color}`}>
                         <Icon platform={platformData.platform.toLowerCase()} className="w-5 h-5 text-white" />
                       </div>
                       <span className="font-semibold capitalize">
                         {platformData.platform}
                       </span>
                     </div>
                   </div>

                   {/* Content */}
                   <div className="p-6 space-y-6">
                                          {/* Frequency Section */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                          📊 Posting Frequency
                        </h3>
                        <div className="space-y-3">
                                                    {/* Frequency Strength Bar */}
                           <div className="relative">
                             <div className="h-3 bg-gradient-to-r from-red-400 via-orange-400 via-yellow-400 via-green-400 to-blue-500 rounded-full overflow-hidden mb-3">
                               <div className="h-full w-full flex">
                                 <div className="flex-1 bg-red-400"></div>
                                 <div className="flex-1 bg-orange-400"></div>
                                 <div className="flex-1 bg-yellow-400"></div>
                                 <div className="flex-1 bg-green-400"></div>
                                 <div className="flex-1 bg-blue-500"></div>
                               </div>
                             </div>
                           </div>
                           
                           {/* Frequency Values Row */}
                           <div className="flex items-center justify-between text-xs">
                             <div className="text-center">
                               <div className="w-3 h-3 bg-red-400 rounded-full mx-auto mb-1"></div>
                               <div className="font-medium text-red-700 dark:text-red-300">Minimal</div>
                               <div className="text-gray-600 dark:text-gray-400">
                                 {platformData.minimal_frequency.posts_per_week} week
                               </div>
                             </div>
                             <div className="text-center">
                               <div className="w-3 h-3 bg-orange-400 rounded-full mx-auto mb-1"></div>
                               <div className="font-medium text-orange-700 dark:text-orange-300">Low</div>
                               <div className="text-gray-600 dark:text-gray-400">
                                 {platformData.low_frequency.posts_per_week} week
                               </div>
                             </div>
                             <div className="text-center">
                               <div className="w-3 h-3 bg-yellow-400 rounded-full mx-auto mb-1"></div>
                               <div className="font-medium text-yellow-700 dark:text-yellow-300">Medium</div>
                               <div className="text-gray-600 dark:text-gray-400">
                                 {platformData.medium_frequency.posts_per_week} week
                               </div>
                             </div>
                             <div className="text-center">
                               <div className="w-3 h-3 bg-green-400 rounded-full mx-auto mb-1"></div>
                               <div className="font-medium text-green-700 dark:text-green-300">High</div>
                               <div className="text-gray-600 dark:text-gray-400">
                                 {platformData.high_frequency.posts_per_week} week
                               </div>
                             </div>
                             <div className="text-center">
                               <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-1"></div>
                               <div className="font-medium text-blue-700 dark:text-blue-300">Optimal</div>
                               <div className="text-gray-600 dark:text-gray-400">
                                 {platformData.optimal_frequency.posts_per_week} week
                               </div>
                             </div>
                           </div>
                        </div>
                      </div>

                                          {/* Timing Section */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                          ⏰ Optimal Posting Times
                        </h3>
                        <div className="flex items-center justify-between text-xs">
                          <div className="text-center">
                            <div className="w-3 h-3 bg-purple-400 rounded-full mx-auto mb-1"></div>
                            <div className="font-medium text-purple-700 dark:text-purple-300">Best Days</div>
                            <div className="text-gray-600 dark:text-gray-400">
                              {platformData.optimal_times.best_days}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="w-3 h-3 bg-orange-400 rounded-full mx-auto mb-1"></div>
                            <div className="font-medium text-orange-700 dark:text-orange-300">Time Windows</div>
                            <div className="text-gray-600 dark:text-gray-400">
                              {platformData.optimal_times.time_windows.join(', ')}
                            </div>
                          </div>
                        </div>
                      </div>

                     
                   </div>
                 </div>
               )
             })}
                      </div>

            {/* General Principles */}
           <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-6">
             <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
               💡 General Principles
             </h3>
             <ul className="space-y-2">
               {socialMediaFrequencyData.general_principles.map((principle, index) => (
                 <li key={index} className="flex items-start space-x-2">
                   <span className="text-blue-500 dark:text-blue-400 mt-1">•</span>
                   <span className="text-sm text-gray-700 dark:text-gray-300">
                     {principle}
                   </span>
                 </li>
               ))}
             </ul>
          </div>
        </div>
      )}

             {/* No Services Selected Warning */}
       {services.length > 0 && selectedServices.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200">
             Please select at least one service to include in the content generation.
          </p>
        </div>
      )}

       {/* Debug Link */}
       {rawResponse && (
         <div className="mt-6 text-center">
           <button
             onClick={() => setShowDebugModal(true)}
             className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
           >
             View Raw AI Response (Debug)
           </button>
        </div>
      )}

      {/* Token Usage Summary */}
      {tokenUsage && (
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            💰 Token Usage & Cost Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {tokenUsage.inputTokens.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Input Tokens
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {tokenUsage.outputTokens.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Output Tokens
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {tokenUsage.totalTokens.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Total Tokens
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                ${tokenUsage.estimatedCost.toFixed(6)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Estimated Cost
              </div>
            </div>
          </div>
          <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
            Based on GPT-4o-mini pricing: $0.15 per 1M input tokens, $0.60 per 1M output tokens
          </div>
        </div>
      )}

       {/* Debug Modal */}
       {showDebugModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
             <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
               <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Raw AI Response
              </h3>
              <button
                 onClick={() => setShowDebugModal(false)}
                 className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
               >
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
              </button>
            </div>
             <div className="p-4 overflow-auto max-h-[calc(80vh-80px)]">
               <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
              {rawResponse}
            </pre>
             </div>
          </div>
        </div>
      )}
               
    </div>
  )
}



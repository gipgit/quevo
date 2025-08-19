'use server'

import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { Decimal } from "@prisma/client/runtime/library"

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
  price_base: Decimal
  price_type: string
  price_unit: string | null
}

interface Service {
  service_id: number
  service_name: string
  description: string | null
  duration_minutes: number | null
  buffer_minutes: number | null
  price_base: Decimal | null
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

function formatServicesForPrompt(business: Business, services: Service[]): string {
  if (!business || services.length === 0) {
    return "No services available for this business."
  }

  let text = `Business Name: ${business.business_name}\n\n`
  text += `Business Description: ${business.business_descr || "No description available"}\n\n`
  text += "Services:\n\n"

  services.forEach((service, index) => {
    text += `${index + 1}. ${service.service_name}\n`
    
    if (service.description) {
      text += `   Description: ${service.description}\n`
    }
    
    // Only include price for fixed price types
    if (service.price_base !== null && service.price_type === 'fixed') {
      text += `   Price: €${service.price_base}\n`
    }
    
    // Include price type information
    text += `   Price Type: ${service.price_type}\n`
    
    // Include booking and quotation availability
    if (service.date_selection) {
      text += `   Bookable: Yes (customers can book appointments online)\n`
    }
    
    // Include quotation availability
    if (service.quotation_available) {
      text += `   Quotation Available: Yes (customers can get online quotes)\n`
    } else {
      text += `   Quotation Available: No\n`
    }
    
    if (service.servicecategory?.category_name) {
      text += `   Category: ${service.servicecategory.category_name}\n`
    }

    // Add service items
    if (service.serviceitem.length > 0) {
      text += `   Items included:\n`
      service.serviceitem.forEach(item => {
        text += `     - ${item.item_name}`
        if (item.item_description) {
          text += `: ${item.item_description}`
        }
        // Only include price for fixed price items
        if (item.price_type === 'fixed' && item.price_base) {
          text += ` (€${item.price_base})`
        }
        text += `\n`
      })
    }

    text += "\n"
  })

  return text
}

// Helper function to get quality descriptions
function getQualityDescriptions(qualities: string[]): string {
  const qualityMap: { [key: string]: string } = {
    'speed': 'Speed & Efficiency - Fast service delivery and quick turnaround times',
    'assistance': 'Customer Support - Excellent customer service and support',
    'bookings': 'Easy Booking - Simple online booking and appointment system',
    'prices': 'Competitive Prices - Affordable rates and great value for money',
    'quality': 'High Quality - Premium quality work and materials',
    'experience': 'Experience - Years of experience and expertise',
    'reliability': 'Reliability - Trustworthy and dependable service',
    'availability': '24/7 Availability - Round-the-clock service availability',
    'care': 'Personal Care - Personalized attention and care',
    'technology': 'Modern Technology - Latest technology and innovative solutions',
    'innovation': 'Innovation - Creative and innovative approaches',
    'delivery': 'Fast Delivery - Quick delivery and logistics',
    'local': 'Local Business - Local expertise and community support'
  }
  
  if (qualities.length === 0) {
    return 'Focus on general service quality and customer satisfaction'
  }
  
  return qualities.map(quality => qualityMap[quality] || quality).join(', ')
}

// Helper function to get language name from locale
function getLocaleLanguage(locale: string): string {
  const languageMap: { [key: string]: string } = {
    'en': 'English',
    'it': 'Italian',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'pt': 'Portuguese',
    'nl': 'Dutch',
    'pl': 'Polish',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'tr': 'Turkish',
    'sv': 'Swedish',
    'da': 'Danish',
    'no': 'Norwegian',
    'fi': 'Finnish',
    'cs': 'Czech',
    'hu': 'Hungarian',
    'ro': 'Romanian',
    'bg': 'Bulgarian',
    'hr': 'Croatian',
    'sk': 'Slovak',
    'sl': 'Slovenian',
    'et': 'Estonian',
    'lv': 'Latvian',
    'lt': 'Lithuanian',
    'mt': 'Maltese',
    'el': 'Greek',
    'he': 'Hebrew',
    'th': 'Thai',
    'vi': 'Vietnamese',
    'id': 'Indonesian',
    'ms': 'Malay',
    'tl': 'Filipino',
    'bn': 'Bengali',
    'ur': 'Urdu',
    'fa': 'Persian',
    'uk': 'Ukrainian',
    'be': 'Belarusian',
    'ka': 'Georgian',
    'hy': 'Armenian',
    'az': 'Azerbaijani',
    'kk': 'Kazakh',
    'ky': 'Kyrgyz',
    'uz': 'Uzbek',
    'tg': 'Tajik',
    'mn': 'Mongolian',
    'ne': 'Nepali',
    'si': 'Sinhala',
    'my': 'Burmese',
    'km': 'Khmer',
    'lo': 'Lao',
    'gl': 'Galician',
    'eu': 'Basque',
    'ca': 'Catalan',
    'cy': 'Welsh',
    'ga': 'Irish',
    'gd': 'Scottish Gaelic',
    'kw': 'Cornish',
    'br': 'Breton',
    'is': 'Icelandic',
    'fo': 'Faroese',
    'sq': 'Albanian',
    'mk': 'Macedonian',
    'sr': 'Serbian',
    'bs': 'Bosnian',
    'me': 'Montenegrin'
  }
  
  return languageMap[locale] || 'English'
}

export async function generateSocialMediaContent(
  business: Business, 
  services: Service[], 
  platforms: string[],
  qualities: string[],
  locale: string = 'en'
): Promise<{ content: SocialMediaContent[], rawResponse: string }> {
  console.log("🤖 [generateSocialMediaContent] Starting OpenAI API call...")
  console.log("📊 [generateSocialMediaContent] Input data:", {
    businessName: business.business_name,
    servicesCount: services.length,
    platforms: platforms,
    qualities: qualities,
    locale: locale
  })
  
  try {
    // Format the data into text strings
    console.log("🔧 [generateSocialMediaContent] Formatting data for prompt...")
    const servicesText = formatServicesForPrompt(business, services)
    
    console.log("📝 [generateSocialMediaContent] Formatted data lengths:", {
      servicesTextLength: servicesText.length
    })
    
         // Get locale-specific language instruction and quality descriptions
     const localeLanguage = getLocaleLanguage(locale)
     const qualityDescriptions = getQualityDescriptions(qualities)
     
     // Construct the prompt
     const prompt = `Based on the following business information and services, generate engaging social media content for the specified platforms.

IMPORTANT: Generate all content in ${localeLanguage} language.

 BUSINESS INFORMATION:
 ${servicesText}
 
 BUSINESS QUALITIES TO HIGHLIGHT: ${qualityDescriptions}
 
 PLATFORMS TO GENERATE CONTENT FOR: ${platforms.join(', ')}

Please generate content for each platform with the following specifications:

1. FACEBOOK/INSTAGRAM: 
   - Engaging title (max 60 characters)
   - Compelling description (150-200 words)
   - Relevant hashtags (5-8 hashtags)
   - Clear call-to-action

2. LINKEDIN:
   - Professional title (max 60 characters)
   - Business-focused description (200-250 words)
   - Professional hashtags (3-5 hashtags)
   - Professional call-to-action

3. TWITTER/X:
   - Concise title (max 50 characters)
   - Brief description (max 280 characters)
   - Trending hashtags (3-5 hashtags)
   - Short call-to-action

4. TIKTOK:
   - Catchy title (max 50 characters)
   - Trendy description (100-150 words)
   - Viral hashtags (5-8 hashtags)
   - Engaging call-to-action

 IMPORTANT GUIDELINES:
 - Generate ALL content in ${localeLanguage} language
 - Only mention prices for services with fixed pricing
 - Emphasize online booking convenience for bookable services
 - Highlight instant quotation availability where applicable
 - Make content engaging and platform-appropriate
 - Include relevant hashtags for each platform
 - Add clear call-to-action suggestions
 - Promote all services, not just specific ones
 - SPECIALLY EMPHASIZE the selected business qualities: ${qualityDescriptions}
 - Make sure the content reflects and highlights these specific qualities throughout

Format the response exactly as follows:

**FACEBOOK/INSTAGRAM:**
**TITLE:** [title]
**DESCRIPTION:** [description]
**HASHTAGS:** [hashtags separated by spaces]
**CALL-TO-ACTION:** [call to action]

**LINKEDIN:**
**TITLE:** [title]
**DESCRIPTION:** [description]
**HASHTAGS:** [hashtags separated by spaces]
**CALL-TO-ACTION:** [call to action]

**TWITTER/X:**
**TITLE:** [title]
**DESCRIPTION:** [description]
**HASHTAGS:** [hashtags separated by spaces]
**CALL-TO-ACTION:** [call to action]

**TIKTOK:**
**TITLE:** [title]
**DESCRIPTION:** [description]
**HASHTAGS:** [hashtags separated by spaces]
**CALL-TO-ACTION:** [call to action]`

    // Call the AI model using the Vercel AI SDK
    console.log("🚀 [generateSocialMediaContent] Making OpenAI API call with gpt-4o-mini...")
    console.log("📄 [generateSocialMediaContent] Prompt length:", prompt.length, "characters")
    
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: prompt,
    })

    console.log("✅ [generateSocialMediaContent] OpenAI API response received")
    console.log("📄 [generateSocialMediaContent] Response length:", result.text.length, "characters")
    console.log("📄 [generateSocialMediaContent] Raw response:", result.text)

    // Parse the response to extract content for each platform
    console.log("🔧 [generateSocialMediaContent] Parsing OpenAI response...")
    const content = result.text
    
    const socialMediaContent: SocialMediaContent[] = []
    
         // Parse each platform's content - only for selected platforms
     const platformsToParse = platforms.map(p => {
       if (p === 'facebook/instagram') return 'FACEBOOK/INSTAGRAM'
       if (p === 'twitter/x') return 'TWITTER/X'
       return p.toUpperCase()
     })
     
     platformsToParse.forEach(platform => {
       // Create a more flexible regex that handles the actual AI response format
       const platformSection = content.match(new RegExp(`\\*\\*${platform}:\\*\\*([\\s\\S]*?)(?=\\*\\*[A-Z]|$)`, 'i'))
       
                        if (platformSection) {
          const sectionContent = platformSection[1]
          console.log(`🔍 [generateSocialMediaContent] Raw section content for ${platform}:`, sectionContent.substring(0, 200) + '...')
          
          // Extract title - more flexible pattern
          const titleMatch = sectionContent.match(/\*\*TITLE:\*\*\s*([^\n]+)/i)
          const title = titleMatch ? titleMatch[1].trim() : ''
          
          // Extract description - more flexible pattern
          const descriptionMatch = sectionContent.match(/\*\*DESCRIPTION:\*\*\s*([\s\S]*?)(?=\*\*HASHTAGS:\*\*|$)/i)
          const description = descriptionMatch ? descriptionMatch[1].trim() : ''
          
          // Extract hashtags - more flexible pattern
          const hashtagsMatch = sectionContent.match(/\*\*HASHTAGS:\*\*\s*([^\n]+)/i)
          const hashtags = hashtagsMatch ? hashtagsMatch[1].trim().split(/\s+/).filter(tag => tag.startsWith('#')) : []
          
          // Extract call to action - more flexible pattern
          const callToActionMatch = sectionContent.match(/\*\*CALL-TO-ACTION:\*\*\s*([^\n]+)/i)
          const callToAction = callToActionMatch ? callToActionMatch[1].trim() : ''
        
        // Map platform names to match the component's expected format
        let platformId = platform.toLowerCase()
        if (platform === 'FACEBOOK/INSTAGRAM') {
          platformId = 'facebook/instagram'
        } else if (platform === 'TWITTER/X') {
          platformId = 'twitter/x'
        }
        
        socialMediaContent.push({
          platform: platformId,
          title,
          description,
          hashtags,
          callToAction
        })
        
                           console.log(`✅ [generateSocialMediaContent] Parsed ${platform}:`, {
            title: title.substring(0, 50) + '...',
            descriptionLength: description.length,
            hashtagsCount: hashtags.length,
            callToAction: callToAction.substring(0, 50) + '...',
            sectionContentLength: sectionContent.length,
            titleMatch: !!titleMatch,
            descriptionMatch: !!descriptionMatch,
            hashtagsMatch: !!hashtagsMatch,
            callToActionMatch: !!callToActionMatch,
            titleRaw: titleMatch ? titleMatch[0] : 'NO MATCH',
            descriptionRaw: descriptionMatch ? descriptionMatch[0].substring(0, 100) + '...' : 'NO MATCH',
            hashtagsRaw: hashtagsMatch ? hashtagsMatch[0] : 'NO MATCH',
            callToActionRaw: callToActionMatch ? callToActionMatch[0] : 'NO MATCH'
          })
      } else {
        console.log(`❌ [generateSocialMediaContent] Failed to parse ${platform}`)
      }
    })

    console.log("📧 [generateSocialMediaContent] Extracted social media content:", {
      platformsGenerated: socialMediaContent.length,
      platforms: socialMediaContent.map(content => content.platform)
    })

    console.log("✅ [generateSocialMediaContent] Successfully generated social media content")
    
    return {
      content: socialMediaContent,
      rawResponse: result.text
    }
  } catch (error) {
    console.error("❌ [generateSocialMediaContent] Error:", error)
    console.error('Error generating social media content:', error)
    throw new Error('Failed to generate social media content')
  }
}

export async function generateMarketingContent(business: Business, services: Service[]) {
  try {
    // Format the services data into a text string
    const servicesText = formatServicesForPrompt(business, services)
    
    // Construct the prompt
    const prompt = `Based on the following business information and services, generate marketing content:

${servicesText}

Please generate:
1. An engaging email marketing content (200-300 words)
2. A social media post title and description for platforms like Facebook/Instagram

Make the content engaging, professional, and focused on the value these services provide to customers. The content should be in the same language as the business name and description.

Format the response as:
EMAIL:
[email content here]

SOCIAL MEDIA TITLE:
[post title here]

SOCIAL MEDIA DESCRIPTION:
[post description here]`

    // Call the AI model using the Vercel AI SDK
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: prompt,
    })

    // Parse the response to extract email and social media content
    const content = result.text
    const emailMatch = content.match(/EMAIL:\s*([\s\S]*?)(?=SOCIAL MEDIA TITLE:|$)/i)
    const titleMatch = content.match(/SOCIAL MEDIA TITLE:\s*([\s\S]*?)(?=SOCIAL MEDIA DESCRIPTION:|$)/i)
    const descriptionMatch = content.match(/SOCIAL MEDIA DESCRIPTION:\s*([\s\S]*?)$/i)

    return {
      emailContent: emailMatch ? emailMatch[1].trim() : content,
      socialMediaTitle: titleMatch ? titleMatch[1].trim() : '',
      socialMediaDescription: descriptionMatch ? descriptionMatch[1].trim() : '',
      servicesText: servicesText
    }
  } catch (error) {
    console.error('Error generating marketing content:', error)
    throw new Error('Failed to generate marketing content')
  }
}

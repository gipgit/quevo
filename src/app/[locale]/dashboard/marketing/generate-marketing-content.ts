'use server'

import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { Decimal } from "@prisma/client/runtime/library"
import { calculateTokenUsageAndCost } from './token-utils'

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
  price_type: string | null
  price_unit: string | null
}

interface Service {
  service_id: string
  service_name: string
  description: string | null
  duration_minutes: number | null
  buffer_minutes: number | null
  price_base: Decimal | null
  price_type: string | null
  has_items: boolean | null
  active_booking: boolean | null
  active_quotation: boolean | null
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
    text += `   Price Type: ${service.price_type || 'Not specified'}\n`
    
    // Include booking and quotation availability
    if (service.active_booking) {
      text += `   Bookable: Yes (customers can book appointments online)\n`
    }
    
    // Include quotation availability
    if (service.active_quotation) {
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
    'local': 'Local Business - Local expertise and community support',
    'certification': 'Certified & Licensed - Professional certifications and licenses',
    'sustainability': 'Eco-Friendly - Environmentally conscious practices',
    'flexibility': 'Flexible Solutions - Adaptable and customizable services'
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
  postTypes: string[],
  frequency: string,
  totalPostsNeeded: number,
  locale: string = 'en'
): Promise<{ content: SocialMediaContent[], rawResponse: string, tokenUsage: { inputTokens: number; outputTokens: number; totalTokens: number; estimatedCost: number } }> {
  // Filter out any legacy facebook/instagram entries and ensure unique platforms
  const filteredPlatforms = platforms.filter(p => p !== 'facebook/instagram')
  const uniquePlatforms = Array.from(new Set(filteredPlatforms))
  
  console.log("📱 Generating content for platforms:", uniquePlatforms)
  console.log("📊 Total posts needed:", totalPostsNeeded)
  console.log("📝 Post types:", postTypes)
  console.log("⏰ Frequency:", frequency)
  
  try {
    // Format the data into text strings
    const servicesText = formatServicesForPrompt(business, services)
    
         // Get locale-specific language instruction and quality descriptions
     const localeLanguage = getLocaleLanguage(locale)
     const qualityDescriptions = getQualityDescriptions(qualities)
     
     // Build platform-specific specifications based on selected platforms
     const platformSpecs = uniquePlatforms.map(platform => {
       const specs: { [key: string]: string } = {
         'facebook': '1. FACEBOOK:\n   - Engaging title (max 60 characters)\n   - Compelling description (150-200 words)\n   - Relevant hashtags (5-8 hashtags)\n   - Clear call-to-action',
         'instagram': '2. INSTAGRAM:\n   - Visual-focused title (max 60 characters)\n   - Engaging description (150-200 words)\n   - Trendy hashtags (5-8 hashtags)\n   - Creative call-to-action',
         'linkedin': '3. LINKEDIN:\n   - Professional title (max 60 characters)\n   - Business-focused description (200-250 words)\n   - Professional hashtags (3-5 hashtags)\n   - Professional call-to-action',
         'twitter/x': '4. TWITTER/X:\n   - Concise title (max 50 characters)\n   - Brief description (max 280 characters)\n   - Trending hashtags (3-5 hashtags)\n   - Short call-to-action',
         'tiktok': '5. TIKTOK:\n   - Catchy title (max 50 characters)\n   - Trendy description (100-150 words)\n   - Viral hashtags (5-8 hashtags)\n   - Engaging call-to-action'
       }
       return specs[platform] || ''
     }).filter(spec => spec !== '').join('\n\n')

                       // Build JSON response format for structured parsing
       const responseFormat = `CRITICAL: You MUST generate EXACTLY ${totalPostsNeeded} posts - no more, no less.

RESPOND WITH EXACTLY ${totalPostsNeeded} POSTS IN THIS JSON FORMAT:

{
  "posts": [
    {
      "platform": "platform_name",
      "postType": "post_type_name", 
      "title": "post title",
      "description": "post description",
      "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
      "callToAction": "call to action text"
    }
  ]
}

MANDATORY RULES (YOU MUST FOLLOW THESE):
- Generate EXACTLY ${totalPostsNeeded} posts total - this is a hard requirement
- Distribute posts evenly across platforms: ${uniquePlatforms.join(', ')}
- Include each post type at least once: ${postTypes.join(', ')}
- Each post must have a unique combination of platform + postType
- Use only the selected platforms: ${uniquePlatforms.join(', ')}
- Use only the selected post types: ${postTypes.join(', ')}
- DO NOT include hashtags in the description field - hashtags should ONLY be in the hashtags array
- Keep descriptions clean and hashtag-free
- The JSON must contain exactly ${totalPostsNeeded} posts in the "posts" array`
     
           // Construct the prompt
      const prompt = `CRITICAL REQUIREMENT: You MUST generate EXACTLY ${totalPostsNeeded} social media posts - no more, no less.

Based on the following business information and services, generate EXACTLY ${totalPostsNeeded} engaging social media posts for the specified platforms.

IMPORTANT: Generate all content in ${localeLanguage} language.

 BUSINESS INFORMATION:
 ${servicesText}
 
 BUSINESS QUALITIES TO HIGHLIGHT: ${qualityDescriptions}
 
 PLATFORMS TO GENERATE CONTENT FOR: ${uniquePlatforms.join(', ')}

 POST TYPES TO INCLUDE: ${postTypes.join(', ')}

 POSTING FREQUENCY: ${frequency} (${totalPostsNeeded} total posts needed)

Please generate ${totalPostsNeeded} posts ONLY for the selected platforms above with the following specifications:

     console.log("🤖 Full AI Prompt:")
     console.log(prompt)

${platformSpecs}

   CRITICAL GUIDELINES:
  - Generate ALL content in ${localeLanguage} language
  - Create EXACTLY ${totalPostsNeeded} unique posts total - this is mandatory
  - Ensure each selected post type is represented in the content
  - Distribute posts evenly across selected platforms
 - Only mention prices for services with fixed pricing
 - Emphasize online booking convenience for bookable services
 - Highlight instant quotation availability where applicable
 - Make content engaging and platform-appropriate
 - Include relevant hashtags for each platform
 - Add clear call-to-action suggestions
 - Promote all services, not just specific ones
 - SPECIALLY EMPHASIZE the selected business qualities: ${qualityDescriptions}
 - Make sure the content reflects and highlights these specific qualities throughout
 - Vary the content style based on post types (questions, tips, showcases, etc.)

 Format the response exactly as follows:

 ${responseFormat}

 FINAL REMINDER: You MUST generate EXACTLY ${totalPostsNeeded} posts in the JSON response.
 CRITICAL: Respond with ONLY valid JSON. No additional text before or after the JSON.
 NOTE: If you cannot generate ${totalPostsNeeded} posts due to output limitations, generate as many as possible and clearly indicate the limitation.`

         // Call the AI model using the Vercel AI SDK

    // Call the AI model using the Vercel AI SDK
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: prompt,
    })

    const content = result.text
    console.log("🤖 Raw AI Response:")
    console.log(content)
    
    const socialMediaContent: SocialMediaContent[] = []
    
    try {
      // Try to parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const jsonResponse = JSON.parse(jsonMatch[0])
        
        if (jsonResponse.posts && Array.isArray(jsonResponse.posts)) {
          console.log(`📊 Parsed ${jsonResponse.posts.length} posts from JSON`)
          
          jsonResponse.posts.forEach((post: any, index: number) => {
            if (post.platform && post.title && post.description) {
              socialMediaContent.push({
                platform: post.platform.toLowerCase(),
                title: post.title,
                description: post.description,
                hashtags: Array.isArray(post.hashtags) ? post.hashtags : [],
                callToAction: post.callToAction || ''
              })
            }
          })
        }
      }
      
      // If JSON parsing failed, fall back to old format
      if (socialMediaContent.length === 0) {
        console.log("⚠️ JSON parsing failed, falling back to old format")
        
        uniquePlatforms.forEach(platform => {
          const platformName = platform === 'twitter/x' ? 'TWITTER/X' : platform.toUpperCase()
          const sectionStart = `===${platformName}===`
          const sectionEnd = '===END==='
          
          const startIndex = content.indexOf(sectionStart)
          if (startIndex !== -1) {
            const endIndex = content.indexOf(sectionEnd, startIndex)
            if (endIndex !== -1) {
              const sectionContent = content.substring(startIndex + sectionStart.length, endIndex).trim()
              
              const titleMatch = sectionContent.match(/TITLE:\s*(.+?)(?=\n|$)/i)
              const descriptionMatch = sectionContent.match(/DESCRIPTION:\s*([\s\S]*?)(?=\nHASHTAGS:|$)/i)
              const hashtagsMatch = sectionContent.match(/HASHTAGS:\s*(.+?)(?=\n|$)/i)
              const callToActionMatch = sectionContent.match(/CALL-TO-ACTION:\s*(.+?)(?=\n|$)/i)
              
              const title = titleMatch ? titleMatch[1].trim() : ''
              const description = descriptionMatch ? descriptionMatch[1].trim() : ''
              const hashtags = hashtagsMatch ? hashtagsMatch[1].trim().split(/\s+/).filter(tag => tag.startsWith('#')) : []
              const callToAction = callToActionMatch ? callToActionMatch[1].trim() : ''
            
              if (title || description) {
                socialMediaContent.push({
                  platform: platform,
                  title,
                  description,
                  hashtags,
                  callToAction
                })
              }
            }
          }
        })
      }
    } catch (error) {
      console.error("❌ Error parsing AI response:", error)
      throw new Error('Failed to parse AI response')
    }

         console.log("✅ Generated content for", socialMediaContent.length, "platforms")
     
     // Validate that we got the exact number of posts requested
     if (socialMediaContent.length !== totalPostsNeeded) {
       console.log(`⚠️ Warning: Generated ${socialMediaContent.length} posts but requested ${totalPostsNeeded}`)
       console.log("📊 This might be due to AI output limitations or not following the exact count requirement")
       console.log("💡 Consider using a higher-tier model like GPT-4o for larger post counts")
     }
     
     // Calculate token usage and cost
     const tokenUsage = calculateTokenUsageAndCost(prompt, result.text)
     
     return {
       content: socialMediaContent,
       rawResponse: result.text,
       tokenUsage
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
2. A social media post title and description for platforms like Facebook and Instagram

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



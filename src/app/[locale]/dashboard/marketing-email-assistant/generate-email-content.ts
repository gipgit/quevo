'use server'

import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { AIContentGenerationRateLimiter } from '@/lib/ai-content-generation-rate-limit'
import prisma from '@/lib/prisma'

interface AIGenerationSettings {
  businessQualities: string[]
  includePromotion: boolean
  promotionType: string
  tone: 'professional' | 'friendly' | 'casual' | 'formal'
  callToAction: 'book_appointment' | 'learn_more' | 'contact_us' | 'custom'
}

interface BusinessInfo {
  business_id: string
  business_name: string
  business_descr: string | null
}

export async function generateMarketingEmailContent(
  recipientType: string,
  locale: string,
  aiSettings: AIGenerationSettings,
  business: BusinessInfo
) {
  try {
    // Check rate limit - using checkAndConsumeToken instead of checkRateLimit
    const rateLimitCheck = await AIContentGenerationRateLimiter.checkAndConsumeToken(business.business_id, 1) // Assuming planId 1 for now
    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        error: rateLimitCheck.errorMessage || 'Rate limit exceeded'
      }
    }

    // Fetch business services from database
    const businessServices = await prisma.service.findMany({
      where: {
        business_id: business.business_id,
        is_active: true
      },
      select: {
        service_name: true,
        description: true,
        price_base: true,
        price_type: true
      },
      orderBy: {
        display_order: 'asc'
      }
    })

    // Build the prompt based on settings
    const prompt = buildEmailPrompt(recipientType, locale, aiSettings, business, businessServices)
    
    // Log the prompt being sent
    console.log('=== AI GENERATION PROMPT ===')
    console.log(prompt)
    console.log('=== END PROMPT ===')

    const result = await generateText({
      model: openai('gpt-4o-mini'),
      prompt,
      temperature: 0.7,
    })

    // Log the raw response received
    console.log('=== AI GENERATION RAW RESPONSE ===')
    console.log(result.text)
    console.log('=== END RAW RESPONSE ===')

    if (!result.text) {
      return {
        success: false,
        error: 'Failed to generate content'
      }
    }

    // Parse the response
    const parsedContent = parseGeneratedContent(result.text, business)

    // Note: Rate limiting is already handled by checkAndConsumeToken above
    // No need for separate logGeneration call

    return {
      success: true,
      data: parsedContent
    }
  } catch (error) {
    console.error('Error generating email content:', error)
    return {
      success: false,
      error: 'Failed to generate email content'
    }
  }
}

function buildEmailPrompt(
  recipientType: string,
  locale: string,
  aiSettings: AIGenerationSettings,
  business: BusinessInfo,
  businessServices: { service_name: string; description: string | null; price_base: any; price_type: string | null }[]
): string {
  const qualities = aiSettings.businessQualities.join(', ')
  const tone = aiSettings.tone
  const cta = aiSettings.callToAction
  const hasPromotion = aiSettings.includePromotion
  const promotionType = aiSettings.promotionType

  let recipientContext = ''
  switch (recipientType) {
    case 'past_customers':
      recipientContext = 'These are past customers who have used your services before. The email should focus on re-engagement, showing appreciation for their previous business, and encouraging them to return.'
      break
    case 'uncommitted_customers':
      recipientContext = 'These are potential customers who have shown interest but haven\'t committed yet. The email should focus on building trust, addressing concerns, and providing compelling reasons to choose your services.'
      break
    case 'all_customers':
      recipientContext = 'This is a general email to all customers. The email should be inclusive and relevant to both past and potential customers.'
      break
    default:
      recipientContext = 'This is a general marketing email to customers.'
  }

  // Build services section
  const servicesSection = businessServices.length > 0 ? `
Available Services:
${businessServices.map(service => {
  const price = service.price_base ? ` (${service.price_type === 'fixed' ? `$${service.price_base}` : `${service.price_base}%`})` : ''
  return `- ${service.service_name}${price}${service.description ? `: ${service.description}` : ''}`
}).join('\n')}
` : ''

  // Only include promotion if explicitly requested
  const promotionSection = hasPromotion ? `
Include a promotional offer of type: ${promotionType}
- Make the promotion compelling and time-sensitive
- Clearly state the value proposition
- Include terms and conditions if applicable
- DO NOT create promotions unless this section is present
` : 'DO NOT include any promotional offers or discounts in this email.'

  const ctaSection = `
Call to Action: ${cta.replace('_', ' ')}
- Make the CTA clear and actionable
- Use appropriate button text
- Include a sense of urgency if applicable
`

  return `You are an expert marketing copywriter creating an email campaign for a business. 

Business Information:
- Name: ${business.business_name}
- Description: ${business.business_descr || 'Professional service business'}
- Business Qualities to Emphasize: ${qualities}

${servicesSection}

Email Requirements:
- Tone: ${tone} (${getToneDescription(tone)})
- Target Audience: ${recipientContext}
- Language: ${locale === 'it' ? 'Italian' : 'English'}
- Content Length: Keep the main body text between 50-100 words maximum
- Subject Line: Maximum 60 characters

${promotionSection}

${ctaSection}

Please generate:
1. A compelling subject line (max 60 characters)
2. An engaging email title/headline (max 8 words)
3. Main email content (50-100 words maximum, 1-2 short paragraphs)
4. Secondary content if needed (optional, max 30 words)
5. Appropriate call-to-action button text and URL suggestion

Format your response as JSON:
{
  "subject": "Subject line here",
  "title": "Email title here", 
  "body": "Main email content here",
  "actionButtonText": "Button text here",
  "actionButtonUrl": "suggested-url-here"
}

Make the content engaging, professional, and tailored to the specified tone and business qualities. Keep the main text concise and impactful.`
}

function getToneDescription(tone: string): string {
  switch (tone) {
    case 'professional':
      return 'Formal, business-like, trustworthy'
    case 'friendly':
      return 'Warm, approachable, personable'
    case 'casual':
      return 'Relaxed, informal, conversational'
    case 'formal':
      return 'Very formal, official, authoritative'
    default:
      return 'Professional and engaging'
  }
}

function parseGeneratedContent(text: string, business: BusinessInfo): any {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        subject: parsed.subject || '',
        body: parsed.body || '',
        title: parsed.title || '',
        actionButtonText: parsed.actionButtonText || 'Learn More',
        actionButtonUrl: parsed.actionButtonUrl || ''
      }
    }

    // Fallback: parse manually if JSON extraction fails
    const lines = text.split('\n')
    const result: any = {
      subject: '',
      body: '',
      title: '',
      actionButtonText: 'Learn More',
      actionButtonUrl: ''
    }

    let currentSection = ''
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.toLowerCase().includes('subject:')) {
        result.subject = trimmed.split(':')[1]?.trim() || ''
      } else if (trimmed.toLowerCase().includes('title:')) {
        result.title = trimmed.split(':')[1]?.trim() || ''
      } else if (trimmed.toLowerCase().includes('body:') || trimmed.toLowerCase().includes('content:')) {
        currentSection = 'body'
      } else if (trimmed.toLowerCase().includes('button:') || trimmed.toLowerCase().includes('cta:')) {
        currentSection = 'button'
      } else if (trimmed && currentSection === 'body') {
        result.body += (result.body ? '\n' : '') + trimmed
      } else if (trimmed && currentSection === 'button') {
        result.actionButtonText = trimmed
      }
    }

    return result
  } catch (error) {
    console.error('Error parsing generated content:', error)
    return {
      subject: 'Special Offer from ' + (business?.business_name || 'Our Business'),
      body: text,
      title: 'Special Offer',
      actionButtonText: 'Learn More',
      actionButtonUrl: ''
    }
  }
}

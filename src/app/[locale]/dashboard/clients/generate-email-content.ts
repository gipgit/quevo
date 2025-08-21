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
    if (service.available_booking) {
      text += `   Bookable: Yes (customers can book appointments online)\n`
    }
    
    // Include quotation availability
    if (service.available_quotation) {
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



export async function generateEmailContent(
  business: Business, 
  services: Service[],
  locale: string = 'en'
) {
  console.log("🤖 [generateEmailContent] Starting OpenAI API call...")
  console.log("📊 [generateEmailContent] Input data:", {
    businessName: business.business_name,
    servicesCount: services.length,
    locale: locale
  })
  
  try {
    // Format the data into text strings
    console.log("🔧 [generateEmailContent] Formatting data for prompt...")
    const servicesText = formatServicesForPrompt(business, services)
    
    console.log("📝 [generateEmailContent] Formatted data lengths:", {
      servicesTextLength: servicesText.length
    })
    
    // Get locale-specific language instruction
    const localeLanguage = getLocaleLanguage(locale)
    
    // Construct the prompt
    const prompt = `Based on the following business information and services, generate personalized email content for re-engagement campaigns.

IMPORTANT: Generate all content in ${localeLanguage} language.

BUSINESS INFORMATION:
${servicesText}

Please generate two separate email campaigns:

1. FOR PAST CUSTOMERS: Create an email that promotes all your services to customers who have used your services before. The tone should be warm, appreciative of their previous business, and highlight all the services you offer. If services are bookable online, emphasize the convenience of online booking. If quotation is available, mention the ability to get instant quotes.

2. FOR UNCOMMITTED CUSTOMERS: Create an email that promotes all your services to customers who showed interest but didn't complete their requests. The tone should be helpful, non-pushy, and showcase all the services you offer. Emphasize the ease of completing their request online if the service is bookable or if they can get a quotation.

IMPORTANT GUIDELINES:
- Generate ALL content in ${localeLanguage} language
- Use "Dear [Customer Name]" as a placeholder for personalization
- Only mention prices for services with fixed pricing
- Emphasize online booking convenience for bookable services
- Highlight instant quotation availability where applicable
- Keep subject lines under 60 characters
- Make email bodies 200-300 words
- Include clear call-to-action suggestions
- Promote all services, not just specific ones

Format the response exactly as follows:

**PAST CUSTOMERS EMAIL:**

**SUBJECT:** [subject line]

**BODY:**
[email body]

**Call-to-action suggestions:**
- [suggestion 1]
- [suggestion 2]

---

**UNCOMMITTED CUSTOMERS EMAIL:**

**SUBJECT:** [subject line]

**BODY:**
[email body]

**Call-to-action suggestions:**
- [suggestion 1]
- [suggestion 2]`

    // Call the AI model using the Vercel AI SDK
    console.log("🚀 [generateEmailContent] Making OpenAI API call with gpt-4o-mini...")
    console.log("📄 [generateEmailContent] Prompt length:", prompt.length, "characters")
    
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: prompt,
    })

    console.log("✅ [generateEmailContent] OpenAI API response received")
    console.log("📄 [generateEmailContent] Response length:", result.text.length, "characters")
    console.log("📄 [generateEmailContent] Raw response:", result.text)

    // Parse the response to extract email content
    console.log("🔧 [generateEmailContent] Parsing OpenAI response...")
    const content = result.text
    
    // Updated regex patterns to match the new format with ** markers
    const pastEmailMatch = content.match(/\*\*PAST CUSTOMERS EMAIL:\*\*\s*\n\s*\*\*SUBJECT:\*\*\s*(.*?)\s*\n\s*\*\*BODY:\*\*\s*\n([\s\S]*?)(?=\*\*Call-to-action suggestions:\*\*|$)/i)
    const uncommittedEmailMatch = content.match(/\*\*UNCOMMITTED CUSTOMERS EMAIL:\*\*\s*\n\s*\*\*SUBJECT:\*\*\s*(.*?)\s*\n\s*\*\*BODY:\*\*\s*\n([\s\S]*?)(?=\*\*Call-to-action suggestions:\*\*|$)/i)

    console.log("🔍 [generateEmailContent] Regex matches:", {
      pastEmailMatch: !!pastEmailMatch,
      uncommittedEmailMatch: !!uncommittedEmailMatch
    })

    // Extract subject and body for past customers
    let pastSubject = ''
    let pastBody = ''
    if (pastEmailMatch) {
      pastSubject = pastEmailMatch[1].trim()
      pastBody = pastEmailMatch[2].trim()
    }

    // Extract subject and body for uncommitted customers
    let uncommittedSubject = ''
    let uncommittedBody = ''
    if (uncommittedEmailMatch) {
      uncommittedSubject = uncommittedEmailMatch[1].trim()
      uncommittedBody = uncommittedEmailMatch[2].trim()
    }

    console.log("📧 [generateEmailContent] Extracted email content:", {
      pastSubject: pastSubject.substring(0, 50) + "...",
      pastBody: pastBody.substring(0, 100) + "...",
      uncommittedSubject: uncommittedSubject.substring(0, 50) + "...",
      uncommittedBody: uncommittedBody.substring(0, 100) + "..."
    })

    console.log("✅ [generateEmailContent] Successfully generated email content")
    
    return {
      pastCustomersEmail: {
        subject: pastSubject,
        body: pastBody
      },
      uncommittedCustomersEmail: {
        subject: uncommittedSubject,
        body: uncommittedBody
      },
      servicesText: servicesText
    }
  } catch (error) {
    console.error("❌ [generateEmailContent] Error:", error)
    console.error('Error generating email content:', error)
    throw new Error('Failed to generate email content')
  }
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

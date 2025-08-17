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
  has_items: boolean | null
  date_selection: boolean | null
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
    
    if (service.price_base !== null) {
      text += `   Price: €${service.price_base}\n`
    }
    
    if (service.duration_minutes) {
      text += `   Duration: ${service.duration_minutes} minutes\n`
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
        if (item.price_base) {
          text += ` (€${item.price_base})`
        }
        text += `\n`
      })
    }

    // Add questions
    if (service.servicequestion.length > 0) {
      text += `   Questions asked to clients:\n`
      service.servicequestion.forEach(question => {
        text += `     - ${question.question_text}${question.is_required ? ' (Required)' : ''}\n`
      })
    }

    // Add requirements
    if (service.servicerequirementblock.length > 0) {
      text += `   Requirements:\n`
      service.servicerequirementblock.forEach(req => {
        text += `     - ${req.title || req.requirements_text}\n`
      })
    }

    text += "\n"
  })

  return text
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

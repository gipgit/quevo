'use server'

import { generateMarketingContent, generateSocialMediaContent } from './generate-marketing-content'

interface Business {
  business_id: string
  business_name: string
  business_descr: string | null
}

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
  price_base: any
  price_type: string
  price_unit: string | null
}

interface Service {
  service_id: number
  service_name: string
  description: string | null
  duration_minutes: number | null
  buffer_minutes: number | null
  price_base: any | null
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

export async function generateMarketingContentAction(business: Business, services: Service[]) {
  return await generateMarketingContent(business, services)
}

export async function generateSocialMediaContentAction(
  business: Business, 
  services: Service[], 
  platforms: string[],
  qualities: string[],
  locale: string = 'en'
) {
  console.log("🚀 [generateSocialMediaContentAction] Starting social media content generation...")
  console.log("📊 [generateSocialMediaContentAction] Input data:", {
    businessName: business.business_name,
    servicesCount: services.length,
    platforms: platforms,
    qualities: qualities,
    locale: locale
  })
  
  try {
    const result = await generateSocialMediaContent(business, services, platforms, qualities, locale)
    
    console.log("✅ [generateSocialMediaContentAction] Successfully generated content for platforms:", 
      result.content.map(content => content.platform))
    
    return {
      success: true,
      data: result.content,
      rawResponse: result.rawResponse,
      message: "Social media content generated successfully!"
    }
  } catch (error) {
    console.error('❌ [generateSocialMediaContentAction] Error generating social media content:', error)
    return {
      success: false,
      data: [],
      rawResponse: '',
      message: error instanceof Error ? error.message : "An unexpected error occurred"
    }
  }
}

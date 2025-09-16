'use server'

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { EmailRateLimiter } from "@/lib/email-rate-limit"
import { AIContentGenerationRateLimiter } from "@/lib/ai-content-generation-rate-limit"

export interface CreateCampaignData {
  campaign_name: string
  subject: string
  content: string
  from_name: string
  from_email: string
  reply_to?: string
  recipient_category: 'past_customers' | 'active_customers' | 'uncommitted_customers' | 'all_customers' | 'custom'
  campaign_type: 'general' | 'past_customers' | 'uncommitted_customers' | 'all_customers'
  scheduled_at?: Date
}

export interface SendCampaignData {
  campaign_id: number
  recipient_ids: string[]
}



export interface CampaignResult {
  success: boolean
  message: string
  campaignId?: number
  sentCount?: number
  failedCount?: number
  rateLimitInfo?: {
    tokensRemaining: number
    tokensCapacity: number
    nextRefillTime?: Date
  }
}

export async function createEmailCampaign(data: CreateCampaignData): Promise<{
  success: boolean
  message: string
  campaignId?: number
}> {
  try {
    const session = await auth()
    if (!session?.user) {
      return {
        success: false,
        message: "Authentication required"
      }
    }

    const business = await prisma.business.findFirst({
      where: {
        usermanager: {
          user_id: session.user.id
        }
      },
      select: {
        business_id: true,
        plan_id: true
      }
    })

    if (!business) {
      return {
        success: false,
        message: "Business not found"
      }
    }

    const campaign = await prisma.marketingemailcampaign.create({
      data: {
        business_id: business.business_id,
        campaign_name: data.campaign_name,
        subject: data.subject,
        content: data.content,
        from_name: data.from_name,
        from_email: data.from_email,
        reply_to: data.reply_to,
        recipient_category: data.recipient_category,
        campaign_type: data.campaign_type,
        scheduled_at: data.scheduled_at,
        status: data.scheduled_at ? 'scheduled' : 'draft'
      }
    })

    return {
      success: true,
      message: "Campaign created successfully",
      campaignId: Number(campaign.id)
    }
  } catch (error) {
    console.error('Error creating campaign:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create campaign"
    }
  }
}

export async function sendEmailCampaign(data: SendCampaignData): Promise<CampaignResult> {
  try {
    const session = await auth()
    if (!session?.user) {
      return {
        success: false,
        message: "Authentication required"
      }
    }

    const business = await prisma.business.findFirst({
      where: {
        usermanager: {
          user_id: session.user.id
        }
      },
      select: {
        business_id: true,
        plan_id: true
      }
    })

    if (!business) {
      return {
        success: false,
        message: "Business not found"
      }
    }

    // Check rate limit
    const planId = business.plan_id || 1
    const rateLimitCheck = await EmailRateLimiter.checkAndConsumeToken(
      business.business_id,
      planId
    )

    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        message: rateLimitCheck.errorMessage || "Rate limit exceeded"
      }
    }

    // Get campaign
    const campaign = await prisma.marketingemailcampaign.findFirst({
      where: {
        id: BigInt(data.campaign_id),
        business_id: business.business_id
      }
    })

    if (!campaign) {
      return {
        success: false,
        message: "Campaign not found"
      }
    }

    // Get recipients count
    const customers = await prisma.usercustomer.findMany({
      where: {
        user_id: {
          in: data.recipient_ids
        }
      }
    })

    // Update campaign status and sent count
    await prisma.marketingemailcampaign.update({
      where: { id: BigInt(data.campaign_id) },
      data: {
        status: 'completed',
        sent_count: customers.length,
        sent_at: new Date()
      }
    })

    return {
      success: true,
      message: `Campaign sent successfully to ${customers.length} recipients`,
      sentCount: customers.length,
      failedCount: 0,
      rateLimitInfo: {
        tokensRemaining: rateLimitCheck.tokensRemaining,
        tokensCapacity: rateLimitCheck.tokensCapacity,
        nextRefillTime: rateLimitCheck.nextRefillTime
      }
    }
  } catch (error) {
    console.error('Error sending campaign:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send campaign"
    }
  }
}



export async function generateMarketingEmailContent(
  campaignType: 'past_customers' | 'uncommitted_customers' | 'general',
  locale: string = 'en'
): Promise<{
  success: boolean
  data?: {
    subject: string
    body: string
  }
  error?: string
}> {
  // This function is now handled by the separate generate-email-content.ts file
  // This is kept for backward compatibility but should not be used
  return {
    success: false,
    error: "Use generateMarketingEmailContent from generate-email-content.ts instead"
  }
}

export async function getEmailRateLimitStatus(): Promise<{
  tokensRemaining: number
  tokensCapacity: number
  allowed: boolean
  nextRefillTime?: Date
}> {
  try {
    const session = await auth()
    if (!session?.user) {
      throw new Error("Authentication required")
    }

    const business = await prisma.business.findFirst({
      where: {
        usermanager: {
          user_id: session.user.id
        }
      },
      select: {
        business_id: true,
        plan_id: true
      }
    })

    if (!business) {
      throw new Error("Business not found")
    }

    const planId = business.plan_id || 1
    const rateLimitStatus = await EmailRateLimiter.getRateLimitStatus(
      business.business_id,
      planId
    )

    return {
      tokensRemaining: rateLimitStatus.tokensRemaining,
      tokensCapacity: rateLimitStatus.tokensCapacity,
      allowed: rateLimitStatus.allowed,
      nextRefillTime: rateLimitStatus.nextRefillTime
    }
  } catch (error) {
    console.error('Error getting rate limit status:', error)
    return {
      tokensRemaining: 0,
      tokensCapacity: 0,
      allowed: false
    }
  }
}

export async function getAIContentGenerationRateLimitStatus(): Promise<{
  generationsAvailable: number
  fillRate: number
  allowed: boolean
  nextRefillTime?: Date
}> {
  try {
    const session = await auth()
    if (!session?.user) {
      throw new Error("Authentication required")
    }

    const business = await prisma.business.findFirst({
      where: {
        usermanager: {
          user_id: session.user.id
        }
      },
      select: {
        business_id: true,
        plan_id: true
      }
    })

    if (!business) {
      throw new Error("Business not found")
    }

    const planId = business.plan_id || 1
    const rateLimitStatus = await AIContentGenerationRateLimiter.getRateLimitStatus(
      business.business_id,
      planId
    )

    return {
      generationsAvailable: rateLimitStatus.generationsAvailable,
      fillRate: rateLimitStatus.fillRate,
      allowed: rateLimitStatus.allowed,
      nextRefillTime: rateLimitStatus.nextRefillTime
    }
  } catch (error) {
    console.error('Error getting AI content generation rate limit status:', error)
    return {
      generationsAvailable: 0,
      fillRate: 1,
      allowed: false
    }
  }
}



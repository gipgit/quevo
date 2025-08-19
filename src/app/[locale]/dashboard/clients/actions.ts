'use server'

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { EmailRateLimiter } from "@/lib/email-rate-limit"
import { AIContentGenerationRateLimiter } from "@/lib/ai-content-generation-rate-limit"
import { generateEmailContent } from "./generate-email-content"

export interface SendCampaignData {
  subject: string
  content: string
  fromName: string
  fromEmail: string
  replyTo?: string
  recipientIds: string[]
}

export interface SendCampaignResult {
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

export async function sendEmailCampaign(data: SendCampaignData): Promise<SendCampaignResult> {
  try {
    const session = await auth()
    if (!session?.user) {
      return {
        success: false,
        message: "Authentication required"
      }
    }

    // Get business and plan info
    const business = await prisma.business.findFirst({
      where: {
        usermanager: {
          user_id: session.user.id
        }
      },
      include: {
        usermanager: {
          select: {
            plan_id: true
          }
        }
      }
    })

    if (!business) {
      return {
        success: false,
        message: "Business not found"
      }
    }

    const planId = business.usermanager?.plan_id || 1

    // Check rate limit for the number of emails to send
    const rateLimitResult = await EmailRateLimiter.checkAndConsumeToken(
      business.business_id,
      planId
    )

    if (!rateLimitResult.allowed) {
      return {
        success: false,
        message: rateLimitResult.errorMessage || "Rate limit exceeded",
        rateLimitInfo: {
          tokensRemaining: rateLimitResult.tokensRemaining,
          tokensCapacity: rateLimitResult.tokensCapacity,
          nextRefillTime: rateLimitResult.nextRefillTime
        }
      }
    }

    // Get customer emails
    const customers = await prisma.usercustomer.findMany({
      where: {
        user_id: {
          in: data.recipientIds
        }
      },
      select: {
        user_id: true,
        email: true,
        name_first: true,
        name_last: true
      }
    })

    if (customers.length === 0) {
      return {
        success: false,
        message: "No valid recipients found"
      }
    }

    // Create campaign record
    const campaign = await prisma.emailcampaign.create({
      data: {
        business_id: business.business_id,
        campaign_name: `Campaign - ${new Date().toLocaleDateString()}`,
        subject: data.subject,
        content: data.content,
        from_name: data.fromName,
        from_email: data.fromEmail,
        reply_to: data.replyTo,
        recipient_count: customers.length,
        status: 'sending'
      }
    })

    // Create recipient records
    const recipientRecords = customers.map(customer => ({
      campaign_id: campaign.id,
      customer_id: customer.user_id,
      email: customer.email,
      status: 'pending' as const
    }))

    await prisma.emailcampaignrecipient.createMany({
      data: recipientRecords
    })

    // TODO: Integrate with Resend or other email service
    // For now, simulate sending emails
    let sentCount = 0
    let failedCount = 0

    for (const customer of customers) {
      try {
        // Simulate email sending
        // await resend.emails.send({
        //   from: data.fromEmail,
        //   to: customer.email,
        //   subject: data.subject,
        //   html: data.content,
        //   reply_to: data.replyTo
        // })

        // Update recipient status to sent
        await prisma.emailcampaignrecipient.updateMany({
          where: {
            campaign_id: campaign.id,
            customer_id: customer.user_id
          },
          data: {
            status: 'sent',
            sent_at: new Date()
          }
        })

        sentCount++
      } catch (error) {
        // Update recipient status to failed
        await prisma.emailcampaignrecipient.updateMany({
          where: {
            campaign_id: campaign.id,
            customer_id: customer.user_id
          },
          data: {
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error'
          }
        })

        failedCount++
      }
    }

    // Update campaign status
    await prisma.emailcampaign.update({
      where: { id: campaign.id },
      data: {
        status: 'completed',
        sent_count: sentCount,
        failed_count: failedCount,
        sent_at: new Date()
      }
    })

    return {
      success: true,
      message: `Campaign sent successfully! ${sentCount} emails sent, ${failedCount} failed.`,
      campaignId: campaign.id,
      sentCount,
      failedCount,
      rateLimitInfo: {
        tokensRemaining: rateLimitResult.tokensRemaining,
        tokensCapacity: rateLimitResult.tokensCapacity
      }
    }

  } catch (error) {
    console.error('Error sending email campaign:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unexpected error occurred"
    }
  }
}

export interface GenerateEmailContentResult {
  success: boolean
  message: string
  pastCustomersEmail?: {
    subject: string
    body: string
  }
  uncommittedCustomersEmail?: {
    subject: string
    body: string
  }
  rateLimitInfo?: {
    generationsAvailable: number
    fillRate: number
    nextRefillTime?: Date
  }
}

export async function generateEmailContentAction(locale: string = 'it'): Promise<GenerateEmailContentResult> {
  console.log("🚀 [generateEmailContentAction] Starting email content generation...")
  
  try {
    const session = await auth()
    if (!session?.user) {
      console.log("❌ [generateEmailContentAction] Not authenticated")
      return {
        success: false,
        message: "Authentication required"
      }
    }

    console.log("✅ [generateEmailContentAction] User authenticated:", session.user.id)

    // Get business and plan info
    console.log("🔍 [generateEmailContentAction] Fetching business info...")
    const business = await prisma.business.findFirst({
      where: {
        usermanager: {
          user_id: session.user.id
        }
      },
      include: {
        usermanager: {
          select: {
            plan_id: true
          }
        }
      }
    })

    if (!business) {
      console.log("❌ [generateEmailContentAction] Business not found")
      return {
        success: false,
        message: "Business not found"
      }
    }

    const planId = business.usermanager?.plan_id || 1
    console.log("✅ [generateEmailContentAction] Business found:", business.business_name, "Plan ID:", planId)

    // Check rate limit for AI content generation
    console.log("🔍 [generateEmailContentAction] Checking AI content generation rate limit...")
    const rateLimitResult = await AIContentGenerationRateLimiter.checkAndConsumeToken(
      business.business_id,
      planId
    )

    console.log("📊 [generateEmailContentAction] Rate limit result:", rateLimitResult)

    if (!rateLimitResult.allowed) {
      console.log("❌ [generateEmailContentAction] Rate limit exceeded")
      return {
        success: false,
        message: rateLimitResult.errorMessage || "AI content generation rate limit exceeded",
        rateLimitInfo: {
          generationsAvailable: rateLimitResult.generationsAvailable,
          fillRate: rateLimitResult.fillRate,
          nextRefillTime: rateLimitResult.nextRefillTime
        }
      }
    }

    // Fetch all services for the business
    console.log("🔍 [generateEmailContentAction] Fetching business services...")
    const services = await prisma.service.findMany({
      where: {
        business_id: business.business_id,
        is_active: true
      },
      include: {
        servicecategory: {
          select: {
            category_name: true
          }
        },
        servicequestion: true,
        servicerequirementblock: true,
        serviceitem: true
      },
      orderBy: {
        display_order: 'asc'
      }
    })

    console.log("✅ [generateEmailContentAction] Found", services.length, "services")

    // Generate email content using AI
    console.log("🤖 [generateEmailContentAction] Calling OpenAI API...")
    const emailContent = await generateEmailContent(
      business,
      services,
      locale
    )

    console.log("✅ [generateEmailContentAction] OpenAI API response:", emailContent)

    // Save the generated content to the database
    console.log("💾 [generateEmailContentAction] Saving generated content to database...")
    await (prisma as any).aigenerationemail.create({
      data: {
        business_id: business.business_id,
        past_customers_subject: emailContent.pastCustomersEmail.subject,
        past_customers_body: emailContent.pastCustomersEmail.body,
        uncommitted_customers_subject: emailContent.uncommittedCustomersEmail.subject,
        uncommitted_customers_body: emailContent.uncommittedCustomersEmail.body,
        services_text: emailContent.servicesText
      }
    })

    console.log("✅ [generateEmailContentAction] Content saved to database successfully")

    return {
      success: true,
      message: "Email content generated successfully!",
      pastCustomersEmail: emailContent.pastCustomersEmail,
      uncommittedCustomersEmail: emailContent.uncommittedCustomersEmail,
      rateLimitInfo: {
        generationsAvailable: rateLimitResult.generationsAvailable,
        fillRate: rateLimitResult.fillRate
      }
    }

  } catch (error) {
    console.error('❌ [generateEmailContentAction] Error generating email content:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unexpected error occurred"
    }
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
      include: {
        usermanager: {
          select: {
            plan_id: true
          }
        }
      }
    })

    if (!business) {
      throw new Error("Business not found")
    }

    const planId = business.usermanager?.plan_id || 1
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
      include: {
        usermanager: {
          select: {
            plan_id: true
          }
        }
      }
    })

    if (!business) {
      throw new Error("Business not found")
    }

    const planId = business.usermanager?.plan_id || 1
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

export async function getAIGenerationHistory(): Promise<{
  success: boolean
  data?: Array<{
    id: number
    generation_date: Date
    past_customers_subject: string | null
    past_customers_body: string | null
    uncommitted_customers_subject: string | null
    uncommitted_customers_body: string | null
  }>
  error?: string
}> {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: "Authentication required" }
    }

    const business = await prisma.business.findFirst({
      where: {
        usermanager: {
          user_id: session.user.id
        }
      }
    })

    if (!business) {
      return { success: false, error: "Business not found" }
    }

    const history = await (prisma as any).aigenerationemail.findMany({
      where: {
        business_id: business.business_id
      },
      select: {
        id: true,
        generation_date: true,
        past_customers_subject: true,
        past_customers_body: true,
        uncommitted_customers_subject: true,
        uncommitted_customers_body: true
      },
      orderBy: {
        generation_date: 'desc'
      },
      take: 10 // Limit to last 10 generations
    })

    return {
      success: true,
      data: history
    }
  } catch (error) {
    console.error('Error getting AI generation history:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred"
    }
  }
}

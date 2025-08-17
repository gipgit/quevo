'use server'

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { EmailRateLimiter } from "@/lib/email-rate-limit"

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

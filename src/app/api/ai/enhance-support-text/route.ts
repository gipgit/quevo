import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { AIContentGenerationRateLimiter } from '@/lib/ai-content-generation-rate-limit'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { supportRequestId, message, category } = await request.json()

    if (!supportRequestId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get the support request
    const supportRequest = await prisma.servicesupportrequest.findFirst({
      where: {
        support_request_id: supportRequestId
      },
      include: {
        business: {
          select: {
            business_name: true,
            business_descr: true
          }
        }
      }
    })

    if (!supportRequest) {
      return NextResponse.json({ error: 'Support request not found' }, { status: 404 })
    }

    // Check rate limit
    const planId = 1 // Default plan - you might want to get this from user
    const rateLimitCheck = await AIContentGenerationRateLimiter.checkAndConsumeToken(
      supportRequest.business_id,
      planId
    )

    if (!rateLimitCheck.allowed) {
      return NextResponse.json({ 
        error: rateLimitCheck.errorMessage || 'Rate limit exceeded' 
      }, { status: 429 })
    }

    // Prepare context for AI
    const businessContext = {
      businessName: supportRequest.business.business_name,
      businessDescription: supportRequest.business.business_descr,
      category,
      originalMessage: message
    }

    // Generate AI enhancement using OpenAI
    const { enhanceSupportText } = await import('@/lib/ai-support-utils')
    const enhancedText = await enhanceSupportText(businessContext)

    // Log the AI generation
    await prisma.aiassistantmessagehistory.create({
      data: {
        business_id: supportRequest.business_id,
        user_message: `Enhance support text for request ${supportRequestId}`,
        ai_response: enhancedText,
        message_type: 'support_text_enhancement',
        request_type: 'openai',
        input_tokens: 0, // You might want to track these
        output_tokens: 0,
        cost_usd: 0,
        success: true
      }
    })

    return NextResponse.json({ 
      enhancedText,
      rateLimitInfo: {
        generationsRemaining: rateLimitCheck.generationsAvailable,
        nextRefillTime: rateLimitCheck.nextRefillTime
      }
    })

  } catch (error) {
    console.error('Error enhancing support text:', error)
    return NextResponse.json({ 
      error: 'Failed to enhance support text' 
    }, { status: 500 })
  }
}

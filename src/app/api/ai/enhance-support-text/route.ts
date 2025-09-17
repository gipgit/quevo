import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { AICreditsManager } from '@/lib/ai-credits-manager'

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

    // Check and consume AI generation credit
    const creditsResult = await AICreditsManager.consumeCredits(
      supportRequest.business_id,
      'SUPPORT_TEXT_ENHANCEMENT',
      'Support text enhancement'
    )

    if (!creditsResult.success) {
      return NextResponse.json({ 
        error: creditsResult.errorMessage || 'Insufficient AI credits' 
      }, { status: 402 }) // 402 Payment Required
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
        creditsRemaining: creditsResult.creditsRemaining,
        creditsConsumed: creditsResult.creditsConsumed
      }
    })

  } catch (error) {
    console.error('Error enhancing support text:', error)
    return NextResponse.json({ 
      error: 'Failed to enhance support text' 
    }, { status: 500 })
  }
}

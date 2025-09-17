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

    const { supportRequestId, message, category, priority } = await request.json()

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
        },
        usercustomer: {
          select: {
            name_first: true,
            name_last: true,
            email: true
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
      'SUPPORT_RESPONSE_GENERATION',
      'Support request response generation'
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
      customerName: supportRequest.usercustomer ? 
        `${supportRequest.usercustomer.name_first} ${supportRequest.usercustomer.name_last}` : 
        'Customer',
      customerEmail: supportRequest.usercustomer?.email || supportRequest.email,
      category,
      priority,
      message
    }

    // Generate AI response using OpenAI
    const { generateSupportResponse } = await import('@/lib/ai-support-utils')
    const aiResponse = await generateSupportResponse(businessContext)

    // Log the AI generation
    await prisma.aiassistantmessagehistory.create({
      data: {
        business_id: supportRequest.business_id,
        user_message: `Generate support response for request ${supportRequestId}`,
        ai_response: aiResponse,
        message_type: 'support_response_generation',
        request_type: 'openai',
        input_tokens: 0, // You might want to track these
        output_tokens: 0,
        cost_usd: 0,
        success: true
      }
    })

    return NextResponse.json({ 
      response: aiResponse,
      rateLimitInfo: {
        creditsRemaining: creditsResult.creditsRemaining,
        creditsConsumed: creditsResult.creditsConsumed
      }
    })

  } catch (error) {
    console.error('Error generating support response:', error)
    return NextResponse.json({ 
      error: 'Failed to generate support response' 
    }, { status: 500 })
  }
}

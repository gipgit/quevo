'use server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { AICreditsManager } from '@/lib/ai-credits-manager'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

interface EnhanceSupportTextData {
  supportRequestId: string
  message: string
  category: string
}

interface EnhanceSupportTextResult {
  success: boolean
  data?: {
    enhancedText: string
    creditsConsumed: number
  }
  error?: string
  errorMessage?: string
}

export async function enhanceSupportText(
  data: EnhanceSupportTextData
): Promise<EnhanceSupportTextResult> {
  try {
    // Verify authentication
    const session = await auth()
    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized',
        errorMessage: 'You must be logged in to enhance text'
      }
    }

    // Get the support request with business information
    const supportRequest = await prisma.servicesupportrequest.findFirst({
      where: {
        support_request_id: data.supportRequestId
      },
      include: {
        business: true,
        usercustomer: {
          select: {
            name_first: true,
            name_last: true
          }
        }
      }
    })

    if (!supportRequest) {
      return {
        success: false,
        error: 'Request not found',
        errorMessage: 'Support request not found'
      }
    }

    // Verify user has access to this business
    if (supportRequest.business.manager_id !== session.user.id) {
      return {
        success: false,
        error: 'Access denied',
        errorMessage: 'You do not have access to this business'
      }
    }

    // Check and consume AI credits
    const creditsResult = await AICreditsManager.consumeCredits(
      supportRequest.business_id,
      'SUPPORT_TEXT_ENHANCEMENT',
      `Support text enhancement for ${data.supportRequestId}`
    )

    if (!creditsResult.success) {
      return {
        success: false,
        error: 'Insufficient credits',
        errorMessage: creditsResult.errorMessage || 'Insufficient AI credits'
      }
    }

    // Build the prompt for AI text enhancement
    const prompt = buildEnhancementPrompt(data, supportRequest.business, supportRequest.usercustomer)

    // Generate AI enhancement
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `You are a professional customer support specialist helping to improve customer communication.

      ${prompt}`,
      temperature: 0.3
    })

    const enhancedText = result.text

    if (!enhancedText) {
      return {
        success: false,
        error: 'Enhancement failed',
        errorMessage: 'Failed to enhance text'
      }
    }

    // Log the AI generation
    await prisma.aiassistantmessagehistory.create({
      data: {
        business_id: supportRequest.business_id,
        user_message: `Enhance support text for request ${data.supportRequestId}`,
        ai_response: enhancedText,
        message_type: 'support_text_enhancement',
        request_type: 'openai',
        input_tokens: 0, // You might want to track these
        output_tokens: 0,
        cost_usd: 0,
        success: true
      }
    })

    return {
      success: true,
      data: {
        enhancedText: enhancedText.trim(),
        creditsConsumed: creditsResult.creditsConsumed || 1
      }
    }

  } catch (error) {
    console.error('Error enhancing support text:', error)
    return {
      success: false,
      error: 'Enhancement failed',
      errorMessage: 'An error occurred while enhancing the text'
    }
  }
}

function buildEnhancementPrompt(
  data: EnhanceSupportTextData,
  business: any,
  customer: any
): string {
  // Extract only first name for privacy, handle cases where name might contain multiple words
  let customerName = 'Customer'
  if (customer?.name_first) {
    const firstName = customer.name_first.trim()
    // If the first name contains spaces, take only the first word
    customerName = firstName.split(' ')[0]
  }

  let prompt = `Your task is to enhance a customer's support request message to make it clearer, more professional, and easier to understand while maintaining the original intent and meaning.

**Customer:** ${customerName}
**Business context:** ${business.business_name}
${business.business_descr ? `**Business description:** ${business.business_descr}` : ''}
**Category:** ${data.category}

**Guidelines:**
- Improve grammar, spelling, and punctuation
- Make the message clearer and more structured
- Maintain the original tone and intent
- Keep the same level of detail
- Make it more professional if appropriate
- Preserve all important information
- Do not add information that wasn't in the original message
- Do not change the core meaning or request

Please enhance the following customer support message to make it clearer and more professional:

**Original message:** ${data.message}

Please provide an enhanced version that maintains the original meaning but improves clarity and professionalism in Italian.`

  return prompt
}

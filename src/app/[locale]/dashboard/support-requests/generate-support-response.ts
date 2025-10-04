'use server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { AICreditsManager } from '@/lib/ai-credits-manager'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

interface GenerateSupportResponseData {
  supportRequestId: string
  message: string
  category: string
  priority: string
  customizations?: string[]
}

interface GenerateSupportResponseResult {
  success: boolean
  data?: {
    response: string
    creditsConsumed: number
  }
  error?: string
  errorMessage?: string
}

export async function generateSupportResponse(
  data: GenerateSupportResponseData
): Promise<GenerateSupportResponseResult> {
  try {
    // Verify authentication
    const session = await auth()
    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized',
        errorMessage: 'You must be logged in to generate responses'
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
            name_last: true,
            email: true
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
      'SUPPORT_RESPONSE_GENERATION',
      `Support request response generation for ${data.supportRequestId}`
    )

    if (!creditsResult.success) {
      return {
        success: false,
        error: 'Insufficient credits',
        errorMessage: creditsResult.errorMessage || 'Insufficient AI credits'
      }
    }

    // Build the prompt for AI response generation
    const prompt = buildSupportResponsePrompt(data, supportRequest.business, supportRequest.usercustomer)

    // Generate AI response
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `You are a professional customer service representative for ${supportRequest.business.business_name}. 
      Generate a short, concise, and professional response to customer support requests. 
      Be helpful, empathetic, and solution-oriented. Keep responses under 200 words.

      ${prompt}`,
      temperature: 0.7
    })

    const response = result.text

    if (!response) {
      return {
        success: false,
        error: 'Generation failed',
        errorMessage: 'Failed to generate response'
      }
    }

    // Log the AI generation
    await prisma.aiassistantmessagehistory.create({
      data: {
        business_id: supportRequest.business_id,
        user_message: `Generate support response for request ${data.supportRequestId}`,
        ai_response: response,
        message_type: 'support_response_generation',
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
        response: response.trim(),
        creditsConsumed: creditsResult.creditsConsumed || 1
      }
    }

  } catch (error) {
    console.error('Error generating support response:', error)
    return {
      success: false,
      error: 'Generation failed',
      errorMessage: 'An error occurred while generating the response'
    }
  }
}

function buildSupportResponsePrompt(
  data: GenerateSupportResponseData,
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

  let prompt = `Generate a professional response for the following support request:

**Customer:** ${customerName}
**Category:** ${data.category}
**Priority:** ${data.priority}
**Support Request:** ${data.message}

**Business:** ${business.business_name}
${business.business_descr ? `**Business Description:** ${business.business_descr}` : ''}

Please generate a professional, helpful response in Italian that:
1. Acknowledges the customer's request
2. Shows understanding of their needs
3. Provides next steps or solutions
4. Maintains a professional and empathetic tone
5. Is concise but comprehensive
6. Signs off with the business name "${business.business_name}" (DO NOT use placeholders like "[your name]" or similar)

**IMPORTANT GUIDELINES:**
- Be professional but warm and empathetic
- Address the customer's concern directly
- Provide clear next steps or solutions when possible
- Maintain the business's brand voice
- Keep the response concise but comprehensive
- Use appropriate tone based on priority level
- Always end the response with the business name, never use placeholder text

Priority levels:
- Low: Standard response time, general assistance
- Medium: Prompt attention, detailed response
- High: Urgent attention, immediate action items
- Urgent: Critical priority, immediate response and escalation

Categories:
- General: General inquiries and questions
- Technical: Technical issues and troubleshooting
- Account: Account-related questions and issues

The response should be ready to send directly to the customer in Italian. Always sign with "${business.business_name}" and never use placeholder text.`

  // Add customization instructions if any are selected
  if (data.customizations && data.customizations.length > 0) {
    prompt += `\n\n**ADDITIONAL INSTRUCTIONS BASED ON SELECTED OPTIONS:**\n`
    
    data.customizations.forEach(customization => {
      switch (customization) {
        case 'ask_to_call':
          prompt += `- Ask the customer to call for immediate assistance and provide the contact number\n`
          break
        case 'we_will_call':
          prompt += `- Inform the customer that someone from the business will call them back soon\n`
          break
        case 'checking_and_get_back':
          prompt += `- Let the customer know that you are investigating their issue and will get back to them with updates\n`
          break
        case 'provide_solution':
          prompt += `- Focus on providing a direct solution or workaround to their issue\n`
          break
        case 'schedule_follow_up':
          prompt += `- Propose a specific time or timeframe for follow-up contact\n`
          break
        case 'escalate_to_specialist':
          prompt += `- Inform that the issue will be escalated to a technical specialist who will handle it\n`
          break
        case 'request_additional_info':
          prompt += `- Ask for more specific details to better understand and resolve the issue\n`
          break
        case 'confirm_understanding':
          prompt += `- Acknowledge and confirm your understanding of the customer's issue before proceeding\n`
          break
      }
    })
    
    prompt += `\nMake sure to naturally incorporate these elements into your response while maintaining the professional tone.`
  }

  return prompt
}

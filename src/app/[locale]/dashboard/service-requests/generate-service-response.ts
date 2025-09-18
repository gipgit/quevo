'use server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { AICreditsManager } from '@/lib/ai-credits-manager'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

interface GenerateServiceResponseData {
  requestId: string
  customerNotes?: string
  requestDetails: {
    customerName: string
    serviceName: string
    requestReference: string
    questionResponses?: any[]
    requirements?: any[]
    eventInfo?: any
    schedulingDates?: any[]
  }
  clarificationRequests?: {
    selectedQuestionIndices: number[]
    selectedRequirementIndices: number[]
    manualQuestions: string
    customerNotesClarification: string
  }
}

interface GenerateServiceResponseResult {
  success: boolean
  data?: {
    response: string
    creditsConsumed: number
  }
  error?: string
  errorMessage?: string
}

export async function generateServiceResponse(
  data: GenerateServiceResponseData
): Promise<GenerateServiceResponseResult> {
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

    // Get the service request with business information
    const serviceRequest = await prisma.servicerequest.findUnique({
      where: { request_id: data.requestId },
      include: {
        business: true,
        service: true
      }
    })

    if (!serviceRequest) {
      return {
        success: false,
        error: 'Request not found',
        errorMessage: 'Service request not found'
      }
    }

    // Verify user has access to this business
    if (serviceRequest.business.manager_id !== session.user.id) {
      return {
        success: false,
        error: 'Access denied',
        errorMessage: 'You do not have access to this business'
      }
    }

    // Check and consume AI credits
    const creditsResult = await AICreditsManager.consumeCredits(
      serviceRequest.business_id,
      'SERVICE_RESPONSE_GENERATION',
      `Service request response generation for ${data.requestDetails.requestReference}`
    )

    if (!creditsResult.success) {
      return {
        success: false,
        error: 'Insufficient credits',
        errorMessage: creditsResult.errorMessage || 'Insufficient AI credits'
      }
    }

    // Build the prompt for AI response generation
    const prompt = buildServiceResponsePrompt(data.requestDetails, data.customerNotes, serviceRequest.business, data.clarificationRequests)

    // Generate AI response
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `You are a professional customer service representative for ${serviceRequest.business.business_name}. 
      Generate a short, concise, and professional response to customer service requests. 
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

    return {
      success: true,
      data: {
        response: response.trim(),
        creditsConsumed: creditsResult.creditsConsumed || 1
      }
    }

  } catch (error) {
    console.error('Error generating service response:', error)
    return {
      success: false,
      error: 'Generation failed',
      errorMessage: 'An error occurred while generating the response'
    }
  }
}

function buildServiceResponsePrompt(
  requestDetails: GenerateServiceResponseData['requestDetails'],
  customerNotes: string | undefined,
  business: any,
  clarificationRequests?: GenerateServiceResponseData['clarificationRequests']
): string {
  let prompt = `Generate a professional response for the following service request:

**Customer:** ${requestDetails.customerName}
**Service:** ${requestDetails.serviceName}
**Request Reference:** ${requestDetails.requestReference}

**Business:** ${business.business_name}
${business.business_descr ? `**Business Description:** ${business.business_descr}` : ''}

**Request Details:**`


  // Add question responses if available
  if (requestDetails.questionResponses && requestDetails.questionResponses.length > 0) {
    prompt += `\n\n**Customer Responses:**`
    requestDetails.questionResponses.forEach((response, index) => {
      let responseText = 'No response'
      
      // Handle text responses
      if (response.response_text) {
        responseText = response.response_text
      }
      // Handle checkbox/multiple choice responses
      else if (response.selected_options && response.selected_options.length > 0) {
        responseText = response.selected_options.map((option: any) => option.option_text || option.text || option).join(', ')
      }
      
      prompt += `\n${index + 1}. ${response.question_text}: ${responseText}`
    })
  }

  // Add requirements if available
  if (requestDetails.requirements && requestDetails.requirements.length > 0) {
    prompt += `\n\n**Requirements:**`
    requestDetails.requirements.forEach((req, index) => {
      prompt += `\n${index + 1}. ${req.requirements_text} (Status: ${req.customer_confirmed ? 'Confirmed' : 'Pending'})`
    })
  }

  // Add event & scheduling information if available
  if (requestDetails.eventInfo) {
    prompt += `\n\n**Event Information:**`
    prompt += `\nEvent Name: ${requestDetails.eventInfo.event_name || 'N/A'}`
    if (requestDetails.eventInfo.event_description) {
      prompt += `\nEvent Description: ${requestDetails.eventInfo.event_description}`
    }
  }

  // Add scheduling dates if available
  if (requestDetails.schedulingDates && requestDetails.schedulingDates.length > 0) {
    prompt += `\n\n**Customer's Preferred Dates/Times (NOT CONFIRMED APPOINTMENTS):**`
    prompt += `\nThese are the customer's preferred dates/times for the service, but they are NOT confirmed appointments yet.`
    requestDetails.schedulingDates.forEach((date, index) => {
      prompt += `\n${index + 1}. ${date}`
    })
  }

  // Add customer notes if available
  if (customerNotes) {
    prompt += `\n\n**Customer Notes:**\n${customerNotes}`
  }

  // Add clarification requests if specified
  if (clarificationRequests) {
    const { selectedQuestionIndices, selectedRequirementIndices, manualQuestions, customerNotesClarification } = clarificationRequests
    
    if (selectedQuestionIndices.length > 0 || selectedRequirementIndices.length > 0 || manualQuestions.trim() || customerNotesClarification.trim()) {
      prompt += `\n\n**CLARIFICATION REQUESTS:**`
      
      // Add customer notes clarification
      if (customerNotesClarification.trim()) {
        prompt += `\n\n**Customer Notes Clarification Needed:**\n${customerNotesClarification.trim()}`
        prompt += `\n\nPlease address these specific concerns about the customer notes and ask for clarification where needed in Italian.`
      }
      
      // Add selected questions that need clarification
      if (selectedQuestionIndices.length > 0) {
        prompt += `\n\nThe following question responses need clarification or additional information:`
        selectedQuestionIndices.forEach((index) => {
          const question = requestDetails.questionResponses?.[index]
          if (question) {
            let responseText = 'No response'
            if (question.response_text) {
              responseText = question.response_text
            } else if (question.selected_options && question.selected_options.length > 0) {
              responseText = question.selected_options.map((option: any) => option.option_text || option.text || option).join(', ')
            }
            prompt += `\n- "${question.question_text}": ${responseText}`
          }
        })
        prompt += `\n\nPlease ask for more specific details or clarification for these responses in Italian.`
      }
      
      // Add selected requirements that need clarification
      if (selectedRequirementIndices.length > 0) {
        prompt += `\n\nThe following requirements were not confirmed by the customer and need clarification:`
        selectedRequirementIndices.forEach((index) => {
          const requirement = requestDetails.requirements?.[index]
          if (requirement) {
            prompt += `\n- "${requirement.title ? requirement.title + ': ' : ''}${requirement.requirements_text}"`
          }
        })
        prompt += `\n\nPlease ask the customer why these requirements were not confirmed and if they need clarification or have concerns about them in Italian.`
      }
      
      // Add manual questions
      if (manualQuestions.trim()) {
        prompt += `\n\n**Additional Questions to Ask:**\n${manualQuestions.trim()}`
        prompt += `\n\nPlease integrate these questions naturally into your response in Italian.`
      }
    }
  }

  prompt += `\n\nPlease generate a professional, helpful response in Italian that:
1. Acknowledges the customer's request
2. Shows understanding of their needs
3. Provides next steps or solutions
4. Maintains a professional and empathetic tone
5. Is concise but comprehensive
6. Signs off with the business name "${business.business_name}" (DO NOT use placeholders like "[your name]" or similar)

**IMPORTANT GUIDELINES:**
- If scheduling dates/times are mentioned, treat them as PREFERENCES expressed by the customer, NOT as confirmed appointments
- Do not refer to dates as "appointments" or "bookings" unless they are actually confirmed
- Use phrases like "preferred dates", "suggested times", or "availability requests" instead
- If any information is missing, unclear, or incomplete, request clarification from the customer
- Always end the response with the business name, never use placeholders

**INFORMATION TO CLARIFY IF MISSING/UNCLEAR:**
- Customer notes that are unclear or incomplete
- Question responses that don't provide sufficient detail
- Requirements that are not confirmed or are vague
- Any other information needed to properly fulfill the service request

The response should be ready to send directly to the customer in Italian. Always sign with "${business.business_name}" and never use placeholder text.`

  return prompt
}

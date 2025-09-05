import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface BusinessContext {
  businessName: string
  businessDescription?: string | null
  customerName?: string
  customerEmail?: string | null
  category: string
  priority: string
  message: string
}

interface EnhancementContext {
  businessName: string
  businessDescription?: string | null
  category: string
  originalMessage: string
}

export async function generateSupportResponse(context: BusinessContext): Promise<string> {
  try {
    const systemPrompt = `You are a professional customer support representative for ${context.businessName}. 
    ${context.businessDescription ? `Business description: ${context.businessDescription}` : ''}
    
    Your task is to generate a helpful, professional, and empathetic response to a customer support request.
    
    Guidelines:
    - Be professional but warm and empathetic
    - Address the customer's concern directly
    - Provide clear next steps or solutions when possible
    - Maintain the business's brand voice
    - Keep the response concise but comprehensive
    - Use appropriate tone based on priority level
    - Include relevant contact information if needed
    
    Priority levels:
    - Low: Standard response time, general assistance
    - Medium: Prompt attention, detailed response
    - High: Urgent attention, immediate action items
    - Urgent: Critical priority, immediate response and escalation
    
    Categories:
    - General: General inquiries and questions
    - Technical: Technical issues and troubleshooting
    - Account: Account-related questions and issues`

    const userPrompt = `Generate a support response for the following request:
    
    Customer: ${context.customerName || 'Customer'}
    Email: ${context.customerEmail || 'Not provided'}
    Category: ${context.category}
    Priority: ${context.priority}
    
    Message: ${context.message}
    
    Please provide a professional, helpful response that addresses their concern.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    return completion.choices[0]?.message?.content || 'Unable to generate response at this time.'
  } catch (error) {
    console.error('Error generating support response:', error)
    throw new Error('Failed to generate support response')
  }
}

export async function enhanceSupportText(context: EnhancementContext): Promise<string> {
  try {
    const systemPrompt = `You are a professional customer support specialist helping to improve customer communication.
    
    Your task is to enhance a customer's support request message to make it clearer, more professional, and easier to understand while maintaining the original intent and meaning.
    
    Guidelines:
    - Improve grammar, spelling, and punctuation
    - Make the message clearer and more structured
    - Maintain the original tone and intent
    - Keep the same level of detail
    - Make it more professional if appropriate
    - Preserve all important information
    - Do not add information that wasn't in the original message
    - Do not change the core meaning or request
    
    Business context: ${context.businessName}
    ${context.businessDescription ? `Business description: ${context.businessDescription}` : ''}
    Category: ${context.category}`

    const userPrompt = `Please enhance the following customer support message to make it clearer and more professional:
    
    Original message: ${context.originalMessage}
    
    Please provide an enhanced version that maintains the original meaning but improves clarity and professionalism.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 400,
      temperature: 0.3,
    })

    return completion.choices[0]?.message?.content || context.originalMessage
  } catch (error) {
    console.error('Error enhancing support text:', error)
    throw new Error('Failed to enhance support text')
  }
}

'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

interface SendSupportResponseData {
  supportRequestId: string
  responseText: string
  responseType: 'manual' | 'ai_generated' | 'template'
  isAiGenerated: boolean
  aiModel?: string
  aiCustomizations?: string[]
}

export async function sendSupportResponse(data: SendSupportResponseData) {
  console.log('sendSupportResponse called with data:', data)
  
  try {
    const session = await auth()
    console.log('Session:', session)
    
    if (!session?.user?.id) {
      console.log('No session or user ID')
      return {
        success: false,
        error: 'Authentication required'
      }
    }

    if (!data.responseText.trim()) {
      return {
        success: false,
        error: 'Response text cannot be empty'
      }
    }

    // Get the support request to verify access and get business_id
    console.log('Looking up support request:', data.supportRequestId)
    const supportRequest = await prisma.servicesupportrequest.findUnique({
      where: {
        support_request_id: data.supportRequestId
      },
      include: {
        business: {
          select: {
            business_id: true,
            manager_id: true
          }
        }
      }
    })

    console.log('Support request found:', supportRequest)

    if (!supportRequest) {
      console.log('Support request not found')
      return {
        success: false,
        error: 'Support request not found'
      }
    }

    // Verify user has access to this business
    if (supportRequest.business.manager_id !== session.user.id) {
      console.log('Access denied - manager mismatch:', supportRequest.business.manager_id, 'vs', session.user.id)
      return {
        success: false,
        error: 'Access denied'
      }
    }

    // Create the response record
    console.log('Creating response record with data:', {
      support_request_id: data.supportRequestId,
      business_id: supportRequest.business.business_id,
      responder_id: session.user.id,
      response_text: data.responseText.trim(),
      response_type: data.responseType,
      is_ai_generated: data.isAiGenerated,
      ai_model: data.aiModel || null,
      ai_customizations: data.aiCustomizations || null
    })
    
    const response = await prisma.servicesupportresponse.create({
      data: {
        support_request_id: data.supportRequestId,
        business_id: supportRequest.business.business_id,
        responder_id: session.user.id,
        response_text: data.responseText.trim(),
        response_type: data.responseType,
        is_ai_generated: data.isAiGenerated,
        ai_model: data.aiModel || null,
        ...(data.aiCustomizations && { ai_customizations: data.aiCustomizations }),
        status: 'sent',
        sent_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    })

    console.log('Response created successfully:', response.response_id)

    return {
      success: true,
      responseId: response.response_id
    }

  } catch (error) {
    console.error('Error sending support response:', error)
    return {
      success: false,
      error: 'Failed to send response'
    }
  }
}

import prisma from '@/lib/prisma';

export interface AIMessageHistoryData {
  business_id: string;
  session_id?: string;
  user_message: string;
  ai_response?: string;
  message_type?: string;
  request_type?: string;
  input_tokens?: number;
  output_tokens?: number;
  cost_usd?: number;
  response_time_ms?: number;
  success?: boolean;
  error_message?: string;
  user_ip?: string;
  user_agent?: string;
  validation_passed?: boolean;
  validation_errors?: string;
  rate_limited?: boolean;
}

export async function logAIMessageHistory(data: AIMessageHistoryData) {
  try {
    await prisma.aiassistantmessagehistory.create({
      data: {
        business_id: data.business_id,
        session_id: data.session_id,
        user_message: data.user_message,
        ai_response: data.ai_response,
        message_type: data.message_type || 'conversation',
        request_type: data.request_type || 'openai',
        input_tokens: data.input_tokens,
        output_tokens: data.output_tokens,
        cost_usd: data.cost_usd,
        response_time_ms: data.response_time_ms,
        success: data.success ?? true,
        error_message: data.error_message,
        user_ip: data.user_ip,
        user_agent: data.user_agent,
        validation_passed: data.validation_passed ?? true,
        validation_errors: data.validation_errors,
        rate_limited: data.rate_limited ?? false,
      },
    });
  } catch (error) {
    // Log error but don't throw - we don't want message history to break the chat
    console.error('Failed to log AI message history:', error);
  }
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

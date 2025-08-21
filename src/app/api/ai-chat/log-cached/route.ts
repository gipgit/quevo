import { NextRequest, NextResponse } from 'next/server';
import { logAIMessageHistory } from '@/lib/ai-message-history';

export async function POST(request: NextRequest) {
  try {
    const { business_id, session_id, user_message, ai_response, message_type } = await request.json();

    // Log the cached response
    await logAIMessageHistory({
      business_id,
      session_id,
      user_message,
      ai_response,
      message_type: message_type || 'cached',
      request_type: 'cached',
      success: true,
      user_ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to log cached response:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

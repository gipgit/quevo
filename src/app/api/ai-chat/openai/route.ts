import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import prisma from '@/lib/prisma';
import { logAIMessageHistory, generateSessionId } from '@/lib/ai-message-history';

// Security and validation constants
const MAX_INPUT_LENGTH = 100;
const MIN_INPUT_LENGTH = 3;
const MAX_REPEATED_CHARS = 5;
const MAX_OUTPUT_TOKENS = 300;
const FALLBACK_RESPONSE = "Mi spiace brody. Ho fatto un doublecheck ma non sono riuscito a processare questa richiesta. Passo la richiesta a mis lideres CEO Aurix e Gianlucazzo.";

// Input validation function
function validateMessage(message: string): { isValid: boolean; error?: string } {
  // Check length
  if (message.length > MAX_INPUT_LENGTH) {
    return { isValid: false, error: `Il messaggio è troppo lungo (max ${MAX_INPUT_LENGTH} caratteri)` };
  }
  
  if (message.length < MIN_INPUT_LENGTH) {
    return { isValid: false, error: `Il messaggio è troppo corto (min ${MIN_INPUT_LENGTH} caratteri)` };
  }

  // Check for repeated characters (spam/gibberish detection)
  const repeatedChars = message.match(/(.)\1{4,}/g);
  if (repeatedChars && repeatedChars.some(seq => seq.length > MAX_REPEATED_CHARS)) {
    return { isValid: false, error: "Il messaggio contiene troppi caratteri ripetuti" };
  }

  // Check for excessive special characters
  const specialCharRatio = (message.match(/[^a-zA-Z0-9\s]/g) || []).length / message.length;
  if (specialCharRatio > 0.5) {
    return { isValid: false, error: "Il messaggio contiene troppi caratteri speciali" };
  }

  // Check for common spam patterns
  const spamPatterns = [
    /\b(spam|casino|poker|bet|win|money|free|click|buy|sell|offer|discount|sale)\b/i,
    /(http|www|\.com|\.net|\.org)/i,
    /[A-Z]{5,}/,
    /\d{10,}/
  ];
  
  if (spamPatterns.some(pattern => pattern.test(message))) {
    return { isValid: false, error: "Il messaggio contiene contenuto non consentito" };
  }

  return { isValid: true };
}

// Rate limiting (simple in-memory for now - in production use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }
  
  userLimit.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - userLimit.count };
}

// Token cost calculation (approximate)
function calculateTokenCost(inputTokens: number, outputTokens: number): { cost: number; inputCost: number; outputCost: number } {
  // GPT-4 Mini pricing (approximate as of 2024)
  const INPUT_COST_PER_1K = 0.00015; // $0.00015 per 1K input tokens
  const OUTPUT_COST_PER_1K = 0.0006;  // $0.0006 per 1K output tokens
  
  const inputCost = (inputTokens / 1000) * INPUT_COST_PER_1K;
  const outputCost = (outputTokens / 1000) * OUTPUT_COST_PER_1K;
  const totalCost = inputCost + outputCost;
  
  return { cost: totalCost, inputCost, outputCost };
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(ip);
    
    const { message, businessUrlname, context } = await request.json();

    // Basic validation
    if (!message || !businessUrlname) {
      return NextResponse.json(
        { error: 'Message and business URL are required' },
        { status: 400 }
      );
    }
    
    if (!rateLimit.allowed) {
      // Log rate limited request (with minimal data since we don't have business yet)
      await logAIMessageHistory({
        business_id: 'unknown',
        session_id: context?.sessionId,
        user_message: message,
        request_type: 'rate_limited',
        success: false,
        error_message: 'Rate limit exceeded',
        rate_limited: true,
        user_ip: ip,
        user_agent: request.headers.get('user-agent') || undefined,
      });

      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Input validation
    const validation = validateMessage(message);
    if (!validation.isValid) {
      // Log failed validation (with minimal data since we don't have business yet)
      await logAIMessageHistory({
        business_id: 'unknown',
        session_id: context?.sessionId,
        user_message: message,
        request_type: 'validation_failed',
        success: false,
        error_message: validation.error,
        validation_passed: false,
        validation_errors: validation.error,
        user_ip: ip,
        user_agent: request.headers.get('user-agent') || undefined,
      });

      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Get business data for context
    const business = await prisma.business.findUnique({
      where: { business_urlname: businessUrlname },
      select: {
        business_id: true,
        business_name: true,
        business_descr: true,
        business_email: true,
        business_phone: true
      }
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Get business services for context
    const services = await prisma.service.findMany({
      where: {
        business_id: business.business_id,
        is_active: true
      },
      select: {
        service_name: true,
        description: true,
        price_base: true,
        active_booking: true,
        active_quotation: true
      }
    });

    // Create system prompt with business context
    const systemPrompt = `Sei l'assistente virtuale di ${business.business_name}. I tuoi capi e amministratori della società sono Roly (him), Aurix (aka Aurora, her) e Gianlucazzo (aka Gianluca, him). 

INFORMAZIONI AZIENDA:
- Nome: ${business.business_name}
- Descrizione: ${business.business_descr || 'Non disponibile'}
- Email: ${business.business_email ? JSON.stringify(business.business_email) : 'Non disponibile'}
- Telefono: ${business.business_phone ? JSON.stringify(business.business_phone) : 'Non disponibile'}

SERVIZI DISPONIBILI:
${services.map(service => 
  `- ${service.service_name}: ${service.description || 'Nessuna descrizione'} (€${service.price_base || 'Prezzo su richiesta'}, Durata variabile)
   - Prenotabile: ${service.active_booking ? 'Sì' : 'No'}
   - Preventivo automatico: ${service.active_quotation ? 'Sì' : 'No'}`
).join('\n')}

REGOLE IMPORTANTI:
1. Rispondi nella lingua del cliente
2. Sii cordiale e professionale, ma non troppo formale e aggiungi qualche emoji.
3. Mantieni le risposte concise (max ${MAX_OUTPUT_TOKENS} token)
4. Se non puoi aiutare, suggerisci di contattare l'azienda
5. Non fornire informazioni personali o sensibili
6. Non fare promesse che non puoi mantenere
7. Se la richiesta è troppo complessa, prendi spunto dalla risposta di fallback e continuala con qualcosa del tipo 'Intanto ti consiglio di....'
8. Se il cliente usa un linguaggio non formale, rispondi in modo simile usando un gergo da ragazzo.

RISPOSTA DI FALLBACK: "${FALLBACK_RESPONSE}"`;

    // Create user message with context
    const userMessage = `Messaggio utente: "${message}"

${context?.messages ? `Contesto conversazione (ultimi 3 messaggi):
${context.messages.slice(-3).map((msg: any) => `${msg.type}: ${msg.content}`).join('\n')}` : ''}`;

    // Log the prompt being sent to OpenAI
    console.log('=== OPENAI PROMPT SENT ===');
    console.log('System Prompt:', systemPrompt);
    console.log('User Message:', userMessage);
    console.log('Business:', business.business_name);
    console.log('Services Count:', services.length);
    console.log('================================');

         // Stream the response
     const result = await streamText({
       model: openai('gpt-4o-mini'),
       temperature: 0.7,
       messages: [
         { role: 'system', content: systemPrompt },
         { role: 'user', content: userMessage }
       ],
     });

    // Log the raw response
    console.log('=== OPENAI RAW RESPONSE ===');
    console.log('Response Object:', JSON.stringify(result, null, 2));
    console.log('Text Stream Type:', typeof result.textStream);
    console.log('================================');

    // Log successful request (we'll log the full response after streaming)
    const startTime = Date.now();
    const estimatedInputTokens = Math.ceil((systemPrompt.length + userMessage.length) / 4);

    // Create a custom readable stream that includes prompt info in the first chunk
    const promptInfo = {
      systemPrompt,
      userMessage,
      business: business.business_name,
      servicesCount: services.length
    };

    const encoder = new TextEncoder();
    const promptChunk = encoder.encode(JSON.stringify({ type: 'prompt', data: promptInfo }) + '\n');
    
    const originalStream = result.textStream;
    let fullResponse = '';
    
    const combinedStream = new ReadableStream({
      start(controller) {
        // Send prompt info first
        controller.enqueue(promptChunk);
        
        // Then pipe the original text stream
        const reader = originalStream.getReader();
        function pump(): Promise<void> {
          return reader.read().then(({ done, value }) => {
            if (done) {
              // Log the complete message history
              const responseTime = Date.now() - startTime;
              const estimatedOutputTokens = Math.ceil(fullResponse.length / 4);
              const cost = calculateTokenCost(estimatedInputTokens, estimatedOutputTokens);
              
              logAIMessageHistory({
                business_id: business?.business_id || 'unknown',
                session_id: context?.sessionId,
                user_message: message,
                ai_response: fullResponse,
                message_type: 'conversation',
                request_type: 'openai',
                input_tokens: estimatedInputTokens,
                output_tokens: estimatedOutputTokens,
                cost_usd: cost.cost,
                response_time_ms: responseTime,
                success: true,
                user_ip: ip,
                user_agent: request.headers.get('user-agent') || undefined,
                validation_passed: true,
              });
              
              controller.close();
              return;
            }
            
            // Accumulate the full response
            if ((value as any) instanceof Uint8Array || (value as any) instanceof ArrayBuffer) {
              const chunk = new TextDecoder().decode(value as unknown as Uint8Array);
              fullResponse += chunk;
            }
            
            controller.enqueue(value);
            return pump();
          });
        }
        return pump();
      }
    });

    // Add rate limit headers
    const response = new Response(combinedStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': (Date.now() + RATE_LIMIT_WINDOW).toString(),
      },
    });

    return response;

  } catch (error: any) {
    console.error('=== OPENAI API ERROR ===');
    console.error('Error:', error);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('========================');
    
    // Log error in message history (with minimal data since variables might not be available)
    try {
      await logAIMessageHistory({
        business_id: 'unknown',
        session_id: undefined,
        user_message: 'Error occurred before message processing',
        request_type: 'error',
        success: false,
        error_message: error.message || 'Unknown error',
        user_ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || undefined,
      });
    } catch (logError) {
      console.error('Failed to log error to message history:', logError);
    }
    
    // Return fallback response on error
    return NextResponse.json(
      { 
        error: 'Internal server error',
        fallback: FALLBACK_RESPONSE
      },
      { status: 500 }
    );
  }
}

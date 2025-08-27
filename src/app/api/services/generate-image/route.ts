import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { auth } from '@/lib/auth';
import { AIContentGenerationRateLimiter } from '@/lib/ai-content-generation-rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { serviceTitle, imageDescription, businessId } = await request.json();

    // Validate input
    if (!serviceTitle || !businessId) {
      return NextResponse.json(
        { error: 'Service title and business ID are required' },
        { status: 400 }
      );
    }

    // Check rate limiting
    const rateLimitResult = await AIContentGenerationRateLimiter.checkAndConsumeToken(businessId, 1); // Assuming plan ID 1 for now
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.errorMessage || 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Build the prompt for image generation
    let prompt = `Create a clean, professional stock image style cover for a service called "${serviceTitle}". `;
    
    if (imageDescription) {
      prompt += `Additional description: ${imageDescription}. `;
    }
    
    prompt += `The image should be:
    - Simple and clean, not overly creative or complex
    - High resolution and professional looking
    - Stock image style, suitable for business use
    - Relevant to the service but not too specific
    - 16:9 aspect ratio, landscape orientation
    - No text or logos, just visual elements
    - Professional color scheme
    - Suitable for a service listing cover image`;

    console.log('🤖 [generateServiceImage] Generating image with prompt:', prompt);

    // Generate image using OpenAI DALL-E
    const result = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      size: '1792x1024', // 16:9 aspect ratio
      quality: 'standard',
      style: 'natural', // More realistic, less artistic
    });

    console.log('✅ [generateServiceImage] Image generated successfully');

    // Get the image URL from the response
    if (!result.data || !result.data[0]) {
      throw new Error('No image data received from OpenAI');
    }
    
    const imageUrl = result.data[0].url;
    if (!imageUrl) {
      throw new Error('No image URL received from OpenAI');
    }

    // Fetch the image and convert to base64
    const imageResponse = await fetch(imageUrl);
    const arrayBuffer = await imageResponse.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;

    return NextResponse.json({
      success: true,
      imageDataUrl: dataUrl,
      generationsAvailable: rateLimitResult.generationsAvailable,
    });

  } catch (error) {
    console.error('❌ [generateServiceImage] Error generating image:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate image. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// src/app/api/payments/get-checkout-session/route.ts

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import stripe from '@/lib/stripe'; // Your shared Stripe utility instance
import type { NextRequest } from 'next/server';

// This ensures the route is not cached, which is good practice for API routes
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID is required.' }, { status: 400 });
  }

  if (!stripe) {
    console.error('Stripe is not initialized.');
    return NextResponse.json({ error: 'Stripe service is unavailable.' }, { status: 500 });
  }

  try {
    // Retrieve the Checkout Session from Stripe
    // IMPORTANT: Expand 'line_items.data.price.product' to get the full product object
    // including its 'name' for the frontend. This is 4 levels deep, which is the limit.
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'subscription', 'line_items.data.price.product'],
    });

    if (!session) {
      return NextResponse.json({ error: 'Checkout session not found.' }, { status: 404 });
    }

    return NextResponse.json({ session }, { status: 200 });
  } catch (error: any) {
    console.error('Error retrieving checkout session:', error);
    return NextResponse.json({ error: error.message || 'Failed to retrieve session details.' }, { status: 500 });
  }
}

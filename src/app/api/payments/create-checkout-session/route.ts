// src/app/api/payments/create-checkout-session/route.ts

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import stripe from '@/lib/stripe'; // Your Stripe utility
import prisma from '@/lib/prisma'; // Your Prisma client

export async function POST(req: Request) {
  const { priceId, userId, userEmail } = await req.json();

  if (!priceId || !userId || !userEmail) {
    return NextResponse.json({ error: 'Missing required fields: priceId, userId, or userEmail' }, { status: 400 });
  }

  try {
    // 1. Find the internal Plan based on the provided Stripe Price ID
    const plan = await prisma.plan.findUnique({
      where: { stripe_price_id: priceId },
    });

    if (!plan) {
      console.error(`Plan not found for priceId: ${priceId}`);
      return NextResponse.json({ error: 'Invalid plan selected.' }, { status: 400 });
    }

    // 2. Find or create Stripe Customer
    let customer: Stripe.Customer | undefined;

    const existingUserManager = await prisma.usermanager.findUnique({
      where: { user_id: userId },
    });

    if (existingUserManager?.stripe_customer_id) {
      const customerResponse = await stripe!.customers.retrieve(existingUserManager.stripe_customer_id);
      if ((customerResponse as Stripe.DeletedCustomer).deleted) {
        throw new Error('Stripe customer has been deleted.');
      }
      customer = customerResponse as Stripe.Customer;
      if (customer.email !== userEmail) {
        await stripe!.customers.update(customer.id, { email: userEmail });
      }
      // Do NOT update plan_id here. Only update in webhook after payment confirmation.
    } else {
      // Create a new Stripe customer
      customer = await stripe!.customers.create({
        email: userEmail,
        metadata: {
          userId: userId, // Link to your internal user_id from UserManager
        },
      });
      // Store the new customer ID in your UserManager table
      await prisma.usermanager.update({
        where: { user_id: userId },
        data: {
          stripe_customer_id: customer.id,
        },
      });
      console.log(`New Stripe customer created for UserManager ${userId}.`);
    }

    if (!customer) {
      throw new Error('Failed to retrieve or create Stripe customer.');
    }

    // 3. Create the Checkout Session
    const session = await stripe!.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/plan/subscription-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/plan/subscription-cancelled`,
      metadata: {
        userId: userId, // Pass your internal user_id to the webhook
        planId: plan.plan_id.toString(), // Pass the internal plan ID to the webhook for easier lookup
      },
      subscription_data: {
        // Optional: If you want to offer a trial directly from checkout
        // trial_period_days: 7,
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}

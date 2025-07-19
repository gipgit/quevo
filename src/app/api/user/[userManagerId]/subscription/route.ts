import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import getStripe from '@/lib/stripe';

export async function GET(req: NextRequest, { params }: { params: { userManagerId: string } }) {
  const { userManagerId } = params;
  if (!userManagerId) {
    return NextResponse.json({ error: 'Missing userManagerId' }, { status: 400 });
  }

  // Fetch UserManager from DB
  const userManager = await prisma.usermanager.findUnique({
    where: { user_id: userManagerId },
  });
  if (!userManager) {
    return NextResponse.json({ error: 'UserManager not found' }, { status: 404 });
  }

  // If no Stripe customer/subscription, return DB details only
  if (!userManager.stripe_customer_id || !userManager.stripe_subscription_id) {
    return NextResponse.json({ userManager, stripe: null });
  }

  // Fetch live Stripe subscription and payment method details
  try {
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(userManager.stripe_subscription_id, {
      expand: ['default_payment_method', 'items.data.price', 'latest_invoice.payment_intent'],
    });
    let defaultPaymentMethod = null;
    if (subscription.default_payment_method && typeof subscription.default_payment_method !== 'string') {
      defaultPaymentMethod = subscription.default_payment_method;
    }
    return NextResponse.json({
      userManager,
      subscription,
      default_payment_method: defaultPaymentMethod,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, userManager, stripe: null }, { status: 500 });
  }
}

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

  // Get the first business for this manager (for backward compatibility)
  // In the future, this should be updated to handle multiple businesses
  const business = await prisma.business.findFirst({
    where: { manager_id: userManagerId },
    include: { plan: true },
  });

  if (!business) {
    return NextResponse.json({ error: 'No business found for this manager' }, { status: 404 });
  }

  // If no Stripe customer/subscription, return DB details only
  if (!business.stripe_customer_id || !business.stripe_subscription_id) {
    return NextResponse.json({ 
      userManager, 
      business,
      plan: business.plan,
      stripe: null 
    });
  }

  // Fetch live Stripe subscription and payment method details
  try {
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(business.stripe_subscription_id, {
      expand: ['default_payment_method', 'items.data.price', 'latest_invoice.payment_intent'],
    });
    let defaultPaymentMethod = null;
    if (subscription.default_payment_method && typeof subscription.default_payment_method !== 'string') {
      defaultPaymentMethod = subscription.default_payment_method;
    }
    return NextResponse.json({
      userManager,
      business,
      plan: business.plan,
      subscription,
      default_payment_method: defaultPaymentMethod,
    });
  } catch (err: any) {
    return NextResponse.json({ 
      error: err.message, 
      userManager, 
      business,
      plan: business.plan,
      stripe: null 
    }, { status: 500 });
  }
}

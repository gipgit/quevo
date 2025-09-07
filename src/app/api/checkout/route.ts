import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { planId, moduleIds, successUrl, cancelUrl } = await request.json();

    // Get plan and modules data
    const { getAllPlans } = await import('@/lib/plan-features');
    const { getAllModules } = await import('@/lib/additional-modules');
    
    const plans = getAllPlans();
    const modules = getAllModules();
    
    const selectedPlan = plans.find(p => p.id === planId);
    const selectedModules = modules.filter(m => moduleIds.includes(m.id));

    if (!selectedPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 400 });
    }

    // Create Stripe checkout session
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    // Add plan
    if (selectedPlan.stripe_price_id) {
      lineItems.push({
        price: selectedPlan.stripe_price_id,
        quantity: 1,
      });
    }

    // Add modules
    selectedModules.forEach(module => {
      if (module.stripe_price_id) {
        lineItems.push({
          price: module.stripe_price_id,
          quantity: 1,
        });
      }
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'subscription',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        planId: selectedPlan.id,
        moduleIds: JSON.stringify(moduleIds),
        planName: selectedPlan.name,
        moduleNames: JSON.stringify(selectedModules.map(m => m.name)),
      },
      subscription_data: {
        metadata: {
          planId: selectedPlan.id,
          moduleIds: JSON.stringify(moduleIds),
        },
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}

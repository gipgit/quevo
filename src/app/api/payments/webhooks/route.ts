// src/app/api/payments/webhooks/route.ts

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import getStripe from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set in environment variables. Webhook cannot be verified.');
    return NextResponse.json({ error: 'Webhook secret not configured.' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log(`Received Stripe event: ${event.type} (ID: ${event.id})`);
  } catch (err: any) {
    console.error('Webhook signature verification failed.', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Helper function to safely convert Unix timestamp to Date
  const safeUnixToDate = (timestamp: number | null): Date | null => {
    if (typeof timestamp === 'number' && !isNaN(timestamp)) {
      const date = new Date(timestamp * 1000);
      console.log(`safeUnixToDate: Input ${timestamp} -> Output Date: ${date.toISOString()}`);
      return date;
    }
    console.log(`safeUnixToDate: Input ${timestamp} -> Output: null (invalid)`);
    return null;
  };

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      const customerId = checkoutSession.customer as string;
      const subscriptionId = checkoutSession.subscription as string;
      const userIdFromMetadata = checkoutSession.metadata?.userId;
      const businessIdFromMetadata = checkoutSession.metadata?.businessId;
      const planIdFromMetadata = checkoutSession.metadata?.planId;

      console.log('Processing checkout.session.completed event...');
      console.log({ customerId, subscriptionId, userIdFromMetadata, businessIdFromMetadata, planIdFromMetadata });

      if (!userIdFromMetadata || !businessIdFromMetadata || !customerId || !subscriptionId || !planIdFromMetadata) {
        console.error('Missing critical data in checkout.session.completed webhook:', {
          userIdFromMetadata, businessIdFromMetadata, customerId, subscriptionId, planIdFromMetadata
        });
        return NextResponse.json({ error: 'Missing data' }, { status: 400 });
      }

      try {
        const stripe = getStripe();
        const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
          expand: ['items.data.price', 'default_payment_method', 'latest_invoice'],
        });
        const currentPeriodEnd = subscription.items.data[0]?.current_period_end;
        const currentPeriodStart = subscription.items.data[0]?.current_period_start;
        const nextInvoiceDate = subscription.latest_invoice && typeof subscription.latest_invoice !== 'string' ? subscription.latest_invoice.next_payment_attempt : null;
        const cancelAtPeriodEnd = subscription.cancel_at_period_end ?? null;
        const canceledAt = subscription.canceled_at ? safeUnixToDate(subscription.canceled_at) : null;
        const paymentMethod = subscription.default_payment_method && typeof subscription.default_payment_method !== 'string' ? subscription.default_payment_method : null;
        const paymentMethodId = paymentMethod?.id ?? null;
        const paymentMethodBrand = paymentMethod?.card?.brand ?? null;
        const paymentMethodLast4 = paymentMethod?.card?.last4 ?? null;
        const currentPeriodEndDate = safeUnixToDate(currentPeriodEnd);
        const currentPeriodStartDate = safeUnixToDate(currentPeriodStart);
        const nextInvoiceDateObj = safeUnixToDate(nextInvoiceDate);
        const currentPriceId = subscription.items.data[0]?.price?.id;
        const internalPlanId = parseInt(planIdFromMetadata, 10);
        const plan = await prisma.plan.findUnique({
          where: { stripe_price_id: currentPriceId },
        });
        if (!plan || plan.plan_id !== internalPlanId) {
          console.error(`Mismatch or missing Plan for priceId: ${currentPriceId} or planId: ${internalPlanId}`);
          return NextResponse.json({ error: 'Plan data mismatch' }, { status: 400 });
        }
        await prisma.business.update({
          where: { business_id: businessIdFromMetadata },
          data: {
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            stripe_price_id: currentPriceId,
            stripe_current_period_start: currentPeriodStartDate,
            stripe_current_period_end: currentPeriodEndDate,
            stripe_next_invoice_date: nextInvoiceDateObj,
            stripe_cancel_at_period_end: cancelAtPeriodEnd,
            stripe_canceled_at: canceledAt,
            stripe_payment_method_id: paymentMethodId,
            stripe_payment_method_brand: paymentMethodBrand,
            stripe_payment_method_last4: paymentMethodLast4,
            stripe_status: subscription.status,
            subscription_status: subscription.status,
            plan_id: plan.plan_id,
          },
        });

        // Initialize AI credits for new subscription
        const { AICreditsManager } = await import('@/lib/ai-credits-manager');
        await AICreditsManager.initializeCreditsForBusiness(
          businessIdFromMetadata,
          plan.plan_id,
          currentPeriodStartDate || undefined,
          currentPeriodEndDate || undefined
        );

        console.log(`Business ${businessIdFromMetadata} subscribed/updated successfully! Status: ${subscription.status}, Plan ID: ${plan.plan_id} (${plan.plan_name}). stripe_current_period_end set to: ${currentPeriodEndDate?.toISOString()}`);
      } catch (prismaError) {
        console.error(`Error updating Business ${businessIdFromMetadata} after checkout.session.completed:`, prismaError);
        // Log the full error for more details
        if (prismaError instanceof Error) {
          console.error(prismaError.stack);
        }
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }
      break;

    case 'customer.subscription.updated':
      const updatedSubscription = event.data.object as Stripe.Subscription;
      const updatedCustomerId = updatedSubscription.customer as string;

      console.log('Processing customer.subscription.updated event for customer:', updatedCustomerId);
      // Stripe API v2025+ does NOT return current_period_end at the root of the subscription object.
      // Instead, get it from the first item in updatedSubscription.items.data
      const updatedCurrentPeriodEnd = updatedSubscription.items.data[0]?.current_period_end;
      console.log(`Stripe Subscription current_period_end: ${updatedCurrentPeriodEnd}`);
      const updatedCurrentPeriodEndDate = safeUnixToDate(updatedCurrentPeriodEnd);
      console.log(`Converted currentPeriodEndDate for DB: ${updatedCurrentPeriodEndDate ? updatedCurrentPeriodEndDate.toISOString() : 'NULL'}`);

      try {
        const businessToUpdate = await prisma.business.findUnique({
          where: { stripe_customer_id: updatedCustomerId },
        });

        if (businessToUpdate) {
          const currentPriceId = updatedSubscription.items.data[0]?.price?.id;
          const plan = await prisma.plan.findUnique({
            where: { stripe_price_id: currentPriceId },
          });
          const newPlanId = plan ? plan.plan_id : 1;
          const updatedCurrentPeriodStart = updatedSubscription.items.data[0]?.current_period_start;
          const updatedCurrentPeriodEnd = updatedSubscription.items.data[0]?.current_period_end;
          const updatedCurrentPeriodStartDate = safeUnixToDate(updatedCurrentPeriodStart);
          const updatedCurrentPeriodEndDate = safeUnixToDate(updatedCurrentPeriodEnd);
          const updatedNextInvoiceDate = updatedSubscription.latest_invoice && typeof updatedSubscription.latest_invoice !== 'string' ? updatedSubscription.latest_invoice.next_payment_attempt : null;
          const updatedNextInvoiceDateObj = safeUnixToDate(updatedNextInvoiceDate);
          const updatedCancelAtPeriodEnd = updatedSubscription.cancel_at_period_end ?? null;
          const updatedCanceledAt = updatedSubscription.canceled_at ? safeUnixToDate(updatedSubscription.canceled_at) : null;
          const updatedPaymentMethod = updatedSubscription.default_payment_method && typeof updatedSubscription.default_payment_method !== 'string' ? updatedSubscription.default_payment_method : null;
          const updatedPaymentMethodId = updatedPaymentMethod?.id ?? null;
          const updatedPaymentMethodBrand = updatedPaymentMethod?.card?.brand ?? null;
          const updatedPaymentMethodLast4 = updatedPaymentMethod?.card?.last4 ?? null;
          await prisma.business.update({
            where: { business_id: businessToUpdate.business_id },
            data: {
              stripe_subscription_id: updatedSubscription.id,
              stripe_price_id: currentPriceId,
              stripe_current_period_end: updatedCurrentPeriodEndDate,
              stripe_current_period_start: updatedCurrentPeriodStartDate,
              stripe_next_invoice_date: updatedNextInvoiceDateObj,
              stripe_cancel_at_period_end: updatedCancelAtPeriodEnd,
              stripe_canceled_at: updatedCanceledAt,
              stripe_payment_method_id: updatedPaymentMethodId,
              stripe_payment_method_brand: updatedPaymentMethodBrand,
              stripe_payment_method_last4: updatedPaymentMethodLast4,
              stripe_status: updatedSubscription.status,
              subscription_status: updatedSubscription.status,
              plan_id: newPlanId,
            },
          });

          // Update AI credits for plan change
          const { AICreditsManager } = await import('@/lib/ai-credits-manager');
          const planCreditsMap: Record<number, number> = {
            1: 50,    // FREE
            2: 500,   // PRO
            3: 1500,  // PRO PLUS
            4: 999999, // PRO UNLIMITED
          };
          const planCredits = planCreditsMap[newPlanId] || 0;
          
          await AICreditsManager.allocateCreditsForPeriod(
            businessToUpdate.business_id,
            planCredits,
            updatedCurrentPeriodStartDate || new Date(),
            updatedCurrentPeriodEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
          );

          console.log(`Subscription for customer ${updatedCustomerId} updated to ${updatedSubscription.status}, Plan ID: ${newPlanId} (${plan?.plan_name || 'FREE'}). stripe_current_period_end set to: ${updatedCurrentPeriodEndDate?.toISOString()}`);
        } else {
            console.warn(`Business with Stripe Customer ID ${updatedCustomerId} not found in DB for subscription update.`);
        }
      } catch (prismaError) {
        console.error(`Error updating Business for customer.subscription.updated:`, prismaError);
        if (prismaError instanceof Error) {
          console.error(prismaError.stack);
        }
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }
      break;

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object as Stripe.Subscription;
      const deletedCustomerId = deletedSubscription.customer as string;
      try {
        const businessToDelete = await prisma.business.findUnique({
          where: { stripe_customer_id: deletedCustomerId },
        });
        if (businessToDelete) {
          const freePlan = await prisma.plan.findUnique({
            where: { plan_name: 'FREE' },
            select: { plan_id: true }
          });
          const freePlanId = freePlan ? freePlan.plan_id : 1;
          await prisma.business.update({
            where: { business_id: businessToDelete.business_id },
            data: {
              stripe_subscription_id: null,
              stripe_price_id: null,
              stripe_current_period_end: null,
              stripe_current_period_start: null,
              stripe_next_invoice_date: null,
              stripe_cancel_at_period_end: null,
              stripe_canceled_at: null,
              stripe_payment_method_id: null,
              stripe_payment_method_brand: null,
              stripe_payment_method_last4: null,
              stripe_status: 'canceled',
              subscription_status: 'canceled',
              plan_id: freePlanId,
            },
          });
          console.log(`Subscription for customer ${deletedCustomerId} deleted. Business plan set to FREE (ID: ${freePlanId}).`);
        } else {
            console.warn(`Business with Stripe Customer ID ${deletedCustomerId} not found in DB for subscription deletion.`);
        }
      } catch (prismaError) {
        console.error(`Error updating Business for customer.subscription.deleted:`, prismaError);
        if (prismaError instanceof Error) {
          console.error(prismaError.stack);
        }
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }
      break;

    case 'invoice.paid':
      const invoicePaid = event.data.object as Stripe.Invoice;
      const paidCustomerId = invoicePaid.customer as string;
      console.log(`Invoice paid for customer ${paidCustomerId}. Invoice ID: ${invoicePaid.id}`);
      break;

    case 'invoice.payment_failed':
      const invoiceFailed = event.data.object as Stripe.Invoice;
      const failedCustomerId = invoiceFailed.customer as string;

      try {
        const businessAfterFailedPayment = await prisma.business.findUnique({
            where: { stripe_customer_id: failedCustomerId },
            include: { usermanager: true }
        });

        if (businessAfterFailedPayment) {
            // Update business subscription status to past_due
            await prisma.business.update({
                where: { business_id: businessAfterFailedPayment.business_id },
                data: {
                  subscription_status: 'past_due',
                },
            });
            console.log(`Invoice payment failed for customer ${failedCustomerId}. Business subscription status set to 'past_due'.`);
        } else {
            console.warn(`Business with Stripe Customer ID ${failedCustomerId} not found in DB for failed payment.`);
        }
      } catch (prismaError) {
        console.error(`Error updating UserManager for invoice.payment_failed:`, prismaError);
        if (prismaError instanceof Error) {
          console.error(prismaError.stack);
        }
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }
      break;

    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

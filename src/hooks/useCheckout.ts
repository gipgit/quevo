import { useState } from 'react';
import { PlanFeature } from '@/lib/plan-features';

interface CheckoutState {
  loading: boolean;
  error: string | null;
}

export function useCheckout() {
  const [state, setState] = useState<CheckoutState>({
    loading: false,
    error: null,
  });

  const createCheckoutSession = async (
    plan: PlanFeature,
    userId: string,
    userEmail: string,
    businessId: string,
    successUrl?: string,
    cancelUrl?: string
  ) => {
    setState({ loading: true, error: null });

    try {
      console.log('Checkout request:', {
        plan: plan.name,
        ai_credits: plan.ai_credits_included,
        userId,
        userEmail,
        businessId,
        successUrl: successUrl || `${window.location.origin}/dashboard?success=true`,
        cancelUrl: cancelUrl || `${window.location.origin}/pricing?canceled=true`,
      });

      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.stripe_price_id,
          userId,
          userEmail,
          businessId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { sessionId, url } = await response.json();
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
      
      setState({ loading: false, error: null });
    } catch (error: any) {
      setState({ loading: false, error: error.message });
    }
  };

  return {
    ...state,
    createCheckoutSession,
  };
}







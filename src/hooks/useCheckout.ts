import { useState } from 'react';
import { PlanFeature } from '@/lib/plan-features';
import { AdditionalModule } from '@/lib/additional-modules';

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
    modules: AdditionalModule[],
    successUrl?: string,
    cancelUrl?: string
  ) => {
    setState({ loading: true, error: null });

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          moduleIds: modules.map(m => m.id),
          successUrl: successUrl || `${window.location.origin}/dashboard?success=true`,
          cancelUrl: cancelUrl || `${window.location.origin}/pricing?canceled=true`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();

      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      setState({ loading: false, error: error.message });
    }
  };

  return {
    ...state,
    createCheckoutSession,
  };
}

import Stripe from 'stripe';

let stripe: Stripe | undefined;

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

// To avoid re-initializing Stripe in development due to Next.js hot-reloading
if (process.env.NODE_ENV === 'production') {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-06-30.basil', // Use the latest API version as required by the Stripe types
  });
} else {
  if (!(global as any).stripe) {
    (global as any).stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil',
    });
  }
  stripe = (global as any).stripe;
}

export default stripe;
// Static plan features configuration
export interface PlanFeature {
  id: string;
  name: string;
  description: string;
  display_price: string;
  display_frequency: string;
  stripe_price_id?: string;
  stripe_product_id?: string;
  features: string[];
}

export const PLAN_FEATURES: Record<string, PlanFeature> = {
  FREE: {
    id: '1',
    name: 'FREE',
    description: 'Perfect for getting started with basic features',
    display_price: '$0',
    display_frequency: 'month',
    stripe_price_id: 'price_1Rga6DFZno1GO0aPb1BIRjHj',
    stripe_product_id: 'prod_SbnhM60y15v5Q0',
    features: [
      'Service Requests: 30 / month',
      'Appointments: 30 / month',
      'Board Duration: 1 week (+ backup export)',
      'Operations per Board: 30',
      'Support Requests: Basic (Email only)',
      '❌ Email automatiche quando ricevi richiesta',
      '❌ Email Automatiche con inserimento Azione',
      '❌ Automatic appointment reminders'
    ]
  },
  PRO: {
    id: '2',
    name: 'Pro',
    description: 'Access to essential features with increased usage limits and standard support',
    display_price: '$20',
    display_frequency: 'month',
    stripe_price_id: 'price_1RgSNNFZno1GO0aPl3EGir5D',
    stripe_product_id: 'prod_SbfimtKbyTaWs1',
    features: [
      'Service Requests: 300 / month',
      'Appointments: 300 / month',
      'Board Duration: up to 6 months (+ backup export)',
      'Operations per Board: 50',
      'Support Requests: Standard (Email + Chat)',
      'Remove Logo',
      'Email Automatiche',
      'Google Reviews, Faqs',
      '❌ Automatic appointment reminders'
    ]
  },
  'PRO PLUS': {
    id: '3',
    name: 'Pro Plus',
    description: 'Unlock the full power of our platform with increased limits and priority support',
    display_price: '$45',
    display_frequency: 'month',
    stripe_price_id: 'price_1RgSONFZno1GO0aPOj8i43Ad',
    stripe_product_id: 'prod_SbfjO9k5FV4fAz',
    features: [
      'Service Requests: 1000 / month',
      'Appointments: 1000 / month',
      'Board Duration: up to 2 years (+ backup export)',
      'Operations per Board: 150',
      'Support Requests: Priority (Email + Chat + Phone)',
      'Remove Logo, Video Covers, Document Upload, Document Download',
      '✅ Automatic appointment reminders (Email + SMS)'
    ]
  },
  'PRO UNLIMITED': {
    id: '4',
    name: 'Pro Unlimited',
    description: 'Unleash the full potential of our platform with unlimited access to all features',
    display_price: '$165',
    display_frequency: 'month',
    stripe_price_id: '',
    stripe_product_id: '',
    features: [
      'Appointments: Unlimited',
      'Service Requests: Unlimited',
      'Board Duration: Unlimited (see details)',
      'Operations per Board: Unlimited',
      'Support Requests: 24/7 Priority (Email + Chat + Phone + Dedicated Manager)',
      'Remove Logo, Video Covers, Document Upload, Document Download',
      '✅ Automatic appointment reminders (Email + SMS + Advanced scheduling)'
    ]
  }
};

// Helper function to get all plans in order
export function getAllPlans(): PlanFeature[] {
  return Object.values(PLAN_FEATURES).sort((a, b) => parseInt(a.id) - parseInt(b.id));
}

// Helper function to get plan by ID
export function getPlanById(id: string): PlanFeature | undefined {
  return Object.values(PLAN_FEATURES).find(plan => plan.id === id);
}

// Helper function to get plan by name
export function getPlanByName(name: string): PlanFeature | undefined {
  return PLAN_FEATURES[name];
}

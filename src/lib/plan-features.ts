// Feature types for icon differentiation
export type FeatureType = 'core' | 'ai';

export interface PlanFeatureItem {
  text: string;
  type: FeatureType;
  description?: string;
}

// Static plan features configuration
export interface PlanFeature {
  id: string;
  name: string;
  description: string;
  display_price: string;
  display_frequency: string;
  stripe_price_id?: string;
  stripe_product_id?: string;
  features: PlanFeatureItem[];
  ai_credits_included: number | string;
  support: string;
}

export const PLAN_FEATURES: Record<string, PlanFeature> = {
  FREE: {
    id: '1',
    name: 'FREE',
    description: 'Perfect for getting started with basic features.',
    display_price: '$0',
    display_frequency: 'month',
    stripe_price_id: 'price_1Rga6DFZno1GO0aPb1BIRjHj',
    stripe_product_id: 'prod_SbnhM60y15v5Q0',
    features: [
      { text: 'Remove Quevo Logo', type: 'core' },
      { text: 'Service Requests: 30 / month', type: 'core' },
      { text: 'Appointments: 30 / month', type: 'core' },
      { text: 'Board Duration: 1 week', type: 'core' },
      { text: 'AI Response Assistant (Basic)', type: 'ai', description: 'Automatically generates professional responses to customer inquiries' },
      { text: 'AI Content Generation (Limited)', type: 'ai', description: 'Create basic content for your business needs' }
    ],
    ai_credits_included: 50,
    support: 'Basic (Email only)'
  },
  PRO: {
    id: '2',
    name: 'Pro',
    description: 'Access to essential features with increased usage limits and standard support.',
    display_price: '$20',
    display_frequency: 'month',
    stripe_price_id: 'price_1RgSNNFZno1GO0aPl3EGir5D',
    stripe_product_id: 'prod_SbfimtKbyTaWs1',
    features: [
      { text: 'All Free features', type: 'core' },
      { text: 'Remove Quevo Logo', type: 'core' },
      { text: 'Service Requests: 300 / month', type: 'core' },
      { text: 'Appointments: 300 / month', type: 'core' },
      { text: 'Board Duration: up to 6 months', type: 'core' },
      { text: 'Google Reviews & FAQs Integration', type: 'core' },
      { text: 'AI Email Content Creator', type: 'ai', description: 'Automated email content generation with brand tone matching' },
      { text: 'AI Social Media Content Creator', type: 'ai', description: 'Complete social media content planning with posting timelines' },
      { text: 'AI Support Requests Assistant', type: 'ai', description: 'Intelligent support request analysis and action recommendations' },
      { text: 'Email Marketing Campaigns', type: 'ai', description: 'AI-powered email campaign creation and management' }
    ],
    ai_credits_included: 500,
    support: 'Standard (Email + In-Dashboard Messages)'
  },
  'PRO PLUS': {
    id: '3',
    name: 'Pro Plus',
    description: 'Unlock the full power of our platform with increased limits and priority support.',
    display_price: '$45',
    display_frequency: 'month',
    stripe_price_id: 'price_1RgSONFZno1GO0aPOj8i43Ad',
    stripe_product_id: 'prod_SbfjO9k5FV4fAz',
    features: [
      { text: 'All Pro features', type: 'core' },
      { text: 'Remove Quevo Logo', type: 'core' },
      { text: 'Service Requests: 1000 / month', type: 'core' },
      { text: 'Appointments: 1000 / month', type: 'core' },
      { text: 'Board Duration: up to 2 years', type: 'core' },
      { text: 'Video Covers', type: 'core' },
      { text: 'Document Upload & Download', type: 'core' },
      { text: 'Automatic appointment reminders (Email + SMS)', type: 'core' },
      { text: 'AI Chat Assistant (Advanced)', type: 'ai', description: 'Advanced customer support assistant with brand understanding' },
      { text: 'Advanced AI Content Customization', type: 'ai', description: 'Fine-tune AI content to match your specific brand voice' },
      { text: 'AI-Powered Analytics & Insights', type: 'ai', description: 'Get intelligent insights from your business data' },
      { text: 'Priority AI Feature Access', type: 'ai', description: 'Early access to new AI features and capabilities' }
    ],
    ai_credits_included: 1500,
    support: 'Priority (Email + In-Dashboard Messages)'
  },
  'PRO UNLIMITED': {
    id: '4',
    name: 'Pro Unlimited',
    description: 'Unleash the full potential of our platform with unlimited access to all features.',
    display_price: '$165',
    display_frequency: 'month',
    stripe_price_id: '',
    stripe_product_id: '',
    features: [
      { text: 'Remove Quevo Logo', type: 'core' },
      { text: 'Appointments: Unlimited', type: 'core' },
      { text: 'Service Requests: Unlimited', type: 'core' },
      { text: 'Board Duration: Unlimited', type: 'core' },
      { text: 'Operations per Board: Unlimited', type: 'core' },
      { text: 'Video Covers', type: 'core' },
      { text: 'Document Upload & Download', type: 'core' },
      { text: 'All AI Features (Unlimited)', type: 'ai', description: 'Complete access to all AI capabilities without limits' },
      { text: 'AI Chat Assistant (Enterprise)', type: 'ai', description: 'Enterprise-grade customer support with advanced AI capabilities' },
      { text: 'Advanced AI Workflow Automation', type: 'ai', description: 'Automate complex business workflows with AI intelligence' },
      { text: 'Dedicated AI Support & Training', type: 'ai', description: 'Personalized AI training and dedicated support team' }
    ],
    ai_credits_included: 'unlimited',
    support: '24/7 Priority (Email + In-Dashboard Messages)'
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

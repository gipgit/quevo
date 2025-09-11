// Additional modules configuration
export interface AdditionalModule {
  id: string;
  name: string;
  price: string;
  frequency: string;
  description: string;
  features: string[];
  aiCredits?: string;
  icon: string;
  stripe_price_id?: string;
}

export const ADDITIONAL_MODULES: AdditionalModule[] = [
  {
    id: 'email-marketing',
    name: 'Email Marketing Campaigns',
    price: '$25',
    frequency: 'month',
    description: 'Send emails to all customers',
    features: [
      'Send emails to all customers',
      '2,000 AI credits / month for marketing campaigns'
    ],
    aiCredits: '2,000 AI credits / month',
    icon: '✉',
    stripe_price_id: 'price_email_marketing_monthly' // Replace with actual Stripe price ID
  },
  {
    id: 'ai-chat-assistant',
    name: 'AI Chat Assistant',
    price: '$9',
    frequency: 'month',
    description: 'Intelligent customer support assistant',
    features: [
      'No technical skills or extra configuration required',
      'Understands and matches your brand and services, tone, target and more, reading real time data available and linked in your profile',
      'Easy and quick specific customization: customize the behavior anytime with one click',
      '1,000 AI credits / month'
    ],
    aiCredits: '1,000 AI credits / month',
    icon: '✨',
    stripe_price_id: 'price_ai_chat_monthly' // Replace with actual Stripe price ID
  },
  {
    id: 'ai-email-creator',
    name: 'AI Email Content Creator',
    price: '<$9',
    frequency: 'month',
    description: 'Automated email content generation',
    features: [
      'No technical skills or extra configuration required',
      'Understands and matches your brand tone and style',
      'If needed, easy and quick specific customization: customize tone, content length, qualities to highlight etc',
      '1,000 AI credits / month'
    ],
    aiCredits: '1,000 AI credits / month',
    icon: '✨',
    stripe_price_id: 'price_ai_email_monthly' // Replace with actual Stripe price ID
  },
  {
    id: 'ai-social-creator',
    name: 'AI Social Media Content Creator',
    price: '<$15',
    frequency: 'month',
    description: 'Complete social media content planning',
    features: [
      'Choose socials and frequency for posts, qualities to highlight etc and Click Generate: you get a full month of posts content',
      'A posting timeline with dates and times, covering different type of posts',
      '1,000 AI credits / month'
    ],
    aiCredits: '1,000 AI credits / month',
    icon: '✨',
    stripe_price_id: 'price_ai_social_monthly' // Replace with actual Stripe price ID
  },
  {
    id: 'ai-support-assistant',
    name: 'AI Support Requests Assistant',
    price: '$12',
    frequency: 'month',
    description: 'Intelligent support request analysis',
    features: [
      'Your customers support requests are sent from the board link and linked to a specific board that contain a timeline of events connected to that service process',
      'Helps you understand faster what the message, what the user wants, what happened in the past with that customer, what may have gone wrong',
      'Only uses generic non-personal information about events (for example dates or status of events) contained in the Service Board linked to the service request, excluding and without having access to documents uploaded or sensible information that may be present in the board (no names, no payments details)',
      'Analyzes the original message and corrects any orthography or syntax errors in the original message and provides a second easier to read version',
      'Provides the shortest and most practical list of actions that should be performed based on the message',
      '1,000 AI credits / month'
    ],
    aiCredits: '1,000 AI credits / month',
    icon: '✨',
    stripe_price_id: 'price_ai_support_monthly' // Replace with actual Stripe price ID
  },
  {
    id: 'response-assistant',
    name: 'Response Assistant',
    price: '$8',
    frequency: 'month',
    description: 'AI-powered response generation for customer inquiries',
    features: [
      'Automatically generates professional responses to customer inquiries',
      'Matches your brand tone and communication style',
      'Context-aware responses based on customer history',
      '500 AI credits / month'
    ],
    aiCredits: '500 AI credits / month',
    icon: '💬',
    stripe_price_id: 'price_response_assistant_monthly' // Replace with actual Stripe price ID
  }
];

// Helper function to get all modules
export function getAllModules(): AdditionalModule[] {
  return ADDITIONAL_MODULES;
}

// Helper function to get module by ID
export function getModuleById(id: string): AdditionalModule | undefined {
  return ADDITIONAL_MODULES.find(module => module.id === id);
}

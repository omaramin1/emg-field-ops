import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

export const STRIPE_CONFIG = {
  // Architect OS pricing tiers
  ARCHITECT_OS_PRICING: {
    STARTER: {
      price: 97,
      name: 'Architect OS Starter',
      description: 'Basic access to Architect OS framework and templates',
      features: ['Core framework', 'Basic templates', 'Community support'],
    },
    PROFESSIONAL: {
      price: 497,
      name: 'Architect OS Professional',
      description: 'Advanced features and priority support',
      features: ['Everything in Starter', 'Advanced templates', 'Priority support', '1-on-1 onboarding'],
    },
    ENTERPRISE: {
      price: 9997,
      name: 'Architect OS Enterprise',
      description: 'Full enterprise solution with custom integration',
      features: ['Everything in Professional', 'Custom integrations', 'White-label options', 'Dedicated account manager'],
    },
  },

  // EMG Field App application fees
  EMG_APPLICATION_FEES: {
    BASIC_SUBMISSION: {
      price: 25,
      name: 'Basic Application Submission',
      description: 'Standard processing fee for EMG field applications',
    },
    EXPEDITED_REVIEW: {
      price: 75,
      name: 'Expedited Review',
      description: 'Priority processing within 24-48 hours',
    },
    PREMIUM_PACKAGE: {
      price: 150,
      name: 'Premium Application Package',
      description: 'Comprehensive review with consultation',
    },
  },

  // Stripe settings
  CURRENCY: 'usd',
  PAYMENT_METHOD_TYPES: ['card'],
  STATEMENT_DESCRIPTOR: 'ARCHITECT.OS',
  
  // Webhook settings
  WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  
  // Success/cancel URLs (will be set dynamically)
  SUCCESS_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  CANCEL_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
} as const;

export type ArchitectOSTier = keyof typeof STRIPE_CONFIG.ARCHITECT_OS_PRICING;
export type EMGApplicationType = keyof typeof STRIPE_CONFIG.EMG_APPLICATION_FEES;
import { stripe, STRIPE_CONFIG, ArchitectOSTier, EMGApplicationType } from '../config/stripe';

export interface CreateCheckoutSessionParams {
  customerEmail?: string;
  customerId?: string;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
}

export interface ArchitectOSPurchase extends CreateCheckoutSessionParams {
  tier: ArchitectOSTier;
}

export interface EMGApplicationPayment extends CreateCheckoutSessionParams {
  applicationType: EMGApplicationType;
  applicationId: string;
}

export class PaymentService {
  /**
   * Create a Stripe checkout session for Architect OS purchase
   */
  static async createArchitectOSCheckout(params: ArchitectOSPurchase) {
    const { tier, customerEmail, customerId, successUrl, cancelUrl, metadata = {} } = params;
    
    const pricing = STRIPE_CONFIG.ARCHITECT_OS_PRICING[tier];
    
    try {
      const session = await stripe.checkout.sessions.create({
        customer_email: customerEmail,
        customer: customerId,
        payment_method_types: STRIPE_CONFIG.PAYMENT_METHOD_TYPES,
        line_items: [
          {
            price_data: {
              currency: STRIPE_CONFIG.CURRENCY,
              product_data: {
                name: pricing.name,
                description: pricing.description,
                metadata: {
                  tier,
                  type: 'architect_os',
                },
              },
              unit_amount: pricing.price * 100, // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl || `${STRIPE_CONFIG.SUCCESS_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${STRIPE_CONFIG.CANCEL_URL}/payment/cancel`,
        metadata: {
          ...metadata,
          type: 'architect_os',
          tier,
        },
        statement_descriptor: STRIPE_CONFIG.STATEMENT_DESCRIPTOR,
        allow_promotion_codes: true,
      });

      return {
        sessionId: session.id,
        url: session.url,
        status: 'created',
      };
    } catch (error) {
      console.error('Error creating Architect OS checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  /**
   * Create a Stripe checkout session for EMG application fee
   */
  static async createEMGApplicationCheckout(params: EMGApplicationPayment) {
    const { applicationType, applicationId, customerEmail, customerId, successUrl, cancelUrl, metadata = {} } = params;
    
    const fee = STRIPE_CONFIG.EMG_APPLICATION_FEES[applicationType];
    
    try {
      const session = await stripe.checkout.sessions.create({
        customer_email: customerEmail,
        customer: customerId,
        payment_method_types: STRIPE_CONFIG.PAYMENT_METHOD_TYPES,
        line_items: [
          {
            price_data: {
              currency: STRIPE_CONFIG.CURRENCY,
              product_data: {
                name: fee.name,
                description: fee.description,
                metadata: {
                  application_type: applicationType,
                  type: 'emg_application',
                },
              },
              unit_amount: fee.price * 100, // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl || `${STRIPE_CONFIG.SUCCESS_URL}/emg/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${STRIPE_CONFIG.CANCEL_URL}/emg/payment/cancel`,
        metadata: {
          ...metadata,
          type: 'emg_application',
          application_type: applicationType,
          application_id: applicationId,
        },
        statement_descriptor: 'EMG APP FEE',
      });

      return {
        sessionId: session.id,
        url: session.url,
        status: 'created',
      };
    } catch (error) {
      console.error('Error creating EMG application checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  /**
   * Retrieve a checkout session
   */
  static async getCheckoutSession(sessionId: string) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return session;
    } catch (error) {
      console.error('Error retrieving checkout session:', error);
      throw new Error('Failed to retrieve checkout session');
    }
  }

  /**
   * Create a customer
   */
  static async createCustomer(email: string, metadata?: Record<string, string>) {
    try {
      const customer = await stripe.customers.create({
        email,
        metadata,
      });
      return customer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  /**
   * Get customer by email
   */
  static async getCustomerByEmail(email: string) {
    try {
      const customers = await stripe.customers.list({
        email,
        limit: 1,
      });
      return customers.data[0] || null;
    } catch (error) {
      console.error('Error retrieving customer:', error);
      throw new Error('Failed to retrieve customer');
    }
  }

  /**
   * Process webhook events
   */
  static async processWebhookEvent(event: any) {
    console.log(`Processing webhook event: ${event.type}`);
    
    switch (event.type) {
      case 'checkout.session.completed':
        return await this.handleCheckoutSessionCompleted(event.data.object);
      
      case 'payment_intent.succeeded':
        return await this.handlePaymentIntentSucceeded(event.data.object);
      
      case 'payment_intent.payment_failed':
        return await this.handlePaymentIntentFailed(event.data.object);
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
        return { processed: false };
    }
  }

  private static async handleCheckoutSessionCompleted(session: any) {
    console.log('Checkout session completed:', session.id);
    
    // Handle based on session type
    const sessionType = session.metadata?.type;
    
    if (sessionType === 'architect_os') {
      // Handle Architect OS purchase
      const tier = session.metadata?.tier;
      console.log(`Architect OS ${tier} purchase completed for customer:`, session.customer);
      
      // TODO: Update user access, send confirmation email, etc.
      return {
        processed: true,
        type: 'architect_os_purchase',
        tier,
        customerId: session.customer,
        amount: session.amount_total,
      };
    } else if (sessionType === 'emg_application') {
      // Handle EMG application payment
      const applicationType = session.metadata?.application_type;
      const applicationId = session.metadata?.application_id;
      console.log(`EMG application ${applicationType} payment completed for application:`, applicationId);
      
      // TODO: Update application status, send confirmation, etc.
      return {
        processed: true,
        type: 'emg_application_payment',
        applicationType,
        applicationId,
        customerId: session.customer,
        amount: session.amount_total,
      };
    }
    
    return { processed: false };
  }

  private static async handlePaymentIntentSucceeded(paymentIntent: any) {
    console.log('Payment intent succeeded:', paymentIntent.id);
    return { processed: true, type: 'payment_succeeded' };
  }

  private static async handlePaymentIntentFailed(paymentIntent: any) {
    console.log('Payment intent failed:', paymentIntent.id);
    return { processed: true, type: 'payment_failed' };
  }
}
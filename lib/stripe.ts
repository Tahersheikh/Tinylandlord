import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    properties: 1,
    features: ['1 property', 'Basic payment tracking', 'Email reminders'],
  },
  starter: {
    name: 'Starter',
    price: 9,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER,
    properties: 5,
    features: [
      '5 properties',
      'Automatic late fees',
      'SMS reminders',
      'Expense tracking',
      'CSV export',
    ],
  },
  pro: {
    name: 'Pro',
    price: 19,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
    properties: Infinity,
    features: [
      'Unlimited properties',
      'AI message composer',
      'WhatsApp reminders',
      'Tax reports (Schedule E)',
      'PDF export',
      'Priority support',
    ],
  },
}

export async function createStripeCustomer(email: string, name?: string) {
  return stripe.customers.create({ email, name })
}

export async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
}: {
  customerId: string
  priceId: string
  successUrl: string
  cancelUrl: string
}) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
  })
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

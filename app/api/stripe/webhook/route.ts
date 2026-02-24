import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

const TIER_BY_PRICE: Record<string, string> = {
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER ?? '']: 'starter',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ?? '']: 'pro',
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  const getCustomerId = (obj: any) => obj.customer as string

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const sub = await stripe.subscriptions.retrieve(session.subscription as string)
        const priceId = sub.items.data[0].price.id
        const tier = TIER_BY_PRICE[priceId] ?? 'starter'
        await supabaseAdmin.from('landlords')
          .update({
            stripe_subscription_id: sub.id,
            subscription_status: tier,
            subscription_tier: tier,
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_customer_id', getCustomerId(session))
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const sub = await stripe.subscriptions.retrieve(invoice.subscription as string)
        const priceId = sub.items.data[0].price.id
        const tier = TIER_BY_PRICE[priceId] ?? 'starter'
        await supabaseAdmin.from('landlords')
          .update({
            subscription_status: tier,
            subscription_tier: tier,
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_customer_id', getCustomerId(invoice))
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await supabaseAdmin.from('landlords')
          .update({ subscription_status: 'free', subscription_tier: 'free', stripe_subscription_id: null })
          .eq('stripe_customer_id', sub.customer as string)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.warn('Payment failed for customer:', invoice.customer)
        // Could send an email to the landlord here
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

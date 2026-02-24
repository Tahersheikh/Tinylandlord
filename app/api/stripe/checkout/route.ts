import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { stripe, createStripeCustomer, createCheckoutSession } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const priceId = formData.get('priceId') as string

    if (!priceId) return NextResponse.json({ error: 'Price ID required' }, { status: 400 })

    // Get landlord
    const { data: landlord } = await supabaseAdmin
      .from('landlords')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (!landlord) return NextResponse.json({ error: 'Landlord not found' }, { status: 404 })

    // Create Stripe customer if needed
    let customerId = landlord.stripe_customer_id
    if (!customerId) {
      const customer = await createStripeCustomer(landlord.email, landlord.name)
      customerId = customer.id
      await supabaseAdmin.from('landlords').update({ stripe_customer_id: customerId }).eq('id', landlord.id)
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!
    const checkoutSession = await createCheckoutSession({
      customerId,
      priceId,
      successUrl: `${appUrl}/settings?success=true`,
      cancelUrl: `${appUrl}/settings?canceled=true`,
    })

    return NextResponse.redirect(checkoutSession.url!, 303)
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

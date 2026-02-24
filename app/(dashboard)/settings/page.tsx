import { createServerClient, getCurrentLandlord } from '@/lib/supabase'
import { PLANS } from '@/lib/stripe'
import { CheckCircle2, ExternalLink, Crown } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = createServerClient()
  const landlord = await getCurrentLandlord(supabase)
  if (!landlord) return null

  const currentPlan = PLANS[landlord.subscription_tier as keyof typeof PLANS] ?? PLANS.free

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-stone-900">Settings</h1>
        <p className="text-stone-500 text-sm mt-1">Manage your account and subscription</p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-stone-900 mb-4">Profile</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Full name</label>
            <input
              type="text"
              defaultValue={landlord.name ?? ''}
              name="name"
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
            <input type="email" defaultValue={landlord.email} disabled
              className="w-full border border-stone-100 rounded-lg px-3 py-2.5 text-sm bg-stone-50 text-stone-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Phone (for notifications)</label>
            <input
              type="tel"
              defaultValue={landlord.phone ?? ''}
              name="phone"
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <button type="submit" className="bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors">
            Save changes
          </button>
        </form>
      </div>

      {/* Subscription */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-stone-900">Subscription</h2>
          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${
            landlord.subscription_tier === 'pro' ? 'bg-violet-100 text-violet-700' :
            landlord.subscription_tier === 'starter' ? 'bg-emerald-100 text-emerald-700' :
            'bg-stone-100 text-stone-600'
          }`}>
            {landlord.subscription_tier === 'pro' && <Crown className="w-3.5 h-3.5" />}
            {currentPlan.name} plan
          </span>
        </div>

        <div className="space-y-2 mb-6">
          {currentPlan.features.map(f => (
            <div key={f} className="flex items-center gap-2 text-sm text-stone-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              {f}
            </div>
          ))}
        </div>

        {landlord.subscription_tier !== 'pro' && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {(['starter', 'pro'] as const).filter(t => t !== landlord.subscription_tier).map(tier => {
              const plan = PLANS[tier]
              return (
                <form key={tier} action="/api/stripe/checkout" method="POST">
                  <input type="hidden" name="priceId" value={plan.priceId ?? ''} />
                  <button type="submit"
                    className="w-full border-2 border-emerald-700 text-emerald-700 hover:bg-emerald-700 hover:text-white px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                  >
                    Upgrade to {plan.name} — ${plan.price}/mo
                  </button>
                </form>
              )
            })}
          </div>
        )}

        {landlord.stripe_subscription_id && (
          <form action="/api/stripe/portal" method="POST">
            <button type="submit" className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 transition-colors">
              <ExternalLink className="w-4 h-4" /> Manage billing & invoices
            </button>
          </form>
        )}
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <h2 className="font-semibold text-red-700 mb-2">Danger Zone</h2>
        <p className="text-sm text-stone-500 mb-4">Deleting your account will permanently remove all properties, tenants, and payment records. This cannot be undone.</p>
        <button className="text-sm text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors font-medium">
          Delete account
        </button>
      </div>
    </div>
  )
}

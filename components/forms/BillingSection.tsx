'use client'

import { useState } from 'react'
import { Loader2, ExternalLink } from 'lucide-react'

export function BillingSection({ landlord }: { landlord: any }) {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleUpgrade(planKey: string) {
    setLoading(planKey)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planKey }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    setLoading(null)
  }

  async function handleManageBilling() {
    setLoading('portal')
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    setLoading(null)
  }

  const tier = landlord.subscription_tier ?? 'free'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">Current plan: <span className="capitalize font-bold text-blue-600">{tier}</span></p>
          {landlord.current_period_end && (
            <p className="text-xs text-gray-500 mt-0.5">
              Renews {new Date(landlord.current_period_end).toLocaleDateString()}
            </p>
          )}
        </div>
        {tier !== 'free' && landlord.stripe_customer_id && (
          <button onClick={handleManageBilling} disabled={loading === 'portal'}
            className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
            {loading === 'portal' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />}
            Manage Billing
          </button>
        )}
      </div>

      {tier === 'free' && (
        <div className="flex gap-3">
          {(['starter', 'pro'] as const).map(plan => (
            <button key={plan} onClick={() => handleUpgrade(plan)} disabled={!!loading}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                plan === 'pro' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border border-blue-600 text-blue-600 hover:bg-blue-50'
              }`}>
              {loading === plan && <Loader2 className="h-4 w-4 animate-spin" />}
              Upgrade to {plan === 'starter' ? 'Starter ($9/mo)' : 'Pro ($19/mo)'}
            </button>
          ))}
        </div>
      )}

      {tier === 'starter' && (
        <button onClick={() => handleUpgrade('pro')} disabled={!!loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          {loading === 'pro' && <Loader2 className="h-4 w-4 animate-spin" />}
          Upgrade to Pro ($19/mo) — Get AI messages & tax reports
        </button>
      )}
    </div>
  )
}

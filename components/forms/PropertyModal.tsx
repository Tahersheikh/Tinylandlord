'use client'

import { useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { X, Loader2 } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase'
import { TIER_LIMITS } from '@/types'

interface PropertyModalProps {
  landlordId: string
  property?: any
  children: ReactNode
  subscriptionTier: string
  currentCount: number
}

export function PropertyModal({ landlordId, property, children, subscriptionTier, currentCount }: PropertyModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createSupabaseClient()

  const tier = subscriptionTier as keyof typeof TIER_LIMITS
  const limit = TIER_LIMITS[tier]?.properties ?? 1
  const atLimit = !property && currentCount >= limit

  const [form, setForm] = useState({
    address: property?.address ?? '',
    unit_number: property?.unit_number ?? '',
    city: property?.city ?? '',
    state: property?.state ?? '',
    zip: property?.zip ?? '',
    rent_amount: property?.rent_amount ?? '',
    rent_due_day: property?.rent_due_day ?? 1,
    late_fee_amount: property?.late_fee_amount ?? 50,
    late_fee_grace_period: property?.late_fee_grace_period ?? 5,
    property_type: property?.property_type ?? 'residential',
    notes: property?.notes ?? '',
  })

  function handleOpen() {
    if (atLimit) {
      alert(`Your ${tier} plan allows up to ${limit} propert${limit === 1 ? 'y' : 'ies'}. Upgrade to add more.`)
      return
    }
    setOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const data = {
      ...form,
      landlord_id: landlordId,
      rent_amount: parseFloat(String(form.rent_amount)),
      rent_due_day: parseInt(String(form.rent_due_day)),
      late_fee_amount: parseFloat(String(form.late_fee_amount)),
      late_fee_grace_period: parseInt(String(form.late_fee_grace_period)),
    }

    const result = property
      ? await supabase.from('properties').update(data).eq('id', property.id)
      : await supabase.from('properties').insert(data)

    if (result.error) {
      setError(result.error.message)
      setLoading(false)
      return
    }

    setOpen(false)
    router.refresh()
    setLoading(false)
  }

  async function handleDelete() {
    if (!property || !confirm('Delete this property? This will also delete all associated tenants and payment records.')) return
    setLoading(true)
    await supabase.from('properties').delete().eq('id', property.id)
    setOpen(false)
    router.refresh()
    setLoading(false)
  }

  return (
    <>
      <div onClick={handleOpen}>{children}</div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{property ? 'Edit Property' : 'Add Property'}</h2>
              <button onClick={() => setOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                <input
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123 Main St"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit #</label>
                  <input
                    value={form.unit_number}
                    onChange={e => setForm({ ...form, unit_number: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Apt 2B"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    value={form.state}
                    onChange={e => setForm({ ...form, state: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="CA"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                  <input
                    value={form.zip}
                    onChange={e => setForm({ ...form, zip: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent *</label>
                  <input
                    type="number"
                    value={form.rent_amount}
                    onChange={e => setForm({ ...form, rent_amount: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1500"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Day of Month</label>
                  <input
                    type="number"
                    value={form.rent_due_day}
                    onChange={e => setForm({ ...form, rent_due_day: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="31"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Late Fee ($)</label>
                  <input
                    type="number"
                    value={form.late_fee_amount}
                    onChange={e => setForm({ ...form, late_fee_amount: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grace Period (days)</label>
                  <input
                    type="number"
                    value={form.late_fee_grace_period}
                    onChange={e => setForm({ ...form, late_fee_grace_period: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select
                  value={form.property_type}
                  onChange={e => setForm({ ...form, property_type: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="multi-family">Multi-Family</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-2">
                {property && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-4 py-2 text-red-600 text-sm font-medium hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {property ? 'Save Changes' : 'Add Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

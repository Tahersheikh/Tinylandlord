'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { US_STATES } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import type { Property } from '@/types'

interface PropertyFormProps {
  landlordId: string
  property?: Property
}

export default function PropertyForm({ landlordId, property }: PropertyFormProps) {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isEdit = !!property

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(e.currentTarget)
    const data = {
      landlord_id: landlordId,
      address: form.get('address') as string,
      unit_number: form.get('unit_number') as string || null,
      city: form.get('city') as string,
      state: form.get('state') as string,
      zip: form.get('zip') as string,
      rent_amount: parseFloat(form.get('rent_amount') as string),
      rent_due_day: parseInt(form.get('rent_due_day') as string),
      late_fee_amount: parseFloat(form.get('late_fee_amount') as string),
      late_fee_grace_period: parseInt(form.get('late_fee_grace_period') as string),
      property_type: form.get('property_type') as string,
      notes: form.get('notes') as string || null,
    }

    const { error } = isEdit
      ? await supabase.from('properties').update(data).eq('id', property.id)
      : await supabase.from('properties').insert(data)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/properties')
      router.refresh()
    }
  }

  const inputClass = "w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
  const labelClass = "block text-sm font-medium text-stone-700 mb-1.5"

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <h2 className="font-semibold text-stone-900 mb-4">Address</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelClass}>Street address *</label>
            <input type="text" name="address" required defaultValue={property?.address} className={inputClass} placeholder="123 Main St" />
          </div>
          <div>
            <label className={labelClass}>Unit / Apt number</label>
            <input type="text" name="unit_number" defaultValue={property?.unit_number ?? ''} className={inputClass} placeholder="4B" />
          </div>
          <div>
            <label className={labelClass}>City *</label>
            <input type="text" name="city" required defaultValue={property?.city ?? ''} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>State *</label>
            <select name="state" required defaultValue={property?.state ?? ''} className={inputClass}>
              <option value="">Select state</option>
              {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>ZIP code *</label>
            <input type="text" name="zip" required defaultValue={property?.zip ?? ''} className={inputClass} placeholder="12345" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <h2 className="font-semibold text-stone-900 mb-4">Rent Settings</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Monthly rent *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
              <input type="number" name="rent_amount" required defaultValue={property?.rent_amount ?? ''} className={inputClass + ' pl-7'} placeholder="1500" min="0" step="0.01" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Due day of month *</label>
            <input type="number" name="rent_due_day" required defaultValue={property?.rent_due_day ?? 1} className={inputClass} min="1" max="31" />
          </div>
          <div>
            <label className={labelClass}>Late fee amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
              <input type="number" name="late_fee_amount" defaultValue={property?.late_fee_amount ?? 50} className={inputClass + ' pl-7'} min="0" step="0.01" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Grace period (days)</label>
            <input type="number" name="late_fee_grace_period" defaultValue={property?.late_fee_grace_period ?? 5} className={inputClass} min="0" max="30" />
          </div>
          <div>
            <label className={labelClass}>Property type</label>
            <select name="property_type" defaultValue={property?.property_type ?? 'residential'} className={inputClass}>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="multi-family">Multi-family</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <label className={labelClass}>Notes (optional)</label>
        <textarea name="notes" defaultValue={property?.notes ?? ''} rows={3}
          className={inputClass + ' resize-none'} placeholder="Any additional notes about this property..." />
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={loading}
          className="bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEdit ? 'Save changes' : 'Add property'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="border border-stone-200 text-stone-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

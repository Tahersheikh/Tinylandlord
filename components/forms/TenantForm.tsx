'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'
import type { Tenant, Property } from '@/types'

interface TenantFormProps {
  landlordId: string
  properties: Property[]
  tenant?: Tenant
}

export default function TenantForm({ landlordId, properties, tenant }: TenantFormProps) {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isEdit = !!tenant

  const inputClass = "w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
  const labelClass = "block text-sm font-medium text-stone-700 mb-1.5"

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(e.currentTarget)
    const data = {
      landlord_id: landlordId,
      property_id: form.get('property_id') as string,
      name: form.get('name') as string,
      email: form.get('email') as string || null,
      phone: form.get('phone') as string || null,
      lease_start: form.get('lease_start') as string,
      lease_end: form.get('lease_end') as string || null,
      rent_amount: parseFloat(form.get('rent_amount') as string),
      security_deposit: parseFloat(form.get('security_deposit') as string) || 0,
      status: form.get('status') as string,
      emergency_contact_name: form.get('emergency_contact_name') as string || null,
      emergency_contact_phone: form.get('emergency_contact_phone') as string || null,
      notes: form.get('notes') as string || null,
    }

    const { error } = isEdit
      ? await supabase.from('tenants').update(data).eq('id', tenant.id)
      : await supabase.from('tenants').insert(data)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/tenants')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <h2 className="font-semibold text-stone-900 mb-4">Tenant Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelClass}>Property *</label>
            <select name="property_id" required defaultValue={tenant?.property_id ?? ''} className={inputClass}>
              <option value="">Select property</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>
                  {p.address}{p.unit_number ? ` · Unit ${p.unit_number}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Full name *</label>
            <input type="text" name="name" required defaultValue={tenant?.name ?? ''} className={inputClass} placeholder="Jane Smith" />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" name="email" defaultValue={tenant?.email ?? ''} className={inputClass} placeholder="jane@example.com" />
          </div>
          <div>
            <label className={labelClass}>Phone (for SMS reminders)</label>
            <input type="tel" name="phone" defaultValue={tenant?.phone ?? ''} className={inputClass} placeholder="+1 555 000 0000" />
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select name="status" defaultValue={tenant?.status ?? 'active'} className={inputClass}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="moved-out">Moved Out</option>
              <option value="evicted">Evicted</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <h2 className="font-semibold text-stone-900 mb-4">Lease & Financials</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Lease start *</label>
            <input type="date" name="lease_start" required defaultValue={tenant?.lease_start ?? ''} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Lease end</label>
            <input type="date" name="lease_end" defaultValue={tenant?.lease_end ?? ''} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Monthly rent *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
              <input type="number" name="rent_amount" required defaultValue={tenant?.rent_amount ?? ''} className={inputClass + ' pl-7'} min="0" step="0.01" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Security deposit</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
              <input type="number" name="security_deposit" defaultValue={tenant?.security_deposit ?? 0} className={inputClass + ' pl-7'} min="0" step="0.01" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <h2 className="font-semibold text-stone-900 mb-4">Emergency Contact</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Name</label>
            <input type="text" name="emergency_contact_name" defaultValue={tenant?.emergency_contact_name ?? ''} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input type="tel" name="emergency_contact_phone" defaultValue={tenant?.emergency_contact_phone ?? ''} className={inputClass} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <label className={labelClass}>Notes (optional)</label>
        <textarea name="notes" defaultValue={tenant?.notes ?? ''} rows={3}
          className={inputClass + ' resize-none'} placeholder="Any notes about this tenant..." />
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={loading}
          className="bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEdit ? 'Save changes' : 'Add tenant'}
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

'use client'

import { useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { X, Loader2 } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase'

interface TenantModalProps {
  landlordId: string
  properties: any[]
  tenant?: any
  children: ReactNode
}

export function TenantModal({ landlordId, properties, tenant, children }: TenantModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createSupabaseClient()

  const [form, setForm] = useState({
    property_id: tenant?.property_id ?? (properties[0]?.id ?? ''),
    name: tenant?.name ?? '',
    email: tenant?.email ?? '',
    phone: tenant?.phone ?? '',
    lease_start: tenant?.lease_start ?? '',
    lease_end: tenant?.lease_end ?? '',
    rent_amount: tenant?.rent_amount ?? '',
    security_deposit: tenant?.security_deposit ?? 0,
    status: tenant?.status ?? 'active',
    emergency_contact_name: tenant?.emergency_contact_name ?? '',
    emergency_contact_phone: tenant?.emergency_contact_phone ?? '',
    notes: tenant?.notes ?? '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const data = {
      ...form,
      landlord_id: landlordId,
      rent_amount: parseFloat(String(form.rent_amount)),
      security_deposit: parseFloat(String(form.security_deposit)),
      lease_end: form.lease_end || null,
      email: form.email || null,
      phone: form.phone || null,
    }

    const result = tenant
      ? await supabase.from('tenants').update(data).eq('id', tenant.id)
      : await supabase.from('tenants').insert(data)

    if (result.error) { setError(result.error.message); setLoading(false); return }

    setOpen(false)
    router.refresh()
    setLoading(false)
  }

  async function handleDelete() {
    if (!tenant || !confirm('Remove this tenant? Payment records will be preserved.')) return
    await supabase.from('tenants').update({ status: 'moved-out' }).eq('id', tenant.id)
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{tenant ? 'Edit Tenant' : 'Add Tenant'}</h2>
              <button onClick={() => setOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property *</label>
                <select
                  value={form.property_id}
                  onChange={e => setForm({ ...form, property_id: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.address}{p.unit_number ? ` #${p.unit_number}` : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Jane Smith"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lease Start *</label>
                  <input
                    type="date"
                    value={form.lease_start}
                    onChange={e => setForm({ ...form, lease_start: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lease End</label>
                  <input
                    type="date"
                    value={form.lease_end}
                    onChange={e => setForm({ ...form, lease_end: e.target.value })}
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
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit</label>
                  <input
                    type="number"
                    value={form.security_deposit}
                    onChange={e => setForm({ ...form, security_deposit: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="moved-out">Moved Out</option>
                  <option value="evicted">Evicted</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                  <input
                    value={form.emergency_contact_name}
                    onChange={e => setForm({ ...form, emergency_contact_name: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 opacity-0">Phone</label>
                  <input
                    value={form.emergency_contact_phone}
                    onChange={e => setForm({ ...form, emergency_contact_phone: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Phone"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                {tenant && (
                  <button type="button" onClick={handleDelete} className="px-4 py-2 text-red-600 text-sm font-medium hover:bg-red-50 rounded-lg">
                    Mark Moved Out
                  </button>
                )}
                <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {tenant ? 'Save Changes' : 'Add Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

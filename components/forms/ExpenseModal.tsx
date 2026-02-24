'use client'

import { useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { X, Loader2, Upload } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase'
import { format } from 'date-fns'

const CATEGORIES = [
  'maintenance', 'repairs', 'insurance', 'taxes', 'utilities',
  'management', 'advertising', 'supplies', 'legal', 'mortgage', 'other'
]

interface ExpenseModalProps {
  landlordId: string
  properties: any[]
  children: ReactNode
}

export function ExpenseModal({ landlordId, properties, children }: ExpenseModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createSupabaseClient()

  const [form, setForm] = useState({
    property_id: '',
    category: 'maintenance',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    vendor: '',
    description: '',
    receipt_url: '',
    deductible: true,
  })

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucket', 'receipts')

    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()

    if (data.url) setForm(f => ({ ...f, receipt_url: data.url }))
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await supabase.from('expenses').insert({
      ...form,
      landlord_id: landlordId,
      property_id: form.property_id || null,
      amount: parseFloat(String(form.amount)),
      receipt_url: form.receipt_url || null,
    })

    if (result.error) { setError(result.error.message); setLoading(false); return }

    setOpen(false)
    router.refresh()
    setLoading(false)
  }

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Add Expense</h2>
              <button onClick={() => setOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-4 w-4" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                  <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00" min="0" step="0.01" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
                  <select value={form.property_id} onChange={e => setForm({ ...form, property_id: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">General</option>
                    {properties.map(p => <option key={p.id} value={p.id}>{p.address}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                <input value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contractor name, store, etc." />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Receipt</label>
                {form.receipt_url ? (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                    ✓ Receipt uploaded
                    <button type="button" onClick={() => setForm({ ...form, receipt_url: '' })} className="text-red-400 hover:text-red-600 ml-auto">Remove</button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg p-3 cursor-pointer hover:border-blue-400 transition-colors">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 text-gray-400" />}
                    <span className="text-sm text-gray-500">{uploading ? 'Uploading...' : 'Upload receipt (JPG, PNG, PDF)'}</span>
                    <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                  </label>
                )}
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="deductible" checked={form.deductible}
                  onChange={e => setForm({ ...form, deductible: e.target.checked })}
                  className="rounded border-gray-300" />
                <label htmlFor="deductible" className="text-sm text-gray-700">Tax deductible</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

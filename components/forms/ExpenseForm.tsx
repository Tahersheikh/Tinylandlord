'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { EXPENSE_CATEGORIES } from '@/lib/utils'
import { Loader2, Upload } from 'lucide-react'
import type { Property } from '@/types'

interface ExpenseFormProps {
  landlordId: string
  properties: Property[]
}

export default function ExpenseForm({ landlordId, properties }: ExpenseFormProps) {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [receiptUrl, setReceiptUrl] = useState('')

  const inputClass = "w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
  const labelClass = "block text-sm font-medium text-stone-700 mb-1.5"

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucket', 'receipts')
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()
    if (data.url) setReceiptUrl(data.url)
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(e.currentTarget)
    const { error } = await supabase.from('expenses').insert({
      landlord_id: landlordId,
      property_id: form.get('property_id') as string || null,
      category: form.get('category') as string,
      amount: parseFloat(form.get('amount') as string),
      date: form.get('date') as string,
      vendor: form.get('vendor') as string || null,
      description: form.get('description') as string || null,
      receipt_url: receiptUrl || null,
      deductible: form.get('deductible') === 'true',
    })
    if (error) { setError(error.message); setLoading(false) }
    else { router.push('/expenses'); router.refresh() }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Category *</label>
            <select name="category" required className={inputClass}>
              {EXPENSE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Property</label>
            <select name="property_id" className={inputClass}>
              <option value="">All properties</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.address}{p.unit_number ? ` · ${p.unit_number}` : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Amount *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
              <input type="number" name="amount" required className={inputClass + ' pl-7'} min="0" step="0.01" placeholder="0.00" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Date *</label>
            <input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Vendor / Payee</label>
            <input type="text" name="vendor" className={inputClass} placeholder="Home Depot, Insurance Co..." />
          </div>
          <div>
            <label className={labelClass}>Tax deductible</label>
            <select name="deductible" defaultValue="true" className={inputClass}>
              <option value="true">Yes — deductible</option>
              <option value="false">No — not deductible</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Description</label>
            <input type="text" name="description" className={inputClass} placeholder="Brief description of the expense..." />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Receipt (optional)</label>
            <div className="border-2 border-dashed border-stone-200 rounded-lg p-6 text-center hover:border-emerald-300 transition-colors">
              {receiptUrl ? (
                <p className="text-sm text-emerald-600">✓ Receipt uploaded</p>
              ) : (
                <>
                  <Upload className="w-6 h-6 mx-auto text-stone-400 mb-2" />
                  <p className="text-sm text-stone-500 mb-2">Upload receipt (JPG, PNG, PDF · max 5MB)</p>
                  <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileUpload} className="hidden" id="receipt-upload" />
                  <label htmlFor="receipt-upload" className="text-sm text-emerald-700 font-medium cursor-pointer hover:underline">
                    {uploading ? 'Uploading...' : 'Choose file'}
                  </label>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={loading || uploading}
          className="bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Add expense
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

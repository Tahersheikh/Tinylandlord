'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase'

export function ProfileForm({ landlord }: { landlord: any }) {
  const [form, setForm] = useState({ name: landlord.name ?? '', phone: landlord.phone ?? '' })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseClient()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await supabase.from('landlords').update({ name: form.name, phone: form.phone }).eq('id', landlord.id)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    router.refresh()
    setLoading(false)
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input value={landlord.email} disabled className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="John Smith" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+1 (555) 000-0000" />
        <p className="text-xs text-gray-400 mt-1">Used as the sender name in SMS reminders to tenants.</p>
      </div>
      <button type="submit" disabled={loading}
        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
        {saved ? 'Saved!' : 'Save Changes'}
      </button>
    </form>
  )
}

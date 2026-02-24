'use client'

import { useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { X, Loader2, Sparkles } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase'

const TEMPLATES: Record<string, string> = {
  'Rent reminder (3 days)': "Hi {name}, just a friendly reminder that your rent is due in 3 days. Please reach out if you have any questions!",
  'Rent due today': "Hi {name}, your rent is due today. Please submit payment at your earliest convenience. Thank you!",
  'Late rent notice': "Hi {name}, your rent is now overdue. Please remit payment immediately to avoid additional fees.",
  'Late fee applied': "Hi {name}, a late fee has been applied to your account. Please contact us to arrange payment.",
  'Lease renewal reminder': "Hi {name}, your lease is coming up for renewal. Please let us know if you'd like to continue.",
  'Maintenance update': "Hi {name}, we wanted to update you that your maintenance request is being actively addressed.",
}

interface SendMessageModalProps {
  landlordId: string
  tenants: any[]
  subscriptionTier: string
  template?: string
  children: ReactNode
}

export function SendMessageModal({ landlordId, tenants, subscriptionTier, template, children }: SendMessageModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseClient()
  const isPro = subscriptionTier === 'pro'

  const [form, setForm] = useState({
    tenant_id: tenants[0]?.id ?? '',
    type: 'sms' as 'sms' | 'email' | 'whatsapp',
    content: template ? (TEMPLATES[template] ?? '') : '',
  })

  function handleOpen() {
    if (template) setForm(f => ({ ...f, content: TEMPLATES[template] ?? '' }))
    setOpen(true)
  }

  async function handleAIGenerate() {
    if (!isPro) { alert('AI message generation requires a Pro subscription.'); return }
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantName: tenants.find(t => t.id === form.tenant_id)?.name, type: 'reminder' }),
      })
      const data = await res.json()
      if (data.message) setForm(f => ({ ...f, content: data.message }))
    } catch {}
    setAiLoading(false)
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await supabase.from('communications').insert({
      landlord_id: landlordId,
      tenant_id: form.tenant_id,
      type: form.type,
      direction: 'outbound',
      content: form.content,
      status: 'sent',
    })
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
          <div className="relative bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Send Message</h2>
              <button onClick={() => setOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleSend} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tenant</label>
                <select value={form.tenant_id} onChange={e => setForm({ ...form, tenant_id: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                  {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Channel</label>
                <div className="flex gap-2">
                  {(['sms', 'email', 'whatsapp'] as const).map(ch => (
                    <button key={ch} type="button" onClick={() => setForm({ ...form, type: ch })}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors uppercase ${form.type === ch ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <button type="button" onClick={handleAIGenerate} disabled={aiLoading}
                    className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg transition-colors ${isPro ? 'text-purple-600 bg-purple-50 hover:bg-purple-100' : 'text-gray-400 bg-gray-50 cursor-not-allowed'}`}>
                    {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                    {isPro ? 'AI Write' : 'AI (Pro)'}
                  </button>
                </div>
                <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={5} required placeholder="Write your message..." />
                <p className="text-xs text-gray-400 mt-1">{form.content.length} chars {form.type === 'sms' ? '(160 limit for 1 SMS)' : ''}</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

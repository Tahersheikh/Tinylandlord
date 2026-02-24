import { createServerClient, getCurrentLandlord } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { MessageSquare, Mail, Phone, Smartphone, Plus } from 'lucide-react'

const typeIcons: Record<string, any> = {
  sms: Smartphone, email: Mail, whatsapp: Smartphone, call: Phone, in_person: MessageSquare
}
const typeColors: Record<string, string> = {
  sms: 'bg-blue-100 text-blue-700',
  email: 'bg-violet-100 text-violet-700',
  whatsapp: 'bg-emerald-100 text-emerald-700',
  call: 'bg-amber-100 text-amber-700',
  in_person: 'bg-stone-100 text-stone-700',
}
const statusColors: Record<string, string> = {
  sent: 'text-stone-500', delivered: 'text-emerald-600', failed: 'text-red-500', read: 'text-blue-600', draft: 'text-amber-600'
}

export default async function CommunicationsPage() {
  const supabase = createServerClient()
  const landlord = await getCurrentLandlord(supabase)
  if (!landlord) return null

  const { data: comms } = await supabase
    .from('communications')
    .select('*, tenants(name)')
    .eq('landlord_id', landlord.id)
    .order('sent_at', { ascending: false })
    .limit(100)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">Communications</h1>
          <p className="text-stone-500 text-sm mt-1">{comms?.length ?? 0} messages logged</p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors">
          <Plus className="w-4 h-4" /> Send message
        </button>
      </div>

      {(!comms || comms.length === 0) ? (
        <div className="bg-white rounded-xl border border-stone-200 p-16 text-center">
          <MessageSquare className="w-14 h-14 mx-auto text-stone-300 mb-4" />
          <h3 className="font-semibold text-stone-700 text-lg mb-2">No messages yet</h3>
          <p className="text-stone-400 text-sm">Messages sent to tenants will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {comms.map((comm: any) => {
            const Icon = typeIcons[comm.type] ?? MessageSquare
            return (
              <div key={comm.id} className="bg-white rounded-xl border border-stone-200 p-4 hover:shadow-sm transition-all flex items-start gap-4">
                <div className={`p-2 rounded-lg flex-shrink-0 ${typeColors[comm.type] ?? 'bg-stone-100 text-stone-600'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-stone-900 text-sm">{comm.tenants?.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[comm.type] ?? ''}`}>
                      {comm.type.replace('_', ' ')}
                    </span>
                    <span className={`text-xs ${statusColors[comm.status] ?? 'text-stone-400'}`}>· {comm.status}</span>
                    <span className="text-xs text-stone-400 ml-auto">{formatDate(comm.sent_at)}</span>
                  </div>
                  <p className="text-sm text-stone-600 line-clamp-2">{comm.content}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

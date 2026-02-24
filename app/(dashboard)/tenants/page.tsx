import { createServerClient, getCurrentLandlord } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Users, Plus, Phone, Mail, Calendar, ChevronRight, Pencil } from 'lucide-react'
import Link from 'next/link'

export default async function TenantsPage() {
  const supabase = createServerClient()
  const landlord = await getCurrentLandlord(supabase)
  if (!landlord) return null

  const { data: tenants } = await supabase
    .from('tenants')
    .select('*, properties(address, unit_number)')
    .eq('landlord_id', landlord.id)
    .order('created_at', { ascending: false })

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700',
    inactive: 'bg-stone-100 text-stone-600',
    'moved-out': 'bg-blue-100 text-blue-700',
    evicted: 'bg-red-100 text-red-700',
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">Tenants</h1>
          <p className="text-stone-500 text-sm mt-1">
            {tenants?.filter(t => t.status === 'active').length ?? 0} active · {tenants?.length ?? 0} total
          </p>
        </div>
        <Link href="/tenants/new" className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors">
          <Plus className="w-4 h-4" /> Add tenant
        </Link>
      </div>

      {(!tenants || tenants.length === 0) ? (
        <div className="bg-white rounded-xl border border-stone-200 p-16 text-center">
          <Users className="w-14 h-14 mx-auto text-stone-300 mb-4" />
          <h3 className="font-semibold text-stone-700 text-lg mb-2">No tenants yet</h3>
          <p className="text-stone-400 text-sm mb-6">Add a tenant to a property to start tracking their rent.</p>
          <Link href="/tenants/new" className="inline-flex items-center gap-2 bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors">
            <Plus className="w-4 h-4" /> Add first tenant
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                {['Tenant', 'Property', 'Rent', 'Lease Period', 'Status', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {tenants.map((tenant: any) => (
                <tr key={tenant.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-stone-900 text-sm">{tenant.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {tenant.email && (
                        <span className="flex items-center gap-1 text-xs text-stone-400">
                          <Mail className="w-3 h-3" /> {tenant.email}
                        </span>
                      )}
                      {tenant.phone && (
                        <span className="flex items-center gap-1 text-xs text-stone-400">
                          <Phone className="w-3 h-3" /> {tenant.phone}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-stone-600">
                    {tenant.properties?.address}
                    {tenant.properties?.unit_number ? ` · #${tenant.properties.unit_number}` : ''}
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-stone-900">{formatCurrency(tenant.rent_amount)}/mo</p>
                    {tenant.security_deposit > 0 && (
                      <p className="text-xs text-stone-400">Deposit: {formatCurrency(tenant.security_deposit)}</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 text-sm text-stone-600">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      {formatDate(tenant.lease_start)}
                      {tenant.lease_end && ` → ${formatDate(tenant.lease_end)}`}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[tenant.status] ?? 'bg-stone-100 text-stone-600'}`}>
                      {tenant.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <Link href={`/tenants/${tenant.id}/edit`} className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                      <Link href={`/tenants/${tenant.id}`} className="p-1.5 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

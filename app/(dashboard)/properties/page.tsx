import { createServerClient, getCurrentLandlord } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Building2, Plus, MapPin, DollarSign, Users, ChevronRight, Pencil } from 'lucide-react'
import Link from 'next/link'

export default async function PropertiesPage() {
  const supabase = createServerClient()
  const landlord = await getCurrentLandlord(supabase)
  if (!landlord) return null

  const { data: properties } = await supabase
    .from('properties')
    .select('*, tenants(id, name, status, rent_amount)')
    .eq('landlord_id', landlord.id)
    .order('created_at', { ascending: false })

  const canAddMore = (landlord.subscription_tier === 'pro') ||
    (landlord.subscription_tier === 'starter' && (properties?.length ?? 0) < 5) ||
    (landlord.subscription_tier === 'free' && (properties?.length ?? 0) < 1)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">Properties</h1>
          <p className="text-stone-500 text-sm mt-1">{properties?.length ?? 0} propert{(properties?.length ?? 0) !== 1 ? 'ies' : 'y'}</p>
        </div>
        {canAddMore ? (
          <Link href="/properties/new" className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors">
            <Plus className="w-4 h-4" /> Add property
          </Link>
        ) : (
          <Link href="/settings" className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors">
            Upgrade to add more
          </Link>
        )}
      </div>

      {(!properties || properties.length === 0) ? (
        <div className="bg-white rounded-xl border border-stone-200 p-16 text-center">
          <Building2 className="w-14 h-14 mx-auto text-stone-300 mb-4" />
          <h3 className="font-semibold text-stone-700 text-lg mb-2">No properties yet</h3>
          <p className="text-stone-400 text-sm mb-6">Add your first property to start tracking rent.</p>
          <Link href="/properties/new" className="inline-flex items-center gap-2 bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors">
            <Plus className="w-4 h-4" /> Add first property
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {properties.map((property: any) => {
            const activeTenants = (property.tenants ?? []).filter((t: any) => t.status === 'active')
            const monthlyRent = activeTenants.reduce((sum: number, t: any) => sum + t.rent_amount, 0)
            return (
              <div key={property.id} className="bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all">
                <div className="p-5 flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-emerald-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-900">
                        {property.address}
                        {property.unit_number ? ` · Unit ${property.unit_number}` : ''}
                      </h3>
                      <div className="flex items-center gap-1 text-stone-400 text-sm mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {[property.city, property.state, property.zip].filter(Boolean).join(', ')}
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-sm">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-stone-700 font-medium">{formatCurrency(property.rent_amount)}/mo</span>
                          <span className="text-stone-400 text-xs">listed</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                          <Users className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-stone-700">{activeTenants.length} tenant{activeTenants.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="text-xs text-stone-400">
                          Late fee: {formatCurrency(property.late_fee_amount)} after {property.late_fee_grace_period} days
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/properties/${property.id}/edit`} className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors">
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <Link href={`/properties/${property.id}`} className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
                {activeTenants.length > 0 && (
                  <div className="px-5 pb-4 border-t border-stone-50 pt-3">
                    <div className="flex flex-wrap gap-2">
                      {activeTenants.map((t: any) => (
                        <Link key={t.id} href={`/tenants/${t.id}`} className="bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 px-3 py-1 rounded-lg text-xs font-medium transition-colors">
                          {t.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

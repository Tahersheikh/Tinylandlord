import { createServerClient, getCurrentLandlord } from '@/lib/supabase'
import TenantForm from '@/components/forms/TenantForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NewTenantPage() {
  const supabase = createServerClient()
  const landlord = await getCurrentLandlord(supabase)
  if (!landlord) return null
  const { data: properties } = await supabase.from('properties').select('*').eq('landlord_id', landlord.id)
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link href="/tenants" className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to tenants
      </Link>
      <h1 className="font-serif text-2xl font-bold text-stone-900 mb-6">Add tenant</h1>
      <TenantForm landlordId={landlord.id} properties={properties ?? []} />
    </div>
  )
}

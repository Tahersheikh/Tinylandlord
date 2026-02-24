import { createServerClient, getCurrentLandlord } from '@/lib/supabase'
import PropertyForm from '@/components/forms/PropertyForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NewPropertyPage() {
  const supabase = createServerClient()
  const landlord = await getCurrentLandlord(supabase)
  if (!landlord) return null
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link href="/properties" className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to properties
      </Link>
      <h1 className="font-serif text-2xl font-bold text-stone-900 mb-6">Add property</h1>
      <PropertyForm landlordId={landlord.id} />
    </div>
  )
}

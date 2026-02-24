'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase'
import { format } from 'date-fns'

export function MarkPaidButton({ paymentId }: { paymentId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseClient()

  async function handleMarkPaid() {
    setLoading(true)
    await supabase
      .from('rent_payments')
      .update({
        status: 'paid',
        paid_date: format(new Date(), 'yyyy-MM-dd'),
      })
      .eq('id', paymentId)

    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleMarkPaid}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 font-medium disabled:opacity-50 whitespace-nowrap"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
      Mark Paid
    </button>
  )
}

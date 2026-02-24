import { createServerClient, getCurrentLandlord } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DollarSign, CheckCircle2, Clock, AlertCircle, Filter, Download } from 'lucide-react'

export default async function PaymentsPage({ searchParams }: { searchParams: { status?: string; month?: string } }) {
  const supabase = createServerClient()
  const landlord = await getCurrentLandlord(supabase)
  if (!landlord) return null

  const status = searchParams.status
  const month = searchParams.month ?? new Date().toISOString().substring(0, 7)

  let query = supabase
    .from('rent_payments')
    .select('*, tenants(name, email, phone), properties(address, unit_number)')
    .eq('landlord_id', landlord.id)
    .gte('due_date', `${month}-01`)
    .lte('due_date', `${month}-31`)
    .order('due_date', { ascending: true })

  if (status) query = query.eq('status', status)

  const { data: payments } = await query

  const totals = {
    paid: (payments ?? []).filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0),
    pending: (payments ?? []).filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0),
    late: (payments ?? []).filter(p => p.status === 'late').reduce((s, p) => s + p.amount, 0),
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">Payments</h1>
          <p className="text-stone-500 text-sm mt-1">{payments?.length ?? 0} records for {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex gap-2">
          <form className="flex gap-2">
            <input type="month" name="month" defaultValue={month}
              className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button type="submit" className="bg-stone-100 text-stone-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-200 transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </form>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Collected', value: totals.paid, icon: CheckCircle2, color: 'emerald' },
          { label: 'Pending', value: totals.pending, icon: Clock, color: 'amber' },
          { label: 'Late', value: totals.late, icon: AlertCircle, color: 'red' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
            <div className={`text-${color}-600 flex items-center gap-1.5 text-sm font-medium mb-1`}>
              <Icon className="w-4 h-4" /> {label}
            </div>
            <p className="text-2xl font-bold text-stone-900">{formatCurrency(value)}</p>
          </div>
        ))}
      </div>

      {/* Payment table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-stone-50 border-b border-stone-100">
            <tr>
              {['Tenant', 'Property', 'Due Date', 'Amount', 'Method', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {(!payments || payments.length === 0) ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-stone-400 text-sm">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No payments found for this month
                </td>
              </tr>
            ) : payments.map((payment: any) => (
              <tr key={payment.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-stone-800">{payment.tenants?.name}</p>
                  <p className="text-xs text-stone-400">{payment.tenants?.email}</p>
                </td>
                <td className="px-4 py-3 text-sm text-stone-600">
                  {payment.properties?.address}
                  {payment.properties?.unit_number ? ` #${payment.properties.unit_number}` : ''}
                </td>
                <td className="px-4 py-3 text-sm text-stone-600">{formatDate(payment.due_date)}</td>
                <td className="px-4 py-3">
                  <p className="text-sm font-semibold text-stone-900">{formatCurrency(payment.amount)}</p>
                  {payment.late_fee_applied > 0 && (
                    <p className="text-xs text-red-500">+{formatCurrency(payment.late_fee_applied)} fee</p>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-stone-500 capitalize">{payment.payment_method ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    payment.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                    payment.status === 'late' ? 'bg-red-100 text-red-700' :
                    payment.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    payment.status === 'partial' ? 'bg-blue-100 text-blue-700' :
                    'bg-stone-100 text-stone-600'
                  }`}>
                    {payment.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {payment.status !== 'paid' && (
                    <form action={`/api/payments/${payment.id}/mark-paid`} method="POST">
                      <button type="submit" className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                        Mark paid
                      </button>
                    </form>
                  )}
                  {payment.paid_date && (
                    <span className="text-xs text-stone-400">Paid {formatDate(payment.paid_date)}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

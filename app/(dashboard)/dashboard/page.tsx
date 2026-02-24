import { createServerClient, getCurrentLandlord } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DollarSign, Building2, Users, AlertCircle, TrendingUp, Clock, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'

async function getDashboardData(landlordId: string) {
  const supabase = createServerClient()

  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  const [propertiesRes, tenantsRes, paymentsRes, expensesRes, recentPaymentsRes] = await Promise.all([
    supabase.from('properties').select('*').eq('landlord_id', landlordId),
    supabase.from('tenants').select('*').eq('landlord_id', landlordId).eq('status', 'active'),
    supabase.from('rent_payments')
      .select('*, tenants(name), properties(address, unit_number)')
      .eq('landlord_id', landlordId)
      .gte('due_date', firstOfMonth)
      .lte('due_date', lastOfMonth),
    supabase.from('expenses').select('amount').eq('landlord_id', landlordId)
      .gte('date', firstOfMonth).lte('date', lastOfMonth),
    supabase.from('rent_payments')
      .select('*, tenants(name), properties(address, unit_number)')
      .eq('landlord_id', landlordId)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const payments = paymentsRes.data ?? []
  const totalDue = payments.reduce((sum, p) => sum + p.amount, 0)
  const collected = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
  const outstanding = payments.filter(p => p.status !== 'paid' && p.status !== 'waived').reduce((sum, p) => sum + p.amount, 0)
  const latePayments = payments.filter(p => p.status === 'late').length
  const totalExpenses = (expensesRes.data ?? []).reduce((sum, e) => sum + e.amount, 0)

  const properties = propertiesRes.data ?? []
  const tenants = tenantsRes.data ?? []

  const upcomingPayments = payments
    .filter(p => p.status === 'pending' || p.status === 'late')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 5)

  return {
    stats: {
      totalDue,
      collected,
      outstanding,
      latePayments,
      totalProperties: properties.length,
      activeTenants: tenants.length,
      netIncome: collected - totalExpenses,
    },
    upcomingPayments,
    recentPayments: recentPaymentsRes.data ?? [],
  }
}

export default async function DashboardPage() {
  const supabase = createServerClient()
  const landlord = await getCurrentLandlord(supabase)

  if (!landlord) return <div className="p-8 text-stone-500">Loading...</div>

  const { stats, upcomingPayments, recentPayments } = await getDashboardData(landlord.id)

  const statCards = [
    { label: 'Rent Due This Month', value: formatCurrency(stats.totalDue), icon: DollarSign, color: 'text-blue-600 bg-blue-50', sub: `${stats.activeTenants} active tenants` },
    { label: 'Collected', value: formatCurrency(stats.collected), icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50', sub: stats.totalDue > 0 ? `${Math.round((stats.collected / stats.totalDue) * 100)}% collection rate` : '—' },
    { label: 'Outstanding', value: formatCurrency(stats.outstanding), icon: Clock, color: 'text-amber-600 bg-amber-50', sub: `${stats.latePayments} payments late` },
    { label: 'Properties', value: stats.totalProperties.toString(), icon: Building2, color: 'text-violet-600 bg-violet-50', sub: 'Active units' },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}{landlord.name ? `, ${landlord.name.split(' ')[0]}` : ''} 👋
          </h1>
          <p className="text-stone-500 text-sm mt-1">Here's what's happening with your properties</p>
        </div>
        <div className="flex gap-3">
          <Link href="/properties/new" className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors">
            <Plus className="w-4 h-4" /> Add property
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-stone-500 font-medium">{label}</p>
              <div className={`p-2 rounded-lg ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-stone-900 mb-1">{value}</p>
            <p className="text-xs text-stone-400">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Payments */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
            <h2 className="font-semibold text-stone-900">Upcoming & Late Payments</h2>
            <Link href="/payments" className="text-xs text-emerald-700 font-medium flex items-center gap-1 hover:underline">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-stone-50">
            {upcomingPayments.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-sm">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                No pending payments this month
              </div>
            ) : upcomingPayments.map((payment: any) => {
              const daysUntil = Math.round((new Date(payment.due_date).getTime() - Date.now()) / 86400000)
              const isLate = daysUntil < 0
              return (
                <div key={payment.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-stone-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-stone-800">{payment.tenants?.name}</p>
                    <p className="text-xs text-stone-400">
                      {payment.properties?.address}
                      {payment.properties?.unit_number ? ` · Unit ${payment.properties.unit_number}` : ''}
                    </p>
                    <p className={`text-xs font-medium mt-0.5 ${isLate ? 'text-red-500' : daysUntil <= 1 ? 'text-amber-600' : 'text-stone-400'}`}>
                      {isLate ? `${Math.abs(daysUntil)} days overdue` : daysUntil === 0 ? 'Due today' : `Due in ${daysUntil} days`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-stone-900">{formatCurrency(payment.amount)}</p>
                    {isLate && payment.late_fee_applied > 0 && (
                      <p className="text-xs text-red-500">+{formatCurrency(payment.late_fee_applied)} late fee</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
            <h2 className="font-semibold text-stone-900">Recent Activity</h2>
            <Link href="/payments" className="text-xs text-emerald-700 font-medium flex items-center gap-1 hover:underline">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-stone-50">
            {recentPayments.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-sm">
                <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-40" />
                No payments recorded yet
              </div>
            ) : recentPayments.map((payment: any) => (
              <div key={payment.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-stone-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-stone-800">{payment.tenants?.name}</p>
                  <p className="text-xs text-stone-400">{formatDate(payment.due_date)} · {payment.payment_method ?? 'Unknown method'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    payment.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                    payment.status === 'late' ? 'bg-red-100 text-red-700' :
                    payment.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-stone-100 text-stone-600'
                  }`}>
                    {payment.status}
                  </span>
                  <span className="text-sm font-bold text-stone-900">{formatCurrency(payment.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      {stats.totalProperties === 0 && (
        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
          <Building2 className="w-10 h-10 mx-auto text-emerald-600 mb-3" />
          <h3 className="font-semibold text-emerald-900 mb-1">Add your first property</h3>
          <p className="text-emerald-700 text-sm mb-4">Get started by adding a property to begin tracking rent.</p>
          <Link href="/properties/new" className="inline-flex items-center gap-2 bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors">
            <Plus className="w-4 h-4" /> Add property
          </Link>
        </div>
      )}
    </div>
  )
}

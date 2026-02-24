import { createServerClient, getCurrentLandlord } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { BarChart3, Download, FileText, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import Link from 'next/link'

export default async function ReportsPage({ searchParams }: { searchParams: { year?: string } }) {
  const supabase = createServerClient()
  const landlord = await getCurrentLandlord(supabase)
  if (!landlord) return null

  const year = searchParams.year ?? new Date().getFullYear().toString()
  const isPro = landlord.subscription_tier === 'pro'

  const [paymentsRes, expensesRes, propertiesRes] = await Promise.all([
    supabase.from('rent_payments')
      .select('amount, status, due_date, paid_date, property_id, properties(address, unit_number)')
      .eq('landlord_id', landlord.id)
      .eq('status', 'paid')
      .gte('paid_date', `${year}-01-01`)
      .lte('paid_date', `${year}-12-31`),
    supabase.from('expenses')
      .select('amount, category, deductible, property_id')
      .eq('landlord_id', landlord.id)
      .gte('date', `${year}-01-01`)
      .lte('date', `${year}-12-31`),
    supabase.from('properties').select('id, address, unit_number').eq('landlord_id', landlord.id),
  ])

  const payments = paymentsRes.data ?? []
  const expenses = expensesRes.data ?? []
  const properties = propertiesRes.data ?? []

  const totalIncome = payments.reduce((s, p) => s + p.amount, 0)
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const deductibleExpenses = expenses.filter(e => e.deductible).reduce((s, e) => s + e.amount, 0)
  const netIncome = totalIncome - totalExpenses

  // Monthly breakdown
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const monthlyIncome = months.map((_, i) => {
    const m = String(i + 1).padStart(2, '0')
    return payments.filter(p => p.paid_date?.startsWith(`${year}-${m}`)).reduce((s, p) => s + p.amount, 0)
  })
  const monthlyExpenses = months.map((_, i) => {
    const m = String(i + 1).padStart(2, '0')
    return expenses.filter(e => (e as any).date?.startsWith(`${year}-${m}`)).reduce((s, e) => s + e.amount, 0)
  })

  // Income by property
  const incomeByProperty: Record<string, number> = {}
  payments.forEach((p: any) => {
    const key = p.properties?.address ?? p.property_id
    incomeByProperty[key] = (incomeByProperty[key] ?? 0) + p.amount
  })

  // Expenses by category
  const expensesByCategory: Record<string, number> = {}
  expenses.forEach(e => {
    expensesByCategory[e.category] = (expensesByCategory[e.category] ?? 0) + e.amount
  })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">Reports</h1>
          <p className="text-stone-500 text-sm mt-1">Tax year {year} summary</p>
        </div>
        <div className="flex gap-2">
          <form><select name="year" defaultValue={year} className="border border-stone-200 rounded-lg px-3 py-2 text-sm">
            {[2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select></form>
          {isPro ? (
            <button className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors">
              <Download className="w-4 h-4" /> Export PDF
            </button>
          ) : (
            <Link href="/settings" className="flex items-center gap-2 bg-stone-200 text-stone-600 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed">
              <Download className="w-4 h-4" /> Export PDF (Pro)
            </Link>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Gross Income', value: totalIncome, icon: TrendingUp, color: 'emerald' },
          { label: 'Total Expenses', value: totalExpenses, icon: TrendingDown, color: 'red' },
          { label: 'Net Income', value: netIncome, icon: DollarSign, color: netIncome >= 0 ? 'emerald' : 'red' },
          { label: 'Tax Deductible', value: deductibleExpenses, icon: FileText, color: 'blue' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm">
            <div className={`text-${color}-600 flex items-center gap-1.5 text-xs font-medium mb-2`}><Icon className="w-3.5 h-3.5" />{label}</div>
            <p className={`text-2xl font-bold ${value < 0 ? 'text-red-600' : 'text-stone-900'}`}>{formatCurrency(Math.abs(value))}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Income by property */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
          <h2 className="font-semibold text-stone-900 mb-4">Income by Property</h2>
          {Object.keys(incomeByProperty).length === 0 ? (
            <p className="text-stone-400 text-sm">No income recorded for {year}</p>
          ) : Object.entries(incomeByProperty).sort(([,a],[,b]) => b - a).map(([addr, amt]) => (
            <div key={addr} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
              <span className="text-sm text-stone-700 truncate flex-1 mr-4">{addr}</span>
              <span className="text-sm font-semibold text-emerald-700">{formatCurrency(amt)}</span>
            </div>
          ))}
        </div>

        {/* Expenses by category (Schedule E) */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
          <h2 className="font-semibold text-stone-900 mb-1">Schedule E Expense Summary</h2>
          <p className="text-xs text-stone-400 mb-4">IRS Form 1040 — Rental Income & Loss</p>
          {Object.keys(expensesByCategory).length === 0 ? (
            <p className="text-stone-400 text-sm">No expenses recorded for {year}</p>
          ) : Object.entries(expensesByCategory).sort(([,a],[,b]) => b - a).map(([cat, amt]) => (
            <div key={cat} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
              <span className="text-sm text-stone-700 capitalize">{cat.replace('_', ' ')}</span>
              <span className="text-sm font-semibold text-red-600">{formatCurrency(amt)}</span>
            </div>
          ))}
          {Object.keys(expensesByCategory).length > 0 && (
            <div className="flex items-center justify-between pt-3 mt-1 border-t border-stone-200">
              <span className="text-sm font-semibold text-stone-900">Total Deductions</span>
              <span className="text-sm font-bold text-red-700">{formatCurrency(deductibleExpenses)}</span>
            </div>
          )}
        </div>

        {/* Monthly chart (simple bars) */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 col-span-2">
          <h2 className="font-semibold text-stone-900 mb-6">Monthly Income vs Expenses — {year}</h2>
          <div className="flex items-end gap-2 h-40">
            {months.map((m, i) => {
              const inc = monthlyIncome[i]
              const exp = monthlyExpenses[i]
              const maxVal = Math.max(...monthlyIncome, ...monthlyExpenses, 1)
              return (
                <div key={m} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end gap-0.5 h-32 justify-center">
                    <div
                      className="flex-1 bg-emerald-400 rounded-t-sm transition-all"
                      style={{ height: `${(inc / maxVal) * 100}%` }}
                      title={`Income: ${formatCurrency(inc)}`}
                    />
                    <div
                      className="flex-1 bg-red-300 rounded-t-sm transition-all"
                      style={{ height: `${(exp / maxVal) * 100}%` }}
                      title={`Expenses: ${formatCurrency(exp)}`}
                    />
                  </div>
                  <span className="text-xs text-stone-400">{m}</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5 text-xs text-stone-500"><div className="w-3 h-3 bg-emerald-400 rounded-sm" /> Income</div>
            <div className="flex items-center gap-1.5 text-xs text-stone-500"><div className="w-3 h-3 bg-red-300 rounded-sm" /> Expenses</div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { createServerClient, getCurrentLandlord } from '@/lib/supabase'
import { formatCurrency, formatDate, EXPENSE_CATEGORIES } from '@/lib/utils'
import { Receipt, Plus, TrendingDown, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default async function ExpensesPage({ searchParams }: { searchParams: { year?: string } }) {
  const supabase = createServerClient()
  const landlord = await getCurrentLandlord(supabase)
  if (!landlord) return null

  const year = searchParams.year ?? new Date().getFullYear().toString()

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*, properties(address, unit_number)')
    .eq('landlord_id', landlord.id)
    .gte('date', `${year}-01-01`)
    .lte('date', `${year}-12-31`)
    .order('date', { ascending: false })

  const total = (expenses ?? []).reduce((s, e) => s + e.amount, 0)
  const deductible = (expenses ?? []).filter(e => e.deductible).reduce((s, e) => s + e.amount, 0)

  const byCategory: Record<string, number> = {}
  ;(expenses ?? []).forEach(e => {
    byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount
  })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">Expenses</h1>
          <p className="text-stone-500 text-sm mt-1">{expenses?.length ?? 0} records for {year}</p>
        </div>
        <div className="flex gap-2">
          <form>
            <select name="year" defaultValue={year} className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </form>
          <Link href="/expenses/new" className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors">
            <Plus className="w-4 h-4" /> Add expense
          </Link>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
          <div className="flex items-center gap-1.5 text-stone-500 text-sm mb-1"><TrendingDown className="w-4 h-4" /> Total Expenses</div>
          <p className="text-2xl font-bold text-stone-900">{formatCurrency(total)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
          <div className="flex items-center gap-1.5 text-emerald-600 text-sm mb-1"><CheckCircle2 className="w-4 h-4" /> Tax Deductible</div>
          <p className="text-2xl font-bold text-stone-900">{formatCurrency(deductible)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
          <div className="text-stone-500 text-sm mb-1">Top Category</div>
          <p className="text-lg font-bold text-stone-900 capitalize">
            {Object.keys(byCategory).sort((a, b) => byCategory[b] - byCategory[a])[0]?.replace('_', ' ') ?? '—'}
          </p>
          <p className="text-xs text-stone-400">{formatCurrency(Object.values(byCategory).sort((a, b) => b - a)[0] ?? 0)}</p>
        </div>
      </div>

      {/* Expenses list */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-stone-50 border-b border-stone-100">
            <tr>
              {['Date', 'Category', 'Property', 'Vendor', 'Description', 'Amount', 'Deductible'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {(!expenses || expenses.length === 0) ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-stone-400 text-sm">
                  <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No expenses logged for {year}
                </td>
              </tr>
            ) : expenses.map((expense: any) => {
              const cat = EXPENSE_CATEGORIES.find(c => c.value === expense.category)
              return (
                <tr key={expense.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-stone-600">{formatDate(expense.date)}</td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 bg-stone-100 text-stone-700 text-xs font-medium rounded-full capitalize">
                      {expense.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-stone-600">
                    {expense.properties ? `${expense.properties.address}${expense.properties.unit_number ? ` #${expense.properties.unit_number}` : ''}` : 'All properties'}
                  </td>
                  <td className="px-4 py-3 text-sm text-stone-600">{expense.vendor ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-stone-600 max-w-48 truncate">{expense.description ?? '—'}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-stone-900">{formatCurrency(expense.amount)}</td>
                  <td className="px-4 py-3">
                    {expense.deductible
                      ? <span className="text-emerald-600 text-xs font-medium">✓ Yes</span>
                      : <span className="text-stone-400 text-xs">No</span>
                    }
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

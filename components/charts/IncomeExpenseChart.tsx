'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { createSupabaseClient } from '@/lib/supabase'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'

interface MonthData {
  month: string
  income: number
  expenses: number
}

export function IncomeExpenseChart({ landlordId }: { landlordId: string }) {
  const [data, setData] = useState<MonthData[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    async function fetchData() {
      const months: MonthData[] = []

      for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i)
        const start = format(startOfMonth(date), 'yyyy-MM-dd')
        const end = format(endOfMonth(date), 'yyyy-MM-dd')
        const label = format(date, 'MMM')

        const [{ data: payments }, { data: expenses }] = await Promise.all([
          supabase.from('rent_payments')
            .select('amount')
            .eq('landlord_id', landlordId)
            .eq('status', 'paid')
            .gte('paid_date', start)
            .lte('paid_date', end),
          supabase.from('expenses')
            .select('amount')
            .eq('landlord_id', landlordId)
            .gte('date', start)
            .lte('date', end),
        ])

        months.push({
          month: label,
          income: payments?.reduce((s, p) => s + Number(p.amount), 0) ?? 0,
          expenses: expenses?.reduce((s, e) => s + Number(e.amount), 0) ?? 0,
        })
      }

      setData(months)
      setLoading(false)
    }
    fetchData()
  }, [landlordId])

  if (loading) {
    return <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
        <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
        <Legend />
        <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" name="Expenses" fill="#f87171" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

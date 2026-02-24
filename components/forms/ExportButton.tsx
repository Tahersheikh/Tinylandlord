'use client'

import { ReactNode } from 'react'
import { generateCSV, downloadCSV } from '@/lib/utils'

interface ExportButtonProps {
  type: 'csv'
  data: { payments?: any[]; expenses?: any[]; year?: number }
  filename: string
  children: ReactNode
}

export function ExportButton({ type, data, filename, children }: ExportButtonProps) {
  function handleExport() {
    if (type === 'csv') {
      const rows: any[] = []

      data.payments?.forEach(p => {
        rows.push({
          type: 'Income',
          date: p.paid_date,
          description: `Rent - ${p.property?.address ?? ''}`,
          amount: p.amount,
          category: 'Rental Income',
          tenant: p.tenant?.name,
        })
      })

      data.expenses?.forEach(e => {
        rows.push({
          type: 'Expense',
          date: e.date,
          description: e.description ?? e.category,
          amount: -e.amount,
          category: e.category,
          vendor: e.vendor,
          deductible: e.deductible ? 'Yes' : 'No',
        })
      })

      rows.sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))

      const headers = ['type', 'date', 'description', 'amount', 'category', 'tenant', 'vendor', 'deductible']
      const csv = generateCSV(rows, headers)
      downloadCSV(csv, `${filename}-${data.year ?? new Date().getFullYear()}.csv`)
    }
  }

  return <div onClick={handleExport}>{children}</div>
}

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, differenceInDays, addMonths } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy')
}

export function getDaysUntilDue(dueDate: string): number {
  return differenceInDays(new Date(dueDate), new Date())
}

export function getPaymentStatus(dueDate: string, paidDate?: string | null): string {
  if (paidDate) return 'paid'
  const days = getDaysUntilDue(dueDate)
  if (days < 0) return 'late'
  return 'pending'
}

export function calculateLateFee(
  amount: number,
  lateFeeAmount: number,
  gracePeriod: number,
  dueDate: string
): number {
  const daysLate = Math.abs(getDaysUntilDue(dueDate))
  if (daysLate <= gracePeriod) return 0
  return lateFeeAmount
}

export function getNextRentDueDate(dueDayOfMonth: number): Date {
  const today = new Date()
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), dueDayOfMonth)
  if (today > thisMonth) {
    return addMonths(thisMonth, 1)
  }
  return thisMonth
}

export function getOccupancyRate(totalUnits: number, occupiedUnits: number): number {
  if (totalUnits === 0) return 0
  return Math.round((occupiedUnits / totalUnits) * 100)
}

export const EXPENSE_CATEGORIES = [
  { value: 'maintenance', label: 'Maintenance', deductible: true },
  { value: 'repairs', label: 'Repairs', deductible: true },
  { value: 'insurance', label: 'Insurance', deductible: true },
  { value: 'taxes', label: 'Property Taxes', deductible: true },
  { value: 'utilities', label: 'Utilities', deductible: true },
  { value: 'management', label: 'Property Management', deductible: true },
  { value: 'advertising', label: 'Advertising', deductible: true },
  { value: 'supplies', label: 'Supplies', deductible: true },
  { value: 'legal', label: 'Legal & Professional', deductible: true },
  { value: 'mortgage', label: 'Mortgage Interest', deductible: true },
  { value: 'other', label: 'Other', deductible: false },
]

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'check', label: 'Check' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'venmo', label: 'Venmo' },
  { value: 'zelle', label: 'Zelle' },
  { value: 'stripe', label: 'Stripe' },
  { value: 'other', label: 'Other' },
]

export const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
]

// Retry with exponential backoff
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries === 0) throw error
    await new Promise(res => setTimeout(res, delay))
    return withRetry(fn, retries - 1, delay * 2)
  }
}

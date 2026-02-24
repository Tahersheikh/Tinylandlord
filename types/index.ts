export type SubscriptionTier = 'free' | 'starter' | 'pro'
export type PaymentStatus = 'pending' | 'paid' | 'late' | 'partial' | 'waived'
export type TenantStatus = 'active' | 'inactive' | 'evicted' | 'moved-out'
export type PropertyType = 'residential' | 'commercial' | 'multi-family'
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'emergency'
export type MaintenanceStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'
export type CommunicationType = 'sms' | 'email' | 'whatsapp' | 'call' | 'in_person'
export type ExpenseCategory = 'maintenance' | 'repairs' | 'insurance' | 'taxes' | 'utilities' | 'management' | 'advertising' | 'supplies' | 'legal' | 'mortgage' | 'other'

export interface Landlord {
  id: string
  user_id: string
  email: string
  name?: string
  phone?: string
  subscription_status: SubscriptionTier
  subscription_tier: SubscriptionTier
  stripe_customer_id?: string
  stripe_subscription_id?: string
  current_period_end?: string
  created_at: string
  updated_at: string
}

export interface Property {
  id: string
  landlord_id: string
  address: string
  unit_number?: string
  city?: string
  state?: string
  zip?: string
  rent_amount: number
  rent_due_day: number
  late_fee_amount: number
  late_fee_grace_period: number
  property_type: PropertyType
  notes?: string
  created_at: string
  updated_at: string
  // Joined
  tenants?: Tenant[]
}

export interface Tenant {
  id: string
  property_id: string
  landlord_id: string
  name: string
  email?: string
  phone?: string
  lease_start: string
  lease_end?: string
  rent_amount: number
  security_deposit: number
  status: TenantStatus
  emergency_contact_name?: string
  emergency_contact_phone?: string
  notes?: string
  created_at: string
  updated_at: string
  // Joined
  properties?: Property
  rent_payments?: RentPayment[]
}

export interface RentPayment {
  id: string
  tenant_id: string
  property_id: string
  landlord_id: string
  amount: number
  due_date: string
  paid_date?: string
  status: PaymentStatus
  late_fee_applied: number
  payment_method?: string
  notes?: string
  created_at: string
  updated_at: string
  // Joined
  tenants?: Tenant
  properties?: Property
}

export interface Expense {
  id: string
  landlord_id: string
  property_id?: string
  category: ExpenseCategory
  amount: number
  date: string
  vendor?: string
  description?: string
  receipt_url?: string
  deductible: boolean
  created_at: string
  // Joined
  properties?: Property
}

export interface Communication {
  id: string
  landlord_id: string
  tenant_id: string
  type: CommunicationType
  direction: 'inbound' | 'outbound'
  content: string
  status: 'draft' | 'sent' | 'delivered' | 'failed' | 'read'
  sent_at: string
  metadata: Record<string, any>
  // Joined
  tenants?: Tenant
}

export interface MaintenanceRequest {
  id: string
  property_id: string
  tenant_id?: string
  landlord_id: string
  title: string
  description?: string
  priority: MaintenancePriority
  status: MaintenanceStatus
  assigned_to?: string
  estimated_cost?: number
  actual_cost?: number
  completed_at?: string
  created_at: string
  // Joined
  properties?: Property
  tenants?: Tenant
}

export interface DashboardStats {
  totalRentDue: number
  totalCollected: number
  totalOutstanding: number
  occupancyRate: number
  totalProperties: number
  activeTenants: number
  latePayments: number
}

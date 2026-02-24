-- ============================================
-- TinyLandlord Database Schema
-- Run this in your Supabase SQL editor
-- ============================================

create extension if not exists "uuid-ossp";

-- Landlords table
create table landlords (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  email text not null unique,
  name text,
  phone text,
  subscription_status text default 'free' check (subscription_status in ('free', 'starter', 'pro')),
  subscription_tier text default 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamp,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Properties table
create table properties (
  id uuid default gen_random_uuid() primary key,
  landlord_id uuid references landlords(id) on delete cascade not null,
  address text not null,
  unit_number text,
  city text,
  state text,
  zip text,
  rent_amount decimal(10,2) not null,
  rent_due_day integer default 1 check (rent_due_day between 1 and 31),
  late_fee_amount decimal(10,2) default 50.00,
  late_fee_grace_period integer default 5 check (late_fee_grace_period between 0 and 30),
  property_type text default 'residential' check (property_type in ('residential', 'commercial', 'multi-family')),
  notes text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Tenants table
create table tenants (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  landlord_id uuid references landlords(id) on delete cascade not null,
  name text not null,
  email text,
  phone text,
  lease_start date not null,
  lease_end date,
  rent_amount decimal(10,2) not null,
  security_deposit decimal(10,2) default 0,
  status text default 'active' check (status in ('active', 'inactive', 'evicted', 'moved-out')),
  emergency_contact_name text,
  emergency_contact_phone text,
  notes text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Rent payments table
create table rent_payments (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references tenants(id) on delete cascade not null,
  property_id uuid references properties(id) on delete cascade not null,
  landlord_id uuid references landlords(id) on delete cascade not null,
  amount decimal(10,2) not null,
  due_date date not null,
  paid_date date,
  status text default 'pending' check (status in ('pending', 'paid', 'late', 'partial', 'waived')),
  late_fee_applied decimal(10,2) default 0,
  payment_method text check (payment_method in ('cash', 'check', 'bank_transfer', 'venmo', 'zelle', 'stripe', 'other')),
  notes text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Expenses table
create table expenses (
  id uuid default gen_random_uuid() primary key,
  landlord_id uuid references landlords(id) on delete cascade not null,
  property_id uuid references properties(id) on delete set null,
  category text not null check (category in ('maintenance', 'repairs', 'insurance', 'taxes', 'utilities', 'management', 'advertising', 'supplies', 'legal', 'mortgage', 'other')),
  amount decimal(10,2) not null,
  date date not null,
  vendor text,
  description text,
  receipt_url text,
  deductible boolean default true,
  created_at timestamp default now()
);

-- Communications log
create table communications (
  id uuid default gen_random_uuid() primary key,
  landlord_id uuid references landlords(id) on delete cascade not null,
  tenant_id uuid references tenants(id) on delete cascade not null,
  type text not null check (type in ('sms', 'email', 'whatsapp', 'call', 'in_person')),
  direction text default 'outbound' check (direction in ('inbound', 'outbound')),
  content text not null,
  status text default 'sent' check (status in ('draft', 'sent', 'delivered', 'failed', 'read')),
  sent_at timestamp default now(),
  metadata jsonb default '{}'
);

-- Maintenance requests
create table maintenance_requests (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  tenant_id uuid references tenants(id) on delete set null,
  landlord_id uuid references landlords(id) on delete cascade not null,
  title text not null,
  description text,
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'emergency')),
  status text default 'open' check (status in ('open', 'in_progress', 'completed', 'cancelled')),
  assigned_to text,
  estimated_cost decimal(10,2),
  actual_cost decimal(10,2),
  completed_at timestamp,
  created_at timestamp default now()
);

-- Indexes
create index idx_properties_landlord on properties(landlord_id);
create index idx_tenants_landlord on tenants(landlord_id);
create index idx_tenants_property on tenants(property_id);
create index idx_rent_payments_tenant on rent_payments(tenant_id);
create index idx_rent_payments_landlord on rent_payments(landlord_id);
create index idx_rent_payments_due_date on rent_payments(due_date);
create index idx_rent_payments_status on rent_payments(status);
create index idx_expenses_landlord on expenses(landlord_id);
create index idx_communications_landlord on communications(landlord_id);
create index idx_maintenance_landlord on maintenance_requests(landlord_id);

-- Row Level Security
alter table landlords enable row level security;
alter table properties enable row level security;
alter table tenants enable row level security;
alter table rent_payments enable row level security;
alter table expenses enable row level security;
alter table communications enable row level security;
alter table maintenance_requests enable row level security;

create policy "Users can view own landlord record" on landlords for select using (auth.uid() = user_id);
create policy "Users can insert own landlord record" on landlords for insert with check (auth.uid() = user_id);
create policy "Users can update own landlord record" on landlords for update using (auth.uid() = user_id);

create policy "Landlords can CRUD own properties" on properties for all
  using (landlord_id in (select id from landlords where user_id = auth.uid()));

create policy "Landlords can CRUD own tenants" on tenants for all
  using (landlord_id in (select id from landlords where user_id = auth.uid()));

create policy "Landlords can CRUD own payments" on rent_payments for all
  using (landlord_id in (select id from landlords where user_id = auth.uid()));

create policy "Landlords can CRUD own expenses" on expenses for all
  using (landlord_id in (select id from landlords where user_id = auth.uid()));

create policy "Landlords can CRUD own communications" on communications for all
  using (landlord_id in (select id from landlords where user_id = auth.uid()));

create policy "Landlords can CRUD own maintenance" on maintenance_requests for all
  using (landlord_id in (select id from landlords where user_id = auth.uid()));

-- Update timestamps trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger update_landlords_updated_at before update on landlords for each row execute function update_updated_at_column();
create trigger update_properties_updated_at before update on properties for each row execute function update_updated_at_column();
create trigger update_tenants_updated_at before update on tenants for each row execute function update_updated_at_column();
create trigger update_rent_payments_updated_at before update on rent_payments for each row execute function update_updated_at_column();

-- Auto-create landlord profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into landlords (user_id, email) values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Storage: run separately in Supabase Dashboard
-- insert into storage.buckets (id, name, public) values ('receipts', 'receipts', false);
-- insert into storage.buckets (id, name, public) values ('leases', 'leases', false);

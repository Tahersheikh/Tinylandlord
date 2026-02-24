import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client-side Supabase client
export const createBrowserClient = () => createClientComponentClient()

// Server-side Supabase client (for Server Components & Route Handlers)
export const createServerClient = () =>
  createServerComponentClient({ cookies })

// Admin client (bypasses RLS - use only in server-side API routes)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// Helper: get current landlord record
export async function getCurrentLandlord(supabase: ReturnType<typeof createServerClient>) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const { data: landlord } = await supabase
    .from('landlords')
    .select('*')
    .eq('user_id', session.user.id)
    .single()

  return landlord
}

// Helper: check subscription tier limits
export function checkTierLimit(tier: string, count: number): boolean {
  const limits: Record<string, number> = {
    free: 1,
    starter: 5,
    pro: Infinity,
  }
  return count < (limits[tier] ?? 1)
}

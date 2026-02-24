import { createSupabaseServerClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { formatDate, getPriorityColor } from '@/lib/utils'
import { Wrench, Plus, AlertTriangle } from 'lucide-react'
import { MaintenanceModal } from '@/components/forms/MaintenanceModal'

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-yellow-50 text-yellow-700',
  in_progress: 'bg-blue-50 text-blue-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-gray-50 text-gray-500',
}

export default async function MaintenancePage() {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: landlord } = await supabase
    .from('landlords').select('*').eq('user_id', user.id).single()
  if (!landlord) redirect('/login')

  const [{ data: requests }, { data: properties }, { data: tenants }] = await Promise.all([
    supabase.from('maintenance_requests')
      .select('*, property:properties(address), tenant:tenants(name)')
      .eq('landlord_id', landlord.id)
      .order('created_at', { ascending: false }),
    supabase.from('properties').select('id, address').eq('landlord_id', landlord.id),
    supabase.from('tenants').select('id, name').eq('landlord_id', landlord.id).eq('status', 'active'),
  ])

  const openCount = requests?.filter(r => r.status === 'open').length ?? 0
  const emergencyCount = requests?.filter(r => r.priority === 'emergency' && r.status !== 'completed').length ?? 0

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance</h1>
          <p className="text-gray-500 mt-1">{openCount} open requests</p>
        </div>
        <MaintenanceModal landlordId={landlord.id} properties={properties ?? []} tenants={tenants ?? []}>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            New Request
          </button>
        </MaintenanceModal>
      </div>

      {emergencyCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 font-medium">{emergencyCount} emergency request{emergencyCount > 1 ? 's' : ''} require immediate attention</p>
        </div>
      )}

      {requests && requests.length > 0 ? (
        <div className="space-y-3">
          {requests.map((req: any) => (
            <div key={req.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{req.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(req.priority)}`}>
                      {req.priority}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[req.status]}`}>
                      {req.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    {req.property?.address}
                    {req.tenant && ` · Reported by ${req.tenant.name}`}
                    {' · '}{formatDate(req.created_at)}
                  </p>
                  {req.description && <p className="text-sm text-gray-600">{req.description}</p>}
                  {req.assigned_to && <p className="text-xs text-gray-400 mt-1">Assigned to: {req.assigned_to}</p>}
                </div>
                <MaintenanceModal landlordId={landlord.id} properties={properties ?? []} tenants={tenants ?? []} request={req}>
                  <button className="text-xs text-blue-600 hover:text-blue-700 font-medium ml-4 whitespace-nowrap">Edit</button>
                </MaintenanceModal>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Wrench className="h-14 w-14 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No maintenance requests</h3>
          <p className="text-gray-500 text-sm mb-6">Log maintenance issues to track repairs and costs.</p>
          <MaintenanceModal landlordId={landlord.id} properties={properties ?? []} tenants={tenants ?? []}>
            <button className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4" />
              Log first request
            </button>
          </MaintenanceModal>
        </div>
      )}
    </div>
  )
}

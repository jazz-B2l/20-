import { requireAdmin } from '@/lib/auth-utils'
import { AdminDashboard } from '@/components/admin-dashboard'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const { user, roleName } = await requireAdmin()

  return (
    <div className="min-h-screen bg-background">
      <AdminDashboard user={user} roleName={roleName} />
    </div>
  )
}

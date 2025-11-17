import AdminDashboard from '@/components/admin/AdminDashboard'
import AdminLogin from '@/components/admin/AdminLogin'
import { hasAdminSession } from '@/lib/adminAuth'

export default async function AdminPage() {
  const authenticated = await hasAdminSession()
  return authenticated ? <AdminDashboard /> : <AdminLogin />
}



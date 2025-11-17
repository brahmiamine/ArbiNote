import { ReactNode } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 bg-gray-50 text-gray-900">
          <header className="px-8 py-6 border-b border-gray-200 bg-white shadow-sm">
            <p className="text-sm text-gray-500">Espace d’administration</p>
            <h1 className="text-2xl font-semibold text-gray-900">Gestion des arbitres</h1>
          </header>
          <div className="p-8">{children}</div>
        </div>
      </div>
    </div>
  )
}



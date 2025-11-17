import { ReactNode } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { FederationProvider } from '@/components/FederationContext'
import { fetchFederationsWithLeagues } from '@/lib/dataAccess'
import { getActiveLeagueId } from '@/lib/leagueSelection'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const federations = await fetchFederationsWithLeagues()
  const availableLeagueIds = new Set(
    federations.flatMap((fed) => fed.leagues.map((league) => league.id))
  )

  let activeLeagueId = await getActiveLeagueId()
  if (!activeLeagueId || !availableLeagueIds.has(activeLeagueId)) {
    activeLeagueId = federations[0]?.leagues[0]?.id ?? null
  }

  if (!activeLeagueId) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="max-w-lg text-center space-y-4">
          <h1 className="text-2xl font-semibold">Configuration requise</h1>
          <p className="text-slate-200">
            Aucune ligue n’est disponible. Ajoutez des fédérations et ligues dans la base de données
            pour utiliser l’espace admin.
          </p>
        </div>
      </div>
    )
  }

  return (
    <FederationProvider federations={federations} initialLeagueId={activeLeagueId}>
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
    </FederationProvider>
  )
}



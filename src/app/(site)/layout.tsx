import { ReactNode } from 'react'
import Navigation from '@/components/Navigation'
import { FederationProvider } from '@/components/FederationContext'
import { fetchFederationsWithLeagues } from '@/lib/dataAccess'
import { getActiveLeagueId } from '@/lib/leagueSelection'

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const federations = await fetchFederationsWithLeagues()
  const availableLeagueIds = new Set(
    federations.flatMap((fed) => fed.leagues.map((league) => league.id))
  )

  const preferredLeagueId =
    federations
      .find((fed) => fed.code === 'TUN')
      ?.leagues.find((league) => league.nom === 'Ligue Professionnelle 1')?.id ?? null

  let activeLeagueId = await getActiveLeagueId()
  if (!activeLeagueId || !availableLeagueIds.has(activeLeagueId)) {
    activeLeagueId = preferredLeagueId ?? federations[0]?.leagues[0]?.id ?? null
  }

  return (
    <FederationProvider federations={federations} initialLeagueId={activeLeagueId}>
      <Navigation />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </FederationProvider>
  )
}



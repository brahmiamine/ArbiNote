import HomeClient from '@/components/HomeClient'
import { fetchNextJourneeMatches } from '@/lib/dataAccess'
import { getActiveLeagueId } from '@/lib/leagueSelection'

export default async function Home() {
  const leagueId = await getActiveLeagueId()
  const upcoming = await fetchNextJourneeMatches(new Date(), leagueId ?? undefined)

  return <HomeClient upcoming={upcoming as any ?? undefined} />
}

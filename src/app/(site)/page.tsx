import HomeClient from '@/components/HomeClient'
import { fetchFeaturedSaisons, fetchNextJourneeMatches } from '@/lib/dataAccess'
import { getActiveLeagueId } from '@/lib/leagueSelection'

export default async function Home() {
  const leagueId = await getActiveLeagueId()
  const saisons = await fetchFeaturedSaisons(2, leagueId ?? undefined)
  const upcoming = await fetchNextJourneeMatches(new Date(), leagueId ?? undefined)
  return <HomeClient saisons={saisons} upcoming={upcoming ?? undefined} />
}

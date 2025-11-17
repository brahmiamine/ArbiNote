import { Saison } from '@/types'
import HomeClient from '@/components/HomeClient'
import { fetchFeaturedSaisons, fetchNextJourneeMatches } from '@/lib/dataAccess'

async function getFeaturedSaisons(): Promise<Saison[]> {
  return fetchFeaturedSaisons(2)
}

export default async function Home() {
  const saisons = await getFeaturedSaisons()
  const upcoming = await fetchNextJourneeMatches()
  return <HomeClient saisons={saisons} upcoming={upcoming ?? undefined} />
}

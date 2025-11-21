import HomeClient from '@/components/HomeClient'
import {
  fetchArbitres,
  fetchCritereDefinitions,
  fetchFeaturedSaisons,
  fetchJourneesBySaison,
  fetchLatestSaison,
  fetchMatchesByJournee,
  fetchMatchesByJourneeIds,
  fetchNextJourneeMatches,
  fetchVotesByMatchIds,
} from '@/lib/dataAccess'
import { getActiveLeagueId } from '@/lib/leagueSelection'
import { buildRanking } from '@/lib/rankings'

export default async function Home() {
  const leagueId = await getActiveLeagueId()
  const [saisons, upcoming, latestSaison] = await Promise.all([
    fetchFeaturedSaisons(2, leagueId ?? undefined),
    fetchNextJourneeMatches(new Date(), leagueId ?? undefined),
    fetchLatestSaison(leagueId ?? undefined),
  ])

  let previousSection: Awaited<ReturnType<typeof fetchNextJourneeMatches>> | null = null
  let rankingPreview:
    | {
        referees: ReturnType<typeof buildRanking>
        general: ReturnType<typeof buildRanking>
      }
    | null = null
  let statsSummary:
    | {
        totalReferees: number
        totalMatches: number
        totalJournees: number
        totalVotes: number
        seasonLabel?: string
      }
    | null = null

  if (latestSaison) {
    const journees = await fetchJourneesBySaison(latestSaison.id)
    const now = new Date()
    const datedJournees = journees
      .filter((journee) => journee.date_journee)
      .sort((a, b) => {
        if (!a.date_journee || !b.date_journee) return 0
        return new Date(a.date_journee).getTime() - new Date(b.date_journee).getTime()
      })

    const previousJournee =
      datedJournees
        .filter((journee) => journee.date_journee && new Date(journee.date_journee) <= now)
        .pop() ?? datedJournees.at(-1) ?? journees.at(-1) ?? null

    const previousMatches = previousJournee
      ? await fetchMatchesByJournee(previousJournee.id)
      : null

    if (previousJournee && previousMatches && previousMatches.length > 0) {
      previousSection = {
        journee: previousJournee,
        matches: previousMatches,
      }
    }

    const journeeIds = journees.map((journee) => journee.id)
    const matchesIndex = await fetchMatchesByJourneeIds(journeeIds)
    const matchIds = matchesIndex?.map((match) => match.id) ?? []
    const votes = matchIds.length > 0 ? await fetchVotesByMatchIds(matchIds) : []
    const criteresDefinitions = await fetchCritereDefinitions()

    const arbitreCriteres = criteresDefinitions.filter((critere) => critere.categorie === 'arbitre')
    const generalCriteres = criteresDefinitions

    const refereeRanking = buildRanking(votes, {
      criteres: arbitreCriteres,
      includeCategories: ['arbitre'],
    })
    const generalRanking = buildRanking(votes, {
      criteres: generalCriteres,
      includeCategories: ['arbitre', 'var', 'assistant'],
    })

    rankingPreview = {
      referees: refereeRanking.slice(0, 5),
      general: generalRanking.slice(0, 5),
    }

    const arbitres = await fetchArbitres()
    statsSummary = {
      totalReferees: arbitres.length,
      totalMatches: matchIds.length,
      totalJournees: journees.length,
      totalVotes: votes.length,
      seasonLabel: latestSaison.nom,
    }
  }

  return (
    <HomeClient
      saisons={saisons}
      upcoming={upcoming ?? undefined}
      previous={previousSection ?? undefined}
      ranking={rankingPreview ?? undefined}
      stats={statsSummary ?? undefined}
    />
  )
}

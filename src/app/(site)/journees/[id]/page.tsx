import Link from 'next/link'
import { notFound } from 'next/navigation'
import MatchCard from '@/components/MatchCard'
import RankingTable from '@/components/RankingTable'
import { buildRanking } from '@/lib/rankings'
import { CritereDefinition, Journee, Match, Vote } from '@/types'
import { getServerLocale, translate } from '@/lib/i18nServer'
import {
  fetchCritereDefinitions,
  fetchJourneeWithSeason,
  fetchMatchesByJournee,
  fetchVotesByMatchIds,
} from '@/lib/dataAccess'

async function getJournee(id: string): Promise<Journee & { saison?: { id: string; nom: string } } | null> {
  return (await fetchJourneeWithSeason(id)) as (Journee & { saison?: { id: string; nom: string } }) | null
}

async function getMatches(journeeId: string): Promise<Match[]> {
  return (await fetchMatchesByJournee(journeeId)) as Match[]
}

export default async function JourneePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const journee = await getJournee(id)

  if (!journee) {
    notFound()
  }

  const locale = await getServerLocale()
  const t = (key: string) => translate(key, locale)
  const matches = await getMatches(id)
  const matchIds = matches.map((m) => m.id)

  const votes = (await fetchVotesByMatchIds(matchIds)) as Vote[]

  const criteresDefinitions = (await fetchCritereDefinitions()) as unknown as CritereDefinition[]

  const definitions = criteresDefinitions as CritereDefinition[]
  const arbitreCriteres = definitions.filter((c) => c.categorie === 'arbitre')
  const generalCriteres = definitions

  const refereeRanking = buildRanking(votes, {
    criteres: arbitreCriteres,
    includeCategories: ['arbitre'],
  })

  const generalRanking = buildRanking(votes, {
    criteres: generalCriteres,
    includeCategories: ['arbitre', 'var', 'assistant'],
  })

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        {journee.saison && (
          <Link
            href={`/saisons/${journee.saison.id}`}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {t('journee.backToSeason')} {journee.saison.nom}
          </Link>
        )}
        <h1 className="text-3xl font-bold mt-2">
          {t('common.matchday')} {journee.numero}
        </h1>
      </div>

      <section>
        <h2 className="text-2xl font-semibold mb-4">{t('journee.matchesTitle')}</h2>
        {matches.length === 0 ? (
          <p className="text-gray-600">{t('journee.noMatches')}</p>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </section>

      {refereeRanking[0] && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700 mb-1">{t('journee.bestReferee')}</p>
          <p className="text-2xl font-bold text-blue-900">
            {locale === 'ar' && refereeRanking[0].nom_ar
              ? refereeRanking[0].nom_ar
              : refereeRanking[0].nom}
          </p>
          <p className="text-sm text-blue-700">
            {t('common.globalNote')}: {refereeRanking[0].moyenne.toFixed(2)} / 5
          </p>
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">{t('journee.rankingsTitle')}</h2>
        <RankingTable
          entries={refereeRanking}
          criteres={arbitreCriteres}
          locale={locale}
          t={t}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">{t('journee.generalRankingTitle')}</h2>
        <RankingTable
          entries={generalRanking}
          criteres={generalCriteres}
          locale={locale}
          t={t}
        />
      </section>
    </div>
  )
}



import Link from 'next/link'
import { notFound } from 'next/navigation'
import RankingTable from '@/components/RankingTable'
import { buildRanking } from '@/lib/rankings'
import { formatDate, getLocalizedName } from '@/lib/utils'
import { CritereDefinition, Journee, Saison, Vote } from '@/types'
import { getServerLocale, translate } from '@/lib/i18nServer'
import {
  fetchCritereDefinitions,
  fetchJourneesBySaison,
  fetchMatchesByJourneeIds,
  fetchSaisonById,
  fetchVotesByMatchIds,
} from '@/lib/dataAccess'

async function getSaison(id: string): Promise<Saison | null> {
  return fetchSaisonById(id)
}

async function getJournees(saisonId: string): Promise<Journee[]> {
  return fetchJourneesBySaison(saisonId)
}

export default async function SaisonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const saison = await getSaison(id)

  if (!saison) {
    notFound()
  }

  const locale = await getServerLocale()
  const t = (key: string, params?: Record<string, string | number>) => translate(key, locale, params)
  const journees = await getJournees(saison.id)
  const journeeIds = journees.map((j) => j.id)

  const matches = await fetchMatchesByJourneeIds(journeeIds)

  const matchIds = matches?.map((m) => m.id) ?? []

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

  const matchesByJournee = journees.map((journee) => ({
    journee,
    matchCount: matches?.filter((m) => m.journee_id === journee.id).length ?? 0,
  }))

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <Link href="/saisons" className="text-blue-600 hover:text-blue-800 text-sm">
          {t('saisonDetail.backLink')}
        </Link>
        <h1 className="text-3xl font-bold mt-2">{saison.nom}</h1>
        <p className="text-gray-600">
          {saison.date_debut ? formatDate(saison.date_debut, locale) : '?'} —{' '}
          {saison.date_fin ? formatDate(saison.date_fin, locale) : '?'}
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-semibold mb-4">{t('saisonDetail.daysTitle')}</h2>
        {journees.length === 0 ? (
          <p className="text-gray-600">{t('saisonDetail.noDays')}</p>
        ) : (
          <div className="space-y-3">
            {matchesByJournee.map(({ journee, matchCount }) => (
              <Link
                key={journee.id}
                href={`/journees/${journee.id}`}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div>
                  <p className="text-lg font-semibold text-blue-700">
                    {t('common.matchday')} {journee.numero}
                  </p>
                  <p className="text-sm text-gray-500">
                    {matchCount} {t('saisonDetail.matchCountSuffix')}
                  </p>
                </div>
                <span className="text-blue-500 text-sm">{t('saisonDetail.viewMatches')}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {refereeRanking[0] && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700 mb-1">{t('saisonDetail.bestReferee')}</p>
          <p className="text-2xl font-bold text-blue-900">
            {getLocalizedName(locale, {
              defaultValue: refereeRanking[0].nom,
              fr: refereeRanking[0].nom,
              en: refereeRanking[0].nom_en ?? undefined,
              ar: refereeRanking[0].nom_ar ?? undefined,
            })}
          </p>
          <p className="text-sm text-blue-700">
            {t('common.globalNote')}: {refereeRanking[0].moyenne.toFixed(2)} / 5
          </p>
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">{t('saisonDetail.rankingsTitle')}</h2>
        <RankingTable
          entries={refereeRanking}
          criteres={arbitreCriteres}
          locale={locale}
          t={t}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">{t('saisonDetail.generalRankingTitle')}</h2>
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



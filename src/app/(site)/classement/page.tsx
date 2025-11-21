import Link from 'next/link'
import RankingTable from '@/components/RankingTable'
import { buildRanking } from '@/lib/rankings'
import { CritereDefinition, Vote } from '@/types'
import { getServerLocale, translate } from '@/lib/i18nServer'
import { getLocalizedName } from '@/lib/utils'
import {
  fetchArbitres,
  fetchCritereDefinitions,
  fetchJourneesBySaison,
  fetchLatestSaison,
  fetchMatchesByJourneeIds,
  fetchVotesByMatchIds,
} from '@/lib/dataAccess'
import { getActiveLeagueId } from '@/lib/leagueSelection'

async function getLatestSaison(leagueId?: string | null) {
  return fetchLatestSaison(leagueId)
}

export default async function ClassementPage() {
  const locale = await getServerLocale()
  const t = (key: string, params?: Record<string, string | number>) => translate(key, locale, params)
  const leagueId = await getActiveLeagueId()
  const saison = await getLatestSaison(leagueId ?? undefined)

  if (!saison) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t('classement.title')}</h1>
        <p className="text-gray-600">{t('classement.noSeason')}</p>
      </div>
    )
  }

  const journees = await fetchJourneesBySaison(saison.id)
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

  const matchJourneeMap = new Map(
    (matches || []).map((match) => [match.id, match.journee_id])
  )

  const votesByJournee = new Map<string, Vote[]>()
  votes.forEach((vote) => {
    const journeeId = matchJourneeMap.get(vote.match_id)
    if (!journeeId) return
    const group = votesByJournee.get(journeeId) ?? []
    group.push(vote)
    votesByJournee.set(journeeId, group)
  })

  const bestByJournee = journees.map((journee) => {
    const journeeVotes = votesByJournee.get(journee.id) ?? []
    const ranking = buildRanking(journeeVotes, {
      criteres: arbitreCriteres,
      includeCategories: ['arbitre'],
    })
    return { journee, best: ranking[0] ?? null }
  })

  // Données pour les aperçus et stats
  const rankingPreview = {
    referees: refereeRanking.slice(0, 5),
    general: generalRanking.slice(0, 5),
  }

  const arbitres = await fetchArbitres()
  const statsSummary = {
    totalReferees: arbitres.length,
    totalMatches: matchIds.length,
    totalJournees: journees.length,
    totalVotes: votes.length,
    seasonLabel: saison.nom,
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('classement.title')}</h1>
          <p className="text-gray-600">
            {t('classement.seasonLabel')} {saison.nom}
          </p>
        </div>
        <Link
          href={`/saisons/${saison.id}`}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          {t('classement.viewDays')}
        </Link>
      </div>

      {/* Vue d'ensemble (StatsPanel) */}
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-lg">
        <p className="text-xs uppercase tracking-wide text-slate-300 mb-1">
          {t('home.stats.title', { season: statsSummary.seasonLabel })}
        </p>
        <h3 className="text-2xl font-semibold mb-4">{statsSummary.seasonLabel}</h3>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-white/10 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-300">{t('home.stats.referees')}</p>
            <p className="text-2xl font-bold">{statsSummary.totalReferees}</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-300">{t('home.stats.matches')}</p>
            <p className="text-2xl font-bold">{statsSummary.totalMatches}</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-300">{t('home.stats.journees')}</p>
            <p className="text-2xl font-bold">{statsSummary.totalJournees}</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-300">{t('home.stats.votes')}</p>
            <p className="text-2xl font-bold">{statsSummary.totalVotes}</p>
          </div>
        </div>
      </div>

      {/* Aperçu basé sur les dernières notes */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">{t('home.rankings.subtitle')}</p>
              <h3 className="text-xl font-semibold text-gray-900">{t('home.rankings.referees')}</h3>
            </div>
          </div>
          {rankingPreview.referees.length === 0 ? (
            <p className="text-sm text-gray-500">{t('home.rankings.empty')}</p>
          ) : (
            <ul className="space-y-3">
              {rankingPreview.referees.map((entry, index) => (
                <li key={entry.arbitreId} className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {index + 1}.{' '}
                      {getLocalizedName(locale, {
                        defaultValue: entry.nom,
                        fr: entry.nom,
                        en: entry.nom_en ?? undefined,
                        ar: entry.nom_ar ?? undefined,
                      })}
                    </p>
                    <p className="text-xs text-gray-500">{t('home.rankings.votes', { count: entry.votes })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">{entry.moyenne.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{t('common.globalNote')}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">{t('home.rankings.subtitle')}</p>
              <h3 className="text-xl font-semibold text-gray-900">{t('home.rankings.general')}</h3>
            </div>
          </div>
          {rankingPreview.general.length === 0 ? (
            <p className="text-sm text-gray-500">{t('home.rankings.empty')}</p>
          ) : (
            <ul className="space-y-3">
              {rankingPreview.general.map((entry, index) => (
                <li key={entry.arbitreId} className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {index + 1}.{' '}
                      {getLocalizedName(locale, {
                        defaultValue: entry.nom,
                        fr: entry.nom,
                        en: entry.nom_en ?? undefined,
                        ar: entry.nom_ar ?? undefined,
                      })}
                    </p>
                    <p className="text-xs text-gray-500">{t('home.rankings.votes', { count: entry.votes })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">{entry.moyenne.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{t('common.globalNote')}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {refereeRanking.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 mb-1">{t('classement.bestRefereeOverall')}</p>
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
        <div>
          <h2 className="text-2xl font-semibold mb-2">{t('classement.refereeRankingTitle')}</h2>
          <p className="text-sm text-gray-500">{t('classement.refereeRankingDescription')}</p>
        </div>
        <RankingTable
          entries={refereeRanking}
          criteres={arbitreCriteres}
          locale={locale}
          t={t}
        />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2">{t('classement.generalRankingTitle')}</h2>
          <p className="text-sm text-gray-500">{t('classement.generalRankingDescription')}</p>
        </div>
        <RankingTable
          entries={generalRanking}
          criteres={generalCriteres}
          locale={locale}
          t={t}
        />
        {generalRanking[0] && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <p className="text-sm text-emerald-800 mb-1">{t('classement.bestArbitrageOverall')}</p>
            <p className="text-2xl font-bold text-emerald-900">
              {getLocalizedName(locale, {
                defaultValue: generalRanking[0].nom,
                fr: generalRanking[0].nom,
                en: generalRanking[0].nom_en ?? undefined,
                ar: generalRanking[0].nom_ar ?? undefined,
              })}
            </p>
            <p className="text-sm text-emerald-700">
              {t('common.globalNote')}: {generalRanking[0].moyenne.toFixed(2)} / 5
            </p>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">{t('classement.bestByJournee')}</h2>
        {bestByJournee.length === 0 && (
          <p className="text-gray-600 text-sm">{t('journee.noVotes')}</p>
        )}
        {bestByJournee
          .filter((item) => item.best)
          .map(({ journee, best }) => (
            <div
              key={journee.id}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
            >
              <div>
                <p className="text-sm text-gray-500">
                  {t('common.matchday')} {journee.numero}
                </p>
                <p className="text-lg font-semibold">
                  {best
                    ? getLocalizedName(locale, {
                        defaultValue: best.nom,
                        fr: best.nom,
                        en: best.nom_en ?? undefined,
                        ar: best.nom_ar ?? undefined,
                      })
                    : t('journee.noVotes')}
                </p>
              </div>
              {best && (
                <p className="text-blue-600 font-semibold">
                  {best.moyenne.toFixed(2)} / 5
                </p>
              )}
            </div>
          ))}
      </section>
    </div>
  )
}


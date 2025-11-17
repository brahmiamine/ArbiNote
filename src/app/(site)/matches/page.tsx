import MatchCard from '@/components/MatchCard'
import { Match } from '@/types'
import { getServerLocale, translate } from '@/lib/i18nServer'
import { fetchMatches } from '@/lib/dataAccess'
import { getActiveLeagueId } from '@/lib/leagueSelection'

export default async function MatchesPage() {
  const locale = await getServerLocale()
  const t = (key: string, params?: Record<string, string | number>) => translate(key, locale, params)
  const leagueId = await getActiveLeagueId()
  let matches: Match[] = []
  let error: string | null = null

  try {
    matches = (await fetchMatches(20, leagueId ?? undefined)) as Match[]
  } catch (err) {
    error = err instanceof Error ? err.message : t('common.error')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{t('matches.list.title')}</h1>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <p className="text-red-800">
            {t('common.error')}: {error}
          </p>
          <p className="text-sm text-red-600 mt-2">{t('common.errorConfig')}</p>
        </div>
      )}

      {!error && matches.length === 0 && (
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <p className="text-gray-600 mb-2">{t('common.emptyMatchesTitle')}</p>
          <p className="text-sm text-gray-500">{t('common.emptyMatchesDescription')}</p>
        </div>
      )}

      {!error && matches.length > 0 && (
        <div className="space-y-4">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  )
}


import Link from 'next/link'
import { fetchTopMatchesByCriteres } from '@/lib/dataAccess'
import { getLocalizedName } from '@/lib/utils'
import { formatDateOnly } from '@/lib/utils'

interface TopMatchesListProps {
  matchIds: string[]
  category: 'var' | 'assistant'
  locale: string
  t: (key: string, params?: Record<string, string | number>) => string
}

export default async function TopMatchesList({ matchIds, category, locale, t }: TopMatchesListProps) {
  const topMatches = await fetchTopMatchesByCriteres(matchIds, category, 5)

  if (topMatches.length === 0) {
    return (
      <p className="text-sm text-gray-500">{t('classement.noMatchesForCategory')}</p>
    )
  }

  return (
    <ul className="space-y-3">
      {topMatches.map((item, index) => {
        const match = item.match
        const homeTeam = match.equipe_home
        const awayTeam = match.equipe_away
        const journee = match.journee

        const homeName = getLocalizedName(locale, {
          defaultValue: homeTeam.nom,
          fr: homeTeam.nom,
          en: homeTeam.nom_en ?? homeTeam.nom,
          ar: homeTeam.nom_ar ?? homeTeam.nom,
        })
        const awayName = getLocalizedName(locale, {
          defaultValue: awayTeam.nom,
          fr: awayTeam.nom,
          en: awayTeam.nom_en ?? awayTeam.nom,
          ar: awayTeam.nom_ar ?? awayTeam.nom,
        })

        const hasScore =
          match.score_home !== null &&
          match.score_home !== undefined &&
          match.score_away !== null &&
          match.score_away !== undefined

        return (
          <li key={match.id} className="rounded-2xl border border-slate-100 px-4 py-3 hover:border-blue-200 transition">
            <Link href={`/matches/${match.id}`} className="block">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                  {journee && (
                    <span className="text-xs text-gray-500">
                      {t('common.matchday')} {journee.numero}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{item.average.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{t('common.globalNote')}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="font-semibold text-gray-900 truncate flex-1">{homeName}</span>
                <span className="text-gray-600">
                  {hasScore ? `${match.score_home} - ${match.score_away}` : 'VS'}
                </span>
                <span className="font-semibold text-gray-900 truncate flex-1 text-right">{awayName}</span>
              </div>
              {match.date && (
                <p className="text-xs text-gray-500 mt-2">
                  {formatDateOnly(match.date, locale)}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {t('classement.voteCount', { count: item.voteCount })}
              </p>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}


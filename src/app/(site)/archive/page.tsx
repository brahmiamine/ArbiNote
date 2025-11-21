import Link from 'next/link'
import { formatDate, getLocalizedName } from '@/lib/utils'
import { getServerLocale, translate } from '@/lib/i18nServer'
import { fetchJourneesBySaison, fetchLatestSaison, fetchMatchesByJournee } from '@/lib/dataAccess'
import { getActiveLeagueId } from '@/lib/leagueSelection'
import Image from 'next/image'

async function getPreviousJournee(leagueId?: string | null) {
  const latestSaison = await fetchLatestSaison(leagueId ?? undefined)
  if (!latestSaison) return null

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

  if (!previousJournee) return null

  const previousMatches = await fetchMatchesByJournee(previousJournee.id)
  if (!previousMatches || previousMatches.length === 0) return null

  return {
    journee: previousJournee,
    matches: previousMatches,
  }
}

function PreviousMatchCard({
  match,
  locale,
  t,
}: {
  match: any
  locale: string
  t: (key: string) => string
}) {
  const score =
    match.score_home !== null &&
    match.score_home !== undefined &&
    match.score_away !== null &&
    match.score_away !== undefined
      ? `${match.score_home} - ${match.score_away}`
      : '—'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-gray-400 flex items-center justify-between mb-3">
        <span>{match.date ? formatDate(match.date, locale) : t('common.datePending')}</span>
        <span>{(match.journee as any)?.saison?.nom ?? ''}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <TeamDisplay team={match.equipe_home} locale={locale} />
        <p className="text-xl font-semibold text-gray-900">{score}</p>
        <TeamDisplay team={match.equipe_away} align="end" locale={locale} />
      </div>
      <div className="text-xs text-gray-500 mt-3 flex items-center justify-between">
        <span>{t('common.referee')}</span>
        {match.arbitre ? (
          <Link
            href={`/arbitres/${match.arbitre.id}`}
            className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
          >
            {match.arbitre.nom}
          </Link>
        ) : (
          <span className="font-semibold text-gray-700">{t('common.noRefereeAssigned')}</span>
        )}
      </div>
    </div>
  )
}

function TeamDisplay({
  team,
  align = 'start',
  locale,
}: {
  team: any
  align?: 'start' | 'end'
  locale: string
}) {
  const alignmentClasses = align === 'end' ? 'text-right flex-row-reverse' : 'text-left'
  const displayName = getLocalizedName(locale, {
    defaultValue: team.nom,
    fr: team.nom,
    en: team.nom_en ?? team.nom,
    ar: team.nom_ar ?? team.nom,
  })
  return (
    <div className={`flex items-center gap-2 ${alignmentClasses}`}>
      {team.logo_url ? (
        <div className="relative w-10 h-10">
          <Image src={team.logo_url} alt={`Logo ${displayName}`} fill sizes="40px" className="object-contain" />
        </div>
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
          {team.nom
            .split(' ')
            .map((part: string) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()}
        </div>
      )}
      <span className="font-semibold text-gray-900">{displayName}</span>
    </div>
  )
}

export default async function ArchivePage() {
  const locale = await getServerLocale()
  const t = (key: string, params?: Record<string, string | number>) => translate(key, locale, params)
  const leagueId = await getActiveLeagueId()
  const previousSection = await getPreviousJournee(leagueId ?? undefined)

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('nav.archive')}</h1>
        <p className="text-gray-600">{t('home.previous.subtitle')}</p>
      </div>

      {previousSection ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">{t('home.previous.title')}</p>
              <h3 className="text-2xl font-semibold text-gray-900">
                {t('common.matchday')} {previousSection.journee.numero}
              </h3>
              {previousSection.journee.date_journee && (
                <p className="text-sm text-gray-500">{formatDate(previousSection.journee.date_journee, locale)}</p>
              )}
            </div>
            <Link
              href={`/journees/${previousSection.journee.id}`}
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              {t('home.previous.cta')}
            </Link>
          </div>
          {previousSection.matches.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {previousSection.matches.map((match) => (
                <PreviousMatchCard key={match.id} match={match} locale={locale} t={t} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">{t('home.previous.empty')}</p>
          )}
        </section>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">{t('home.previous.empty')}</p>
        </div>
      )}
    </div>
  )
}


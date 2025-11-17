'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatDate, getLocalizedName } from '@/lib/utils'
import { Journee, Match, Saison } from '@/types'
import { useTranslations } from '@/lib/i18n'

interface HomeClientProps {
  saisons: Saison[]
  upcoming?: {
    journee: Journee
    matches: Match[]
  }
}

export default function HomeClient({ saisons, upcoming }: HomeClientProps) {
  const { t, locale } = useTranslations()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('home.title')}</h1>
        <p className="text-xl text-gray-600 mb-8">{t('home.subtitle')}</p>
      </div>

      {upcoming && upcoming.matches.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-gray-500">
                {t('home.upcoming.badge')}
              </p>
              <h3 className="text-2xl font-semibold">
                {t('home.upcoming.title', {
                  numero: upcoming.journee.numero.toString(),
                })}
              </h3>
              <p className="text-gray-500">
                {upcoming.journee.date_journee
                  ? formatDate(upcoming.journee.date_journee, locale)
                  : t('common.datePending')}
              </p>
            </div>
            <Link
              href={`/journees/${upcoming.journee.id}`}
              className="text-blue-600 hover:underline font-medium"
            >
              {t('home.upcoming.cta')}
            </Link>
          </div>
          <div className="space-y-3">
            {upcoming.matches.map((match) => {
              const hasScore =
                match.score_home !== null &&
                match.score_home !== undefined &&
                match.score_away !== null &&
                match.score_away !== undefined

              const kickoff = match.date
                ? formatDate(match.date, locale)
                : upcoming.journee.date_journee
                ? formatDate(upcoming.journee.date_journee, locale)
                : t('common.datePending')

              return (
                <Link
                  key={match.id}
                  href={`/matches/${match.id}`}
                  className="block p-4 card rounded-lg space-y-3 border border-transparent hover:border-blue-200 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <TeamDisplay team={match.equipe_home} locale={locale} />
                        <div className="text-center">
                          <p className="text-xs uppercase text-gray-500">{t('common.date')}</p>
                          <p className="text-sm font-medium text-gray-800">{kickoff}</p>
                        </div>
                        <TeamDisplay team={match.equipe_away} align="end" locale={locale} />
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{t('common.matchday')} {upcoming.journee.numero}</span>
                        <span>{match.date ? t('home.upcoming.notPlayed') : t('common.datePending')}</span>
                      </div>
                    </div>
                    <div className="text-center">
                      {hasScore ? (
                        <p className="text-2xl font-bold text-gray-900">
                          {match.score_home} - {match.score_away}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-600">{t('home.upcoming.notPlayed')}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 flex items-center justify-between">
                    <span>{t('common.referee')}:</span>
                    <span className="font-medium">
                      {match.arbitre?.nom ?? t('common.noRefereeAssigned')}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Link
          href="/saisons"
          className="p-6 card rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-2xl font-bold text-blue-600 mb-2">📆 {t('nav.seasons')}</h2>
          <p className="text-gray-600">{t('home.seasons.description')}</p>
        </Link>
        <Link
          href="/matches"
          className="p-6 card rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-2xl font-bold text-blue-600 mb-2">⚽ {t('nav.matches')}</h2>
          <p className="text-gray-600">{t('home.matches.description')}</p>
        </Link>
        <Link
          href="/classement"
          className="p-6 card rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-2xl font-bold text-blue-600 mb-2">🏆 {t('nav.rankings')}</h2>
          <p className="text-gray-600">{t('home.rankings.description')}</p>
        </Link>
      </div>

      {saisons.length > 0 && (
        <div className="mb-12">
          <h3 className="text-2xl font-semibold mb-4">{t('home.featuredSeasons')}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {saisons.map((saison) => (
              <Link
                key={saison.id}
                href={`/saisons/${saison.id}`}
                className="p-5 card rounded-lg hover:shadow-sm transition-shadow"
              >
                <p className="text-blue-700 font-semibold text-lg">
                  {saison.nom}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {saison.date_debut ? formatDate(saison.date_debut, locale) : '?'} —{' '}
                  {saison.date_fin ? formatDate(saison.date_fin, locale) : '?'}
                </p>
                <p className="text-sm text-gray-500 mt-2">{t('home.viewDays')}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-2">
          {t('home.howItWorks.title')}
        </h3>
        <ul className="space-y-2 text-gray-700 dark:text-gray-200">
          <li>{t('home.howItWorks.step1')}</li>
          <li>{t('home.howItWorks.step2')}</li>
          <li>{t('home.howItWorks.step3')}</li>
        </ul>
      </div>
    </div>
  )
}

function TeamDisplay({
  team,
  align = 'start',
  locale,
}: {
  team: Match['equipe_home']
  align?: 'start' | 'end'
  locale: string
}) {
  const alignmentClasses =
    align === 'end' ? 'text-right flex-row-reverse' : 'text-left'
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
          <Image
            src={team.logo_url}
            alt={`Logo ${displayName}`}
            fill
            sizes="40px"
            className="object-contain"
          />
        </div>
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
          {team.nom
            .split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()}
        </div>
      )}
      <span className="font-semibold text-gray-900">{displayName}</span>
    </div>
  )
}



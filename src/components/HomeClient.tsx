'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatDate, getLocalizedName } from '@/lib/utils'
import { Journee, Match, Saison } from '@/types'
import { RankingEntry } from '@/lib/rankings'
import { useTranslations } from '@/lib/i18n'
import ArbitreLink from './ArbitreLink'

interface HomeClientProps {
  saisons: Saison[]
  upcoming?: {
    journee: Journee
    matches: Match[]
  }
  previous?: {
    journee: Journee
    matches: Match[]
  }
  ranking?: {
    referees: RankingEntry[]
    general: RankingEntry[]
  }
  stats?: {
    totalReferees: number
    totalMatches: number
    totalJournees: number
    totalVotes: number
    seasonLabel?: string
  }
}

export default function HomeClient({ saisons, upcoming, previous, ranking, stats }: HomeClientProps) {
  const { t, locale } = useTranslations()

  const insightCards = [
    {
      id: 'performance',
      title: t('home.insights.cards.performance.title'),
      description: t('home.insights.cards.performance.description'),
      href: '/classement',
    },
    {
      id: 'training',
      title: t('home.insights.cards.training.title'),
      description: t('home.insights.cards.training.description'),
      href: '/admin',
    },
    {
      id: 'community',
      title: t('home.insights.cards.community.title'),
      description: t('home.insights.cards.community.description'),
      href: '/matches',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">
      <header className="text-center space-y-3">
        <p className="text-sm uppercase tracking-wider text-blue-500">ArbiNote</p>
        <h1 className="text-4xl font-bold text-gray-900">{t('home.title')}</h1>
        <p className="text-lg text-gray-600">{t('home.subtitle')}</p>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">{t('home.upcoming.badge')}</p>
              <h2 className="text-2xl font-semibold text-gray-900">
                {upcoming
                  ? t('home.upcoming.title', { numero: upcoming.journee.numero.toString() })
                  : t('home.previous.title')}
              </h2>
              {upcoming?.journee.date_journee && (
                <p className="text-sm text-gray-500">{formatDate(upcoming.journee.date_journee, locale)}</p>
              )}
            </div>
            {upcoming && (
              <Link href={`/journees/${upcoming.journee.id}`} className="text-blue-600 text-sm font-medium hover:underline">
                {t('home.upcoming.cta')}
              </Link>
            )}
          </div>
          {upcoming && upcoming.matches.length > 0 ? (
            <div className="space-y-3">
              {upcoming.matches.slice(0, 4).map((match) => (
                <MatchCard key={match.id} match={match} journeeNumber={upcoming.journee.numero} locale={locale} t={t} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">{t('common.emptyMatchesDescription')}</p>
          )}
        </div>

        <StatsPanel stats={stats} t={t} />
      </section>

      {previous && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">{t('home.previous.title')}</p>
              <h3 className="text-2xl font-semibold text-gray-900">
                {t('common.matchday')} {previous.journee.numero}
              </h3>
              <p className="text-sm text-gray-500">{t('home.previous.subtitle')}</p>
            </div>
            <Link href={`/journees/${previous.journee.id}`} className="text-blue-600 text-sm font-medium hover:underline">
              {t('home.previous.cta')}
            </Link>
          </div>
          {previous.matches.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {previous.matches.slice(0, 4).map((match) => (
                <PreviousMatchCard key={match.id} match={match} locale={locale} t={t} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">{t('home.previous.empty')}</p>
          )}
        </section>
      )}

      {ranking && (
        <section className="grid gap-6 lg:grid-cols-2">
          <RankingBoard
            title={t('home.rankings.referees')}
            subtitle={t('home.rankings.subtitle')}
            entries={ranking.referees}
            locale={locale}
            t={t}
          />
          <RankingBoard
            title={t('home.rankings.general')}
            subtitle={t('home.rankings.subtitle')}
            entries={ranking.general}
            locale={locale}
            t={t}
          />
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <QuickLinkCard href="/saisons" title="📆" label={t('nav.seasons')} description={t('home.seasons.description')} />
        <QuickLinkCard href="/matches" title="⚽" label={t('nav.matches')} description={t('home.matches.description')} />
        <QuickLinkCard href="/classement" title="🏆" label={t('nav.rankings')} description={t('home.rankings.description')} />
      </section>

      {saisons.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">{t('home.featuredSeasons')}</p>
              <h3 className="text-2xl font-semibold text-gray-900">{t('home.viewDays')}</h3>
            </div>
            <Link href="/saisons" className="text-sm font-medium text-blue-600 hover:underline">
              {t('common.viewDays')}
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {saisons.map((saison) => (
              <Link key={saison.id} href={`/saisons/${saison.id}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
                <p className="text-lg font-semibold text-gray-900">{saison.nom}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {saison.date_debut ? formatDate(saison.date_debut, locale) : '?'} — {saison.date_fin ? formatDate(saison.date_fin, locale) : '?'}
                </p>
                <p className="text-sm text-blue-600 mt-3">{t('home.viewDays')}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">{t('home.insights.title')}</p>
          <h3 className="text-2xl font-semibold text-gray-900">{t('home.insights.subtitle')}</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {insightCards.map((card) => (
            <div key={card.id} className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 text-white shadow-lg">
              <h4 className="text-lg font-semibold">{card.title}</h4>
              <p className="text-sm text-slate-200 mt-2">{card.description}</p>
              <Link href={card.href} className="inline-flex items-center gap-1 text-sm font-medium text-blue-200 mt-4 hover:text-white">
                {t('home.insights.read')}
                <span aria-hidden>→</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-blue-100 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950">
        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">{t('home.howItWorks.title')}</h3>
        <ul className="grid gap-3 text-gray-700 dark:text-gray-200 md:grid-cols-3">
          <li className="rounded-2xl bg-white/70 px-4 py-3 text-sm font-medium shadow-sm dark:bg-blue-900/40">
            {t('home.howItWorks.step1')}
          </li>
          <li className="rounded-2xl bg-white/70 px-4 py-3 text-sm font-medium shadow-sm dark:bg-blue-900/40">
            {t('home.howItWorks.step2')}
          </li>
          <li className="rounded-2xl bg-white/70 px-4 py-3 text-sm font-medium shadow-sm dark:bg-blue-900/40">
            {t('home.howItWorks.step3')}
          </li>
        </ul>
      </section>
    </div>
  )
}

function MatchCard({
  match,
  journeeNumber,
  locale,
  t,
}: {
  match: Match
  journeeNumber: number
  locale: string
  t: (key: string, params?: Record<string, string | number>) => string
}) {
  const kickoff = match.date ? formatDate(match.date, locale) : t('common.datePending')
  const hasScore =
    match.score_home !== null &&
    match.score_home !== undefined &&
    match.score_away !== null &&
    match.score_away !== undefined

  return (
    <Link
      href={`/matches/${match.id}`}
      className="block rounded-2xl border border-slate-200 p-4 hover:border-blue-200 hover:shadow-md transition"
    >
      <div className="flex items-center justify-between text-xs uppercase text-gray-400 mb-2">
        <span>
          {t('common.matchday')} {journeeNumber}
        </span>
        <span>{kickoff}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <TeamDisplay team={match.equipe_home} locale={locale} />
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">
            {hasScore ? `${match.score_home} - ${match.score_away}` : t('home.upcoming.notPlayed')}
          </p>
          <p className="text-xs text-gray-500">{match.date ? t('home.upcoming.notPlayed') : t('common.datePending')}</p>
        </div>
        <TeamDisplay team={match.equipe_away} align="end" locale={locale} />
      </div>
      <div className="text-xs text-gray-500 mt-3 flex items-center justify-between">
        <span>{t('common.referee')}</span>
        {match.arbitre ? (
          <ArbitreLink
            arbitreId={match.arbitre.id}
            photoUrl={null}
            name={match.arbitre.nom}
            category={null}
            showPhoto={false}
          />
        ) : (
          <span className="font-medium text-gray-700">{t('common.noRefereeAssigned')}</span>
        )}
      </div>
    </Link>
  )
}

function PreviousMatchCard({
  match,
  locale,
  t,
}: {
  match: Match
  locale: string
  t: (key: string) => string
}) {
  const score =
    match.score_home !== null && match.score_home !== undefined && match.score_away !== null && match.score_away !== undefined
      ? `${match.score_home} - ${match.score_away}`
      : '—'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-gray-400 flex items-center justify-between mb-3">
        <span>{match.date ? formatDate(match.date, locale) : t('common.datePending')}</span>
        <span>{match.journee?.saison?.nom ?? ''}</span>
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

function StatsPanel({
  stats,
  t,
}: {
  stats?: {
    totalReferees: number
    totalMatches: number
    totalJournees: number
    totalVotes: number
    seasonLabel?: string
  }
  t: (key: string, params?: Record<string, string | number>) => string
}) {
  const items = [
    { label: t('home.stats.referees'), value: stats?.totalReferees ?? 0 },
    { label: t('home.stats.matches'), value: stats?.totalMatches ?? 0 },
    { label: t('home.stats.journees'), value: stats?.totalJournees ?? 0 },
    { label: t('home.stats.votes'), value: stats?.totalVotes ?? 0 },
  ]

  return (
    <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-lg">
      <p className="text-xs uppercase tracking-wide text-slate-300 mb-1">
        {t('home.stats.title', { season: stats?.seasonLabel ?? '' })}
      </p>
      <h3 className="text-2xl font-semibold mb-4">{stats?.seasonLabel ?? '—'}</h3>
      <div className="grid gap-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl bg-white/10 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-300">{item.label}</p>
            <p className="text-2xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function RankingBoard({
  title,
  subtitle,
  entries,
  locale,
  t,
}: {
  title: string
  subtitle: string
  entries: RankingEntry[]
  locale: string
  t: (key: string, params?: Record<string, string | number>) => string
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">{subtitle}</p>
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          </div>
      </div>
      {entries.length === 0 ? (
        <p className="text-sm text-gray-500">{t('home.rankings.empty')}</p>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry, index) => (
            <li
              key={entry.arbitreId}
              className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3"
            >
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
  )
}

function QuickLinkCard({
  href,
  title,
  label,
  description,
}: {
  href: string
  title: string
  label: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col gap-2"
    >
      <span className="text-2xl" aria-hidden>
        {title}
      </span>
      <p className="text-lg font-semibold text-gray-900">{label}</p>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
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



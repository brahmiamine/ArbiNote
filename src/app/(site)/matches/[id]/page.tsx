import { notFound } from 'next/navigation'
import VoteForm from '@/components/VoteForm'
import AlreadyVotedSection from '@/components/AlreadyVotedSection'
import { formatDate, getLocalizedName, canVoteMatch } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { getServerLocale, translate } from '@/lib/i18nServer'
import { CritereDefinition } from '@/types'
import { fetchCritereDefinitions, fetchMatchById } from '@/lib/dataAccess'
import ArbitreLink from '@/components/ArbitreLink'

async function getMatch(id: string) {
  return fetchMatchById(id)
}

async function getCriteresDefinitions(): Promise<CritereDefinition[]> {
  const data = await fetchCritereDefinitions()
  return data as unknown as CritereDefinition[]
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const match = await getMatch(id)
  const criteresDefinitions = await getCriteresDefinitions()

  if (!match) {
    notFound()
  }

  const locale = await getServerLocale()
  const t = (key: string, params?: Record<string, string | number>) => translate(key, locale, params)
  const arbitre = match.arbitre || null
  const journeeLabel = match.journee?.numero
  const saisonLabel = match.journee?.saison?.nom
  const homeName = getLocalizedName(locale, {
    defaultValue: match.equipe_home.nom,
    fr: match.equipe_home.nom,
    en: match.equipe_home.nom_en ?? undefined,
    ar: match.equipe_home.nom_ar ?? undefined,
  })
  const awayName = getLocalizedName(locale, {
    defaultValue: match.equipe_away.nom,
    fr: match.equipe_away.nom,
    en: match.equipe_away.nom_en ?? undefined,
    ar: match.equipe_away.nom_ar ?? undefined,
  })
  const homeCity =
    match.equipe_home.city || match.equipe_home.city_en || match.equipe_home.city_ar
      ? getLocalizedName(locale, {
          defaultValue: match.equipe_home.city ?? match.equipe_home.city_en ?? match.equipe_home.city_ar ?? '',
          fr: match.equipe_home.city ?? undefined,
          en: match.equipe_home.city_en ?? undefined,
          ar: match.equipe_home.city_ar ?? undefined,
        })
      : null
  const awayCity =
    match.equipe_away.city || match.equipe_away.city_en || match.equipe_away.city_ar
      ? getLocalizedName(locale, {
          defaultValue: match.equipe_away.city ?? match.equipe_away.city_en ?? match.equipe_away.city_ar ?? '',
          fr: match.equipe_away.city ?? undefined,
          en: match.equipe_away.city_en ?? undefined,
          ar: match.equipe_away.city_ar ?? undefined,
        })
      : null
  const refereeName =
    arbitre && typeof arbitre === 'object'
      ? getLocalizedName(locale, {
          defaultValue: arbitre.nom,
          fr: arbitre.nom,
          en: arbitre.nom_en ?? undefined,
          ar: arbitre.nom_ar ?? undefined,
        })
      : null
  const refereeCategory =
    arbitre &&
    typeof arbitre === 'object' &&
    ((arbitre as any).categorie || (arbitre as any).categorie_ar)
      ? getLocalizedName(locale, {
          defaultValue: (arbitre as any).categorie ?? (arbitre as any).categorie_ar ?? '',
          fr: (arbitre as any).categorie ?? undefined,
          ar: (arbitre as any).categorie_ar ?? undefined,
        })
      : null

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/matches"
        className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
      >
        {t('common.backToMatches')}
      </Link>

      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden mb-6">
        <div className="p-6">
          {/* Header avec date et journée */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{match.date ? formatDate(match.date, locale) : t('common.datePending')}</span>
              </div>
              {journeeLabel && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>{t('matchCard.matchday')} {journeeLabel}</span>
                </div>
              )}
              {saisonLabel && (
                <div className="text-sm text-gray-600">
                  {saisonLabel}
                </div>
              )}
            </div>
          </div>

          {/* Équipes et score */}
          <div className="flex items-center justify-between mb-6">
            {/* Équipe domicile */}
            <div className="flex-1 flex items-center gap-4">
              {match.equipe_home.logo_url ? (
                <div className="relative w-16 h-16 flex-shrink-0">
                  <Image
                    src={match.equipe_home.logo_url}
                    alt={`Logo ${homeName}`}
                    fill
                    sizes="64px"
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-400 font-bold text-lg">
                    {(match.equipe_home.abbr || homeName).charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <div className="font-bold text-xl text-gray-900">{homeName}</div>
                {homeCity && <div className="text-xs text-gray-500 mt-1">{homeCity}</div>}
              </div>
            </div>

            {/* Score */}
            <div className="mx-6 flex-shrink-0">
              {typeof match.score_home === 'number' && typeof match.score_away === 'number' ? (
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {match.score_home} - {match.score_away}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">{t('matchCard.score')}</div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-400 mb-1">VS</div>
                  <div className="text-xs text-gray-400">{t('common.datePending')}</div>
                </div>
              )}
            </div>

            {/* Équipe extérieure */}
            <div className="flex-1 flex items-center gap-4 justify-end text-right">
              <div className="flex-1">
                <div className="font-bold text-xl text-gray-900">{awayName}</div>
                {awayCity && <div className="text-xs text-gray-500 mt-1">{awayCity}</div>}
              </div>
              {match.equipe_away.logo_url ? (
                <div className="relative w-16 h-16 flex-shrink-0">
                  <Image
                    src={match.equipe_away.logo_url}
                    alt={`Logo ${awayName}`}
                    fill
                    sizes="64px"
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-400 font-bold text-lg">
                    {(match.equipe_away.abbr || awayName).charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer avec stade et arbitre */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
            <div className="flex-1 flex items-center gap-4 text-sm text-gray-600">
              {match.equipe_home.stadium && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="truncate">{match.equipe_home.stadium}</span>
                </div>
              )}
            </div>
            {arbitre && typeof arbitre === 'object' && refereeName && (
              <ArbitreLink
                arbitreId={arbitre.id}
                photoUrl={arbitre.photo_url || null}
                name={refereeName}
                category={refereeCategory || null}
              />
            )}
          </div>
        </div>
      </div>

      {arbitre && typeof arbitre === 'object' && canVoteMatch(match as any) && (
        <>
          <VoteForm
            matchId={match.id}
            arbitreId={arbitre.id}
            arbitreNom={refereeName ?? arbitre.nom}
            criteresDefs={criteresDefinitions}
            matchDate={match.date ? (typeof match.date === 'string' ? match.date : match.date.toISOString()) : null}
          />
          <AlreadyVotedSection
            matchId={match.id}
            arbitreId={arbitre.id}
            arbitreNom={refereeName ?? arbitre.nom}
            arbitrePhotoUrl={arbitre.photo_url || null}
            arbitreCategory={refereeCategory || null}
            criteresDefs={criteresDefinitions}
          />
        </>
      )}

      {(!arbitre || typeof arbitre !== 'object') && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">
            {t('matchDetail.noReferee')}
          </p>
        </div>
      )}

      {arbitre && typeof arbitre === 'object' && !canVoteMatch(match as any) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">
            {t('matchDetail.cannotVote')}
          </p>
        </div>
      )}
    </div>
  )
}


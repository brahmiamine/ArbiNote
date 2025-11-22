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
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 overflow-x-hidden">
      <Link
        href="/matches"
        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-3 sm:mb-4 inline-block text-xs sm:text-sm"
      >
        {t('common.backToMatches')}
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden mb-4 sm:mb-6 w-full">
        <div className="p-2 sm:p-4 md:p-6 w-full max-w-full overflow-x-hidden">
          {/* Header avec date et journée */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 pb-2 sm:pb-4 border-b border-gray-100 dark:border-gray-700 gap-1.5 sm:gap-2 w-full">
            <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap min-w-0 w-full">
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 shrink-0">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="break-words">{match.date ? formatDate(match.date, locale) : t('common.datePending')}</span>
              </div>
              {journeeLabel && (
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 shrink-0">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="break-words">{t('matchCard.matchday')} {journeeLabel}</span>
                </div>
              )}
              {saisonLabel && (
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words shrink-0">
                  {saisonLabel}
                </div>
              )}
            </div>
          </div>

          {/* Équipes et score */}
          <div className="mb-3 sm:mb-6 w-full">
            {/* Layout mobile: vertical, desktop: horizontal */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 w-full">
              {/* Équipe domicile */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 w-full sm:w-auto sm:flex-1">
                {match.equipe_home.logo_url ? (
                  <div className="relative w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 shrink-0">
                    <Image
                      src={match.equipe_home.logo_url}
                      alt={`Logo ${homeName}`}
                      fill
                      sizes="(max-width: 640px) 40px, (max-width: 768px) 56px, 64px"
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 shrink-0 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-gray-400 dark:text-gray-400 font-bold text-xs sm:text-base md:text-lg">
                      {(match.equipe_home.abbr || homeName).charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="font-bold text-sm sm:text-lg md:text-xl text-gray-900 dark:text-white break-words">{homeName}</div>
                  {homeCity && <div className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 break-words">{homeCity}</div>}
                </div>
              </div>

              {/* Score - Centré sur mobile, entre les équipes sur desktop */}
              <div className="mx-auto sm:mx-4 shrink-0 self-center">
                {typeof match.score_home === 'number' && typeof match.score_away === 'number' ? (
                  <div className="text-center">
                    <div className="text-xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-0.5 sm:mb-1">
                      {match.score_home} - {match.score_away}
                    </div>
                    <div className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('matchCard.score')}</div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-400 dark:text-gray-500 mb-0.5 sm:mb-1">VS</div>
                    <div className="text-[10px] sm:text-sm text-gray-400 dark:text-gray-500">{t('common.datePending')}</div>
                  </div>
                )}
              </div>

              {/* Équipe extérieure */}
              <div className="flex items-center gap-2 sm:gap-3 justify-start sm:justify-end text-left sm:text-right min-w-0 w-full sm:w-auto sm:flex-1 sm:flex-row-reverse">
                <div className="flex-1 min-w-0 overflow-hidden text-left sm:text-right">
                  <div className="font-bold text-sm sm:text-lg md:text-xl text-gray-900 dark:text-white break-words">{awayName}</div>
                  {awayCity && <div className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 break-words">{awayCity}</div>}
                </div>
                {match.equipe_away.logo_url ? (
                  <div className="relative w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 shrink-0">
                    <Image
                      src={match.equipe_away.logo_url}
                      alt={`Logo ${awayName}`}
                      fill
                      sizes="(max-width: 640px) 40px, (max-width: 768px) 56px, 64px"
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 shrink-0 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-gray-400 dark:text-gray-400 font-bold text-xs sm:text-base md:text-lg">
                      {(match.equipe_away.abbr || awayName).charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer avec stade et arbitre */}
          <div className="pt-2 sm:pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 w-full">
            <div className="flex-1 flex items-center gap-1.5 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 min-w-0 w-full sm:w-auto">
              {match.equipe_home.stadium && (
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="truncate break-words">{match.equipe_home.stadium}</span>
                </div>
              )}
            </div>
            {arbitre && typeof arbitre === 'object' && refereeName && (
              <div className="shrink-0 w-full sm:w-auto">
                <ArbitreLink
                  arbitreId={arbitre.id}
                  photoUrl={arbitre.photo_url || null}
                  name={refereeName}
                  category={refereeCategory || null}
                />
              </div>
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
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm sm:text-base break-words">
            {t('matchDetail.noReferee')}
          </p>
        </div>
      )}

      {arbitre && typeof arbitre === 'object' && !canVoteMatch(match as any) && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm sm:text-base break-words">
            {t('matchDetail.cannotVote')}
          </p>
        </div>
      )}
    </div>
  )
}


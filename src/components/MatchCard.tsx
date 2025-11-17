import Link from 'next/link'
import Image from 'next/image'
import { formatDateShort, getLocalizedName } from '@/lib/utils'
import { Match } from '@/types'
import { getServerLocale, translate } from '@/lib/i18nServer'

interface MatchCardProps {
  match: Match
}

export default async function MatchCard({ match }: MatchCardProps) {
  const locale = await getServerLocale()
  const t = (key: string, params?: Record<string, string | number>) => translate(key, locale, params)
  const dateLabel = match.date ? formatDateShort(match.date, locale) : t('common.datePending')
  const journeeLabel = match.journee?.numero
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
  const homeLabel = match.equipe_home.abbr || homeName
  const awayLabel = match.equipe_away.abbr || awayName
  const homeCity =
    match.equipe_home.city ||
    match.equipe_home.city_ar ||
    match.equipe_home.city_en
      ? getLocalizedName(locale, {
          defaultValue: match.equipe_home.city ?? match.equipe_home.city_en ?? match.equipe_home.city_ar ?? '',
          fr: match.equipe_home.city ?? undefined,
          en: match.equipe_home.city_en ?? undefined,
          ar: match.equipe_home.city_ar ?? undefined,
        })
      : null
  const awayCity =
    match.equipe_away.city ||
    match.equipe_away.city_ar ||
    match.equipe_away.city_en
      ? getLocalizedName(locale, {
          defaultValue: match.equipe_away.city ?? match.equipe_away.city_en ?? match.equipe_away.city_ar ?? '',
          fr: match.equipe_away.city ?? undefined,
          en: match.equipe_away.city_en ?? undefined,
          ar: match.equipe_away.city_ar ?? undefined,
        })
      : null
  const refereeName = match.arbitre
    ? getLocalizedName(locale, {
        defaultValue: match.arbitre.nom,
        fr: match.arbitre.nom,
        en: match.arbitre.nom_en ?? undefined,
        ar: match.arbitre.nom_ar ?? undefined,
      })
    : null
  const refereeCategory =
    match.arbitre && (match.arbitre.categorie || match.arbitre.categorie_ar)
      ? getLocalizedName(locale, {
          defaultValue: match.arbitre.categorie ?? match.arbitre.categorie_ar ?? '',
          fr: match.arbitre.categorie ?? undefined,
          ar: match.arbitre.categorie_ar ?? undefined,
        })
      : null

  return (
    <Link
      href={`/matches/${match.id}`}
      className="block p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-4 mb-1">
            <div className="flex items-center gap-2">
              {match.equipe_home.logo_url && (
                <Image
                  src={match.equipe_home.logo_url}
                  alt={`Logo ${homeName}`}
                  width={36}
                  height={36}
                  className="object-contain"
                />
              )}
              <div>
                <span className="font-bold text-lg">{homeLabel}</span>
                {homeCity && <span className="block text-xs text-gray-500">{homeCity}</span>}
              </div>
            </div>
            <span className="text-gray-500">vs</span>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <span className="font-bold text-lg">{awayLabel}</span>
                {awayCity && <span className="block text-xs text-gray-500">{awayCity}</span>}
              </div>
              {match.equipe_away.logo_url && (
                <Image
                  src={match.equipe_away.logo_url}
                  alt={`Logo ${awayName}`}
                  width={36}
                  height={36}
                  className="object-contain"
                />
              )}
            </div>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <div>
              📅 {t('matchCard.date')}: {dateLabel}
            </div>
            {typeof match.score_home === 'number' &&
              typeof match.score_away === 'number' && (
                <div>
                  🔢 {t('matchCard.score')}: {match.score_home} - {match.score_away}
                </div>
              )}
            {match.equipe_home.stadium && (
              <div>
                🏟️ {t('matchCard.stadium')}: {match.equipe_home.stadium}
              </div>
            )}
            {journeeLabel && (
              <div>
                {t('matchCard.matchday')} {journeeLabel}
              </div>
            )}
            {match.arbitre && refereeName && (
              <div className="flex items-center gap-2">
                {match.arbitre.photo_url && (
                  <span className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                    <Image
                      src={match.arbitre.photo_url}
                      alt={`Photo ${refereeName}`}
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  </span>
                )}
                <div className="flex flex-col text-sm">
                  <span>👤 {t('matchCard.referee')}: {refereeName}</span>
                  {refereeCategory && (
                    <span className="text-xs text-gray-500">{refereeCategory}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="text-blue-600 ml-4">
          →
        </div>
      </div>
    </Link>
  )
}


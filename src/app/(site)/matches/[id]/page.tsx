import { notFound } from 'next/navigation'
import VoteForm from '@/components/VoteForm'
import { formatDate, getLocalizedName } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { getServerLocale, translate } from '@/lib/i18nServer'
import { CritereDefinition } from '@/types'
import { fetchCritereDefinitions, fetchMatchById } from '@/lib/dataAccess'

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
  const t = (key: string) => translate(key, locale)
  const arbitre = match.arbitre || null
  const journeeLabel = match.journee?.numero
  const saisonLabel = match.journee?.saison?.nom
  const refereeName =
    arbitre && typeof arbitre === 'object'
      ? getLocalizedName(locale, {
          defaultValue: arbitre.nom,
          fr: arbitre.nom,
          ar: arbitre.nom_ar ?? undefined,
        })
      : null
  const refereeCategory =
    arbitre &&
    typeof arbitre === 'object' &&
    (arbitre.categorie || arbitre.categorie_ar)
      ? getLocalizedName(locale, {
          defaultValue: arbitre.categorie ?? arbitre.categorie_ar ?? '',
          fr: arbitre.categorie ?? undefined,
          ar: arbitre.categorie_ar ?? undefined,
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

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-3 flex-1">
            {match.equipe_home.logo_url && (
              <Image
                src={match.equipe_home.logo_url}
                alt={`Logo ${match.equipe_home.nom}`}
                width={64}
                height={64}
                className="object-contain"
              />
            )}
            <div>
              <p className="text-sm text-gray-500">{t('common.homeTeam')}</p>
              <p className="text-2xl font-bold">
                {(match.equipe_home.abbr || match.equipe_home.nom).toUpperCase()}
              </p>
              <p className="text-sm text-gray-600">
                {match.equipe_home.nom}
                {match.equipe_home.city && ` (${match.equipe_home.city})`}
              </p>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-500">VS</div>
          <div className="flex items-center gap-3 flex-1 justify-end text-right">
            <div>
              <p className="text-sm text-gray-500">{t('common.awayTeam')}</p>
              <p className="text-2xl font-bold">
                {(match.equipe_away.abbr || match.equipe_away.nom).toUpperCase()}
              </p>
              <p className="text-sm text-gray-600">
                {match.equipe_away.nom}
                {match.equipe_away.city && ` (${match.equipe_away.city})`}
              </p>
            </div>
            {match.equipe_away.logo_url && (
              <Image
                src={match.equipe_away.logo_url}
                alt={`Logo ${match.equipe_away.nom}`}
                width={64}
                height={64}
                className="object-contain"
              />
            )}
          </div>
        </div>

        <div className="space-y-2 text-gray-600 mb-6">
          <div>
            <span className="font-medium">{t('common.date')}:</span>{' '}
            {match.date ? formatDate(match.date, locale) : t('common.datePending')}
          </div>
          {typeof match.score_home === 'number' &&
            typeof match.score_away === 'number' && (
              <div>
                <span className="font-medium">{t('common.score')}:</span>{' '}
                {match.score_home} - {match.score_away}
              </div>
            )}
          {journeeLabel && (
            <div>
              <span className="font-medium">{t('common.matchday')}:</span> {journeeLabel}
            </div>
          )}
          {match.equipe_home.stadium && (
            <div>
              <span className="font-medium">{t('common.stadium')}:</span> {match.equipe_home.stadium}
            </div>
          )}
          {saisonLabel && (
            <div>
              <span className="font-medium">{t('common.season')}:</span> {saisonLabel}
            </div>
          )}
          {arbitre && (
            <div>
              <span className="font-medium">{t('common.referee')}:</span>{' '}
              {typeof arbitre === 'object'
                ? refereeName ?? arbitre.nom
                : t('common.refereeAssigned')}
              {typeof arbitre === 'object' && refereeCategory && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {refereeCategory}
                </span>
              )}
              {typeof arbitre === 'object' && arbitre.photo_url && (
                <span className="ml-4 inline-block relative w-12 h-12 rounded-full overflow-hidden border border-gray-200 align-middle">
                  <Image
                    src={arbitre.photo_url}
                    alt={`Photo ${refereeName ?? arbitre.nom}`}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {arbitre && typeof arbitre === 'object' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">{t('matchDetail.voteTitle')}</h2>
          <VoteForm
            matchId={match.id}
            arbitreId={arbitre.id}
            arbitreNom={refereeName ?? arbitre.nom}
            criteresDefs={criteresDefinitions}
          />
        </div>
      )}

      {(!arbitre || typeof arbitre !== 'object') && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">
            {t('matchDetail.noReferee')}
          </p>
        </div>
      )}
    </div>
  )
}


import { notFound } from 'next/navigation'
import StarsRating from '@/components/StarsRating'
import { formatDate, formatNote, getLocalizedName } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { Vote, Criteres, Match } from '@/types'
import { getServerLocale, translate } from '@/lib/i18nServer'
import { fetchArbitreById, fetchVotesByArbitre, fetchMatchesByArbitre } from '@/lib/dataAccess'

async function getArbitreStats(id: string) {
  // Récupérer l'arbitre
  const arbitre = await fetchArbitreById(id)

  if (!arbitre) {
    return null
  }

  // Calculer les statistiques des votes
  const votes = (await fetchVotesByArbitre(id)) as Vote[]

  const nombreVotes = votes?.length || 0
  const moyenneNote =
    nombreVotes > 0
      ? votes.reduce((sum, v) => sum + Number(v.note_globale), 0) / nombreVotes
      : 0

  // Statistiques par critère
  const statsCriteres = {
    fairplay: 0,
    decisions: 0,
    gestion: 0,
    communication: 0,
  }

  if (votes && votes.length > 0) {
    votes.forEach((vote) => {
      const criteres = vote.criteres as Criteres
      if (criteres) {
        statsCriteres.fairplay += criteres.fairplay || 0
        statsCriteres.decisions += criteres.decisions || 0
        statsCriteres.gestion += criteres.gestion || 0
        statsCriteres.communication += criteres.communication || 0
      }
    })

    Object.keys(statsCriteres).forEach((key) => {
      statsCriteres[key as keyof typeof statsCriteres] /= nombreVotes
    })
  }

  // Récupérer les matchs de l'arbitre
  const matches = await fetchMatchesByArbitre(id)

  return {
    arbitre,
    stats: {
      nombre_votes: nombreVotes,
      moyenne_note: Math.round(moyenneNote * 100) / 100,
      moyenne_criteres: statsCriteres,
    },
    votes: votes || [],
    matches: matches || [],
  }
}

export default async function ArbitrePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getArbitreStats(id)

  if (!data) {
    notFound()
  }

  const locale = await getServerLocale()
  const t = (key: string, params?: Record<string, string | number>) => translate(key, locale, params)
  const { arbitre, stats, votes, matches } = data
  const displayName = getLocalizedName(locale, {
    defaultValue: arbitre.nom,
    fr: arbitre.nom,
    en: arbitre.nom_en ?? undefined,
    ar: arbitre.nom_ar ?? undefined,
  })
  const displayCategory =
    arbitre.categorie || arbitre.categorie_ar
      ? getLocalizedName(locale, {
          defaultValue: arbitre.categorie ?? arbitre.categorie_ar ?? '',
          fr: arbitre.categorie ?? undefined,
          ar: arbitre.categorie_ar ?? undefined,
        })
      : null
  const displayNationality =
    arbitre.nationalite || arbitre.nationalite_ar
      ? getLocalizedName(locale, {
          defaultValue: arbitre.nationalite ?? arbitre.nationalite_ar ?? '',
          fr: arbitre.nationalite ?? undefined,
          ar: arbitre.nationalite_ar ?? undefined,
        })
      : null

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/classement"
        className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
      >
        {t('arbitre.back')}
      </Link>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6 mb-6">
          <div className="flex-shrink-0">
            {arbitre.photo_url ? (
              <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg">
                <Image
                  src={arbitre.photo_url}
                  alt={`Photo ${displayName}`}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-40 h-40 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-4xl font-semibold border-4 border-blue-200 shadow-lg">
                {displayName
                  .split(' ')
                  .map((part: string) => part[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-4">{displayName}</h1>
            <div className="space-y-3 text-gray-600">
              {displayCategory && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">{t('arbitre.category')}:</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm font-medium">
                    {displayCategory}
                  </span>
                </div>
              )}
              {displayNationality && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">{t('arbitre.nationality')}:</span>
                  <span className="text-gray-700">🇹🇳 {displayNationality}</span>
                </div>
              )}
              {arbitre.date_naissance && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">{t('arbitre.birthDate')}:</span>
                  <span className="text-gray-700">
                    {new Date(arbitre.date_naissance).toLocaleDateString(locale, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-600 mb-1">{t('arbitre.averageNote')}</div>
            <div className="text-4xl font-bold text-blue-900">
              {stats.moyenne_note > 0 ? formatNote(stats.moyenne_note) : 'N/A'}
              {stats.moyenne_note > 0 && <span className="text-2xl">/5</span>}
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-600 mb-1">{t('arbitre.voteCount')}</div>
            <div className="text-4xl font-bold text-green-900">
              {stats.nombre_votes}
            </div>
          </div>
        </div>
      </div>

      {stats.moyenne_note > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">{t('arbitre.criteriaTitle')}</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{t('arbitre.criteria.fairplay')}</span>
                <span className="text-lg font-bold">
                  {formatNote(stats.moyenne_criteres.fairplay)}/5
                </span>
              </div>
              <StarsRating
                value={stats.moyenne_criteres.fairplay}
                readOnly
                size="md"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{t('arbitre.criteria.decisions')}</span>
                <span className="text-lg font-bold">
                  {formatNote(stats.moyenne_criteres.decisions)}/5
                </span>
              </div>
              <StarsRating
                value={stats.moyenne_criteres.decisions}
                readOnly
                size="md"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{t('arbitre.criteria.gestion')}</span>
                <span className="text-lg font-bold">
                  {formatNote(stats.moyenne_criteres.gestion)}/5
                </span>
              </div>
              <StarsRating
                value={stats.moyenne_criteres.gestion}
                readOnly
                size="md"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{t('arbitre.criteria.communication')}</span>
                <span className="text-lg font-bold">
                  {formatNote(stats.moyenne_criteres.communication)}/5
                </span>
              </div>
              <StarsRating
                value={stats.moyenne_criteres.communication}
                readOnly
                size="md"
              />
            </div>
          </div>
        </div>
      )}

      {matches.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">{t('arbitre.matchesTitle')}</h2>
          <div className="space-y-3">
            {matches.map((match: Match) => {
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
              return (
                <Link
                  key={match.id}
                  href={`/matches/${match.id}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold">{homeName}</span>
                        <span className="text-gray-400">vs</span>
                        <span className="font-semibold">{awayName}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {match.date && (
                          <span>{formatDate(match.date, locale)}</span>
                        )}
                        {match.journee && (
                          <span>
                            {t('common.matchday')} {match.journee.numero}
                          </span>
                        )}
                        {match.score_home !== null && match.score_away !== null && (
                          <span className="font-semibold text-gray-900">
                            {match.score_home} - {match.score_away}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-blue-600 ml-4">→</div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {votes.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">{t('arbitre.latestVotes')}</h2>
          <div className="space-y-3">
            {votes.slice(0, 10).map((vote: Vote) => {
              const criteres = vote.criteres as Criteres
              return (
                <div
                  key={vote.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">
                      {vote.created_at ? formatDate(vote.created_at, locale) : t('arbitre.unknownDate')}
                    </span>
                    <span className="font-bold text-blue-600">
                      {formatNote(vote.note_globale)}/5
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {criteres && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          {t('arbitre.criteria.fairplay')}: {criteres.fairplay}/5
                        </div>
                        <div>
                          {t('arbitre.criteria.decisions')}: {criteres.decisions}/5
                        </div>
                        <div>
                          {t('arbitre.criteria.gestion')}: {criteres.gestion}/5
                        </div>
                        <div>
                          {t('arbitre.criteria.communication')}:{' '}
                          {criteres.communication}/5
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}


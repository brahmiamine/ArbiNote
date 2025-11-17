import { notFound } from 'next/navigation'
import StarsRating from '@/components/StarsRating'
import { formatDate, formatNote, getLocalizedName } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { Vote, Criteres } from '@/types'
import { getServerLocale, translate } from '@/lib/i18nServer'
import { fetchArbitreById, fetchVotesByArbitre } from '@/lib/dataAccess'

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

  return {
    arbitre,
    stats: {
      nombre_votes: nombreVotes,
      moyenne_note: Math.round(moyenneNote * 100) / 100,
      moyenne_criteres: statsCriteres,
    },
    votes: votes || [],
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
  const { arbitre, stats, votes } = data
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
          <div className="flex items-center gap-4">
            {arbitre.photo_url ? (
              <div className="relative w-28 h-28 rounded-full overflow-hidden border border-gray-200">
                <Image
                  src={arbitre.photo_url}
                  alt={`Photo ${displayName}`}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-28 h-28 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-semibold border border-blue-200">
                {displayName
                  .split(' ')
                  .map((part: string) => part[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
              <div className="space-y-2 text-gray-600">
                {displayCategory && (
                  <div>
                    <span className="font-medium">{t('arbitre.category')}:</span>{' '}
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {displayCategory}
                    </span>
                  </div>
                )}
                {displayNationality && (
                  <div>
                    <span className="font-medium">{t('arbitre.nationality')}:</span>{' '}
                    🇹🇳 {displayNationality}
                  </div>
                )}
              </div>
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


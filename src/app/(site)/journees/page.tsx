import JourneesClient from '@/components/JourneesClient'
import { fetchJourneesBySaison, fetchLatestSaison, fetchMatchesByJournee, fetchNextJourneeMatches } from '@/lib/dataAccess'
import { getActiveLeagueId } from '@/lib/leagueSelection'
import { formatDateOnly } from '@/lib/utils'
import { getServerLocale, translate } from '@/lib/i18nServer'

export default async function JourneesPage() {
  const locale = await getServerLocale()
  const t = (key: string, params?: Record<string, string | number>) => translate(key, locale, params)
  const leagueId = await getActiveLeagueId()
  
  // Récupérer la saison actuelle
  const latestSaison = await fetchLatestSaison(leagueId ?? undefined)
  
  if (!latestSaison) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">{t('journees.title')}</h1>
        <p className="text-gray-600">{t('journees.noSeason')}</p>
      </div>
    )
  }

  // Récupérer toutes les journées de la saison
  const journees = await fetchJourneesBySaison(latestSaison.id)
  
  // Récupérer la prochaine journée par défaut
  const nextJourneeData = await fetchNextJourneeMatches(new Date(), leagueId ?? undefined)
  
  // Préparer les données des journées avec leurs matchs
  const journeesWithMatches = await Promise.all(
    journees.map(async (journee) => {
      const matches = await fetchMatchesByJournee(journee.id)
      const date_journee_str = journee.date_journee 
        ? (typeof journee.date_journee === 'string' 
            ? journee.date_journee 
            : journee.date_journee instanceof Date 
              ? journee.date_journee.toISOString().split('T')[0]
              : null)
        : null
      return {
        id: journee.id,
        numero: journee.numero,
        date_journee: date_journee_str,
        matches: matches as any, // TypeORM entities vs TypeScript types compatibility
        dateLabel: journee.date_journee ? formatDateOnly(journee.date_journee, locale) : null,
      }
    })
  )

  // Trier les journées par date (les plus récentes en premier, puis par numéro)
  journeesWithMatches.sort((a, b) => {
    if (a.date_journee && b.date_journee) {
      return new Date(b.date_journee).getTime() - new Date(a.date_journee).getTime()
    }
    if (a.date_journee) return -1
    if (b.date_journee) return 1
    return b.numero - a.numero
  })

  // Déterminer la journée par défaut (prochaine journée ou dernière)
  const defaultJourneeId = nextJourneeData?.journee?.id || journeesWithMatches[0]?.id || null

  return (
    <JourneesClient
      journees={journeesWithMatches}
      defaultJourneeId={defaultJourneeId}
      locale={locale}
    />
  )
}


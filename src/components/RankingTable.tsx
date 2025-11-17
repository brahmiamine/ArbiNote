import Image from 'next/image'
import { RankingEntry } from '@/lib/rankings'
import { CritereDefinition } from '@/types'
import { getLocalizedName } from '@/lib/utils'

interface RankingTableProps {
  entries: RankingEntry[]
  criteres: CritereDefinition[]
  locale: string
  t: (key: string, params?: Record<string, string | number>) => string
}

export default function RankingTable({
  entries,
  criteres,
  locale,
  t,
}: RankingTableProps) {
  if (!entries.length) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
        <p className="text-gray-600">{t('classement.noVotes')}</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm rtl:text-right">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="px-4 py-3 text-left">{t('classement.rank')}</th>
            <th className="px-4 py-3 text-left">{t('classement.referee')}</th>
            <th className="px-4 py-3 text-left">{t('classement.globalNote')}</th>
            {criteres.map((critere) => (
              <th key={critere.id} className="px-4 py-3 text-left">
                {getLocalizedName(locale, {
                  defaultValue: critere.label_fr,
                  fr: critere.label_fr,
                  en: critere.label_en ?? undefined,
                  ar: critere.label_ar,
                })}
              </th>
            ))}
            <th className="px-4 py-3 text-left">{t('classement.votesCount')}</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => {
            const displayName = getLocalizedName(locale, {
              defaultValue: entry.nom,
              fr: entry.nom,
              en: entry.nom_en ?? undefined,
              ar: entry.nom_ar ?? undefined,
            })

            return (
              <tr
                key={entry.arbitreId}
                className={`border-b border-gray-100 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-4 py-3 font-semibold text-blue-700">
                  {index + 1}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {entry.photo_url && (
                      <span className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                        <Image
                          src={entry.photo_url}
                          alt={`Photo ${displayName}`}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </span>
                    )}
                    <span className="font-medium">{displayName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold text-blue-700">
                  {entry.moyenne.toFixed(2)}
                </td>
                {criteres.map((critere) => {
                  const value = entry.criteres?.[critere.id] ?? null
                  return (
                    <td key={`${entry.arbitreId}-${critere.id}`} className="px-4 py-3">
                      {typeof value === 'number' ? value.toFixed(2) : '—'}
                    </td>
                  )
                })}
                <td className="px-4 py-3 text-gray-600">{entry.votes}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}



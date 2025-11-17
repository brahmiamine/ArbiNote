/**
 * Utilitaires pour l'application ArbiNote
 */

/**
 * Formate une date selon la locale fournie
 */
function resolveIntlLocale(locale: string) {
  if (locale === 'ar') {
    return 'ar-TN'
  }
  if (locale === 'en') {
    return 'en-GB'
  }
  return 'fr-FR'
}

export function formatDate(date: Date | string, locale: string = 'fr'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const intlLocale = resolveIntlLocale(locale)
  return new Intl.DateTimeFormat(intlLocale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Formate une date pour l'affichage court (jour/mois)
 */
export function formatDateShort(date: Date | string, locale: string = 'fr'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const intlLocale = resolveIntlLocale(locale)
  return new Intl.DateTimeFormat(intlLocale, {
    day: '2-digit',
    month: '2-digit',
  }).format(d)
}

/**
 * Calcule la moyenne d'un tableau de nombres
 */
export function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0
  const sum = numbers.reduce((acc, val) => acc + val, 0)
  return sum / numbers.length
}

/**
 * Formate une note sur 5 avec 2 décimales
 */
export function formatNote(note: number): string {
  return note.toFixed(2)
}

/**
 * Arrondit une note à 2 décimales
 */
export function roundNote(note: number): number {
  return Math.round(note * 100) / 100
}

export function getLocalizedName(
  locale: string,
  {
    defaultValue,
    fr,
    ar,
    en,
  }: {
    defaultValue: string
    fr?: string | null
    ar?: string | null
    en?: string | null
  }
): string {
  if (locale === 'ar' && ar) {
    return ar
  }
  if (locale === 'en' && en) {
    return en
  }
  if (locale === 'fr' && fr) {
    return fr
  }
  return fr ?? en ?? ar ?? defaultValue
}


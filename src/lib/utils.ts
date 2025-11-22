/**
 * Utilitaires pour l'application ARBINOTE
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
 * Formate une date sans l'heure (jour/mois/année)
 */
export function formatDateOnly(date: Date | string, locale: string = 'fr'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const intlLocale = resolveIntlLocale(locale)
  return new Intl.DateTimeFormat(intlLocale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
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

/**
 * Vérifie si un match peut être voté
 * Conditions:
 * - Le match doit avoir un arbitre attribué
 * - La date/heure du match doit être dans le passé
 * - Au moins 30 minutes doivent s'être écoulées depuis le début du match
 */
export function canVoteMatch(match: { arbitre_id?: string | null; date?: string | null }): boolean {
  // Vérifier que l'arbitre est attribué
  if (!match.arbitre_id) {
    return false
  }

  // Si pas de date, on ne peut pas voter
  if (!match.date) {
    return false
  }

  const matchDate = new Date(match.date)
  const now = new Date()

  // Vérifier que la date/heure du match est passée
  if (matchDate > now) {
    return false
  }

  // Calculer la différence en millisecondes
  const diffMs = now.getTime() - matchDate.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  // Au moins 30 minutes doivent s'être écoulées depuis le début du match
  return diffMinutes >= 30
}


import { cookies } from 'next/headers'
import frMessages from '@/locales/fr.json'
import arMessages from '@/locales/ar.json'

export type Locale = 'fr' | 'ar'

const translations: Record<Locale, Record<string, string>> = {
  fr: frMessages,
  ar: arMessages,
}

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get('arbinote-locale')?.value
  if (cookieLocale === 'ar') {
    return 'ar'
  }
  return 'fr'
}

export function getServerTranslations(locale: Locale) {
  return translations[locale]
}

export function translate(key: string, locale: Locale): string {
  return translations[locale]?.[key] ?? translations.fr[key] ?? key
}



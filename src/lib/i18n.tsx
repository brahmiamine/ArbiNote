'use client'

import { createContext, useContext, ReactNode, useEffect, useState } from 'react'
import frMessages from '@/locales/fr.json'
import arMessages from '@/locales/ar.json'

export type Locale = 'fr' | 'ar'

interface TranslationContextValue {
  locale: Locale
  dir: 'ltr' | 'rtl'
  t: (key: string) => string
  switchLocale: (newLocale: Locale) => void
}

const defaultLocale: Locale = 'fr'

const translations: Record<Locale, Record<string, string>> = {
  fr: frMessages,
  ar: arMessages,
}

const TranslationContext = createContext<TranslationContextValue>({
  locale: defaultLocale,
  dir: 'ltr',
  t: (key) => translations[defaultLocale][key] ?? key,
  switchLocale: () => {},
})

interface TranslationProviderProps {
  children: ReactNode
  initialLocale?: Locale
}

export function TranslationProvider({
  children,
  initialLocale = defaultLocale,
}: TranslationProviderProps) {
  const [locale, setLocale] = useState<Locale>(initialLocale)
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  const switchLocale = (newLocale: Locale) => {
    setLocale(newLocale)
    if (typeof window !== 'undefined') {
      localStorage.setItem('arbinote-locale', newLocale)
      document.cookie = `arbinote-locale=${newLocale}; path=/; max-age=31536000`
    }
  }

  const t = (key: string) => translations[locale]?.[key] ?? translations[defaultLocale]?.[key] ?? key

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const stored = localStorage.getItem('arbinote-locale')
    if (stored === 'ar' || stored === 'fr') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocale((current) => (stored !== current ? stored : current))
    } else {
      localStorage.setItem('arbinote-locale', initialLocale)
    }
  }, [initialLocale])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
      document.documentElement.dir = dir
    }
  }, [locale, dir])

  return (
    <TranslationContext.Provider value={{ locale, dir, t, switchLocale }}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslations() {
  return useContext(TranslationContext)
}



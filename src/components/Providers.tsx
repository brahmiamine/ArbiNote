'use client'

import { TranslationProvider, Locale as ClientLocale } from '@/lib/i18n'
import LocaleProvider from '@/components/LocaleProvider'

interface Props {
  children: React.ReactNode
  initialLocale: ClientLocale
}

export default function Providers({ children, initialLocale }: Props) {
  return (
    <TranslationProvider initialLocale={initialLocale}>
      <LocaleProvider>{children}</LocaleProvider>
    </TranslationProvider>
  )
}



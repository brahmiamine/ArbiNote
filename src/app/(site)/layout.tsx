import { ReactNode } from 'react'
import Navigation from '@/components/Navigation'

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </>
  )
}



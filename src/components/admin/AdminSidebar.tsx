'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'Tableau de bord', href: '/admin' },
  { label: 'Fédérations', href: '/admin/federations' },
  { label: 'Ligues', href: '/admin/leagues' },
  { label: 'Journées', href: '/admin/journees' },
  { label: 'Matchs', href: '/admin/matches' },
  { label: 'Critères', href: '/admin/criteres' },
  { label: 'Messages', href: '/admin/contact' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800">
      <div className="p-6 text-xl font-bold tracking-tight border-b border-slate-800">
        ArbiNote Admin
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const linkPath = item.href.split('#')[0]
          const isActive = pathname === linkPath
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
        
        {/* Menu Arbitres */}
        <Link
          href="/admin/arbitres"
          className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            pathname === '/admin/arbitres' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          Arbitres
        </Link>
      </nav>
      <div className="p-4 border-t border-slate-800">
        <p className="text-xs text-slate-500">ArbiNote © {new Date().getFullYear()}</p>
      </div>
    </aside>
  )
}



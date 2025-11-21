'use client'

import FederationSwitcher from '../FederationSwitcher'

export default function AdminHeader() {
  return (
    <header className="px-8 py-6 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">Espace d'administration</p>
          <h1 className="text-2xl font-semibold text-gray-900">Gestion des arbitres</h1>
        </div>
        <div className="flex-shrink-0">
          <FederationSwitcher variant="admin" />
        </div>
      </div>
    </header>
  )
}


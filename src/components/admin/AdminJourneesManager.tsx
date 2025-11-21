'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Journee } from '@/types'

type JourneeEdit = {
  date_journee: string
}

function toDateInputValue(value: string | null | undefined) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  const pad = (num: number) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function buildEdit(journee: Journee): JourneeEdit {
  return {
    date_journee: toDateInputValue(journee.date_journee),
  }
}

export default function AdminJourneesManager() {
  const [journees, setJournees] = useState<Journee[]>([])
  const [edits, setEdits] = useState<Record<string, JourneeEdit>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)

  const sortedJournees = useMemo(() => {
    return [...journees].sort((a, b) => {
      const dateA = a.date_journee ? new Date(a.date_journee).getTime() : 0
      const dateB = b.date_journee ? new Date(b.date_journee).getTime() : 0
      if (dateB !== dateA) {
        return dateB - dateA
      }
      return b.numero - a.numero
    })
  }, [journees])

  useEffect(() => {
    loadJournees()
  }, [])

  async function loadJournees() {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/journees', {
        cache: 'no-store',
        credentials: 'include',
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error ?? 'Impossible de charger les journées')
      }
      const data = (await response.json()) as Journee[]
      setJournees(data)
      const nextEdits: Record<string, JourneeEdit> = {}
      data.forEach((journee) => {
        nextEdits[journee.id] = buildEdit(journee)
      })
      setEdits(nextEdits)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  function updateEdit(journeeId: string, field: keyof JourneeEdit, value: string) {
    setEdits((prev) => ({
      ...prev,
      [journeeId]: {
        ...prev[journeeId],
        [field]: value,
      },
    }))
  }

  function hasChanges(journee: Journee) {
    const baseline = buildEdit(journee)
    const current = edits[journee.id]
    if (!current) return false
    return baseline.date_journee !== current.date_journee
  }

  async function handleSave(journee: Journee) {
    const edit = edits[journee.id]
    if (!edit) return
    setSavingId(journee.id)
    try {
      const payload = {
        date_journee: edit.date_journee || null,
      }
      
      const response = await fetch(`/api/admin/journees/${journee.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(result?.error ?? 'Sauvegarde impossible')
      }
      
      const updatedJournee = await response.json()
      
      // Mettre à jour la journée dans l'état
      setJournees((prev) => prev.map((j) => (j.id === journee.id ? updatedJournee : j)))
      
      // Mettre à jour les edits avec les nouvelles données
      setEdits((prev) => ({
        ...prev,
        [journee.id]: buildEdit(updatedJournee),
      }))
    } catch (err) {
      console.error('Error saving journee:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 uppercase tracking-wide">Journées</p>
          <h1 className="text-3xl font-bold">Gestion des journées</h1>
          <p className="text-gray-500 mt-1">Modifiez les dates des journées.</p>
        </div>
        <button
          onClick={loadJournees}
          className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
          disabled={loading}
        >
          Rafraîchir
        </button>
      </header>

      {error && <div className="p-3 border border-red-200 bg-red-50 text-red-700 rounded">{error}</div>}

      <section className="bg-white shadow rounded-lg p-6">
        {loading ? (
          <p>Chargement...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b text-gray-500 uppercase text-xs tracking-wide">
                  <th className="p-2">Journée</th>
                  <th className="p-2">Saison</th>
                  <th className="p-2">Date</th>
                  <th className="p-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedJournees.map((journee) => {
                  const edit = edits[journee.id] ?? buildEdit(journee)
                  const changed = hasChanges(journee)
                  return (
                    <tr key={journee.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-medium">Journée {journee.numero}</div>
                        <div className="text-xs text-gray-500 font-mono truncate">{journee.id}</div>
                      </td>
                      <td className="p-3">
                        {journee.saison ? (
                          <div>
                            <div className="font-medium">{journee.saison.nom}</div>
                            {journee.saison.date_debut && journee.saison.date_fin && (
                              <div className="text-xs text-gray-500">
                                {new Date(journee.saison.date_debut).toLocaleDateString('fr-FR')} -{' '}
                                {new Date(journee.saison.date_fin).toLocaleDateString('fr-FR')}
                              </div>
                            )}
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="p-3">
                        <input
                          type="date"
                          value={edit.date_journee}
                          onChange={(e) => updateEdit(journee.id, 'date_journee', e.target.value)}
                          className="border rounded px-3 py-2 text-sm w-full"
                        />
                      </td>
                      <td className="p-3 text-right">
                        <button
                          className="px-4 py-2 bg-blue-600 text-white text-xs rounded disabled:opacity-50 hover:bg-blue-700"
                          disabled={!changed || savingId === journee.id}
                          onClick={() => handleSave(journee)}
                        >
                          {savingId === journee.id ? 'Sauvegarde...' : 'Sauvegarder'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}


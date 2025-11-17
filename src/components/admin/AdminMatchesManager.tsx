'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Match } from '@/types'

type MatchEdit = {
  score_home: string
  score_away: string
  date: string
}

function toDateTimeInputValue(value: string | null | undefined) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  const pad = (num: number) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}`
}

function buildEdit(match: Match): MatchEdit {
  return {
    score_home: match.score_home ?? match.score_home === 0 ? String(match.score_home) : '',
    score_away: match.score_away ?? match.score_away === 0 ? String(match.score_away) : '',
    date: toDateTimeInputValue(match.date),
  }
}

export default function AdminMatchesManager() {
  const [matches, setMatches] = useState<Match[]>([])
  const [edits, setEdits] = useState<Record<string, MatchEdit>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)

  const sortedMatches = useMemo(() => {
    return [...matches].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0
      const dateB = b.date ? new Date(b.date).getTime() : 0
      return dateB - dateA
    })
  }, [matches])

  useEffect(() => {
    loadMatches()
  }, [])

  async function loadMatches() {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/matches?limit=100', {
        cache: 'no-store',
        credentials: 'include',
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error ?? 'Impossible de charger les matchs')
      }
      const data = (await response.json()) as Match[]
      setMatches(data)
      const nextEdits: Record<string, MatchEdit> = {}
      data.forEach((match) => {
        nextEdits[match.id] = buildEdit(match)
      })
      setEdits(nextEdits)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  function updateEdit(matchId: string, field: keyof MatchEdit, value: string) {
    setEdits((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: value,
      },
    }))
  }

  function hasChanges(match: Match) {
    const baseline = buildEdit(match)
    const current = edits[match.id]
    if (!current) return false
    return (
      baseline.score_home !== current.score_home ||
      baseline.score_away !== current.score_away ||
      baseline.date !== current.date
    )
  }

  async function handleSave(match: Match) {
    const edit = edits[match.id]
    if (!edit) return
    setSavingId(match.id)
    try {
      const payload = {
        score_home: edit.score_home === '' ? null : Number(edit.score_home),
        score_away: edit.score_away === '' ? null : Number(edit.score_away),
        date: edit.date || null,
      }
      const response = await fetch(`/api/admin/matches/${match.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(result?.error ?? 'Sauvegarde impossible')
      }
      await loadMatches()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 uppercase tracking-wide">Matchs</p>
          <h1 className="text-3xl font-bold">Gestion des scores et dates</h1>
          <p className="text-gray-500 mt-1">Modifiez rapidement les scores ou replanifiez un match.</p>
        </div>
        <button
          onClick={loadMatches}
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
                  <th className="p-2">Match</th>
                  <th className="p-2">Journée</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Score</th>
                  <th className="p-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedMatches.map((match) => {
                  const edit = edits[match.id] ?? buildEdit(match)
                  const changed = hasChanges(match)
                  return (
                    <tr key={match.id} className="border-b last:border-0">
                      <td className="p-2">
                        <div className="font-medium">
                          {match.equipe_home.nom} vs {match.equipe_away.nom}
                        </div>
                        <div className="text-xs text-gray-500 font-mono truncate">{match.id}</div>
                      </td>
                      <td className="p-2">
                        {match.journee ? (
                          <div>
                            <div className="font-medium">Journée {match.journee.numero}</div>
                            {match.journee.date_journee && (
                              <div className="text-xs text-gray-500">{new Date(match.journee.date_journee).toLocaleDateString('fr-FR')}</div>
                            )}
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="p-2">
                        <input
                          type="datetime-local"
                          value={edit.date}
                          onChange={(e) => updateEdit(match.id, 'date', e.target.value)}
                          className="border rounded px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            inputMode="numeric"
                            className="w-16 border rounded px-2 py-1 text-sm"
                            value={edit.score_home}
                            onChange={(e) => updateEdit(match.id, 'score_home', e.target.value)}
                          />
                          <span className="text-gray-500">-</span>
                          <input
                            type="number"
                            inputMode="numeric"
                            className="w-16 border rounded px-2 py-1 text-sm"
                            value={edit.score_away}
                            onChange={(e) => updateEdit(match.id, 'score_away', e.target.value)}
                          />
                        </div>
                      </td>
                      <td className="p-2 text-right">
                        <button
                          className="px-4 py-2 bg-blue-600 text-white text-xs rounded disabled:opacity-50"
                          disabled={!changed || savingId === match.id}
                          onClick={() => handleSave(match)}
                        >
                          {savingId === match.id ? 'Sauvegarde...' : 'Sauvegarder'}
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



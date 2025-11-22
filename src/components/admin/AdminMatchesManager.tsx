'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Match, Journee, Arbitre, Team } from '@/types'

type MatchEdit = {
  score_home: string
  score_away: string
  date: string
  arbitre_id: string
  equipe_home: string
  equipe_away: string
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
    score_home: match.score_home !== null && match.score_home !== undefined ? String(match.score_home) : '',
    score_away: match.score_away !== null && match.score_away !== undefined ? String(match.score_away) : '',
    date: toDateTimeInputValue(match.date),
    arbitre_id: match.arbitre_id ?? '',
    equipe_home: match.equipe_home?.id ?? '',
    equipe_away: match.equipe_away?.id ?? '',
  }
}

export default function AdminMatchesManager() {
  const [matches, setMatches] = useState<Match[]>([])
  const [journees, setJournees] = useState<Journee[]>([])
  const [arbitres, setArbitres] = useState<Arbitre[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [edits, setEdits] = useState<Record<string, MatchEdit>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [selectedJourneeId, setSelectedJourneeId] = useState<string>('')

  const sortedJournees = useMemo(() => {
    return [...journees].sort((a, b) => {
      // Trier par numéro de journée en ordre croissant (1, 2, 3...)
      return a.numero - b.numero
    })
  }, [journees])

  const sortedMatches = useMemo(() => {
    return [...matches].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0
      const dateB = b.date ? new Date(b.date).getTime() : 0
      return dateB - dateA
    })
  }, [matches])

  useEffect(() => {
    loadJournees()
    loadArbitres()
    loadTeams()
  }, [])

  useEffect(() => {
    // Sélectionner automatiquement la première journée (journée 1) si disponible
    if (journees.length > 0 && !selectedJourneeId) {
      const sorted = [...journees].sort((a, b) => a.numero - b.numero)
      const firstJournee = sorted[0]
      if (firstJournee) {
        setSelectedJourneeId(firstJournee.id)
      }
    }
  }, [journees, selectedJourneeId])

  useEffect(() => {
    if (selectedJourneeId) {
      loadMatches()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedJourneeId])

  async function loadJournees() {
    try {
      const response = await fetch('/api/admin/journees', {
        cache: 'no-store',
        credentials: 'include',
      })
      if (response.ok) {
        const data = (await response.json()) as Journee[]
        setJournees(data)
      }
    } catch (err) {
      console.error('Error loading journees:', err)
    }
  }

  async function loadArbitres() {
    try {
      const response = await fetch('/api/admin/arbitres', {
        cache: 'no-store',
        credentials: 'include',
      })
      if (response.ok) {
        const data = (await response.json()) as Arbitre[]
        setArbitres(data)
      }
    } catch (err) {
      console.error('Error loading arbitres:', err)
    }
  }

  async function loadTeams() {
    try {
      const response = await fetch('/api/admin/teams', {
        cache: 'no-store',
        credentials: 'include',
      })
      if (response.ok) {
        const data = (await response.json()) as Team[]
        setTeams(data)
      }
    } catch (err) {
      console.error('Error loading teams:', err)
    }
  }

  async function loadMatches() {
    if (!selectedJourneeId) {
      setMatches([])
      setEdits({})
      return
    }
    
    try {
      setLoading(true)
      const url = `/api/admin/matches?limit=100&journeeId=${selectedJourneeId}`
      const response = await fetch(url, {
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
    // Normaliser les valeurs vides pour la comparaison
    const baselineArbitreId = baseline.arbitre_id || ''
    const currentArbitreId = current.arbitre_id || ''
    const baselineEquipeHome = baseline.equipe_home || ''
    const currentEquipeHome = current.equipe_home || ''
    const baselineEquipeAway = baseline.equipe_away || ''
    const currentEquipeAway = current.equipe_away || ''
    return (
      baseline.score_home !== current.score_home ||
      baseline.score_away !== current.score_away ||
      baseline.date !== current.date ||
      baselineArbitreId !== currentArbitreId ||
      baselineEquipeHome !== currentEquipeHome ||
      baselineEquipeAway !== currentEquipeAway
    )
  }

  async function handleSave(match: Match) {
    const edit = edits[match.id]
    if (!edit) return
    setSavingId(match.id)
    try {
      // Construire le payload avec tous les champs modifiables
      // Gérer le score 0 comme valeur valide
      const parseScore = (value: string): number | null => {
        if (value === '' || value === null || value === undefined) {
          return null
        }
        const num = Number(value)
        return Number.isFinite(num) ? num : null
      }
      
      const payload = {
        score_home: parseScore(edit.score_home),
        score_away: parseScore(edit.score_away),
        date: edit.date || null,
        arbitre_id: edit.arbitre_id === '' ? null : (edit.arbitre_id || null),
        equipe_home: edit.equipe_home === '' ? null : (edit.equipe_home || null),
        equipe_away: edit.equipe_away === '' ? null : (edit.equipe_away || null),
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
      
      const updatedMatch = await response.json()
      
      // Mettre à jour le match dans l'état
      setMatches((prev) => prev.map((m) => (m.id === match.id ? updatedMatch : m)))
      
      // Mettre à jour les edits avec les nouvelles données
      setEdits((prev) => ({
        ...prev,
        [match.id]: buildEdit(updatedMatch),
      }))
    } catch (err) {
      console.error('Error saving match:', err)
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
          <h1 className="text-3xl font-bold">Gestion des matchs</h1>
          <p className="text-gray-500 mt-1">Modifiez les scores, dates et arbitres des matchs.</p>
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
        <div className="mb-4 flex items-center gap-4">
          <label htmlFor="journee-filter" className="text-sm font-medium text-gray-700">
            Filtrer par journée:
          </label>
          <select
            id="journee-filter"
            value={selectedJourneeId}
            onChange={(e) => setSelectedJourneeId(e.target.value)}
            className="border rounded px-3 py-2 text-sm min-w-[200px]"
          >
            {sortedJournees.map((journee) => (
              <option key={journee.id} value={journee.id}>
                Journée {journee.numero}
                {journee.date_journee
                  ? ` - ${new Date(journee.date_journee).toLocaleDateString('fr-FR')}`
                  : ''}
              </option>
            ))}
          </select>
        </div>

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
                  <th className="p-2">Arbitre</th>
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
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 flex-1">
                              {(() => {
                                const selectedHomeTeam = teams.find(t => t.id === edit.equipe_home)
                                return selectedHomeTeam?.logo_url ? (
                                  <img
                                    src={selectedHomeTeam.logo_url}
                                    alt={selectedHomeTeam.nom}
                                    className="w-6 h-6 object-contain"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement
                                      target.style.display = 'none'
                                    }}
                                  />
                                ) : (
                                  <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400 font-semibold">
                                    {selectedHomeTeam?.nom.charAt(0).toUpperCase() || '?'}
                                  </div>
                                )
                              })()}
                              <select
                                value={edit.equipe_home}
                                onChange={(e) => updateEdit(match.id, 'equipe_home', e.target.value)}
                                className="border rounded px-2 py-1 text-sm flex-1 min-w-[120px]"
                              >
                                <option value="">Sélectionner...</option>
                                {teams.map((team) => (
                                  <option key={team.id} value={team.id}>
                                    {team.nom}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <span className="text-gray-400 text-xs">vs</span>
                            <div className="flex items-center gap-2 flex-1">
                              {(() => {
                                const selectedAwayTeam = teams.find(t => t.id === edit.equipe_away)
                                return selectedAwayTeam?.logo_url ? (
                                  <img
                                    src={selectedAwayTeam.logo_url}
                                    alt={selectedAwayTeam.nom}
                                    className="w-6 h-6 object-contain"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement
                                      target.style.display = 'none'
                                    }}
                                  />
                                ) : (
                                  <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400 font-semibold">
                                    {selectedAwayTeam?.nom.charAt(0).toUpperCase() || '?'}
                                  </div>
                                )
                              })()}
                              <select
                                value={edit.equipe_away}
                                onChange={(e) => updateEdit(match.id, 'equipe_away', e.target.value)}
                                className="border rounded px-2 py-1 text-sm flex-1 min-w-[120px]"
                              >
                                <option value="">Sélectionner...</option>
                                {teams.map((team) => (
                                  <option key={team.id} value={team.id}>
                                    {team.nom}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 font-mono truncate">{match.id}</div>
                        </div>
                      </td>
                      <td className="p-2">
                        {match.journee ? (
                          <div>
                            <div className="font-medium">Journée {match.journee.numero}</div>
                            {match.journee.date_journee && (
                              <div className="text-xs text-gray-500">
                                {new Date(match.journee.date_journee).toLocaleDateString('fr-FR')}
                              </div>
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
                          className="border rounded px-2 py-1 text-sm w-full"
                        />
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            inputMode="numeric"
                            min="0"
                            step="1"
                            className="w-16 border rounded px-2 py-1 text-sm"
                            value={edit.score_home}
                            onChange={(e) => updateEdit(match.id, 'score_home', e.target.value)}
                            placeholder="0"
                          />
                          <span className="text-gray-500">-</span>
                          <input
                            type="number"
                            inputMode="numeric"
                            min="0"
                            step="1"
                            className="w-16 border rounded px-2 py-1 text-sm"
                            value={edit.score_away}
                            onChange={(e) => updateEdit(match.id, 'score_away', e.target.value)}
                            placeholder="0"
                          />
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <select
                            value={edit.arbitre_id}
                            onChange={(e) => updateEdit(match.id, 'arbitre_id', e.target.value)}
                            className="border rounded px-2 py-1 text-sm flex-1 min-w-[150px]"
                          >
                            <option value="">Aucun arbitre</option>
                            {arbitres.map((arbitre) => (
                              <option key={arbitre.id} value={arbitre.id}>
                                {arbitre.nom}
                              </option>
                            ))}
                          </select>
                          {edit.arbitre_id && (
                            <button
                              type="button"
                              onClick={() => updateEdit(match.id, 'arbitre_id', '')}
                              className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                              title="Supprimer l'arbitre"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-2 text-right">
                        <button
                          className="px-4 py-2 bg-blue-600 text-white text-xs rounded disabled:opacity-50 hover:bg-blue-700"
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

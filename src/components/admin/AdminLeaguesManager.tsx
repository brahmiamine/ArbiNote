'use client'

import { Dispatch, FormEvent, SetStateAction, useEffect, useMemo, useState } from 'react'

interface League {
  id: string
  federation_id: string
  nom: string
  nom_en?: string | null
  nom_ar?: string | null
  logo_url?: string | null
  created_at?: string | null
  federation?: {
    id: string
    nom: string
    code: string
  }
}

interface Federation {
  id: string
  code: string
  nom: string
}

interface LeagueFormState {
  federation_id: string
  nom: string
  nom_en: string
  nom_ar: string
  logoFile: File | null
  logo_url: string
}

const emptyForm: LeagueFormState = {
  federation_id: '',
  nom: '',
  nom_en: '',
  nom_ar: '',
  logoFile: null,
  logo_url: '',
}

export default function AdminLeaguesManager() {
  const [leagues, setLeagues] = useState<League[]>([])
  const [federations, setFederations] = useState<Federation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState<LeagueFormState>(emptyForm)
  const [editForm, setEditForm] = useState<LeagueFormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [uploadingCreate, setUploadingCreate] = useState(false)
  const [uploadingEdit, setUploadingEdit] = useState(false)
  const [viewingLogo, setViewingLogo] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (viewingLogo) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setViewingLogo(null)
        }
      }
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [viewingLogo])

  async function loadData() {
    try {
      setLoading(true)
      const [leaguesRes, federationsRes] = await Promise.all([
        fetch('/api/admin/leagues', { cache: 'no-store', credentials: 'include' }),
        fetch('/api/admin/federations', { cache: 'no-store', credentials: 'include' }),
      ])

      if (!leaguesRes.ok || !federationsRes.ok) {
        throw new Error('Impossible de charger les données')
      }

      const [leaguesData, federationsData] = await Promise.all([
        leaguesRes.json(),
        federationsRes.json(),
      ])

      setLeagues(leaguesData)
      setFederations(federationsData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedLeagues = useMemo(() => {
    let filtered = leagues

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = leagues.filter(
        (league) =>
          league.nom.toLowerCase().includes(query) ||
          league.nom_en?.toLowerCase().includes(query) ||
          league.nom_ar?.toLowerCase().includes(query) ||
          league.federation?.nom.toLowerCase().includes(query)
      )
    }

    return filtered.sort((a, b) => a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' }))
  }, [leagues, searchQuery])

  const handleFileChange =
    (formSetter: Dispatch<SetStateAction<LeagueFormState>>) => (fileList: FileList | null) => {
      if (fileList && fileList.length > 0) {
        const file = fileList[0]
        if (!file.type.startsWith('image/')) {
          setError('Le fichier doit être une image')
          return
        }
        formSetter((prev) => ({ ...prev, logoFile: file }))
      }
    }

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setUploadingCreate(true)

    try {
      let logoUrl = createForm.logo_url

      if (createForm.logoFile) {
        const formData = new FormData()
        formData.append('file', createForm.logoFile)
        const uploadRes = await fetch('/api/uploads/league', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        })
        if (!uploadRes.ok) {
          throw new Error('Échec du téléchargement du logo')
        }
        const uploadData = await uploadRes.json()
        logoUrl = uploadData.url
      }

      const response = await fetch('/api/admin/leagues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          federation_id: createForm.federation_id,
          nom: createForm.nom,
          nom_en: createForm.nom_en || null,
          nom_ar: createForm.nom_ar || null,
          logo_url: logoUrl,
        }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: 'Erreur' }))
        throw new Error(payload.error || 'Création impossible')
      }
      setShowCreateModal(false)
      setCreateForm({ ...emptyForm })
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création')
    } finally {
      setUploadingCreate(false)
    }
  }

  function startEdit(league: League) {
    setEditingId(league.id)
    setEditForm({
      federation_id: league.federation_id,
      nom: league.nom,
      nom_en: league.nom_en || '',
      nom_ar: league.nom_ar || '',
      logoFile: null,
      logo_url: league.logo_url || '',
    })
    // Réinitialiser l'erreur d'image pour cette ligue
    setImageErrors((prev) => {
      const newSet = new Set(prev)
      newSet.delete(league.id)
      return newSet
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm({ ...emptyForm })
  }

  async function handleUpdate(e: FormEvent) {
    e.preventDefault()
    if (!editingId) return
    setError(null)
    setUploadingEdit(true)

    try {
      let logoUrl = editForm.logo_url

      if (editForm.logoFile) {
        const formData = new FormData()
        formData.append('file', editForm.logoFile)
        const uploadRes = await fetch('/api/uploads/league', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        })
        if (!uploadRes.ok) {
          throw new Error('Échec du téléchargement du logo')
        }
        const uploadData = await uploadRes.json()
        logoUrl = uploadData.url
      }

      const response = await fetch(`/api/admin/leagues/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          federation_id: editForm.federation_id,
          nom: editForm.nom,
          nom_en: editForm.nom_en || null,
          nom_ar: editForm.nom_ar || null,
          logo_url: logoUrl,
        }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: 'Erreur' }))
        throw new Error(payload.error || 'Mise à jour impossible')
      }
      setEditingId(null)
      setEditForm({ ...emptyForm })
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour')
    } finally {
      setUploadingEdit(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette ligue ?')) return
    setError(null)
    try {
      const response = await fetch(`/api/admin/leagues/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: 'Erreur' }))
        throw new Error(payload.error || 'Suppression impossible')
      }
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Gestion des ligues</h2>
          <p className="text-gray-500">Liste et modification des ligues</p>
        </div>
        <button
          onClick={() => setShowCreateModal(!showCreateModal)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          {showCreateModal ? 'Annuler' : '+ Ajouter une ligue'}
        </button>
      </div>

      {error && (
        <div className="p-3 border border-red-200 bg-red-50 text-red-700 rounded">{error}</div>
      )}

      {showCreateModal && (
        <div className="bg-white shadow-lg rounded-lg p-6 border-2 border-green-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-green-700">Ajouter une ligue</h3>
            <button
              onClick={() => {
                setShowCreateModal(false)
                setCreateForm({ ...emptyForm })
              }}
              className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
            >
              ✕ Fermer
            </button>
          </div>
          <form className="grid md:grid-cols-2 gap-4" onSubmit={handleCreate}>
            <div>
              <label className="block text-sm font-medium mb-1">Fédération *</label>
              <select
                value={createForm.federation_id}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, federation_id: e.target.value }))}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Sélectionner une fédération</option>
                {federations.map((fed) => (
                  <option key={fed.id} value={fed.id}>
                    {fed.code} - {fed.nom}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nom (français) *</label>
              <input
                type="text"
                value={createForm.nom}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, nom: e.target.value }))}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nom (anglais)</label>
              <input
                type="text"
                value={createForm.nom_en}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, nom_en: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nom (arabe)</label>
              <input
                type="text"
                value={createForm.nom_ar}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, nom_ar: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(setCreateForm)(e.target.files)}
                className="w-full"
              />
              {uploadingCreate && <p className="text-xs text-gray-500 mt-1">Envoi en cours...</p>}
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 disabled:opacity-60"
                disabled={uploadingCreate}
              >
                {uploadingCreate ? 'Ajout en cours...' : 'Ajouter'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        <div className={`${editingId ? 'col-span-12 md:col-span-8' : 'col-span-12'} bg-white shadow rounded-lg p-5`}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Logo</th>
                  <th className="text-left py-2 px-2">Fédération</th>
                  <th className="text-left py-2 px-2">Nom</th>
                  <th className="text-left py-2 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedLeagues.map((league) => (
                  <tr key={league.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-2">
                      {league.logo_url && !imageErrors.has(league.id) ? (
                        <button
                          onClick={() => setViewingLogo(league.logo_url || null)}
                          className="relative w-10 h-10 rounded overflow-hidden border bg-gray-100"
                        >
                          <img 
                            src={league.logo_url} 
                            alt={league.nom} 
                            className="w-full h-full object-cover"
                            onError={() => {
                              setImageErrors((prev) => new Set(prev).add(league.id))
                            }}
                          />
                        </button>
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400 font-semibold">
                          {league.nom.charAt(0).toUpperCase() || '—'}
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-2">
                      {league.federation ? `${league.federation.code} - ${league.federation.nom}` : '—'}
                    </td>
                    <td className="py-2 px-2">{league.nom}</td>
                    <td className="py-2 px-2">
                      <button
                        onClick={() => startEdit(league)}
                        className="text-blue-600 hover:underline mr-3"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(league.id)}
                        className="text-red-600 hover:underline"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {editingId && (
          <div className="col-span-12 md:col-span-4 bg-white shadow rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Modifier</h3>
              <button onClick={cancelEdit} className="text-sm text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Fédération *</label>
                <select
                  value={editForm.federation_id}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, federation_id: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Sélectionner une fédération</option>
                  {federations.map((fed) => (
                    <option key={fed.id} value={fed.id}>
                      {fed.code} - {fed.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nom (français) *</label>
                <input
                  type="text"
                  value={editForm.nom}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, nom: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nom (anglais)</label>
                <input
                  type="text"
                  value={editForm.nom_en}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, nom_en: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nom (arabe)</label>
                <input
                  type="text"
                  value={editForm.nom_ar}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, nom_ar: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Logo</label>
                {editForm.logo_url ? (
                  <div className="mb-2">
                    {imageErrors.has(editingId || '') ? (
                      <div className="w-20 h-20 rounded overflow-hidden border bg-gray-200 flex items-center justify-center text-sm text-gray-400 font-semibold">
                        {editForm.nom.charAt(0).toUpperCase() || '—'}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setViewingLogo(editForm.logo_url)}
                        className="relative w-20 h-20 rounded overflow-hidden border bg-gray-100"
                      >
                        <img 
                          src={editForm.logo_url} 
                          alt="Logo" 
                          className="w-full h-full object-cover"
                          onError={() => {
                            if (editingId) {
                              setImageErrors((prev) => new Set(prev).add(editingId))
                            }
                          }}
                        />
                      </button>
                    )}
                  </div>
                ) : null}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(setEditForm)(e.target.files)}
                  className="w-full"
                />
                {uploadingEdit && <p className="text-xs text-gray-500 mt-1">Envoi en cours...</p>}
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-60"
                  disabled={uploadingEdit}
                >
                  {uploadingEdit ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {viewingLogo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setViewingLogo(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <button
              onClick={() => setViewingLogo(null)}
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-75"
            >
              ✕
            </button>
            <img
              src={viewingLogo}
              alt="Logo"
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}


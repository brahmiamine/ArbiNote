'use client'

import { Dispatch, FormEvent, SetStateAction, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Arbitre } from '@/types'

interface ArbitreFormState {
  nom: string
  nom_en: string
  nom_ar: string
  date_naissance: string
  photoFile: File | null
  photo_url: string
}

const emptyForm: ArbitreFormState = {
  nom: '',
  nom_en: '',
  nom_ar: '',
  date_naissance: '',
  photoFile: null,
  photo_url: '',
}

export default function AdminDashboard() {
  const router = useRouter()
  const [arbitres, setArbitres] = useState<Arbitre[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState<ArbitreFormState>(emptyForm)
  const [editForm, setEditForm] = useState<ArbitreFormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [uploadingCreate, setUploadingCreate] = useState(false)
  const [uploadingEdit, setUploadingEdit] = useState(false)
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadArbitres()
  }, [])

  useEffect(() => {
    if (viewingPhoto) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setViewingPhoto(null)
        }
      }
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [viewingPhoto])

  const filteredAndSortedArbitres = useMemo(() => {
    let filtered = arbitres

    // Filtrer par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = arbitres.filter(
        (arbitre) =>
          arbitre.nom.toLowerCase().includes(query) ||
          arbitre.nom_en?.toLowerCase().includes(query) ||
          arbitre.nom_ar?.toLowerCase().includes(query)
      )
    }

    // Trier par nom
    return filtered.sort((a, b) => a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' }))
  }, [arbitres, searchQuery])

  async function loadArbitres() {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/arbitres', {
        cache: 'no-store',
        credentials: 'include',
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        const message = payload?.error ?? `Impossible de charger les arbitres (${response.status})`
        throw new Error(message)
      }
      const data = (await response.json()) as Arbitre[]
      setArbitres(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange =
    (formSetter: Dispatch<SetStateAction<ArbitreFormState>>) => (fileList: FileList | null) => {
    const file = fileList?.[0] ?? null
    formSetter((prev) => ({ ...prev, photoFile: file }))
    }

  async function uploadPhoto(file: File | null, mode: 'create' | 'edit') {
    if (!file) return ''
    if (mode === 'create') {
      setUploadingCreate(true)
    } else {
      setUploadingEdit(true)
    }
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/uploads/arbitre', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Échec de l’envoi de la photo')
      }
      const data = await response.json()
      return data.url as string
    } finally {
      if (mode === 'create') {
        setUploadingCreate(false)
      } else {
        setUploadingEdit(false)
      }
    }
  }

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    try {
      const photoUrl = await uploadPhoto(createForm.photoFile, 'create')
      const response = await fetch('/api/admin/arbitres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nom: createForm.nom,
          nom_en: createForm.nom_en || null,
          nom_ar: createForm.nom_ar || null,
          date_naissance: createForm.date_naissance || null,
          photo_url: photoUrl || createForm.photo_url || null,
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: 'Erreur' }))
        throw new Error(payload.error || 'Création impossible')
      }

      setCreateForm({ ...emptyForm })
      await loadArbitres()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création')
    }
  }

  const startEdit = (arbitre: Arbitre) => {
    setEditingId(arbitre.id)
    setEditForm({
      nom: arbitre.nom,
      nom_en: arbitre.nom_en || '',
      nom_ar: arbitre.nom_ar || '',
      date_naissance: arbitre.date_naissance
        ? arbitre.date_naissance.slice(0, 10)
        : '',
      photoFile: null,
      photo_url: arbitre.photo_url || '',
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({ ...emptyForm })
  }

  const handleUpdate = async (event: FormEvent) => {
    event.preventDefault()
    if (!editingId) return
    setError(null)
    try {
      let photoUrl = editForm.photo_url || null
      
      // Si une nouvelle photo est sélectionnée, l'uploader
      if (editForm.photoFile) {
        photoUrl = await uploadPhoto(editForm.photoFile, 'edit')
      }
      // Si photo_url est vide (photo supprimée), envoyer null
      else if (editForm.photo_url === '') {
        photoUrl = null
      }
      
      const response = await fetch(`/api/admin/arbitres/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nom: editForm.nom,
          nom_en: editForm.nom_en || null,
          nom_ar: editForm.nom_ar || null,
          date_naissance: editForm.date_naissance || null,
          photo_url: photoUrl,
        }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: 'Erreur' }))
        throw new Error(payload.error || 'Mise à jour impossible')
      }
      setEditingId(null)
      setEditForm({ ...emptyForm })
      await loadArbitres()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour')
    }
  }

  const handleImport = async (event: FormEvent) => {
    event.preventDefault()
    if (!importFile) {
      setImportMessage('Veuillez sélectionner un fichier CSV')
      return
    }
    setImportMessage(null)
    setImporting(true)
    try {
      const formData = new FormData()
      formData.append('file', importFile)
      const response = await fetch('/api/admin/arbitres/import', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: 'Erreur' }))
        throw new Error(payload.error || 'Import impossible')
      }
      const payload = await response.json()
      setImportMessage(`Import réussi: ${payload.inserted} ajoutés, ${payload.updated} mis à jour`)
      setImportFile(null)
      const formElement = event.currentTarget as HTMLFormElement
      formElement.reset()
      await loadArbitres()
    } catch (err) {
      setImportMessage(err instanceof Error ? err.message : 'Erreur pendant l’import')
    } finally {
      setImporting(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' })
    router.refresh()
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Panneau admin</h2>
          <p className="text-gray-500">Gérez les arbitres, les photos et les imports.</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
        >
          Déconnexion
        </button>
      </div>

      {error && <div className="p-3 border border-red-200 bg-red-50 text-red-700 rounded">{error}</div>}

      <section className="grid md:grid-cols-2 gap-6" id="ajouter">
        <div className="bg-white shadow rounded-lg p-5">
          <h3 className="text-xl font-semibold mb-4">Ajouter un arbitre</h3>
          <form className="space-y-4" onSubmit={handleCreate}>
            <div>
              <label className="block text-sm font-medium mb-1">Nom (français)</label>
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
            <div>
              <label className="block text-sm font-medium mb-1">Date de naissance</label>
              <input
                type="date"
                value={createForm.date_naissance}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, date_naissance: e.target.value }))
                }
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(setCreateForm)(e.target.files)}
                className="w-full"
              />
              {uploadingCreate && <p className="text-xs text-gray-500 mt-1">Envoi en cours...</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700"
              disabled={uploadingCreate}
            >
              Ajouter
            </button>
          </form>
        </div>

        <div className="bg-white shadow rounded-lg p-5" id="import">
          <h3 className="text-xl font-semibold mb-4">Import CSV</h3>
          <form className="space-y-4" onSubmit={handleImport}>
            <div>
              <label className="block text-sm font-medium mb-1">Fichier CSV</label>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Colonnes supportées: nom, nom_en, nom_ar, date_naissance, photo_url, id.
              </p>
            </div>
            {importMessage && <p className="text-sm text-blue-600">{importMessage}</p>}
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 disabled:opacity-60"
              disabled={importing}
            >
              {importing ? 'Import en cours...' : 'Importer'}
            </button>
          </form>
        </div>
      </section>

      <section className="bg-white shadow rounded-lg p-5" id="arbitres">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Arbitres ({filteredAndSortedArbitres.length})</h3>
        </div>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Rechercher par nom..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {loading ? (
          <p>Chargement...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="p-2">Nom</th>
                  <th className="p-2">Nom (anglais)</th>
                  <th className="p-2">Nom (arabe)</th>
                  <th className="p-2">Naissance</th>
                  <th className="p-2">Photo</th>
                  <th className="p-2" />
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedArbitres.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      {searchQuery.trim() ? 'Aucun arbitre trouvé pour cette recherche' : 'Aucun arbitre'}
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedArbitres.map((arbitre) => (
                  <tr
                    key={arbitre.id}
                    className={`border-b last:border-0 transition-colors ${
                      editingId === arbitre.id
                        ? 'bg-blue-50 border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="p-3 font-medium">{arbitre.nom}</td>
                    <td className="p-3">{arbitre.nom_en || '—'}</td>
                    <td className="p-3">{arbitre.nom_ar || '—'}</td>
                    <td className="p-3">
                      {arbitre.date_naissance
                        ? new Date(arbitre.date_naissance).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                    <td className="p-3">
                      {arbitre.photo_url ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setViewingPhoto(arbitre.photo_url || null)
                          }}
                          className="flex-shrink-0 group cursor-pointer"
                        >
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300 group-hover:border-blue-500 transition-all shadow-md group-hover:shadow-lg group-hover:scale-105">
                            <img
                              src={arbitre.photo_url}
                              alt={arbitre.nom}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                const parent = target.parentElement
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="w-full h-full bg-gray-200 flex items-center justify-center">
                                      <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                    </div>
                                  `
                                }
                              }}
                            />
                          </div>
                        </button>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => startEdit(arbitre)}
                        className={`px-4 py-1.5 rounded text-xs font-medium transition-colors ${
                          editingId === arbitre.id
                            ? 'bg-blue-700 text-white'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {editingId === arbitre.id ? 'En cours...' : 'Modifier'}
                      </button>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editingId && (
        <section className="bg-white shadow-lg rounded-lg p-6 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-blue-700">Modifier l'arbitre</h3>
            <button
              onClick={cancelEdit}
              className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
            >
              ✕ Fermer
            </button>
          </div>
          <form className="grid md:grid-cols-2 gap-6" onSubmit={handleUpdate}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom (français)</label>
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
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date de naissance</label>
                <input
                  type="date"
                  value={editForm.date_naissance}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, date_naissance: e.target.value }))
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Photo</label>
                {editForm.photo_url ? (
                  <div className="mb-3 p-3 bg-gray-50 rounded border">
                    <div className="flex items-start gap-4 mb-3">
                      <img
                        src={editForm.photo_url}
                        alt="Photo actuelle"
                        className="w-24 h-24 object-cover rounded border-2 border-gray-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 mb-2">Photo actuelle</p>
                        <button
                          type="button"
                          onClick={() => {
                            setEditForm((prev) => ({ ...prev, photo_url: '', photoFile: null }))
                          }}
                          className="px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-medium transition-colors"
                        >
                          ✕ Supprimer la photo
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-3 p-3 bg-gray-50 rounded border border-dashed">
                    <p className="text-sm text-gray-500">Aucune photo</p>
                  </div>
                )}
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(setEditForm)(e.target.files)}
                    className="w-full text-sm"
                  />
                  {uploadingEdit && (
                    <p className="text-xs text-blue-600 mt-1">⏳ Envoi en cours...</p>
                  )}
                  {editForm.photoFile && (
                    <div className="p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-xs text-green-700 font-medium">
                        ✓ Nouvelle photo sélectionnée: {editForm.photoFile.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
                disabled={uploadingEdit}
              >
                Sauvegarder
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
        </section>
      )}

      {/* Modal pour afficher la photo */}
      {viewingPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
          onClick={() => setViewingPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <img
              src={viewingPhoto}
              alt="Photo arbitre"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              onClick={() => setViewingPhoto(null)}
              className="absolute top-4 right-4 bg-white text-gray-800 rounded-full p-2 hover:bg-gray-100 transition-colors shadow-lg"
              aria-label="Fermer"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}



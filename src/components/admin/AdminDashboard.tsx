'use client'

import { Dispatch, FormEvent, SetStateAction, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Arbitre } from '@/types'

interface ArbitreFormState {
  nom: string
  nom_ar: string
  date_naissance: string
  photoFile: File | null
  photo_url: string
}

const emptyForm: ArbitreFormState = {
  nom: '',
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

  useEffect(() => {
    loadArbitres()
  }, [])

  const sortedArbitres = useMemo(
    () =>
      [...arbitres].sort((a, b) =>
        a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' })
      ),
    [arbitres]
  )

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
      const photoUrl = await uploadPhoto(editForm.photoFile, 'edit')
      const response = await fetch(`/api/admin/arbitres/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nom: editForm.nom,
          nom_ar: editForm.nom_ar || null,
          date_naissance: editForm.date_naissance || null,
          photo_url: photoUrl || editForm.photo_url || null,
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
              <label className="block text-sm font-medium mb-1">Nom</label>
              <input
                type="text"
                value={createForm.nom}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, nom: e.target.value }))}
                className="w-full border rounded px-3 py-2"
                required
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
                Colonnes supportées: nom, nom_ar, date_naissance, photo_url, id.
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
          <h3 className="text-xl font-semibold">Arbitres ({sortedArbitres.length})</h3>
        </div>
        {loading ? (
          <p>Chargement...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="p-2">Nom</th>
                  <th className="p-2">Nom arabe</th>
                  <th className="p-2">Naissance</th>
                  <th className="p-2">Photo</th>
                  <th className="p-2" />
                </tr>
              </thead>
              <tbody>
                {sortedArbitres.map((arbitre) => (
                  <tr key={arbitre.id} className="border-b last:border-0">
                    <td className="p-2 font-medium">{arbitre.nom}</td>
                    <td className="p-2">{arbitre.nom_ar || '—'}</td>
                    <td className="p-2">
                      {arbitre.date_naissance
                        ? new Date(arbitre.date_naissance).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                    <td className="p-2">
                      {arbitre.photo_url ? (
                        <a
                          href={arbitre.photo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline"
                        >
                          Voir
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-2 text-right">
                      <button
                        onClick={() => startEdit(arbitre)}
                        className="px-3 py-1 border rounded hover:bg-gray-50 text-xs"
                      >
                        Modifier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editingId && (
        <section className="bg-white shadow rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Modifier l’arbitre</h3>
            <button onClick={cancelEdit} className="text-sm text-gray-500 hover:underline">
              Annuler
            </button>
          </div>
          <form className="grid md:grid-cols-2 gap-4" onSubmit={handleUpdate}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom</label>
                <input
                  type="text"
                  value={editForm.nom}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, nom: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  required
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
                <label className="block text-sm font-medium mb-1">Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(setEditForm)(e.target.files)}
                  className="w-full"
                />
                {uploadingEdit && <p className="text-xs text-gray-500 mt-1">Envoi en cours...</p>}
                {editForm.photo_url && (
                  <p className="text-xs text-gray-500 mt-1 truncate">{editForm.photo_url}</p>
                )}
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
    </div>
  )
}



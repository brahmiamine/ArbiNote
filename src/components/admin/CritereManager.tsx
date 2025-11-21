'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import type { CritereDefinition } from '@/types'

type FormState = {
  id: string
  categorie: CritereDefinition['categorie']
  label_fr: string
  label_en: string
  label_ar: string
  description_fr: string
  description_ar: string
}

const defaultForm: FormState = {
  id: '',
  categorie: 'arbitre',
  label_fr: '',
  label_en: '',
  label_ar: '',
  description_fr: '',
  description_ar: '',
}

const categorieLabels: Record<CritereDefinition['categorie'], string> = {
  arbitre: 'Arbitre central',
  var: 'VAR',
  assistant: 'Assistant',
}

export default function CritereManager() {
  const [criteres, setCriteres] = useState<CritereDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState<FormState>(defaultForm)
  const [editForm, setEditForm] = useState<FormState>(defaultForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const sortedCriteres = useMemo(() => {
    return [...criteres].sort((a, b) => {
      if (a.categorie === b.categorie) {
        return a.id.localeCompare(b.id)
      }
      return a.categorie.localeCompare(b.categorie)
    })
  }, [criteres])

  useEffect(() => {
    loadCriteres()
  }, [])

  async function loadCriteres() {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/criteres', {
        cache: 'no-store',
        credentials: 'include',
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error ?? 'Impossible de charger les critères')
      }
      const data = (await response.json()) as CritereDefinition[]
      setCriteres(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  function resetCreateForm() {
    setCreateForm(defaultForm)
    setShowCreateForm(false)
  }

  function resetEditForm() {
    setEditForm(defaultForm)
    setEditingId(null)
  }

  function startEdit(critere: CritereDefinition) {
    setEditingId(critere.id)
    setEditForm({
      id: critere.id,
      categorie: critere.categorie,
      label_fr: critere.label_fr,
      label_en: critere.label_en ?? '',
      label_ar: critere.label_ar,
      description_fr: critere.description_fr ?? '',
      description_ar: critere.description_ar ?? '',
    })
    setShowCreateForm(false)
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const payload = {
        id: createForm.id.trim(),
        categorie: createForm.categorie,
        label_fr: createForm.label_fr.trim(),
        label_en: createForm.label_en.trim() || null,
        label_ar: createForm.label_ar.trim(),
        description_fr: createForm.description_fr.trim() || null,
        description_ar: createForm.description_ar.trim() || null,
      }

      const response = await fetch('/api/admin/criteres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(result?.error ?? 'Impossible de créer le critère')
      }

      resetCreateForm()
      await loadCriteres()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdate(event: FormEvent) {
    event.preventDefault()
    if (!editingId) return
    setSubmitting(true)
    setError(null)
    try {
      const payload = {
        id: editForm.id.trim(),
        categorie: editForm.categorie,
        label_fr: editForm.label_fr.trim(),
        label_en: editForm.label_en.trim() || null,
        label_ar: editForm.label_ar.trim(),
        description_fr: editForm.description_fr.trim() || null,
        description_ar: editForm.description_ar.trim() || null,
      }

      const response = await fetch(`/api/admin/criteres/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(result?.error ?? 'Impossible de mettre à jour le critère')
      }

      resetEditForm()
      await loadCriteres()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce critère ?')) {
      return
    }
    setDeletingId(id)
    try {
      const response = await fetch(`/api/admin/criteres/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(result?.error ?? 'Suppression impossible')
      }
      if (editingId === id) {
        resetEditForm()
      }
      await loadCriteres()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header avec bouton Ajouter */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Gestion des critères</h2>
          <p className="text-gray-500">Liste et modification des critères d'évaluation</p>
        </div>
        <button
          onClick={() => {
            setShowCreateForm(!showCreateForm)
            if (showCreateForm) {
              resetCreateForm()
            } else {
              resetEditForm()
            }
          }}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          {showCreateForm ? 'Annuler' : '+ Ajouter un critère'}
        </button>
      </div>

      {error && (
        <div className="p-3 border border-red-200 bg-red-50 text-red-700 rounded">{error}</div>
      )}

      {/* Formulaire de création dans la page */}
      {showCreateForm && (
        <div className="bg-white shadow-lg rounded-lg p-6 border-2 border-green-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-green-700">Ajouter un critère</h3>
            <button
              onClick={resetCreateForm}
              className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
            >
              ✕ Fermer
            </button>
          </div>
          <form className="grid md:grid-cols-2 gap-4" onSubmit={handleCreate}>
            <div>
              <label className="block text-sm font-medium mb-1">Identifiant</label>
              <input
                type="text"
                value={createForm.id}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, id: e.target.value }))}
                className="w-full border rounded px-3 py-2"
                placeholder="ex: sifflet"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Catégorie</label>
              <select
                value={createForm.categorie}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, categorie: e.target.value as CritereDefinition['categorie'] }))
                }
                className="w-full border rounded px-3 py-2"
              >
                <option value="arbitre">Arbitre</option>
                <option value="assistant">Assistant</option>
                <option value="var">VAR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Label FR</label>
              <input
                type="text"
                value={createForm.label_fr}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, label_fr: e.target.value }))}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Label EN</label>
              <input
                type="text"
                value={createForm.label_en}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, label_en: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Label AR</label>
              <input
                type="text"
                value={createForm.label_ar}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, label_ar: e.target.value }))}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description FR</label>
              <textarea
                value={createForm.description_fr}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, description_fr: e.target.value }))}
                className="w-full border rounded px-3 py-2"
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description AR</label>
              <textarea
                value={createForm.description_ar}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, description_ar: e.target.value }))}
                className="w-full border rounded px-3 py-2"
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 disabled:opacity-60"
                disabled={submitting}
              >
                {submitting ? 'Création en cours...' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Layout principal : Liste à droite (col-8) et Formulaire de modification à gauche (col-4) */}
      <div className="grid grid-cols-12 gap-6">
        {/* Liste des critères à droite (col-8 ou col-12 si pas de formulaire) */}
        <div className={`${editingId ? 'col-span-12 md:col-span-8' : 'col-span-12'} bg-white shadow rounded-lg p-5`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Critères ({sortedCriteres.length})</h3>
            <button
              onClick={loadCriteres}
              className="text-sm text-blue-600 hover:underline disabled:opacity-50"
              disabled={loading}
            >
              Rafraîchir
            </button>
          </div>

          {loading ? (
            <p>Chargement...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b text-gray-500 uppercase text-xs tracking-wide">
                    <th className="p-2">ID</th>
                    <th className="p-2">Catégorie</th>
                    <th className="p-2">Label FR</th>
                    <th className="p-2">Label EN</th>
                    <th className="p-2">Label AR</th>
                    <th className="p-2" />
                  </tr>
                </thead>
                <tbody>
                  {sortedCriteres.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        Aucun critère
                      </td>
                    </tr>
                  ) : (
                    sortedCriteres.map((critere) => (
                      <tr
                        key={critere.id}
                        className={`border-b last:border-0 transition-colors cursor-pointer ${
                          editingId === critere.id
                            ? 'bg-blue-50 border-blue-200'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => startEdit(critere)}
                      >
                        <td className="p-3 font-mono text-xs">{critere.id}</td>
                        <td className="p-3">{categorieLabels[critere.categorie]}</td>
                        <td className="p-3 font-medium">{critere.label_fr}</td>
                        <td className="p-3">{critere.label_en || '—'}</td>
                        <td className="p-3">{critere.label_ar}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              startEdit(critere)
                            }}
                            className={`px-4 py-1.5 rounded text-xs font-medium transition-colors ${
                              editingId === critere.id
                                ? 'bg-blue-700 text-white'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {editingId === critere.id ? 'En cours...' : 'Modifier'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Formulaire de modification à gauche (col-4) */}
        {editingId && (
          <div className="col-span-12 md:col-span-4 bg-white shadow-lg rounded-lg p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-blue-700">Modifier le critère</h3>
              <button
                onClick={resetEditForm}
                className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
              >
                ✕ Fermer
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleUpdate}>
              <div>
                <label className="block text-sm font-medium mb-1">Identifiant</label>
                <input
                  type="text"
                  value={editForm.id}
                  className="w-full border rounded px-3 py-2 bg-gray-100"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Catégorie</label>
                <select
                  value={editForm.categorie}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, categorie: e.target.value as CritereDefinition['categorie'] }))
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="arbitre">Arbitre</option>
                  <option value="assistant">Assistant</option>
                  <option value="var">VAR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Label FR</label>
                <input
                  type="text"
                  value={editForm.label_fr}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, label_fr: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Label EN</label>
                <input
                  type="text"
                  value={editForm.label_en}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, label_en: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Label AR</label>
                <input
                  type="text"
                  value={editForm.label_ar}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, label_ar: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description FR</label>
                <textarea
                  value={editForm.description_fr}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description_fr: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description AR</label>
                <textarea
                  value={editForm.description_ar}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description_ar: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-60"
                  disabled={submitting}
                >
                  {submitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(editingId)}
                  className="px-4 py-2 bg-red-600 text-white rounded font-semibold hover:bg-red-700 disabled:opacity-60"
                  disabled={deletingId === editingId}
                >
                  {deletingId === editingId ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

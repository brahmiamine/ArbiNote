'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import type { CritereDefinition } from '@/types'

type FormState = {
  id: string
  categorie: CritereDefinition['categorie']
  label_fr: string
  label_ar: string
  description_fr: string
  description_ar: string
}

const defaultForm: FormState = {
  id: '',
  categorie: 'arbitre',
  label_fr: '',
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
  const [form, setForm] = useState<FormState>(defaultForm)
  const [editingId, setEditingId] = useState<string | null>(null)
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

  function resetForm() {
    setForm(defaultForm)
    setEditingId(null)
  }

  function startEdit(critere: CritereDefinition) {
    setEditingId(critere.id)
    setForm({
      id: critere.id,
      categorie: critere.categorie,
      label_fr: critere.label_fr,
      label_ar: critere.label_ar,
      description_fr: critere.description_fr ?? '',
      description_ar: critere.description_ar ?? '',
    })
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        id: form.id.trim(),
        categorie: form.categorie,
        label_fr: form.label_fr.trim(),
        label_ar: form.label_ar.trim(),
        description_fr: form.description_fr.trim() || null,
        description_ar: form.description_ar.trim() || null,
      }

      const url = editingId ? `/api/admin/criteres/${editingId}` : '/api/admin/criteres'
      const method = editingId ? 'PATCH' : 'POST'
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editingId ? payload : { ...payload, id: payload.id }),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(result?.error ?? 'Impossible de sauvegarder le critère')
      }

      resetForm()
      await loadCriteres()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
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
        resetForm()
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
      <header>
        <p className="text-sm text-gray-500 uppercase tracking-wide">Critères</p>
        <h1 className="text-3xl font-bold">Gestion des critères d’évaluation</h1>
        <p className="text-gray-500 mt-1">
          Créez, modifiez ou supprimez les critères utilisés pour noter les arbitres.
        </p>
      </header>

      {error && (
        <div className="p-3 border border-red-200 bg-red-50 text-red-700 rounded">{error}</div>
      )}

      <section className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {editingId ? `Modifier le critère "${editingId}"` : 'Nouveau critère'}
          </h2>
          {editingId && (
            <button
              type="button"
              className="text-sm text-gray-500 hover:underline"
              onClick={resetForm}
            >
              Annuler
            </button>
          )}
        </div>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Identifiant</label>
            <input
              type="text"
              value={form.id}
              onChange={(e) => setForm((prev) => ({ ...prev, id: e.target.value }))}
              className="w-full border rounded px-3 py-2"
              placeholder="ex: sifflet"
              required
              disabled={Boolean(editingId)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Catégorie</label>
            <select
              value={form.categorie}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, categorie: e.target.value as CritereDefinition['categorie'] }))
              }
              className="w-full border rounded px-3 py-2"
            >
              <option value="arbitre">Arbitre</option>
              <option value="assistant">Assistant</option>
              <option value="var">VAR</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Label FR</label>
            <input
              type="text"
              value={form.label_fr}
              onChange={(e) => setForm((prev) => ({ ...prev, label_fr: e.target.value }))}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Label AR</label>
            <input
              type="text"
              value={form.label_ar}
              onChange={(e) => setForm((prev) => ({ ...prev, label_ar: e.target.value }))}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Description FR</label>
            <textarea
              value={form.description_fr}
              onChange={(e) => setForm((prev) => ({ ...prev, description_fr: e.target.value }))}
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Description AR</label>
            <textarea
              value={form.description_ar}
              onChange={(e) => setForm((prev) => ({ ...prev, description_ar: e.target.value }))}
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
          </div>
          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Créer'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="px-4 py-2 border rounded hover:bg-gray-50">
                Annuler
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Critères existants</h2>
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
                  <th className="p-2">Label AR</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedCriteres.map((critere) => (
                  <tr key={critere.id} className="border-b last:border-0">
                    <td className="p-2 font-mono text-xs">{critere.id}</td>
                    <td className="p-2">{categorieLabels[critere.categorie]}</td>
                    <td className="p-2">{critere.label_fr}</td>
                    <td className="p-2">{critere.label_ar}</td>
                    <td className="p-2 flex gap-2">
                      <button
                        className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                        onClick={() => startEdit(critere)}
                      >
                        Modifier
                      </button>
                      <button
                        className="px-2 py-1 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50 disabled:opacity-50"
                        onClick={() => handleDelete(critere.id)}
                        disabled={deletingId === critere.id}
                      >
                        {deletingId === critere.id ? 'Suppression...' : 'Supprimer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}



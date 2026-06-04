'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, FolderOpen, Check, X } from 'lucide-react'

interface Category {
  id: string
  name: string
  description?: string
}

const inputClass = 'w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editCat, setEditCat] = useState<Category | null>(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    fetch('/api/admin/categories')
      .then(r => r.json())
      .then(setCategories)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditCat(null)
    setForm({ name: '', description: '' })
    setError('')
    setShowForm(true)
  }

  const openEdit = (c: Category) => {
    setEditCat(c)
    setForm({ name: c.name, description: c.description ?? '' })
    setError('')
    setShowForm(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const url = editCat ? `/api/admin/categories/${editCat.id}` : '/api/admin/categories'
      const method = editCat ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro ao salvar.'); return }
      setShowForm(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Excluir a categoria "${cat.name}"? As peças desta categoria não serão apagadas.`)) return
    setDeletingId(cat.id)
    try {
      await fetch(`/api/admin/categories/${cat.id}`, { method: 'DELETE' })
      load()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display flex items-center gap-3 text-3xl font-bold uppercase tracking-wide text-white">
            <FolderOpen className="h-7 w-7 text-orange-500" />
            Categorias
          </h1>
          <p className="mt-1 text-sm text-zinc-500">{categories.length} categoria(s) cadastrada(s)</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" />
          Nova Categoria
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80">
                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Nome</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Descrição</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-zinc-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-900">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-10 text-center text-zinc-600">
                    Nenhuma categoria cadastrada.
                  </td>
                </tr>
              ) : categories.map(cat => (
                <tr key={cat.id} className="transition hover:bg-zinc-800/50">
                  <td className="px-5 py-4">
                    <span className="font-semibold text-white">{cat.name}</span>
                  </td>
                  <td className="px-5 py-4 text-zinc-500">
                    {cat.description ?? <span className="text-zinc-700 italic">—</span>}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(cat)}
                        className="rounded-lg border border-zinc-700 p-1.5 text-zinc-400 transition hover:border-orange-500/50 hover:text-orange-400"
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        disabled={deletingId === cat.id}
                        className="rounded-lg border border-zinc-700 p-1.5 text-zinc-400 transition hover:border-red-500/50 hover:text-red-400 disabled:opacity-50"
                        title="Excluir"
                      >
                        {deletingId === cat.id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <Trash2 className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold uppercase tracking-wide text-white">
                {editCat ? 'Editar Categoria' : 'Nova Categoria'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-zinc-600 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">Nome *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required placeholder="Ex: Suspensão, Freios, Motor..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">Descrição</label>
                <input
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Ex: Discos, pastilhas, pinças..."
                  className={inputClass}
                />
              </div>
              {error && (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button" onClick={() => setShowForm(false)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-700 py-2.5 text-sm font-semibold text-zinc-400 hover:border-zinc-500"
                >
                  <X className="h-4 w-4" /> Cancelar
                </button>
                <button
                  type="submit" disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

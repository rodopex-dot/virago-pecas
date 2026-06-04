'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Loader2, Tag, ChevronRight, Search } from 'lucide-react'

interface Part {
  id: string
  name: string
  category: string
  description?: string
  _count: { compatibleParts: number }
}

interface Category { id: string; name: string }

const inputClass = 'w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
const selectClass = 'w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'

export default function AdminPartsPage() {
  const [parts, setParts] = useState<Part[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editPart, setEditPart] = useState<Part | null>(null)
  const [form, setForm] = useState({ name: '', category: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    Promise.all([
      fetch('/api/admin/parts').then(r => r.json()),
      fetch('/api/admin/categories').then(r => r.json()),
    ]).then(([partsData, catsData]) => {
      setParts(partsData)
      setCategories(catsData)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditPart(null)
    setForm({ name: '', category: categories[0]?.name ?? '', description: '' })
    setShowForm(true)
  }

  const openEdit = (p: Part) => {
    setEditPart(p)
    setForm({ name: p.name, category: p.category, description: p.description ?? '' })
    setShowForm(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editPart ? `/api/admin/parts/${editPart.id}` : '/api/admin/parts'
      const method = editPart ? 'PUT' : 'POST'
      await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      setShowForm(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta peça e todas as suas peças compatíveis?')) return
    setDeletingId(id)
    try {
      await fetch(`/api/admin/parts/${id}`, { method: 'DELETE' })
      load()
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = parts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-white">Peças</h1>
          <p className="mt-1 text-sm text-zinc-500">{parts.length} peça(s) cadastrada(s)</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" />
          Nova Peça
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="text" placeholder="Buscar por nome ou categoria..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 py-2.5 pl-11 pr-4 text-sm text-white placeholder-zinc-600 outline-none focus:border-orange-500"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80">
                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Peça</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Categoria</th>
                <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-zinc-500">Compatíveis</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-zinc-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-900">
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-zinc-600">Nenhuma peça encontrada.</td></tr>
              ) : filtered.map(part => (
                <tr key={part.id} className="transition hover:bg-zinc-800/50">
                  <td className="px-5 py-4">
                    <span className="font-medium text-white">{part.name}</span>
                    {part.description && (
                      <p className="mt-0.5 text-xs text-zinc-500 line-clamp-1">{part.description}</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300">
                      {part.category}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="font-bold text-orange-400">{part._count.compatibleParts}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/pecas/${part.id}`}
                        className="flex items-center gap-1 rounded-lg border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-400 transition hover:border-zinc-500 hover:text-white"
                      >
                        <Tag className="h-3 w-3" />
                        Compatíveis
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                      <button
                        onClick={() => openEdit(part)}
                        className="rounded-lg border border-zinc-700 p-1.5 text-zinc-400 transition hover:border-orange-500/50 hover:text-orange-400"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(part.id)}
                        disabled={deletingId === part.id}
                        className="rounded-lg border border-zinc-700 p-1.5 text-zinc-400 transition hover:border-red-500/50 hover:text-red-400 disabled:opacity-50"
                      >
                        {deletingId === part.id
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

      {/* Modal criar/editar */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
            <h2 className="font-display mb-5 text-xl font-bold uppercase tracking-wide text-white">
              {editPart ? 'Editar Peça' : 'Nova Peça'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">Nome *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required placeholder="Ex: Amortecedor Traseiro"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">Categoria *</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  required
                  className={selectClass}
                >
                  <option value="">Selecione uma categoria...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-zinc-600">
                  Gerencie as categorias em{' '}
                  <a href="/admin/categorias" className="text-orange-500 hover:underline">Admin → Categorias</a>
                </p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">Descrição</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} placeholder="Descrição opcional..."
                  className={inputClass}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl border border-zinc-700 py-2.5 text-sm font-semibold text-zinc-400 hover:border-zinc-500">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
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

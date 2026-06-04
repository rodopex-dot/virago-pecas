'use client'

import { useEffect, useState } from 'react'
import {
  BookOpen, Plus, Pencil, Trash2, Loader2, CheckCircle,
  AlertCircle, X, ToggleLeft, ToggleRight, ExternalLink, Save
} from 'lucide-react'

interface Manual {
  id: string
  title: string
  description?: string
  fileUrl: string
  category: string
  active: boolean
  createdAt: string
}

const CATEGORY_OPTIONS = ['Manual', 'Catálogo', 'Ficha Técnica', 'Outro']

function ManualModal({
  manual,
  onClose,
  onSave,
}: {
  manual?: Manual
  onClose: () => void
  onSave: (data: Partial<Manual>) => Promise<void>
}) {
  const [form, setForm] = useState({
    title:       manual?.title       ?? '',
    description: manual?.description ?? '',
    fileUrl:     manual?.fileUrl     ?? '',
    category:    manual?.category    ?? 'Manual',
    active:      manual?.active      ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.fileUrl.trim()) {
      setError('Título e URL são obrigatórios.')
      return
    }
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display font-bold uppercase tracking-wide text-white">
            {manual ? 'Editar Material' : 'Adicionar Material'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1 text-zinc-500 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">
              Categoria
            </label>
            <select
              value={form.category}
              onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500"
            >
              {CATEGORY_OPTIONS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">
              Título *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Ex: Manual de Serviço Yamaha Virago 250"
              required
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">
              Descrição (opcional)
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={2}
              placeholder="Breve descrição do conteúdo"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">
              URL do arquivo / link *
            </label>
            <input
              type="url"
              value={form.fileUrl}
              onChange={e => setForm(p => ({ ...p, fileUrl: e.target.value }))}
              placeholder="https://drive.google.com/... ou link direto do PDF"
              required
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
            <p className="mt-1 text-xs text-zinc-600">
              Pode ser Google Drive, Dropbox, link direto de PDF, etc.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white">Visível no site</p>
              <p className="text-xs text-zinc-500">Quando inativo, não aparece para os visitantes</p>
            </div>
            <button
              type="button"
              onClick={() => setForm(p => ({ ...p, active: !p.active }))}
              className="flex items-center gap-2"
            >
              {form.active ? (
                <><ToggleRight className="h-7 w-7 text-orange-500" /><span className="text-sm font-semibold text-orange-400">Ativo</span></>
              ) : (
                <><ToggleLeft className="h-7 w-7 text-zinc-600" /><span className="text-sm font-semibold text-zinc-500">Inativo</span></>
              )}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60"
            >
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Salvando...</> : <><Save className="h-4 w-4" />Salvar</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminManuaisPage() {
  const [manuals, setManuals] = useState<Manual[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; manual?: Manual }>({ open: false })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const showFeedback = (type: 'success' | 'error', msg: string) => {
    setFeedback({ type, msg })
    setTimeout(() => setFeedback(null), 3000)
  }

  useEffect(() => {
    fetch('/api/admin/manuals')
      .then(r => r.json())
      .then(setManuals)
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (data: Partial<Manual>) => {
    if (modal.manual) {
      // Editar
      const res = await fetch(`/api/admin/manuals/${modal.manual.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Erro ao atualizar.')
      const updated = await res.json()
      setManuals(prev => prev.map(m => m.id === updated.id ? updated : m))
      showFeedback('success', 'Material atualizado!')
    } else {
      // Criar
      const res = await fetch('/api/admin/manuals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Erro ao criar.')
      const created = await res.json()
      setManuals(prev => [...prev, created])
      showFeedback('success', 'Material adicionado!')
    }
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/manuals/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setManuals(prev => prev.filter(m => m.id !== id))
      setDeleteConfirm(null)
      showFeedback('success', 'Material excluído.')
    } else {
      showFeedback('error', 'Erro ao excluir.')
    }
  }

  const grouped = manuals.reduce<Record<string, Manual[]>>((acc, m) => {
    const cat = m.category || 'Outro'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(m)
    return acc
  }, {})

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display flex items-center gap-3 text-3xl font-bold uppercase tracking-wide text-white">
            <BookOpen className="h-7 w-7 text-orange-500" />
            Manuais e Catálogos
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Gerencie os materiais disponíveis para download no site.
          </p>
        </div>
        <button
          onClick={() => setModal({ open: true })}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" />
          Adicionar Material
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`mb-6 flex items-center gap-2 rounded-xl border px-4 py-3 ${
          feedback.type === 'success'
            ? 'border-green-500/30 bg-green-500/10 text-green-400'
            : 'border-red-500/30 bg-red-500/10 text-red-400'
        }`}>
          {feedback.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span className="text-sm">{feedback.msg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      ) : manuals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-700 p-16 text-center">
          <BookOpen className="mx-auto mb-4 h-10 w-10 text-zinc-700" />
          <p className="font-display font-bold uppercase tracking-wide text-zinc-600">Nenhum material cadastrado</p>
          <p className="mt-1 text-sm text-zinc-600">Clique em &ldquo;Adicionar Material&rdquo; para começar.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).sort().map(([cat, items]) => (
            <div key={cat}>
              <div className="mb-3 flex items-center gap-3">
                <span className="font-display text-xs font-bold uppercase tracking-widest text-orange-500">{cat}</span>
                <div className="h-px flex-1 bg-zinc-800" />
                <span className="text-xs text-zinc-600">{items.length} item(ns)</span>
              </div>
              <div className="space-y-2">
                {items.map(manual => (
                  <div
                    key={manual.id}
                    className={`flex items-center justify-between gap-4 rounded-xl border px-5 py-4 transition ${
                      manual.active ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-800 bg-zinc-900 opacity-50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white truncate">{manual.title}</p>
                        {!manual.active && (
                          <span className="shrink-0 rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500">
                            Inativo
                          </span>
                        )}
                      </div>
                      {manual.description && (
                        <p className="mt-0.5 truncate text-xs text-zinc-500">{manual.description}</p>
                      )}
                      <a
                        href={manual.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 flex items-center gap-1 text-[11px] text-zinc-600 hover:text-orange-500"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {manual.fileUrl.length > 60 ? manual.fileUrl.slice(0, 60) + '…' : manual.fileUrl}
                      </a>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        onClick={() => setModal({ open: true, manual })}
                        className="rounded-lg border border-zinc-700 p-1.5 text-zinc-500 hover:border-zinc-500 hover:text-white"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {deleteConfirm === manual.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(manual.id)}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(manual.id)}
                          className="rounded-lg border border-zinc-700 p-1.5 text-zinc-500 hover:border-red-500/50 hover:text-red-400"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <ManualModal
          manual={modal.manual}
          onClose={() => setModal({ open: false })}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

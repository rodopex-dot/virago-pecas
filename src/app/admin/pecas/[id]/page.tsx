'use client'

import { useEffect, useState, use, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Plus, Pencil, Trash2, Loader2,
  CheckCircle, AlertTriangle, AlertOctagon,
  Image as ImageIcon, RefreshCw, X, Images,
} from 'lucide-react'

interface Video { id: string; url: string; platform: string; title?: string }
interface CompatiblePart {
  id: string; name: string; brand?: string; partNumber?: string
  price?: number; purchaseLink: string; imageUrl?: string
  compatibilityLevel: string; adaptationText?: string; notes?: string; videos: Video[]
}
interface Part {
  id: string; name: string; category: string; description?: string
  compatibleParts: CompatiblePart[]
}

const LEVELS = ['ENCAIXE_PERFEITO', 'ADAPTACAO_SIMPLES', 'ADAPTACAO_COMPLEXA'] as const
const levelLabel: Record<string, { label: string; icon: typeof CheckCircle; color: string }> = {
  ENCAIXE_PERFEITO:   { label: 'Encaixe Perfeito',  icon: CheckCircle,   color: 'text-green-400' },
  ADAPTACAO_SIMPLES:  { label: 'Adaptação Simples',  icon: AlertTriangle, color: 'text-yellow-400' },
  ADAPTACAO_COMPLEXA: { label: 'Adaptação Complexa', icon: AlertOctagon,  color: 'text-red-400' },
}
const inputClass = 'w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
const emptyForm = {
  name: '', brand: '', partNumber: '', price: '', purchaseLink: '',
  compatibilityLevel: 'ENCAIXE_PERFEITO', adaptationText: '', notes: '', videoLinks: '', imageUrl: '',
}

export default function PartDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [part, setPart] = useState<Part | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editCp, setEditCp] = useState<CompatiblePart | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [fetchingImage, setFetchingImage] = useState(false)
  const [imageError, setImageError] = useState('')
  const [batchLoading, setBatchLoading] = useState(false)
  const [batchResult, setBatchResult] = useState<{ updated: number; failed: number; total: number } | null>(null)

  const load = useCallback(() => {
    fetch(`/api/admin/parts/${id}`).then(r => r.json()).then(setPart).finally(() => setLoading(false))
  }, [id])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditCp(null); setForm(emptyForm); setImageError(''); setShowForm(true) }
  const openEdit = (cp: CompatiblePart) => {
    setEditCp(cp)
    setForm({
      name: cp.name, brand: cp.brand ?? '', partNumber: cp.partNumber ?? '',
      price: cp.price?.toString() ?? '', purchaseLink: cp.purchaseLink,
      compatibilityLevel: cp.compatibilityLevel,
      adaptationText: cp.adaptationText ?? '', notes: cp.notes ?? '',
      videoLinks: cp.videos.map(v => v.url).join('\n'),
      imageUrl: cp.imageUrl ?? '',
    })
    setImageError('')
    setShowForm(true)
  }

  // Auto-busca imagem+preço ao sair do campo de link (só se algum campo estiver vazio)
  const handleUrlBlur = async () => {
    if (!form.purchaseLink.startsWith('http')) return
    if (form.imageUrl && form.price) return // já tem tudo, não rebusca
    await doFetchImage(form.purchaseLink)
  }

  const doFetchImage = async (url: string) => {
    if (!url.startsWith('http')) return
    setFetchingImage(true)
    setImageError('')
    try {
      const res = await fetch('/api/admin/fetch-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (res.ok) {
        setForm(f => ({
          ...f,
          imageUrl: data.imageUrl ?? f.imageUrl,
          price: data.price != null && !f.price ? String(data.price) : f.price,
        }))
      } else {
        setImageError(data.error ?? 'Dados não encontrados.')
      }
    } finally {
      setFetchingImage(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      const url = editCp
        ? `/api/admin/parts/${id}/compatible/${editCp.id}`
        : `/api/admin/parts/${id}/compatible`
      const method = editCp ? 'PUT' : 'POST'
      await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      setShowForm(false); load()
    } finally { setSaving(false) }
  }

  const handleDelete = async (cpId: string) => {
    if (!confirm('Excluir esta peça compatível?')) return
    setDeletingId(cpId)
    await fetch(`/api/admin/parts/${id}/compatible/${cpId}`, { method: 'DELETE' })
    setDeletingId(null); load()
  }

  const handleBatchFetch = async () => {
    if (!confirm('Buscar imagens para todas as peças sem imagem? Pode demorar alguns segundos.')) return
    setBatchLoading(true); setBatchResult(null)
    try {
      const res = await fetch('/api/admin/fetch-all-images', { method: 'POST' })
      const data = await res.json()
      setBatchResult(data)
      load()
    } finally { setBatchLoading(false) }
  }

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
    </div>
  )
  if (!part) return <div className="p-8 text-zinc-500">Peça não encontrada.</div>

  const withoutImage = part.compatibleParts.filter(cp => !cp.imageUrl).length

  return (
    <div className="p-8">
      <Link href="/admin/pecas" className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-orange-400">
        <ArrowLeft className="h-4 w-4" /> Voltar para Peças
      </Link>

      {/* Cabeçalho */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="mb-1 inline-block rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400">
            {part.category}
          </span>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-white">{part.name}</h1>
        </div>
        <div className="flex gap-2">
          {withoutImage > 0 && (
            <button
              onClick={handleBatchFetch} disabled={batchLoading}
              className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2.5 text-sm font-semibold text-blue-400 hover:bg-blue-500/20 disabled:opacity-50"
            >
              {batchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Images className="h-4 w-4" />}
              Buscar {withoutImage} imagem(ns)
            </button>
          )}
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-600"
          >
            <Plus className="h-4 w-4" /> Adicionar Compatível
          </button>
        </div>
      </div>

      {/* Resultado do batch */}
      {batchResult && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3">
          <p className="text-sm text-blue-300">
            ✅ {batchResult.updated} imagem(ns) encontrada(s) · ❌ {batchResult.failed} não encontrada(s) de {batchResult.total} peças
          </p>
          <button onClick={() => setBatchResult(null)}><X className="h-4 w-4 text-blue-400" /></button>
        </div>
      )}

      {/* Lista de compatíveis */}
      {part.compatibleParts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 py-12 text-center text-zinc-600">
          Nenhuma peça compatível cadastrada.
        </div>
      ) : (
        <div className="space-y-3">
          {part.compatibleParts.map(cp => {
            const lvl = levelLabel[cp.compatibilityLevel]
            const Icon = lvl.icon
            return (
              <div key={cp.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                <div className="flex items-start gap-4">
                  {/* Imagem do produto */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-800">
                    {cp.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cp.imageUrl} alt={cp.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-zinc-600" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-white">{cp.name}</h3>
                      {cp.brand && <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">{cp.brand}</span>}
                    </div>
                    <div className={`mt-1 flex items-center gap-1 text-xs ${lvl.color}`}>
                      <Icon className="h-3 w-3" />{lvl.label}
                    </div>
                    {cp.price && <p className="mt-1 text-sm font-bold text-green-400">
                      {cp.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>}
                    {!cp.imageUrl && (
                      <button
                        onClick={() => doFetchImage(cp.purchaseLink)}
                        className="mt-2 flex items-center gap-1 text-xs text-zinc-500 hover:text-orange-400"
                      >
                        <RefreshCw className="h-3 w-3" /> Buscar imagem
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(cp)}
                      className="rounded-lg border border-zinc-700 p-1.5 text-zinc-400 hover:border-orange-500/50 hover:text-orange-400">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(cp.id)} disabled={deletingId === cp.id}
                      className="rounded-lg border border-zinc-700 p-1.5 text-zinc-400 hover:border-red-500/50 hover:text-red-400 disabled:opacity-50">
                      {deletingId === cp.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal criar/editar */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
            <h2 className="font-display mb-5 text-xl font-bold uppercase tracking-wide text-white">
              {editCp ? 'Editar Peça Compatível' : 'Nova Peça Compatível'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">Nome *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required placeholder="Nome da peça" className={inputClass} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">Marca</label>
                  <input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                    placeholder="Ex: Cofap" className={inputClass} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">Código</label>
                  <input value={form.partNumber} onChange={e => setForm(f => ({ ...f, partNumber: e.target.value }))}
                    placeholder="Ex: CF-300" className={inputClass} />
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Preço (R$)</label>
                    <button
                      type="button"
                      onClick={() => doFetchImage(form.purchaseLink)}
                      disabled={fetchingImage || !form.purchaseLink}
                      className="flex items-center gap-1 text-xs text-zinc-500 hover:text-orange-400 disabled:opacity-40"
                    >
                      {fetchingImage ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                      {fetchingImage ? 'Buscando...' : 'Buscar do link'}
                    </button>
                  </div>
                  <input type="number" step="0.01" value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="0.00" className={inputClass} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">Link de Compra</label>
                  <input type="url" value={form.purchaseLink}
                    onChange={e => setForm(f => ({ ...f, purchaseLink: e.target.value }))}
                    onBlur={handleUrlBlur}
                    placeholder="https://... (opcional)" className={inputClass} />
                </div>
              </div>

              {/* Preview da imagem */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                    Imagem do Produto
                  </label>
                  <button
                    type="button"
                    onClick={() => doFetchImage(form.purchaseLink)}
                    disabled={fetchingImage || !form.purchaseLink}
                    className="flex items-center gap-1 text-xs text-zinc-500 hover:text-orange-400 disabled:opacity-40"
                  >
                    {fetchingImage
                      ? <Loader2 className="h-3 w-3 animate-spin" />
                      : <RefreshCw className="h-3 w-3" />}
                    {fetchingImage ? 'Buscando...' : 'Buscar do link'}
                  </button>
                </div>

                {form.imageUrl ? (
                  <div className="relative overflow-hidden rounded-xl border border-zinc-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.imageUrl} alt="Preview" className="h-40 w-full object-contain bg-zinc-800" />
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, imageUrl: '' }))}
                      className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-800/50">
                    {fetchingImage
                      ? <Loader2 className="h-5 w-5 animate-spin text-orange-400" />
                      : <div className="text-center">
                          <ImageIcon className="mx-auto mb-1 h-6 w-6 text-zinc-600" />
                          <p className="text-xs text-zinc-600">Auto-detectada ao colar o link</p>
                        </div>
                    }
                  </div>
                )}
                {imageError && <p className="mt-1 text-xs text-yellow-500">{imageError}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">Nível *</label>
                <select value={form.compatibilityLevel}
                  onChange={e => setForm(f => ({ ...f, compatibilityLevel: e.target.value }))}
                  className={inputClass}>
                  {LEVELS.map(l => <option key={l} value={l}>{levelLabel[l].label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">Notas</label>
                <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Obs. rápida" className={inputClass} />
              </div>
              {(form.compatibilityLevel === 'ADAPTACAO_SIMPLES' || form.compatibilityLevel === 'ADAPTACAO_COMPLEXA') && (
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">Texto de adaptação</label>
                  <textarea rows={4} value={form.adaptationText}
                    onChange={e => setForm(f => ({ ...f, adaptationText: e.target.value }))}
                    placeholder="Descreva o processo..." className={inputClass} />
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">Links de vídeos (um por linha)</label>
                <textarea rows={2} value={form.videoLinks}
                  onChange={e => setForm(f => ({ ...f, videoLinks: e.target.value }))}
                  placeholder={"https://youtube.com/...\nhttps://instagram.com/..."} className={inputClass} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl border border-zinc-700 py-2.5 text-sm font-semibold text-zinc-400 hover:border-zinc-500">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
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

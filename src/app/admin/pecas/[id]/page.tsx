'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react'

interface Video { id: string; url: string; platform: string; title?: string }
interface CompatiblePart {
  id: string; name: string; brand?: string; partNumber?: string
  price?: number; purchaseLink: string; compatibilityLevel: string
  adaptationText?: string; notes?: string; videos: Video[]
}
interface Part {
  id: string; name: string; category: string; description?: string
  compatibleParts: CompatiblePart[]
}

const LEVELS = ['ENCAIXE_PERFEITO','ADAPTACAO_SIMPLES','ADAPTACAO_COMPLEXA'] as const
const levelLabel: Record<string, { label: string; icon: typeof CheckCircle; color: string }> = {
  ENCAIXE_PERFEITO:  { label: 'Encaixe Perfeito', icon: CheckCircle,  color: 'text-green-400' },
  ADAPTACAO_SIMPLES: { label: 'Adaptação Simples', icon: AlertTriangle, color: 'text-yellow-400' },
  ADAPTACAO_COMPLEXA:{ label: 'Adaptação Complexa', icon: AlertOctagon,  color: 'text-red-400' },
}
const inputClass = 'w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'

const emptyForm = {
  name: '', brand: '', partNumber: '', price: '', purchaseLink: '',
  compatibilityLevel: 'ENCAIXE_PERFEITO', adaptationText: '', notes: '', videoLinks: '',
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

  const load = () => {
    fetch(`/api/admin/parts/${id}`).then(r => r.json()).then(setPart).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [id])

  const openCreate = () => { setEditCp(null); setForm(emptyForm); setShowForm(true) }
  const openEdit = (cp: CompatiblePart) => {
    setEditCp(cp)
    setForm({
      name: cp.name, brand: cp.brand ?? '', partNumber: cp.partNumber ?? '',
      price: cp.price?.toString() ?? '', purchaseLink: cp.purchaseLink,
      compatibilityLevel: cp.compatibilityLevel,
      adaptationText: cp.adaptationText ?? '', notes: cp.notes ?? '',
      videoLinks: cp.videos.map(v => v.url).join('\n'),
    })
    setShowForm(true)
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

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
    </div>
  )
  if (!part) return <div className="p-8 text-zinc-500">Peça não encontrada.</div>

  return (
    <div className="p-8">
      <Link href="/admin/pecas" className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-orange-400">
        <ArrowLeft className="h-4 w-4" /> Voltar para Peças
      </Link>

      {/* Cabeçalho */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <span className="mb-1 inline-block rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400">
            {part.category}
          </span>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-white">{part.name}</h1>
          {part.description && <p className="mt-1 text-sm text-zinc-500">{part.description}</p>}
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-600">
          <Plus className="h-4 w-4" /> Adicionar Compatível
        </button>
      </div>

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
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-white">{cp.name}</h3>
                      {cp.brand && <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">{cp.brand}</span>}
                      {cp.partNumber && <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 font-mono text-xs text-zinc-400">#{cp.partNumber}</span>}
                    </div>
                    <div className={`mt-1 flex items-center gap-1 text-xs ${lvl.color}`}>
                      <Icon className="h-3 w-3" />{lvl.label}
                    </div>
                    {cp.price && <p className="mt-1 text-sm font-bold text-green-400">
                      {cp.price.toLocaleString('pt-BR', { style:'currency', currency:'BRL' })}
                    </p>}
                    {cp.notes && <p className="mt-1 text-xs text-zinc-500">{cp.notes}</p>}
                    {cp.adaptationText && (
                      <p className="mt-2 rounded-lg border border-zinc-800 bg-zinc-800/50 p-3 text-xs text-zinc-400">
                        {cp.adaptationText}
                      </p>
                    )}
                    {cp.videos.length > 0 && (
                      <p className="mt-1 text-xs text-zinc-600">{cp.videos.length} vídeo(s)</p>
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

      {/* Modal */}
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
                  <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} required placeholder="Nome da peça" className={inputClass}/>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">Marca</label>
                  <input value={form.brand} onChange={e => setForm(f=>({...f,brand:e.target.value}))} placeholder="Ex: Cofap" className={inputClass}/>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">Código</label>
                  <input value={form.partNumber} onChange={e => setForm(f=>({...f,partNumber:e.target.value}))} placeholder="Ex: CF-300" className={inputClass}/>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">Preço (R$)</label>
                  <input type="number" step="0.01" value={form.price} onChange={e => setForm(f=>({...f,price:e.target.value}))} placeholder="0.00" className={inputClass}/>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">Link de Compra *</label>
                  <input type="url" value={form.purchaseLink} onChange={e => setForm(f=>({...f,purchaseLink:e.target.value}))} required placeholder="https://..." className={inputClass}/>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">Nível de Compatibilidade *</label>
                <select value={form.compatibilityLevel} onChange={e => setForm(f=>({...f,compatibilityLevel:e.target.value}))} className={inputClass}>
                  {LEVELS.map(l => <option key={l} value={l}>{levelLabel[l].label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">Notas</label>
                <input value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} placeholder="Obs. rápida" className={inputClass}/>
              </div>
              {(form.compatibilityLevel === 'ADAPTACAO_SIMPLES' || form.compatibilityLevel === 'ADAPTACAO_COMPLEXA') && (
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">Texto de adaptação</label>
                  <textarea rows={4} value={form.adaptationText} onChange={e => setForm(f=>({...f,adaptationText:e.target.value}))} placeholder="Descreva o processo de adaptação..." className={inputClass}/>
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">Links de vídeos (um por linha)</label>
                <textarea rows={3} value={form.videoLinks} onChange={e => setForm(f=>({...f,videoLinks:e.target.value}))} placeholder={"https://youtube.com/...\nhttps://instagram.com/..."} className={inputClass}/>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl border border-zinc-700 py-2.5 text-sm font-semibold text-zinc-400 hover:border-zinc-500">Cancelar</button>
                <button type="submit" disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50">
                  {saving && <Loader2 className="h-4 w-4 animate-spin"/>}
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

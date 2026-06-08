'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Image as ImageIcon, Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  Save, Loader2, CheckCircle, X, ExternalLink, Upload, Link2,
  AlertTriangle,
} from 'lucide-react'

interface Banner {
  id: string
  name: string
  imageUrl: string
  linkUrl?: string | null
  altText?: string | null
  location: string
  width?: number | null
  height?: number | null
  active: boolean
  order: number
}

const LOCATIONS: { value: string; label: string; hint: string }[] = [
  { value: 'topo',         label: 'Topo da página',               hint: 'Acima do header — aparece em todas as páginas' },
  { value: 'home-topo',    label: 'Home — acima dos resultados',  hint: 'No início da listagem de peças' },
  { value: 'home-meio',    label: 'Home — entre resultados',      hint: 'No meio da listagem de peças' },
  { value: 'home-rodape',  label: 'Home — abaixo dos resultados', hint: 'Ao final da listagem de peças' },
  { value: 'peca-topo',    label: 'Página de peça — topo',        hint: 'Acima do conteúdo da peça' },
  { value: 'peca-rodape',  label: 'Página de peça — rodapé',      hint: 'Abaixo do conteúdo da peça' },
  { value: 'sidebar',      label: 'Barra lateral',                hint: 'Lateral direita (onde disponível)' },
  { value: 'rodape',       label: 'Rodapé do site',               hint: 'Acima do rodapé global' },
]

const SIZE_PRESETS = [
  { label: 'Leaderboard — 728×90',        width: 728,  height: 90  },
  { label: 'Medium Rectangle — 300×250',  width: 300,  height: 250 },
  { label: 'Large Rectangle — 336×280',   width: 336,  height: 280 },
  { label: 'Half Page — 300×600',         width: 300,  height: 600 },
  { label: 'Mobile Banner — 320×50',      width: 320,  height: 50  },
  { label: 'Mobile Leaderboard — 320×100',width: 320,  height: 100 },
  { label: 'Billboard — 970×250',         width: 970,  height: 250 },
  { label: 'Square — 250×250',            width: 250,  height: 250 },
  { label: 'Personalizado',               width: null, height: null },
]

const locationLabel = (v: string) => LOCATIONS.find(l => l.value === v)?.label ?? v

const EMPTY_FORM = {
  name: '', imageUrl: '', imagePreview: '', imageMode: 'upload' as 'upload' | 'url',
  linkUrl: '', altText: '', location: 'home-topo',
  sizePreset: 'Leaderboard — 728×90', width: 728, height: 90,
  active: true, order: 0,
}

export default function BannersSection() {
  const [banners, setBanners]     = useState<Banner[]>([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [editId, setEditId]       = useState<string | null>(null)
  const [saving, setSaving]       = useState(false)
  const [deleting, setDeleting]   = useState<string | null>(null)
  const [form, setForm]           = useState({ ...EMPTY_FORM })
  const fileRef                   = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/admin/banners')
      .then(r => r.json())
      .then(setBanners)
      .finally(() => setLoading(false))
  }, [])

  const setField = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const handlePreset = (label: string) => {
    const p = SIZE_PRESETS.find(s => s.label === label)
    if (!p) return
    setField('sizePreset', label)
    if (p.width !== null) { setField('width', p.width); setField('height', p.height!) }
  }

  const handleFile = (file: File | null) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => {
      const b64 = e.target?.result as string
      setForm(f => ({ ...f, imageUrl: b64, imagePreview: b64 }))
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleFile(e.dataTransfer.files[0] ?? null)
  }

  const openCreate = () => {
    setEditId(null)
    setForm({ ...EMPTY_FORM })
    setShowForm(true)
  }

  const openEdit = (b: Banner) => {
    const presetMatch = SIZE_PRESETS.find(p => p.width === b.width && p.height === b.height)
    setEditId(b.id)
    setForm({
      name: b.name,
      imageUrl: b.imageUrl,
      imagePreview: b.imageUrl,
      imageMode: b.imageUrl.startsWith('data:') ? 'upload' : 'url',
      linkUrl: b.linkUrl ?? '',
      altText: b.altText ?? '',
      location: b.location,
      sizePreset: presetMatch?.label ?? 'Personalizado',
      width:  b.width  ?? 728,
      height: b.height ?? 90,
      active: b.active,
      order:  b.order,
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.imageUrl.trim()) return
    setSaving(true)

    const payload = {
      name:     form.name.trim(),
      imageUrl: form.imageUrl.trim(),
      linkUrl:  form.linkUrl.trim() || null,
      altText:  form.altText.trim() || null,
      location: form.location,
      width:    form.sizePreset === 'Personalizado' ? (form.width || null) : SIZE_PRESETS.find(p => p.label === form.sizePreset)?.width ?? null,
      height:   form.sizePreset === 'Personalizado' ? (form.height || null) : SIZE_PRESETS.find(p => p.label === form.sizePreset)?.height ?? null,
      active:   form.active,
      order:    form.order,
    }

    const url    = editId ? `/api/admin/banners/${editId}` : '/api/admin/banners'
    const method = editId ? 'PUT' : 'POST'
    const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })

    if (res.ok) {
      const saved = await res.json()
      if (editId) setBanners(prev => prev.map(b => b.id === editId ? saved : b))
      else        setBanners(prev => [...prev, saved])
      setShowForm(false)
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este banner? Essa ação não pode ser desfeita.')) return
    setDeleting(id)
    const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' })
    if (res.ok) setBanners(prev => prev.filter(b => b.id !== id))
    setDeleting(null)
  }

  const handleToggleActive = async (b: Banner) => {
    const res = await fetch(`/api/admin/banners/${b.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !b.active }),
    })
    if (res.ok) setBanners(prev => prev.map(x => x.id === b.id ? { ...x, active: !x.active } : x))
  }

  const isCustomSize = form.sizePreset === 'Personalizado'

  return (
    <div>
      {/* Header da seção */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display flex items-center gap-2 text-xl font-bold uppercase tracking-wide text-white">
            <ImageIcon className="h-5 w-5 text-orange-500" />
            Banners Particulares
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Banners de imagem próprios — configure localização, tamanho e link de destino.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" />
          Novo Banner
        </button>
      </div>

      {/* Formulário de criação/edição */}
      {showForm && (
        <div className="mb-6 rounded-2xl border border-orange-500/30 bg-zinc-900 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-semibold text-white">{editId ? 'Editar Banner' : 'Novo Banner'}</h3>
            <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-zinc-300">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">Nome do banner</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setField('name', e.target.value)}
                placeholder="ex: Parceiro XYZ — Janeiro 2025"
                required
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            {/* Imagem */}
            <div>
              <div className="mb-2 flex items-center gap-3">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Imagem</label>
                <div className="flex rounded-lg border border-zinc-700 p-0.5">
                  <button type="button" onClick={() => setField('imageMode', 'upload')}
                    className={`rounded-md px-3 py-1 text-xs font-semibold transition ${form.imageMode === 'upload' ? 'bg-orange-500 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                    <Upload className="mr-1 inline h-3 w-3" />Upload
                  </button>
                  <button type="button" onClick={() => setField('imageMode', 'url')}
                    className={`rounded-md px-3 py-1 text-xs font-semibold transition ${form.imageMode === 'url' ? 'bg-orange-500 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                    <Link2 className="mr-1 inline h-3 w-3" />URL
                  </button>
                </div>
              </div>

              {form.imageMode === 'upload' ? (
                <div
                  className="relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-800/50 p-6 transition hover:border-orange-500/50"
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => fileRef.current?.click()}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => handleFile(e.target.files?.[0] ?? null)}
                  />
                  {form.imagePreview && form.imageUrl.startsWith('data:') ? (
                    <img src={form.imagePreview} alt="preview" className="max-h-32 max-w-full rounded-lg object-contain" />
                  ) : (
                    <>
                      <Upload className="mb-2 h-8 w-8 text-zinc-600" />
                      <p className="text-sm text-zinc-500">Clique ou arraste uma imagem</p>
                      <p className="mt-1 text-xs text-zinc-600">PNG, JPG, WebP, GIF — recomendado: até 500 KB</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="url"
                    value={form.imageMode === 'url' ? form.imageUrl : ''}
                    onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value, imagePreview: e.target.value }))}
                    placeholder="https://exemplo.com/banner.jpg"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                  {form.imagePreview && !form.imagePreview.startsWith('data:') && (
                    <img src={form.imagePreview} alt="preview" className="max-h-24 rounded-lg object-contain" onError={() => setField('imagePreview', '')} />
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Localização */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">Localização</label>
                <select
                  value={form.location}
                  onChange={e => setField('location', e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500"
                >
                  {LOCATIONS.map(l => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-zinc-600">
                  {LOCATIONS.find(l => l.value === form.location)?.hint}
                </p>
              </div>

              {/* Tamanho */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">Tamanho</label>
                <select
                  value={form.sizePreset}
                  onChange={e => handlePreset(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500"
                >
                  {SIZE_PRESETS.map(s => (
                    <option key={s.label} value={s.label}>{s.label}</option>
                  ))}
                </select>
                {isCustomSize && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="number"
                      value={form.width}
                      onChange={e => setField('width', Number(e.target.value))}
                      placeholder="Largura (px)"
                      min={1}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                    />
                    <span className="flex items-center text-zinc-600">×</span>
                    <input
                      type="number"
                      value={form.height}
                      onChange={e => setField('height', Number(e.target.value))}
                      placeholder="Altura (px)"
                      min={1}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Link de destino */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-zinc-500">
                  <ExternalLink className="h-3.5 w-3.5" /> Link de destino
                </label>
                <input
                  type="url"
                  value={form.linkUrl}
                  onChange={e => setField('linkUrl', e.target.value)}
                  placeholder="https://parceiro.com.br (opcional)"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              {/* Texto alternativo */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">Texto alternativo (alt)</label>
                <input
                  type="text"
                  value={form.altText}
                  onChange={e => setField('altText', e.target.value)}
                  placeholder="Descrição do banner para acessibilidade"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Ordem */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Ordem</label>
                <input
                  type="number"
                  value={form.order}
                  onChange={e => setField('order', Number(e.target.value))}
                  min={0}
                  className="w-20 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-center text-sm text-white outline-none focus:border-orange-500"
                />
                <span className="text-xs text-zinc-600">menor = primeiro</span>
              </div>

              {/* Ativo */}
              <button type="button" onClick={() => setField('active', !form.active)} className="flex items-center gap-2 text-sm font-semibold">
                {form.active
                  ? <><ToggleRight className="h-7 w-7 text-orange-500" /><span className="text-orange-400">Ativo</span></>
                  : <><ToggleLeft className="h-7 w-7 text-zinc-600" /><span className="text-zinc-500">Inativo</span></>
                }
              </button>
            </div>

            {/* Aviso imagem faltando */}
            {!form.imageUrl && (
              <div className="flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
                <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-400" />
                <p className="text-xs text-yellow-300">Faça upload de uma imagem ou informe a URL.</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 border-t border-zinc-800 pt-4">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-400 hover:border-zinc-500 hover:text-zinc-200">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || !form.name.trim() || !form.imageUrl.trim()}
                className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50"
              >
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Salvando...</>
                : <><Save className="h-4 w-4" />{editId ? 'Salvar alterações' : 'Criar banner'}</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de banners */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      ) : banners.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/50 py-16 text-center">
          <ImageIcon className="mx-auto mb-3 h-10 w-10 text-zinc-700" />
          <p className="text-sm font-semibold text-zinc-500">Nenhum banner cadastrado</p>
          <p className="mt-1 text-xs text-zinc-600">Clique em "Novo Banner" para criar o primeiro.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map(banner => (
            <div
              key={banner.id}
              className={`flex items-center gap-4 rounded-2xl border bg-zinc-900 p-4 transition-all ${
                banner.active ? 'border-zinc-700' : 'border-zinc-800 opacity-60'
              }`}
            >
              {/* Preview da imagem */}
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={banner.imageUrl}
                  alt={banner.altText ?? banner.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-white truncate">{banner.name}</span>
                  {banner.active
                    ? <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-400">Ativo</span>
                    : <span className="rounded-full bg-zinc-700/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Inativo</span>
                  }
                </div>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-zinc-500">
                  <span>📍 {locationLabel(banner.location)}</span>
                  {banner.width && banner.height && (
                    <span>📐 {banner.width}×{banner.height}</span>
                  )}
                  {banner.linkUrl && (
                    <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300">
                      <ExternalLink className="h-3 w-3" />
                      {new URL(banner.linkUrl).hostname}
                    </a>
                  )}
                  <span>Ordem: {banner.order}</span>
                </div>
              </div>

              {/* Ações */}
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => handleToggleActive(banner)}
                  title={banner.active ? 'Desativar' : 'Ativar'}
                  className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                >
                  {banner.active
                    ? <ToggleRight className="h-5 w-5 text-orange-500" />
                    : <ToggleLeft className="h-5 w-5" />
                  }
                </button>
                <button
                  onClick={() => openEdit(banner)}
                  title="Editar"
                  className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  disabled={deleting === banner.id}
                  title="Excluir"
                  className="rounded-lg p-2 text-zinc-500 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                >
                  {deleting === banner.id
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Trash2 className="h-4 w-4" />
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dica de uso */}
      {banners.length > 0 && (
        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-600">Como exibir no site</p>
          <p className="text-xs text-zinc-500">
            Use o componente <code className="rounded bg-zinc-800 px-1 text-zinc-400">{'<BannerZone location="..."  />'}</code> nas páginas.
            Localizações disponíveis:
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {LOCATIONS.map(l => (
              <code key={l.value} className="rounded bg-zinc-800 px-2 py-0.5 text-[11px] text-orange-400">{l.value}</code>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

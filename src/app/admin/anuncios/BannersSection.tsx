'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Image as ImageIcon, Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  Save, Loader2, X, ExternalLink, Upload, Link2, AlertTriangle, CheckSquare,
} from 'lucide-react'
import { BANNER_LOCATIONS } from '@/lib/bannerLocations'

interface Banner {
  id: string
  name: string
  imageUrl: string
  linkUrl?: string | null
  altText?: string | null
  locations: string[]
  active: boolean
  order: number
}

const EMPTY_FORM = {
  name:       '',
  imageUrl:   '',
  imagePreview: '',
  imageMode:  'upload' as 'upload' | 'url',
  linkUrl:    '',
  altText:    '',
  locations:  [] as string[],
  active:     true,
  order:      0,
}

export default function BannersSection() {
  const [banners, setBanners]   = useState<Banner[]>([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId]     = useState<string | null>(null)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [form, setForm]         = useState({ ...EMPTY_FORM })
  const fileRef                 = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/admin/banners')
      .then(r => r.json())
      .then(setBanners)
      .finally(() => setLoading(false))
  }, [])

  const setField = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const toggleLocation = (loc: string) =>
    setField('locations', form.locations.includes(loc)
      ? form.locations.filter(l => l !== loc)
      : [...form.locations, loc]
    )

  const handleFile = (file: File | null) => {
    if (!file?.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => {
      const b64 = e.target?.result as string
      setForm(f => ({ ...f, imageUrl: b64, imagePreview: b64 }))
    }
    reader.readAsDataURL(file)
  }

  const openCreate = () => {
    setEditId(null)
    setForm({ ...EMPTY_FORM })
    setShowForm(true)
  }

  const openEdit = (b: Banner) => {
    setEditId(b.id)
    setForm({
      name:         b.name,
      imageUrl:     b.imageUrl,
      imagePreview: b.imageUrl,
      imageMode:    b.imageUrl.startsWith('data:') ? 'upload' : 'url',
      linkUrl:      b.linkUrl  ?? '',
      altText:      b.altText  ?? '',
      locations:    b.locations,
      active:       b.active,
      order:        b.order,
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.imageUrl.trim() || !form.locations.length) return
    setSaving(true)

    const payload = {
      name:      form.name.trim(),
      imageUrl:  form.imageUrl.trim(),
      linkUrl:   form.linkUrl.trim() || null,
      altText:   form.altText.trim() || null,
      locations: form.locations,
      active:    form.active,
      order:     form.order,
    }

    const url    = editId ? `/api/admin/banners/${editId}` : '/api/admin/banners'
    const method = editId ? 'PUT' : 'POST'
    const res    = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      const saved = await res.json()
      setBanners(prev =>
        editId ? prev.map(b => b.id === editId ? saved : b) : [...prev, saved]
      )
      setShowForm(false)
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este banner? Não pode ser desfeito.')) return
    setDeleting(id)
    const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' })
    if (res.ok) setBanners(prev => prev.filter(b => b.id !== id))
    setDeleting(null)
  }

  const handleToggle = async (b: Banner) => {
    const res = await fetch(`/api/admin/banners/${b.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !b.active }),
    })
    if (res.ok) setBanners(prev => prev.map(x => x.id === b.id ? { ...x, active: !x.active } : x))
  }

  const locLabel = (v: string) => BANNER_LOCATIONS[v]?.label ?? v
  const locDims  = (v: string) => {
    const m = BANNER_LOCATIONS[v]
    return m ? `${m.width}×${m.height}` : ''
  }

  const valid = form.name.trim() && form.imageUrl.trim() && form.locations.length > 0

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display flex items-center gap-2 text-xl font-bold uppercase tracking-wide text-white">
            <ImageIcon className="h-5 w-5 text-orange-500" />
            Banners Particulares
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Crie banners com imagem própria. Cada banner pode aparecer em múltiplas localizações.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" /> Novo Banner
        </button>
      </div>

      {/* Formulário */}
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
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">Nome</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setField('name', e.target.value)}
                placeholder="ex: Parceiro Janeiro 2025"
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
                  onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0] ?? null) }}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => fileRef.current?.click()}
                >
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={e => handleFile(e.target.files?.[0] ?? null)} />
                  {form.imageUrl.startsWith('data:') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.imagePreview} alt="preview" className="max-h-28 max-w-full rounded-lg object-contain" />
                  ) : (
                    <>
                      <Upload className="mb-2 h-8 w-8 text-zinc-600" />
                      <p className="text-sm text-zinc-500">Clique ou arraste a imagem</p>
                      <p className="mt-1 text-xs text-zinc-600">PNG, JPG, WebP — recomendado até 500 KB</p>
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
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.imagePreview} alt="preview" className="max-h-20 rounded-lg object-contain"
                      onError={() => setField('imagePreview', '')} />
                  )}
                </div>
              )}
            </div>

            {/* Localizações — checkboxes */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-zinc-500">
                <CheckSquare className="h-3.5 w-3.5" />
                Localizações <span className="text-zinc-600 normal-case font-normal">(selecione uma ou mais)</span>
              </label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {Object.entries(BANNER_LOCATIONS).map(([value, meta]) => {
                  const checked = form.locations.includes(value)
                  return (
                    <label
                      key={value}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
                        checked
                          ? 'border-orange-500/50 bg-orange-500/5'
                          : 'border-zinc-700 bg-zinc-800/30 hover:border-zinc-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleLocation(value)}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-orange-500"
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-white">{meta.label}</span>
                          <span className="rounded-full bg-zinc-700 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                            {meta.width}×{meta.height}px
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-zinc-600">{meta.hint}</p>
                      </div>
                    </label>
                  )
                })}
              </div>
              {form.locations.length === 0 && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-yellow-500">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Selecione ao menos uma localização.
                </p>
              )}
            </div>

            {/* Link + Alt text */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">Texto alternativo (alt)</label>
                <input
                  type="text"
                  value={form.altText}
                  onChange={e => setField('altText', e.target.value)}
                  placeholder="Descrição acessível do banner"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </div>

            {/* Ordem + Ativo */}
            <div className="flex items-center gap-6">
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
              <button type="button" onClick={() => setField('active', !form.active)}
                className="flex items-center gap-2 text-sm font-semibold">
                {form.active
                  ? <><ToggleRight className="h-7 w-7 text-orange-500" /><span className="text-orange-400">Ativo</span></>
                  : <><ToggleLeft  className="h-7 w-7 text-zinc-600" /><span className="text-zinc-500">Inativo</span></>
                }
              </button>
            </div>

            {/* Rodapé do form */}
            <div className="flex items-center justify-end gap-3 border-t border-zinc-800 pt-4">
              <button type="button" onClick={() => setShowForm(false)}
                className="rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-400 hover:border-zinc-500 hover:text-zinc-200">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || !valid}
                className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50"
              >
                {saving
                  ? <><Loader2 className="h-4 w-4 animate-spin" />Salvando...</>
                  : <><Save className="h-4 w-4" />{editId ? 'Salvar alterações' : 'Criar banner'}</>
                }
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
            <div key={banner.id}
              className={`flex items-center gap-4 rounded-2xl border bg-zinc-900 p-4 transition-all ${
                banner.active ? 'border-zinc-700' : 'border-zinc-800 opacity-60'
              }`}
            >
              {/* Preview */}
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={banner.imageUrl} alt={banner.altText ?? banner.name}
                  className="h-full w-full object-cover" />
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
                {/* Localizações como chips */}
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {banner.locations.map(loc => (
                    <span key={loc}
                      className="flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
                      <span>{locLabel(loc)}</span>
                      <span className="text-zinc-600">{locDims(loc)}</span>
                    </span>
                  ))}
                </div>
                {banner.linkUrl && (
                  <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer"
                    className="mt-1 flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300">
                    <ExternalLink className="h-3 w-3" />
                    {new URL(banner.linkUrl).hostname}
                  </a>
                )}
              </div>

              {/* Ações */}
              <div className="flex shrink-0 items-center gap-1">
                <button onClick={() => handleToggle(banner)} title={banner.active ? 'Desativar' : 'Ativar'}
                  className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300">
                  {banner.active
                    ? <ToggleRight className="h-5 w-5 text-orange-500" />
                    : <ToggleLeft  className="h-5 w-5" />
                  }
                </button>
                <button onClick={() => openEdit(banner)} title="Editar"
                  className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(banner.id)} disabled={deleting === banner.id}
                  title="Excluir"
                  className="rounded-lg p-2 text-zinc-500 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50">
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
    </div>
  )
}

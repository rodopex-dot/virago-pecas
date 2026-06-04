'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Link2, CheckCircle, XCircle, Loader2, ExternalLink, ShoppingCart, Youtube, Film } from 'lucide-react'

interface LinkSuggestion {
  id: string
  purchaseLink?: string | null
  videoLinks?: string | null
  submitterEmail?: string | null
  notes?: string | null
  status: string
  createdAt: string
  compatiblePart: {
    id: string
    name: string
    brand?: string | null
    part: { name: string; category: string }
  }
}

const TABS = [
  { value: 'PENDENTE',  label: 'Pendentes' },
  { value: 'APROVADA',  label: 'Aprovadas' },
  { value: 'REJEITADA', label: 'Rejeitadas' },
]

function videoIcon(url: string) {
  if (url.includes('youtube') || url.includes('youtu.be')) return <Youtube className="h-3.5 w-3.5 text-red-500" />
  if (url.includes('instagram')) return <Film className="h-3.5 w-3.5 text-pink-400" />
  return <Film className="h-3.5 w-3.5 text-zinc-400" />
}

function LinksPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tab = searchParams.get('status') ?? 'PENDENTE'

  const [items, setItems] = useState<LinkSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  const load = (status: string) => {
    setLoading(true)
    fetch(`/api/admin/link-suggestions?status=${status}`)
      .then(r => r.json())
      .then(setItems)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(tab) }, [tab])

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActionId(id)
    await fetch(`/api/admin/link-suggestions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    setActionId(null)
    load(tab)
  }

  const pending = items.length

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-display flex items-center gap-3 text-3xl font-bold uppercase tracking-wide text-white">
          <Link2 className="h-7 w-7 text-orange-500" />
          Links Sugeridos
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Links de compra e vídeos enviados pela comunidade para revisão.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-zinc-800 bg-zinc-900 p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => router.push(`?status=${t.value}`)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === t.value
                ? 'bg-orange-500 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 py-16 text-center text-zinc-600">
          Nenhuma sugestão {tab === 'PENDENTE' ? 'pendente' : tab === 'APROVADA' ? 'aprovada' : 'rejeitada'}.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(item => {
            const videos = item.videoLinks?.split('\n').map(v => v.trim()).filter(Boolean) ?? []
            const isActing = actionId === item.id

            return (
              <div key={item.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                {/* Peça */}
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <span className="mb-1 inline-block rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                      {item.compatiblePart.part.category}
                    </span>
                    <p className="text-xs text-zinc-500">{item.compatiblePart.part.name}</p>
                    <p className="font-semibold text-white">{item.compatiblePart.name}</p>
                    {item.compatiblePart.brand && (
                      <p className="text-xs text-zinc-500">{item.compatiblePart.brand}</p>
                    )}
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    item.status === 'PENDENTE' ? 'bg-yellow-500/10 text-yellow-400'
                    : item.status === 'APROVADA' ? 'bg-green-500/10 text-green-400'
                    : 'bg-red-500/10 text-red-400'
                  }`}>
                    {item.status}
                  </span>
                </div>

                {/* Links sugeridos */}
                <div className="mb-4 space-y-2">
                  {item.purchaseLink && (
                    <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-800/50 px-3 py-2.5">
                      <ShoppingCart className="h-4 w-4 shrink-0 text-orange-400" />
                      <a
                        href={item.purchaseLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 truncate text-sm text-orange-400 hover:underline"
                      >
                        {item.purchaseLink}
                      </a>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
                    </div>
                  )}

                  {videos.map((url, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-800/50 px-3 py-2.5">
                      {videoIcon(url)}
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 truncate text-sm text-zinc-300 hover:text-white hover:underline"
                      >
                        {url}
                      </a>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
                    </div>
                  ))}
                </div>

                {/* Metadados */}
                <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-600">
                  <span>{new Date(item.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  {item.submitterEmail && <span>📧 {item.submitterEmail}</span>}
                  {item.notes && <span className="text-zinc-500">💬 {item.notes}</span>}
                </div>

                {/* Ações */}
                {item.status === 'PENDENTE' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(item.id, 'approve')}
                      disabled={isActing}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 py-2.5 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {isActing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                      Aprovar e aplicar
                    </button>
                    <button
                      onClick={() => handleAction(item.id, 'reject')}
                      disabled={isActing}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                    >
                      {isActing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                      Rejeitar
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function LinksPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-16"><Loader2 className="h-6 w-6 animate-spin text-orange-500" /></div>}>
      <LinksPageContent />
    </Suspense>
  )
}

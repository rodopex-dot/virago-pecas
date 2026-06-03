'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle, Loader2, ExternalLink, Clock } from 'lucide-react'

interface Suggestion {
  id: string; partName: string; compatiblePartName: string; brand?: string
  purchaseLink: string; compatibilityLevel: string; adaptationText?: string
  videoLinks?: string; submitterEmail?: string
  status: 'PENDENTE' | 'APROVADA' | 'REJEITADA'; createdAt: string
}

interface Part { id: string; name: string; category: string }

const levelLabel: Record<string, { label: string; color: string }> = {
  ENCAIXE_PERFEITO:  { label: 'Encaixe Perfeito',  color: 'text-green-400 border-green-500/30 bg-green-500/10' },
  ADAPTACAO_SIMPLES: { label: 'Adaptação Simples',  color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' },
  ADAPTACAO_COMPLEXA:{ label: 'Adaptação Complexa', color: 'text-red-400 border-red-500/30 bg-red-500/10' },
}

export default function SugestaoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null)
  const [parts, setParts] = useState<Part[]>([])
  const [selectedPartId, setSelectedPartId] = useState('')
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<'approve' | 'reject' | null>(null)
  const [showApproveModal, setShowApproveModal] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/suggestions/${id}`).then(r => r.json()),
      fetch('/api/admin/parts').then(r => r.json()),
    ]).then(([s, p]) => { setSuggestion(s); setParts(p) }).finally(() => setLoading(false))
  }, [id])

  const handleReject = async () => {
    if (!confirm('Rejeitar esta sugestão?')) return
    setActing('reject')
    await fetch(`/api/admin/suggestions/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject' }),
    })
    setActing(null)
    router.push('/admin/sugestoes')
  }

  const handleApprove = async () => {
    setActing('approve')
    await fetch(`/api/admin/suggestions/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve', partId: selectedPartId || undefined }),
    })
    setActing(null)
    setShowApproveModal(false)
    router.push('/admin/sugestoes')
  }

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
    </div>
  )
  if (!suggestion) return <div className="p-8 text-zinc-500">Sugestão não encontrada.</div>

  const lvl = levelLabel[suggestion.compatibilityLevel]
  const isPending = suggestion.status === 'PENDENTE'

  return (
    <div className="p-8">
      <Link href="/admin/sugestoes" className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-orange-400">
        <ArrowLeft className="h-4 w-4" /> Voltar para Sugestões
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-white">
            {suggestion.compatiblePartName}
          </h1>
          <p className="mt-1 text-zinc-500">sugerida para: <span className="text-white">{suggestion.partName}</span></p>
        </div>
        <div className="flex items-center gap-2">
          {suggestion.status === 'PENDENTE' && <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400"><Clock className="h-3 w-3"/>Pendente</span>}
          {suggestion.status === 'APROVADA' && <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400"><CheckCircle className="h-3 w-3"/>Aprovada</span>}
          {suggestion.status === 'REJEITADA' && <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400"><XCircle className="h-3 w-3"/>Rejeitada</span>}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Info da sugestão */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="mb-4 font-display text-xs font-bold uppercase tracking-widest text-zinc-500">Dados da Peça</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-zinc-600">Peça original</dt>
                <dd className="font-medium text-white">{suggestion.partName}</dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-600">Peça compatível</dt>
                <dd className="font-medium text-white">{suggestion.compatiblePartName}</dd>
              </div>
              {suggestion.brand && (
                <div>
                  <dt className="text-xs text-zinc-600">Marca</dt>
                  <dd className="text-zinc-300">{suggestion.brand}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-zinc-600">Nível de compatibilidade</dt>
                <dd>
                  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${lvl.color}`}>
                    {lvl.label}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-600">Link de compra</dt>
                <dd>
                  <a href={suggestion.purchaseLink} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-orange-400 hover:underline">
                    Ver produto <ExternalLink className="h-3 w-3" />
                  </a>
                </dd>
              </div>
              {suggestion.submitterEmail && (
                <div>
                  <dt className="text-xs text-zinc-600">E-mail do colaborador</dt>
                  <dd className="text-zinc-300">{suggestion.submitterEmail}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-zinc-600">Enviado em</dt>
                <dd className="text-zinc-400">{new Date(suggestion.createdAt).toLocaleString('pt-BR')}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="space-y-4">
          {suggestion.adaptationText && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <h2 className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-zinc-500">Texto de Adaptação</h2>
              <p className="text-sm leading-relaxed text-zinc-300">{suggestion.adaptationText}</p>
            </div>
          )}
          {suggestion.videoLinks && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <h2 className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-zinc-500">Links de Vídeos</h2>
              <div className="space-y-2">
                {suggestion.videoLinks.split('\n').filter(Boolean).map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-orange-400 hover:underline">
                    <ExternalLink className="h-3.5 w-3.5" />{url}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ações */}
      {isPending && (
        <div className="mt-6 flex gap-3">
          <button onClick={handleReject} disabled={acting !== null}
            className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50">
            {acting === 'reject' ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            Rejeitar
          </button>
          <button onClick={() => setShowApproveModal(true)} disabled={acting !== null}
            className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:opacity-50">
            {acting === 'approve' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            Aprovar e Publicar
          </button>
        </div>
      )}

      {/* Modal de aprovação */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
            <h2 className="font-display mb-2 text-xl font-bold uppercase tracking-wide text-white">Aprovar Sugestão</h2>
            <p className="mb-5 text-sm text-zinc-400">
              Escolha a qual peça original esta compatível será vinculada.
              Se deixar em branco, o sistema cria automaticamente uma nova peça &quot;{suggestion.partName}&quot;.
            </p>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">
              Vincular a peça existente (opcional)
            </label>
            <select value={selectedPartId} onChange={e => setSelectedPartId(e.target.value)}
              className="mb-5 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500">
              <option value="">→ Criar nova peça: &quot;{suggestion.partName}&quot;</option>
              {parts.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setShowApproveModal(false)}
                className="flex-1 rounded-xl border border-zinc-700 py-2.5 text-sm font-semibold text-zinc-400 hover:border-zinc-500">
                Cancelar
              </button>
              <button onClick={handleApprove} disabled={acting === 'approve'}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 py-2.5 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50">
                {acting === 'approve' && <Loader2 className="h-4 w-4 animate-spin"/>}
                Confirmar e Publicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

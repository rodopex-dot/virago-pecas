'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Clock, CheckCircle, XCircle, Loader2, ChevronRight } from 'lucide-react'

interface Suggestion {
  id: string; partName: string; compatiblePartName: string
  brand?: string; compatibilityLevel: string
  status: 'PENDENTE' | 'APROVADA' | 'REJEITADA'; createdAt: string
}

const statusConfig = {
  PENDENTE:  { label: 'Pendente',  icon: Clock,       color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
  APROVADA:  { label: 'Aprovada',  icon: CheckCircle, color: 'text-green-400 bg-green-500/10 border-green-500/30' },
  REJEITADA: { label: 'Rejeitada', icon: XCircle,     color: 'text-red-400 bg-red-500/10 border-red-500/30' },
}

const levelLabel: Record<string, string> = {
  ENCAIXE_PERFEITO:  'Encaixe Perfeito',
  ADAPTACAO_SIMPLES: 'Adaptação Simples',
  ADAPTACAO_COMPLEXA:'Adaptação Complexa',
}

function SugestoesContent() {
  const searchParams = useSearchParams()
  const statusFilter = searchParams.get('status') ?? ''

  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState(statusFilter)

  const load = (status: string) => {
    setLoading(true)
    const url = status ? `/api/admin/suggestions?status=${status}` : '/api/admin/suggestions'
    fetch(url).then(r => r.json()).then(setSuggestions).finally(() => setLoading(false))
  }

  useEffect(() => { load(activeFilter) }, [activeFilter])

  const filters = [
    { value: '',          label: 'Todas' },
    { value: 'PENDENTE',  label: 'Pendentes' },
    { value: 'APROVADA',  label: 'Aprovadas' },
    { value: 'REJEITADA', label: 'Rejeitadas' },
  ]

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-white">Sugestões</h1>
        <p className="mt-1 text-sm text-zinc-500">{suggestions.length} resultado(s)</p>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex gap-2">
        {filters.map(f => (
          <button key={f.value} onClick={() => setActiveFilter(f.value)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeFilter === f.value
                ? 'bg-orange-500 text-white'
                : 'border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      ) : suggestions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 py-12 text-center text-zinc-600">
          Nenhuma sugestão encontrada.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80">
                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Peça Compatível</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Para peça</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Nível</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Data</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-zinc-500">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-900">
              {suggestions.map(s => {
                const cfg = statusConfig[s.status]
                const Icon = cfg.icon
                return (
                  <tr key={s.id} className="transition hover:bg-zinc-800/50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">{s.compatiblePartName}</p>
                      {s.brand && <p className="text-xs text-zinc-500">{s.brand}</p>}
                    </td>
                    <td className="px-5 py-4 text-zinc-400">{s.partName}</td>
                    <td className="px-5 py-4 text-xs text-zinc-500">{levelLabel[s.compatibilityLevel]}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.color}`}>
                        <Icon className="h-3 w-3" />{cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-zinc-500">
                      {new Date(s.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/admin/sugestoes/${s.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-orange-500/50 hover:text-orange-400">
                        Revisar <ChevronRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function SugestoesPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-orange-500"/></div>}>
      <SugestoesContent />
    </Suspense>
  )
}

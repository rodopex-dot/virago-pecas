'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Tag, Puzzle, Inbox, Clock, CheckCircle, XCircle } from 'lucide-react'

interface Stats {
  parts: number
  compatibleParts: number
  pendingSuggestions: number
  totalSuggestions: number
  recentSuggestions: Suggestion[]
}

interface Suggestion {
  id: string
  partName: string
  compatiblePartName: string
  status: string
  createdAt: string
}

const statusConfig = {
  PENDENTE:  { label: 'Pendente',  icon: Clock,         color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
  APROVADA:  { label: 'Aprovada',  icon: CheckCircle,   color: 'text-green-400 bg-green-500/10 border-green-500/30' },
  REJEITADA: { label: 'Rejeitada', icon: XCircle,       color: 'text-red-400 bg-red-500/10 border-red-500/30' },
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  const statCards = stats
    ? [
        { label: 'Peças Originais',   value: stats.parts,           icon: Tag,     color: 'text-orange-400', bg: 'bg-orange-500/10' },
        { label: 'Peças Compatíveis', value: stats.compatibleParts, icon: Puzzle,  color: 'text-blue-400',   bg: 'bg-blue-500/10' },
        { label: 'Sugestões Pendentes', value: stats.pendingSuggestions, icon: Inbox, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
        { label: 'Total Sugestões',   value: stats.totalSuggestions, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
      ]
    : []

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-500">Visão geral do sistema</p>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900" />
            ))
          : statCards.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                <div className={`mb-3 inline-flex rounded-xl p-2.5 ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <p className="text-3xl font-bold text-white">{value}</p>
                <p className="mt-1 text-xs text-zinc-500">{label}</p>
              </div>
            ))}
      </div>

      {/* Sugestões recentes */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <h2 className="font-display font-bold uppercase tracking-wide text-white">
            Sugestões Recentes
          </h2>
          <Link
            href="/admin/sugestoes"
            className="text-xs font-semibold text-orange-400 hover:text-orange-300"
          >
            Ver todas →
          </Link>
        </div>
        <div className="divide-y divide-zinc-800">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse px-6 py-4" />
            ))
          ) : stats?.recentSuggestions.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-zinc-600">
              Nenhuma sugestão ainda.
            </div>
          ) : (
            stats?.recentSuggestions.map((s) => {
              const cfg = statusConfig[s.status as keyof typeof statusConfig]
              const Icon = cfg?.icon ?? Clock
              return (
                <Link
                  key={s.id}
                  href={`/admin/sugestoes/${s.id}`}
                  className="flex items-center justify-between px-6 py-4 transition hover:bg-zinc-800/50"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{s.compatiblePartName}</p>
                    <p className="text-xs text-zinc-500">para: {s.partName}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${cfg?.color}`}>
                    <Icon className="h-3 w-3" />
                    {cfg?.label}
                  </span>
                </Link>
              )
            })
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <Link
          href="/admin/pecas"
          className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-orange-500/40"
        >
          <Tag className="h-6 w-6 text-orange-400" />
          <div>
            <p className="font-semibold text-white">Gerenciar Peças</p>
            <p className="text-xs text-zinc-500">Criar, editar e excluir peças</p>
          </div>
        </Link>
        <Link
          href="/admin/sugestoes?status=PENDENTE"
          className="flex items-center gap-3 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5 transition hover:border-yellow-500/40"
        >
          <Inbox className="h-6 w-6 text-yellow-400" />
          <div>
            <p className="font-semibold text-white">Moderar Sugestões</p>
            <p className="text-xs text-zinc-500">
              {stats ? `${stats.pendingSuggestions} pendente(s)` : '...'}
            </p>
          </div>
        </Link>
      </div>
    </div>
  )
}

import Link from 'next/link'
import {
  Disc3, Zap, MoveVertical, Shield, Cable, Star,
  Settings, Radio, Gauge, Bike,
} from 'lucide-react'

export interface CategoryConfig {
  icon: React.ElementType
  image?: string
  gradient: string
  glow: string
  description: string
}

export const categoryConfig: Record<string, CategoryConfig> = {
  Freios: {
    icon: Disc3,
    image: '/categories/freios.jpg',
    gradient: 'from-red-600/20 to-red-900/10',
    glow: 'group-hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]',
    description: 'Discos, pastilhas, pinças',
  },
  Motor: {
    icon: Zap,
    image: '/categories/motor.jpg',
    gradient: 'from-yellow-500/20 to-orange-800/10',
    glow: 'group-hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]',
    description: 'Pistão, carburador, velas',
  },
  Suspensão: {
    icon: MoveVertical,
    image: '/categories/suspensao.jpg',
    gradient: 'from-blue-600/20 to-blue-900/10',
    glow: 'group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]',
    description: 'Garfo, amortecedor, molas',
  },
  Carenagem: {
    icon: Shield,
    image: '/categories/carenagem.jpg',
    gradient: 'from-purple-600/20 to-purple-900/10',
    glow: 'group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]',
    description: 'Rabeta, tanque, plásticos',
  },
  Cabos: {
    icon: Cable,
    image: '/categories/cabos.jpg',
    gradient: 'from-green-600/20 to-green-900/10',
    glow: 'group-hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]',
    description: 'Acelerador, embreagem, freio',
  },
  Acessórios: {
    icon: Star,
    image: '/categories/acessorios.jpg',
    gradient: 'from-orange-500/20 to-orange-900/10',
    glow: 'group-hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]',
    description: 'Retrovisores, manoplas, farol',
  },
  Elétrica: {
    icon: Radio,
    image: '/categories/eletrica.jpg',
    gradient: 'from-cyan-600/20 to-cyan-900/10',
    glow: 'group-hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]',
    description: 'Regulador, bobina, chicote',
  },
  Transmissão: {
    icon: Settings,
    image: '/categories/transmissao.jpg',
    gradient: 'from-zinc-600/20 to-zinc-800/10',
    glow: 'group-hover:shadow-[0_0_20px_rgba(161,161,170,0.2)]',
    description: 'Corrente, pinhão, coroa',
  },
  Carburação: {
    icon: Gauge,
    image: '/categories/carburador.jpg',
    gradient: 'from-amber-600/20 to-amber-900/10',
    glow: 'group-hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]',
    description: 'Carburador, filtro, bico',
  },
  Geral: {
    icon: Bike,
    gradient: 'from-zinc-700/20 to-zinc-900/10',
    glow: 'group-hover:shadow-[0_0_20px_rgba(161,161,170,0.2)]',
    description: 'Outros componentes',
  },
}

function getFallbackConfig(category: string): CategoryConfig {
  return {
    icon: Bike,
    gradient: 'from-zinc-700/20 to-zinc-900/10',
    glow: 'group-hover:shadow-[0_0_20px_rgba(249,115,22,0.2)]',
    description: category,
  }
}

interface CategoryCardProps {
  category: string
  partCount: number
}

export default function CategoryCard({ category, partCount }: CategoryCardProps) {
  const cfg = categoryConfig[category] ?? getFallbackConfig(category)
  const Icon = cfg.icon

  return (
    <Link
      href={`/?q=${encodeURIComponent(category)}`}
      className={`group relative overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br ${cfg.gradient} transition-all duration-300 hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600 ${cfg.glow}`}
    >
      {cfg.image ? (
        /* Card com imagem de fundo */
        <>
          <div className="relative h-40 w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cfg.image}
              alt={category}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
          </div>
          <div className="bg-white px-5 pb-5 pt-3 dark:bg-zinc-950/80">
            <h3 className="font-display text-xl font-bold uppercase tracking-wide text-zinc-900 dark:text-white">
              {category}
            </h3>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{cfg.description}</p>
            <div className="mt-2 flex items-center gap-1">
              <span className="text-sm font-bold text-orange-500">{partCount}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">peça{partCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </>
      ) : (
        /* Card com ícone (padrão) */
        <>
          <div className="absolute inset-0 opacity-5 dark:opacity-5">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full border-4 border-zinc-900 dark:border-white" />
            <div className="absolute -right-2 -top-2 h-16 w-16 rounded-full border-2 border-zinc-900 dark:border-white" />
          </div>
          <div className="relative p-6">
            <div className="mb-4 inline-flex rounded-xl border border-zinc-300 bg-white/60 p-3 backdrop-blur-sm dark:border-white/10 dark:bg-black/30">
              <Icon className="h-7 w-7 text-zinc-700 dark:text-white" strokeWidth={1.5} />
            </div>
            <h3 className="font-display text-xl font-bold uppercase tracking-wide text-zinc-900 dark:text-white">
              {category}
            </h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{cfg.description}</p>
            <div className="mt-3 flex items-center gap-1">
              <span className="text-sm font-bold text-orange-500">{partCount}</span>
              <span className="text-xs text-zinc-500">peça{partCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </>
      )}
    </Link>
  )
}

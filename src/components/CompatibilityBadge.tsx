import { CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react'

type CompatibilityLevel = 'ENCAIXE_PERFEITO' | 'ADAPTACAO_SIMPLES' | 'ADAPTACAO_COMPLEXA'

interface CompatibilityBadgeProps {
  level: CompatibilityLevel
  size?: 'sm' | 'md'
}

const config = {
  ENCAIXE_PERFEITO: {
    label: 'Encaixe Perfeito',
    sublabel: 'Plug & Play',
    icon: CheckCircle,
    badge: 'bg-green-500/10 text-green-400 border-green-500/30',
    iconClass: 'text-green-400',
    card: 'border-l-green-500',
  },
  ADAPTACAO_SIMPLES: {
    label: 'Adaptação Simples',
    sublabel: 'Pequenos ajustes',
    icon: AlertTriangle,
    badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    iconClass: 'text-yellow-400',
    card: 'border-l-yellow-500',
  },
  ADAPTACAO_COMPLEXA: {
    label: 'Adaptação Complexa',
    sublabel: 'Solda / cortes',
    icon: AlertOctagon,
    badge: 'bg-red-500/10 text-red-400 border-red-500/30',
    iconClass: 'text-red-400',
    card: 'border-l-red-500',
  },
}

export default function CompatibilityBadge({ level, size = 'md' }: CompatibilityBadgeProps) {
  const { label, sublabel, icon: Icon, badge, iconClass } = config[level]

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${badge}`}>
        <Icon className={`h-3 w-3 ${iconClass}`} />
        {label}
      </span>
    )
  }

  return (
    <div className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 ${badge}`}>
      <Icon className={`h-5 w-5 ${iconClass}`} />
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs opacity-60">{sublabel}</p>
      </div>
    </div>
  )
}

export { config as compatibilityConfig }

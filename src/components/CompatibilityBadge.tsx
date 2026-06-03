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
    classes: 'bg-green-100 text-green-800 border-green-200',
    iconClass: 'text-green-600',
  },
  ADAPTACAO_SIMPLES: {
    label: 'Adaptação Simples',
    sublabel: 'Pequenos ajustes',
    icon: AlertTriangle,
    classes: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    iconClass: 'text-yellow-600',
  },
  ADAPTACAO_COMPLEXA: {
    label: 'Adaptação Complexa',
    sublabel: 'Solda / cortes',
    icon: AlertOctagon,
    classes: 'bg-red-100 text-red-800 border-red-200',
    iconClass: 'text-red-600',
  },
}

export default function CompatibilityBadge({ level, size = 'md' }: CompatibilityBadgeProps) {
  const { label, sublabel, icon: Icon, classes, iconClass } = config[level]

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${classes}`}>
        <Icon className={`h-3 w-3 ${iconClass}`} />
        {label}
      </span>
    )
  }

  return (
    <div className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 ${classes}`}>
      <Icon className={`h-5 w-5 ${iconClass}`} />
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs opacity-75">{sublabel}</p>
      </div>
    </div>
  )
}

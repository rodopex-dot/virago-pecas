interface AdPlaceholderProps {
  slot: 'top' | 'sidebar' | 'inline'
  className?: string
}

const slotConfig = {
  top: { label: 'Banner Topo - 728x90', height: 'h-24', width: 'w-full max-w-3xl' },
  sidebar: { label: 'Banner Lateral - 300x250', height: 'h-64', width: 'w-full' },
  inline: { label: 'Banner Entre Resultados - 468x60', height: 'h-16', width: 'w-full' },
}

export default function AdPlaceholder({ slot, className = '' }: AdPlaceholderProps) {
  const config = slotConfig[slot]

  return (
    <div
      className={`flex items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 ${config.height} ${config.width} ${className}`}
      aria-label="Espaço para publicidade"
    >
      <p className="text-xs text-gray-400">{config.label} · Google AdSense</p>
    </div>
  )
}

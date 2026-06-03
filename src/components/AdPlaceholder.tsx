interface AdPlaceholderProps {
  slot: 'top' | 'sidebar' | 'inline'
  className?: string
}

const slotConfig = {
  top: { label: 'Banner Topo · 728×90 · Google AdSense', height: 'h-20', width: 'w-full max-w-3xl' },
  sidebar: { label: 'Banner Lateral · 300×250 · Google AdSense', height: 'h-64', width: 'w-full' },
  inline: { label: 'Banner · 468×60 · Google AdSense', height: 'h-14', width: 'w-full' },
}

export default function AdPlaceholder({ slot, className = '' }: AdPlaceholderProps) {
  const config = slotConfig[slot]
  return (
    <div
      className={`flex items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-900/50 ${config.height} ${config.width} ${className}`}
      aria-label="Espaço para publicidade"
    >
      <p className="text-[10px] uppercase tracking-widest text-zinc-700">{config.label}</p>
    </div>
  )
}

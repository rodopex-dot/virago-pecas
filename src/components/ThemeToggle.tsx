'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'

const themes = [
  { value: 'system', icon: Monitor, label: 'Sistema' },
  { value: 'light',  icon: Sun,     label: 'Claro'   },
  { value: 'dark',   icon: Moon,    label: 'Escuro'  },
]

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Evita hydration mismatch
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="h-9 w-9" />

  const current = themes.find((t) => t.value === theme) ?? themes[0]
  const Icon = current.icon

  const cycle = () => {
    const idx = themes.findIndex((t) => t.value === theme)
    const next = themes[(idx + 1) % themes.length]
    setTheme(next.value)
  }

  return (
    <button
      onClick={cycle}
      title={`Tema: ${current.label}`}
      aria-label={`Alternar tema (atual: ${current.label})`}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition hover:border-orange-500 hover:text-orange-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-orange-500 dark:hover:text-orange-400"
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}

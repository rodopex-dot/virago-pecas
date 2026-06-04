'use client'

import Link from 'next/link'
import { Wrench, PlusCircle, Menu, X } from 'lucide-react'
import { useState } from 'react'
import ThemeToggle from './ThemeToggle'

const NAV_LINKS = [
  { href: '/',         label: 'Buscar Peças' },
  { href: '/manuais',  label: 'Manuais' },
  { href: '/sobre',    label: 'Sobre' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="rounded-lg bg-orange-500/10 p-1.5 transition group-hover:bg-orange-500/20">
              <Wrench className="h-5 w-5 text-orange-500" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-lg font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                Virago 250
              </span>
              <span className="text-[10px] uppercase tracking-widest text-orange-500">Peças</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-4 md:flex">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                {label}
              </Link>
            ))}
            <ThemeToggle />
            <Link
              href="/contribuir"
              className="flex items-center gap-1.5 rounded-lg border border-orange-500 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-500 transition hover:bg-orange-500 hover:text-white"
            >
              <PlusCircle className="h-4 w-4" />
              Contribuir
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
              className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              {menuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-zinc-200 py-3 dark:border-zinc-800 md:hidden">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="block py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/contribuir"
              className="mt-2 flex items-center gap-1.5 rounded-lg border border-orange-500 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-500"
              onClick={() => setMenuOpen(false)}
            >
              <PlusCircle className="h-4 w-4" />
              Contribuir
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}

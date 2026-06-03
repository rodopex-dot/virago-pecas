'use client'

import Link from 'next/link'
import { Wrench, PlusCircle, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="rounded-lg bg-orange-500/10 p-1.5 transition group-hover:bg-orange-500/20">
              <Wrench className="h-5 w-5 text-orange-500" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-lg font-bold uppercase tracking-wider text-white">
                Virago 250
              </span>
              <span className="text-[10px] uppercase tracking-widest text-orange-500">Peças</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/"
              className="text-sm font-medium text-zinc-400 transition hover:text-white"
            >
              Buscar Peças
            </Link>
            <Link
              href="/contribuir"
              className="flex items-center gap-1.5 rounded-lg border border-orange-500 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-400 transition hover:bg-orange-500 hover:text-white"
            >
              <PlusCircle className="h-4 w-4" />
              Contribuir
            </Link>
          </nav>

          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? (
              <X className="h-6 w-6 text-zinc-400" />
            ) : (
              <Menu className="h-6 w-6 text-zinc-400" />
            )}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-zinc-800 py-3 md:hidden">
            <Link
              href="/"
              className="block py-2 text-sm font-medium text-zinc-400"
              onClick={() => setMenuOpen(false)}
            >
              Buscar Peças
            </Link>
            <Link
              href="/contribuir"
              className="mt-2 flex items-center gap-1.5 rounded-lg border border-orange-500 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-400"
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

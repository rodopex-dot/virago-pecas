'use client'

import Link from 'next/link'
import { Wrench, PlusCircle, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-orange-200 bg-white shadow-sm">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-orange-600 hover:text-orange-700">
            <Wrench className="h-6 w-6" />
            <span className="text-lg font-bold">Virago 250 Peças</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-orange-600"
            >
              Buscar Peças
            </Link>
            <Link
              href="/contribuir"
              className="flex items-center gap-1.5 rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700"
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
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-gray-100 py-3 md:hidden">
            <Link
              href="/"
              className="block py-2 text-sm font-medium text-gray-600"
              onClick={() => setMenuOpen(false)}
            >
              Buscar Peças
            </Link>
            <Link
              href="/contribuir"
              className="mt-2 flex items-center gap-1.5 rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white"
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

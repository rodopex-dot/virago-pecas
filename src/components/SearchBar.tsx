'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

interface SearchBarProps {
  initialValue?: string
  size?: 'lg' | 'md'
}

export default function SearchBar({ initialValue = '', size = 'md' }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/?q=${encodeURIComponent(query.trim())}`)
    } else {
      router.push('/')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Search className={`text-zinc-400 dark:text-zinc-500 ${size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar peça original (ex: Amortecedor, Pastilha de freio...)"
          className={`w-full rounded-l-xl border border-zinc-300 bg-white pl-11 pr-4 text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-600 ${
            size === 'lg' ? 'py-4 text-base' : 'py-2.5 text-sm'
          }`}
        />
        <button
          type="submit"
          className={`rounded-r-xl bg-orange-500 font-semibold text-white transition hover:bg-orange-600 active:bg-orange-700 ${
            size === 'lg' ? 'px-7 text-base' : 'px-4 text-sm'
          }`}
        >
          Buscar
        </button>
      </div>
    </form>
  )
}

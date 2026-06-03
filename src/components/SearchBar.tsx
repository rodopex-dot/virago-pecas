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
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Search className={`text-gray-400 ${size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar peça original (ex: Amortecedor, Pastilha de freio...)"
          className={`w-full rounded-l-xl border border-gray-300 bg-white pl-11 pr-4 text-gray-900 placeholder-gray-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 ${
            size === 'lg' ? 'py-4 text-base' : 'py-2.5 text-sm'
          }`}
        />
        <button
          type="submit"
          className={`rounded-r-xl bg-orange-600 font-semibold text-white transition hover:bg-orange-700 active:bg-orange-800 ${
            size === 'lg' ? 'px-6 text-base' : 'px-4 text-sm'
          }`}
        >
          Buscar
        </button>
      </div>
    </form>
  )
}

import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import SearchBar from '@/components/SearchBar'
import AdBanner from '@/components/AdBanner'
import CompatibilityBadge from '@/components/CompatibilityBadge'
import CategoryCard from '@/components/CategoryCard'
import { ChevronRight, PlusCircle, Bike, Search } from 'lucide-react'

interface SearchParams {
  q?: string
}

async function searchParts(query: string) {
  return prisma.part.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: { compatibleParts: { select: { compatibilityLevel: true } } },
    orderBy: { name: 'asc' },
  })
}

async function getAllParts() {
  return prisma.part.findMany({
    include: { compatibleParts: { select: { compatibilityLevel: true } } },
    orderBy: { category: 'asc' },
  })
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const query = params.q?.trim() ?? ''
  const parts = query ? await searchParts(query) : await getAllParts()

  // Group parts by category for the category grid
  const allParts = query ? await getAllParts() : parts
  const categoryMap = allParts.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1
    return acc
  }, {})
  const categories = Object.entries(categoryMap)

  const resultCategories = [...new Set(parts.map((p) => p.category))]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Ad top */}
      <div className="mb-8 flex justify-center">
        <AdBanner slot="top" />
      </div>

      {/* Hero — mostrado apenas sem busca */}
      {!query && (
        <div className="mb-12 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-orange-400">
            <Bike className="h-3.5 w-3.5" />
            Yamaha Virago 250
          </div>
          <h1 className="font-display mb-4 text-4xl font-bold uppercase leading-tight tracking-wide text-white md:text-6xl">
            Encontre Peças{' '}
            <span className="text-gradient">Compatíveis</span>
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-zinc-400">
            Banco de dados colaborativo com níveis de compatibilidade detalhados,
            instruções de adaptação e links de compra diretos.
          </p>
          <div className="mx-auto max-w-2xl">
            <SearchBar size="lg" />
          </div>
        </div>
      )}

      {/* Search compacta quando tem query */}
      {query && (
        <div className="mb-6">
          <SearchBar initialValue={query} />
          <p className="mt-2.5 text-sm text-zinc-500">
            {parts.length === 0
              ? `Nenhum resultado para "${query}"`
              : `${parts.length} peça${parts.length > 1 ? 's' : ''} encontrada${parts.length > 1 ? 's' : ''} para "${query}"`}
          </p>
        </div>
      )}

      <div className="flex gap-6">
        {/* Conteúdo principal */}
        <div className="flex-1 min-w-0">

          {/* Grid de categorias — mostrado apenas sem busca */}
          {!query && categories.length > 0 && (
            <section className="mb-10">
              <div className="mb-5 flex items-center gap-3">
                <h2 className="font-display text-sm font-bold uppercase tracking-widest text-zinc-500">
                  Categorias
                </h2>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
                {categories.map(([cat, count]) => (
                  <CategoryCard key={cat} category={cat} partCount={count} />
                ))}
              </div>
            </section>
          )}

          {/* Todas as peças ou resultados de busca */}
          {parts.length === 0 && query ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center">
              <Search className="mx-auto mb-4 h-10 w-10 text-zinc-700" />
              <h3 className="mb-1 font-display text-lg font-bold uppercase tracking-wide text-zinc-400">
                Peça não encontrada
              </h3>
              <p className="mb-4 text-sm text-zinc-600">
                Tente outro termo ou contribua adicionando esta peça.
              </p>
              <Link
                href="/contribuir"
                className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
              >
                <PlusCircle className="h-4 w-4" />
                Sugerir peça
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {resultCategories.map((category, catIdx) => {
                const categoryParts = parts.filter((p) => p.category === category)
                return (
                  <div key={category}>
                    {/* Cabeçalho da categoria */}
                    <div className="mb-3 flex items-center gap-3">
                      <span className="font-display text-xs font-bold uppercase tracking-widest text-orange-500">
                        {category}
                      </span>
                      <div className="h-px flex-1 bg-zinc-800" />
                    </div>

                    <div className="space-y-2">
                      {categoryParts.map((part) => (
                        <Link
                          key={part.id}
                          href={`/pecas/${part.id}`}
                          className="group flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition-all hover:border-orange-500/40 hover:bg-zinc-900/80 hover:shadow-orange-glow-sm"
                        >
                          <div>
                            <p className="font-semibold text-white transition group-hover:text-orange-400">
                              {part.name}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {[...new Set(part.compatibleParts.map((cp) => cp.compatibilityLevel))].map(
                                (level) => (
                                  <CompatibilityBadge key={level} level={level} size="sm" />
                                )
                              )}
                            </div>
                          </div>
                          <div className="ml-4 flex shrink-0 items-center gap-2 text-sm text-zinc-600">
                            <span className="hidden sm:block">{part.compatibleParts.length} opção(ões)</span>
                            <ChevronRight className="h-5 w-5 transition group-hover:translate-x-0.5 group-hover:text-orange-500" />
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* Ad entre categorias */}
                    {catIdx === 0 && resultCategories.length > 1 && (
                      <div className="mt-4 flex justify-center">
                        <AdBanner slot="inline" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* CTA contribuição (sem busca, na home) */}
          {!query && parts.length > 0 && (
            <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6 sm:flex-row">
              <div>
                <p className="font-display font-bold uppercase tracking-wide text-white">
                  Conhece uma peça compatível?
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  Ajude outros donos de Virago compartilhando seu conhecimento.
                </p>
              </div>
              <Link
                href="/contribuir"
                className="flex shrink-0 items-center gap-2 rounded-xl border border-orange-500 bg-orange-500/10 px-5 py-2.5 text-sm font-semibold text-orange-400 transition hover:bg-orange-500 hover:text-white"
              >
                <PlusCircle className="h-4 w-4" />
                Contribuir
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 space-y-4">
            <AdBanner slot="sidebar" />
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <p className="font-display text-sm font-bold uppercase tracking-wide text-white">
                Contribuir
              </p>
              <p className="mt-1.5 text-xs text-zinc-500">
                Compartilhe peças compatíveis com a comunidade.
              </p>
              <Link
                href="/contribuir"
                className="mt-3 block rounded-lg bg-orange-500 py-2 text-center text-xs font-bold uppercase tracking-wider text-white transition hover:bg-orange-600"
              >
                Adicionar Peça
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import SearchBar from '@/components/SearchBar'
import AdPlaceholder from '@/components/AdPlaceholder'
import CompatibilityBadge from '@/components/CompatibilityBadge'
import { Tag, ChevronRight, Bike } from 'lucide-react'

interface SearchParams {
  q?: string
}

async function searchParts(query: string) {
  return prisma.part.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { category: { contains: query } },
        { description: { contains: query } },
      ],
    },
    include: {
      compatibleParts: {
        select: { compatibilityLevel: true },
      },
    },
    orderBy: { name: 'asc' },
  })
}

async function getAllParts() {
  return prisma.part.findMany({
    include: {
      compatibleParts: {
        select: { compatibilityLevel: true },
      },
    },
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

  const categories = [...new Set(parts.map((p) => p.category))]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Banner Topo */}
      <div className="mb-6 flex justify-center">
        <AdPlaceholder slot="top" />
      </div>

      {/* Hero */}
      {!query && (
        <div className="mb-10 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-orange-100 p-4">
              <Bike className="h-10 w-10 text-orange-600" />
            </div>
          </div>
          <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">
            Peças Compatíveis para
            <span className="text-orange-600"> Yamaha Virago 250</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-gray-600">
            Banco de dados colaborativo com níveis de compatibilidade detalhados, instruções de
            adaptação e links de compra. Encontre a peça certa para a sua moto.
          </p>
          <div className="mx-auto max-w-2xl">
            <SearchBar size="lg" />
          </div>
        </div>
      )}

      {/* Search bar compacta quando tem query */}
      {query && (
        <div className="mb-6">
          <SearchBar initialValue={query} />
          <p className="mt-2 text-sm text-gray-500">
            {parts.length === 0
              ? `Nenhuma peça encontrada para "${query}"`
              : `${parts.length} peça(s) encontrada(s) para "${query}"`}
          </p>
        </div>
      )}

      {/* Resultados */}
      <div className="flex gap-6">
        {/* Lista de peças */}
        <div className="flex-1">
          {parts.length === 0 && query ? (
            <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
              <Tag className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <h3 className="mb-1 font-semibold text-gray-700">Peça não encontrada</h3>
              <p className="text-sm text-gray-500">
                Tente um termo diferente ou{' '}
                <Link href="/contribuir" className="text-orange-600 hover:underline">
                  contribua adicionando esta peça
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((category, catIdx) => {
                const categoryParts = parts.filter((p) => p.category === category)
                return (
                  <div key={category}>
                    {!query && (
                      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                        <span className="h-px flex-1 bg-gray-200" />
                        {category}
                        <span className="h-px flex-1 bg-gray-200" />
                      </h2>
                    )}
                    <div className="grid gap-3 sm:grid-cols-1">
                      {categoryParts.map((part) => (
                        <Link
                          key={part.id}
                          href={`/pecas/${part.id}`}
                          className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-orange-300 hover:shadow-md"
                        >
                          <div>
                            <p className="font-semibold text-gray-900 group-hover:text-orange-700">
                              {part.name}
                            </p>
                            <p className="mt-0.5 text-sm text-gray-500">{part.category}</p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {[...new Set(part.compatibleParts.map((cp) => cp.compatibilityLevel))].map(
                                (level) => (
                                  <CompatibilityBadge key={level} level={level} size="sm" />
                                )
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{part.compatibleParts.length} opção(ões)</span>
                            <ChevronRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-orange-500" />
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* Banner inline entre categorias */}
                    {catIdx === 0 && categories.length > 1 && (
                      <div className="mt-4 flex justify-center">
                        <AdPlaceholder slot="inline" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Sidebar com ad */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-24">
            <AdPlaceholder slot="sidebar" />
            <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-4">
              <h3 className="mb-2 font-semibold text-orange-800">Conhece uma peça compatível?</h3>
              <p className="mb-3 text-sm text-orange-700">
                Ajude a comunidade contribuindo com seu conhecimento.
              </p>
              <Link
                href="/contribuir"
                className="block rounded-lg bg-orange-600 py-2 text-center text-sm font-semibold text-white transition hover:bg-orange-700"
              >
                Adicionar peça
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

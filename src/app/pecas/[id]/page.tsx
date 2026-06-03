import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import CompatibilityBadge from '@/components/CompatibilityBadge'
import VideoEmbed from '@/components/VideoEmbed'
import AdPlaceholder from '@/components/AdPlaceholder'
import { ArrowLeft, ExternalLink, Info, ShoppingCart, Tag } from 'lucide-react'

async function getPart(id: string) {
  return prisma.part.findUnique({
    where: { id },
    include: {
      compatibleParts: {
        include: { videos: true },
        orderBy: { compatibilityLevel: 'asc' },
      },
    },
  })
}

function formatPrice(price: number | null) {
  if (!price) return null
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function PartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const part = await getPart(id)

  if (!part) notFound()

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Banner topo */}
      <div className="mb-6 flex justify-center">
        <AdPlaceholder slot="top" />
      </div>

      {/* Breadcrumb */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para a busca
      </Link>

      <div className="flex gap-6">
        {/* Conteúdo principal */}
        <div className="flex-1">
          {/* Cabeçalho da peça */}
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <span className="mb-2 inline-block rounded-full bg-orange-100 px-3 py-0.5 text-xs font-medium text-orange-700">
                  {part.category}
                </span>
                <h1 className="text-2xl font-bold text-gray-900">{part.name}</h1>
                {part.description && (
                  <p className="mt-1 text-gray-600">{part.description}</p>
                )}
              </div>
              <Tag className="h-8 w-8 shrink-0 text-orange-300" />
            </div>
            <p className="mt-4 text-sm text-gray-500">
              {part.compatibleParts.length} opção(ões) compatível(is) encontrada(s)
            </p>
          </div>

          {/* Legenda de compatibilidade */}
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">Entenda os níveis de compatibilidade</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <CompatibilityBadge level="ENCAIXE_PERFEITO" size="sm" />
                  <CompatibilityBadge level="ADAPTACAO_SIMPLES" size="sm" />
                  <CompatibilityBadge level="ADAPTACAO_COMPLEXA" size="sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Lista de peças compatíveis */}
          <div className="space-y-4">
            {part.compatibleParts.map((cp, index) => (
              <div key={cp.id}>
                <div
                  className={`rounded-xl border bg-white p-5 shadow-sm ${
                    cp.compatibilityLevel === 'ENCAIXE_PERFEITO'
                      ? 'border-green-200'
                      : cp.compatibilityLevel === 'ADAPTACAO_SIMPLES'
                      ? 'border-yellow-200'
                      : 'border-red-200'
                  }`}
                >
                  {/* Cabeçalho do card */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-bold text-gray-900">{cp.name}</h2>
                        {cp.brand && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                            {cp.brand}
                          </span>
                        )}
                        {cp.partNumber && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-600">
                            #{cp.partNumber}
                          </span>
                        )}
                      </div>
                      {cp.price && (
                        <p className="mt-1 text-lg font-semibold text-green-700">
                          {formatPrice(cp.price)}
                        </p>
                      )}
                    </div>
                    <CompatibilityBadge level={cp.compatibilityLevel} />
                  </div>

                  {/* Notas */}
                  {cp.notes && (
                    <p className="mt-3 text-sm text-gray-600">{cp.notes}</p>
                  )}

                  {/* Texto de adaptação */}
                  {cp.adaptationText && (
                    <div
                      className={`mt-4 rounded-lg p-4 ${
                        cp.compatibilityLevel === 'ADAPTACAO_SIMPLES'
                          ? 'bg-yellow-50 border border-yellow-200'
                          : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      <p
                        className={`mb-2 text-xs font-bold uppercase tracking-wider ${
                          cp.compatibilityLevel === 'ADAPTACAO_SIMPLES'
                            ? 'text-yellow-700'
                            : 'text-red-700'
                        }`}
                      >
                        Como fazer a adaptação
                      </p>
                      <p className="text-sm leading-relaxed text-gray-700">{cp.adaptationText}</p>
                    </div>
                  )}

                  {/* Vídeos */}
                  {cp.videos.length > 0 && <VideoEmbed videos={cp.videos} />}

                  {/* Botão de compra */}
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="text-xs text-gray-400">Link de compra</span>
                    <a
                      href={cp.purchaseLink}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Comprar
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                {/* Banner inline entre peças */}
                {index === 0 && part.compatibleParts.length > 1 && (
                  <div className="my-4 flex justify-center">
                    <AdPlaceholder slot="inline" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA contribuição */}
          <div className="mt-6 rounded-xl border border-dashed border-orange-300 bg-orange-50 p-5 text-center">
            <p className="mb-2 text-sm font-medium text-orange-800">
              Conhece outra peça compatível com {part.name}?
            </p>
            <Link
              href={`/contribuir?peca=${encodeURIComponent(part.name)}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
            >
              Sugerir peça compatível
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-24">
            <AdPlaceholder slot="sidebar" />
          </div>
        </aside>
      </div>
    </div>
  )
}

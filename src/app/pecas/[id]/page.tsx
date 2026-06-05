import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import CompatibilityBadge from '@/components/CompatibilityBadge'
import VideoEmbed from '@/components/VideoEmbed'
import AdBanner from '@/components/AdBanner'
import { categoryConfig } from '@/components/CategoryCard'
import { convertToAffiliateLink, PLATFORM_BUTTON } from '@/lib/affiliateLinks'
import LinkSuggestionForm from '@/components/LinkSuggestionForm'
import CommentsSection from '@/components/CommentsSection'
import { ArrowLeft, ExternalLink, ShoppingCart } from 'lucide-react'

async function getPart(id: string) {
  return prisma.part.findUnique({
    where: { id },
    include: {
      compatibleParts: {
        include: {
          videos: true,
          purchaseLinks: { orderBy: { createdAt: 'asc' } },
          _count: { select: { comments: { where: { approved: true } } } },
        },
        orderBy: { compatibilityLevel: 'asc' },
      },
    },
  })
}

function formatPrice(price: number | null) {
  if (!price) return null
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const adaptationStyle = {
  ADAPTACAO_SIMPLES: {
    bg: 'bg-yellow-500/10 border-yellow-500/30',
    title: 'text-yellow-600 dark:text-yellow-400',
    bar: 'bg-yellow-500',
  },
  ADAPTACAO_COMPLEXA: {
    bg: 'bg-red-500/10 border-red-500/30',
    title: 'text-red-600 dark:text-red-400',
    bar: 'bg-red-500',
  },
}

export default async function PartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [part, affiliateConfigs] = await Promise.all([
    getPart(id),
    prisma.affiliateConfig.findMany(),
  ])
  if (!part) notFound()

  const catCfg = categoryConfig[part.category]
  const CatIcon = catCfg?.icon

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Ad topo */}
      <div className="mb-6 flex justify-center">
        <AdBanner slot="top" />
      </div>

      {/* Breadcrumb */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-orange-500"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para a busca
      </Link>

      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          {/* Cabeçalho da peça */}
          <div className="mb-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="h-1 w-full bg-gradient-to-r from-orange-600 via-orange-400 to-transparent" />
            <div className="flex items-start justify-between gap-4 p-6">
              <div className="flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {CatIcon && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      <CatIcon className="h-3.5 w-3.5 text-orange-500" />
                      {part.category}
                    </span>
                  )}
                  <span className="text-xs text-zinc-500">
                    {part.compatibleParts.length} opção(ões) compatível(is)
                  </span>
                </div>
                <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-zinc-900 dark:text-white md:text-4xl">
                  {part.name}
                </h1>
                {part.description && (
                  <p className="mt-2 text-zinc-600 dark:text-zinc-400">{part.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Lista de peças compatíveis */}
          <div className="space-y-4">
            {part.compatibleParts.map((cp, index) => {
              const style = adaptationStyle[cp.compatibilityLevel as keyof typeof adaptationStyle]

              return (
                <div key={cp.id}>
                  <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex">
                      <div className={`w-1 shrink-0 ${
                        cp.compatibilityLevel === 'ENCAIXE_PERFEITO' ? 'bg-green-500' :
                        cp.compatibilityLevel === 'ADAPTACAO_SIMPLES' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <div className="flex-1 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex flex-1 gap-4">
                            {/* Imagem do produto */}
                            {cp.imageUrl && (
                              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={cp.imageUrl}
                                  alt={cp.name}
                                  className="h-full w-full object-contain p-1"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{cp.name}</h2>
                                {cp.brand && (
                                  <span className="rounded-full border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                                    {cp.brand}
                                  </span>
                                )}
                                {cp.partNumber && (
                                  <span className="rounded-full border border-zinc-200 bg-zinc-100 px-2 py-0.5 font-mono text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                                    #{cp.partNumber}
                                  </span>
                                )}
                              </div>
                              {cp.price && (
                                <p className="mt-1 text-lg font-bold text-green-600 dark:text-green-400">
                                  {formatPrice(cp.price)}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Badge + botões de compra por plataforma */}
                          <div className="flex w-fit shrink-0 flex-col gap-2">
                            <CompatibilityBadge level={cp.compatibilityLevel} className="w-full" />
                            {cp.purchaseLinks.map(pl => {
                              const style = PLATFORM_BUTTON[pl.platform] ?? PLATFORM_BUTTON.other
                              const href = convertToAffiliateLink(pl.url, affiliateConfigs)
                              return (
                                <a
                                  key={pl.id}
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer sponsored"
                                  className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${style.bg} ${style.text} ${style.hover}`}
                                >
                                  <ShoppingCart className="h-5 w-5" />
                                  <div>
                                    <p className="text-sm font-semibold leading-none">{style.label}</p>
                                    <p className="text-xs opacity-70 leading-none mt-0.5">Ver oferta</p>
                                  </div>
                                </a>
                              )
                            })}
                            {/* Fallback para o campo legado */}
                            {cp.purchaseLinks.length === 0 && cp.purchaseLink && (
                              <a
                                href={convertToAffiliateLink(cp.purchaseLink, affiliateConfigs)}
                                target="_blank"
                                rel="noopener noreferrer sponsored"
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
                              >
                                <ShoppingCart className="h-5 w-5" />
                                <div>
                                  <p className="text-sm font-semibold leading-none">Comprar</p>
                                  <p className="text-xs opacity-70 leading-none mt-0.5">Ver oferta</p>
                                </div>
                              </a>
                            )}
                          </div>
                        </div>

                        {cp.notes && (
                          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{cp.notes}</p>
                        )}

                        {cp.adaptationText && style && (
                          <div className={`mt-4 rounded-xl border p-4 ${style.bg}`}>
                            <p className={`mb-2 text-xs font-bold uppercase tracking-widest ${style.title}`}>
                              Como fazer a adaptação
                            </p>
                            <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                              {cp.adaptationText}
                            </p>
                          </div>
                        )}

                        {cp.videos.length > 0 && <VideoEmbed videos={cp.videos} />}

                        <LinkSuggestionForm
                          compatiblePartId={cp.id}
                          compatiblePartName={cp.name}
                        />
                        <CommentsSection
                          compatiblePartId={cp.id}
                          initialCount={cp._count.comments}
                        />

                      </div>
                    </div>
                  </div>

                  {index === 0 && part.compatibleParts.length > 1 && (
                    <div className="my-4 flex justify-center">
                      <AdBanner slot="inline" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* CTA contribuição */}
          <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-dashed border-orange-500/30 bg-orange-500/5 p-5 sm:flex-row">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Conhece outra peça compatível com{' '}
              <span className="font-semibold text-zinc-900 dark:text-white">{part.name}</span>?
            </p>
            <Link
              href={`/contribuir?peca=${encodeURIComponent(part.name)}`}
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-orange-500 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-500 transition hover:bg-orange-500 hover:text-white"
            >
              Sugerir peça compatível
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24">
            <AdBanner slot="sidebar" />
          </div>
        </aside>
      </div>
    </div>
  )
}

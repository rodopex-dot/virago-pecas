import { prisma } from '@/lib/prisma'
import AdBanner from '@/components/AdBanner'
import {
  BookOpen, Download, FileText, ExternalLink, Bike, FolderOpen
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Manuais e Catálogos — Virago 250 Peças',
  description:
    'Baixe manuais, catálogos e fichas técnicas da Yamaha Virago 250. Material de referência para manutenção e peças.',
}

const CATEGORY_ICONS: Record<string, typeof BookOpen> = {
  'Manual':         BookOpen,
  'Catálogo':       FolderOpen,
  'Ficha Técnica':  FileText,
}

async function getManuals() {
  return prisma.manual.findMany({
    where: { active: true },
    orderBy: [{ category: 'asc' }, { title: 'asc' }],
  })
}

function isExternalLink(url: string) {
  return url.startsWith('http://') || url.startsWith('https://')
}

export default async function ManuaisPage() {
  const manuals = await getManuals()

  // Agrupar por categoria
  const grouped = manuals.reduce<Record<string, typeof manuals>>((acc, m) => {
    const cat = m.category || 'Outros'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(m)
    return acc
  }, {})

  const categories = Object.keys(grouped).sort()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Ad top */}
      <div className="mb-8 flex justify-center">
        <AdBanner slot="top" />
      </div>

      {/* Hero */}
      <div className="mb-10 text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-orange-500">
          <Bike className="h-3.5 w-3.5" />
          Yamaha Virago 250
        </div>
        <h1 className="font-display mb-4 text-4xl font-bold uppercase leading-tight tracking-wide text-zinc-900 dark:text-white md:text-5xl">
          Manuais e <span className="text-orange-500">Catálogos</span>
        </h1>
        <p className="mx-auto max-w-xl text-zinc-600 dark:text-zinc-400">
          Material de referência para manutenção, peças e especificações técnicas da Virago 250.
          Faça o download gratuitamente.
        </p>
      </div>

      {/* Conteúdo */}
      {manuals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-16 text-center dark:border-zinc-700">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-zinc-300 dark:text-zinc-700" />
          <h2 className="font-display mb-2 text-lg font-bold uppercase tracking-wide text-zinc-500">
            Em breve
          </h2>
          <p className="text-sm text-zinc-400 dark:text-zinc-600">
            Estamos preparando os materiais para disponibilização. Volte em breve!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map((category, catIdx) => {
            const Icon = CATEGORY_ICONS[category] ?? FileText
            const items = grouped[category]

            return (
              <div key={category}>
                {/* Cabeçalho da categoria */}
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-orange-500/10 p-1.5">
                    <Icon className="h-4 w-4 text-orange-500" />
                  </div>
                  <h2 className="font-display text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white">
                    {category}
                  </h2>
                  <span className="rounded-full border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800">
                    {items.length}
                  </span>
                  <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                </div>

                {/* Grid de itens */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {items.map(manual => {
                    const external = isExternalLink(manual.fileUrl)
                    return (
                      <a
                        key={manual.id}
                        href={manual.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:border-orange-500/40 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-orange-500/40"
                      >
                        <div className="mt-0.5 rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 transition group-hover:border-orange-500/30 group-hover:bg-orange-500/5 dark:border-zinc-700 dark:bg-zinc-800">
                          <FileText className="h-5 w-5 text-zinc-400 transition group-hover:text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-zinc-900 transition group-hover:text-orange-500 dark:text-white dark:group-hover:text-orange-400 line-clamp-2">
                            {manual.title}
                          </p>
                          {manual.description && (
                            <p className="mt-1 text-xs leading-relaxed text-zinc-500 line-clamp-2">
                              {manual.description}
                            </p>
                          )}
                          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-orange-500">
                            {external ? (
                              <ExternalLink className="h-3.5 w-3.5" />
                            ) : (
                              <Download className="h-3.5 w-3.5" />
                            )}
                            {external ? 'Abrir link' : 'Baixar arquivo'}
                          </div>
                        </div>
                      </a>
                    )
                  })}
                </div>

                {/* Ad inline após primeira categoria */}
                {catIdx === 0 && categories.length > 1 && (
                  <div className="mt-6 flex justify-center">
                    <AdBanner slot="inline" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Sidebar ad (apenas mobile, no desktop fica no layout) */}
      <div className="mt-10 flex justify-center lg:hidden">
        <AdBanner slot="sidebar" />
      </div>

      {/* Aviso */}
      <div className="mt-10 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-xs leading-relaxed text-zinc-500">
          Os materiais disponibilizados aqui são de domínio público ou licenciados para distribuição
          gratuita. A Virago 250 Peças não possui vínculo oficial com a Yamaha Motor Co.
        </p>
      </div>
    </div>
  )
}

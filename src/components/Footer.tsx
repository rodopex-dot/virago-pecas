import Link from 'next/link'
import { Wrench, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-orange-500" />
            <span className="font-display font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
              Virago 250 Peças
            </span>
          </div>
          <p className="flex items-center gap-1 text-sm text-zinc-500">
            Feito com <Heart className="h-3.5 w-3.5 text-orange-500" /> pela comunidade Virago
          </p>
          <nav className="flex gap-5 text-sm text-zinc-500">
            <Link href="/" className="transition hover:text-orange-500">Buscar</Link>
            <Link href="/contribuir" className="transition hover:text-orange-500">Contribuir</Link>
          </nav>
        </div>
        <div className="mt-6 border-t border-zinc-200 pt-6 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-600">
          Este site é mantido pela comunidade e não possui vínculo oficial com a Yamaha Motor Co.
        </div>
      </div>
    </footer>
  )
}

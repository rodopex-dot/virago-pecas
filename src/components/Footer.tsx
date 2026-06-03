import Link from 'next/link'
import { Wrench, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 text-orange-600">
            <Wrench className="h-5 w-5" />
            <span className="font-bold">Virago 250 Peças</span>
          </div>
          <p className="flex items-center gap-1 text-sm text-gray-500">
            Feito com <Heart className="h-4 w-4 text-red-500" /> pela comunidade Virago
          </p>
          <nav className="flex gap-4 text-sm text-gray-500">
            <Link href="/" className="hover:text-orange-600">
              Buscar
            </Link>
            <Link href="/contribuir" className="hover:text-orange-600">
              Contribuir
            </Link>
          </nav>
        </div>
        <p className="mt-4 text-center text-xs text-gray-400">
          Este site é mantido pela comunidade e não possui vínculo oficial com a Yamaha Motor Co.
        </p>
      </div>
    </footer>
  )
}

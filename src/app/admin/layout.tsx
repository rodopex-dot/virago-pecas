'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Wrench, LayoutDashboard, Tag, Inbox, Megaphone, FolderOpen,
  Link2, LinkIcon, LogOut, ExternalLink, BookOpen, Mail, MessageCircle,
} from 'lucide-react'

const navItems = [
  { href: '/admin/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/admin/pecas',       label: 'Peças',        icon: Tag },
  { href: '/admin/categorias',  label: 'Categorias',   icon: FolderOpen },
  { href: '/admin/sugestoes',   label: 'Sugestões',    icon: Inbox },
  { href: '/admin/links',       label: 'Links',        icon: LinkIcon },
  { href: '/admin/comentarios', label: 'Comentários',  icon: MessageCircle },
  { href: '/admin/manuais',     label: 'Manuais',      icon: BookOpen },
  { href: '/admin/mensagens',   label: 'Mensagens',    icon: Mail },
  { href: '/admin/anuncios',    label: 'Anúncios',     icon: Megaphone },
  { href: '/admin/afiliados',   label: 'Afiliados',    icon: Link2 },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname === '/admin/login') return <>{children}</>

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">

      {/* Sidebar — ícones só (mobile) | ícones + texto (desktop) */}
      <aside className="flex w-14 shrink-0 flex-col overflow-y-auto border-r border-zinc-800 bg-zinc-900 md:w-60">

        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-center border-b border-zinc-800 md:justify-start md:gap-3 md:px-5">
          <div className="rounded-lg bg-orange-500/10 p-1.5">
            <Wrench className="h-5 w-5 text-orange-500" />
          </div>
          <div className="hidden leading-none md:block">
            <p className="font-display text-sm font-bold uppercase tracking-wider text-white">
              Admin
            </p>
            <p className="text-[10px] text-zinc-500">Virago 250 Peças</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 p-2 md:space-y-1 md:p-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={`flex items-center justify-center rounded-xl py-2.5 text-sm font-medium transition md:justify-start md:gap-3 md:px-3 ${
                  active
                    ? 'bg-orange-500/15 text-orange-400'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-orange-400' : ''}`} />
                <span className="hidden md:block">{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="shrink-0 space-y-0.5 border-t border-zinc-800 p-2 md:space-y-1 md:p-3">
          <Link
            href="/"
            target="_blank"
            title="Ver site"
            className="flex items-center justify-center rounded-xl py-2.5 text-sm text-zinc-500 transition hover:bg-zinc-800 hover:text-white md:justify-start md:gap-3 md:px-3"
          >
            <ExternalLink className="h-[18px] w-[18px]" />
            <span className="hidden md:block">Ver site</span>
          </Link>
          <button
            onClick={handleLogout}
            title="Sair"
            className="flex w-full items-center justify-center rounded-xl py-2.5 text-sm text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400 md:justify-start md:gap-3 md:px-3"
          >
            <LogOut className="h-[18px] w-[18px]" />
            <span className="hidden md:block">Sair</span>
          </button>
        </div>
      </aside>

      {/* Conteúdo */}
      <div className="flex-1 min-h-0 overflow-auto">
        {children}
      </div>

    </div>
  )
}

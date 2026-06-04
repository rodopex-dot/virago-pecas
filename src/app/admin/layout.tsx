'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Wrench, LayoutDashboard, Tag, Inbox, Megaphone, FolderOpen, Link2, LinkIcon, LogOut, ExternalLink, BookOpen, Mail } from 'lucide-react'

const navItems = [
  { href: '/admin/dashboard',   label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/admin/pecas',       label: 'Peças',         icon: Tag },
  { href: '/admin/categorias',  label: 'Categorias',    icon: FolderOpen },
  { href: '/admin/sugestoes',   label: 'Sugestões',     icon: Inbox },
  { href: '/admin/links',       label: 'Links',         icon: LinkIcon },
  { href: '/admin/manuais',     label: 'Manuais',       icon: BookOpen },
  { href: '/admin/mensagens',   label: 'Mensagens',     icon: Mail },
  { href: '/admin/anuncios',    label: 'Anúncios',      icon: Megaphone },
  { href: '/admin/afiliados',   label: 'Afiliados',     icon: Link2 },
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
    <div className="flex min-h-screen bg-zinc-950">
      {/* Sidebar */}
      <aside className="flex w-60 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-zinc-800 px-5">
          <div className="rounded-lg bg-orange-500/10 p-1.5">
            <Wrench className="h-5 w-5 text-orange-500" />
          </div>
          <div className="leading-none">
            <p className="font-display text-sm font-bold uppercase tracking-wider text-white">
              Admin
            </p>
            <p className="text-[10px] text-zinc-500">Virago 250 Peças</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-orange-500/15 text-orange-400'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-orange-400' : ''}`} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="space-y-1 border-t border-zinc-800 p-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
          >
            <ExternalLink className="h-4 w-4" />
            Ver site
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}

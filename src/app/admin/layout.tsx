'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Wrench, LayoutDashboard, Tag, Inbox, Megaphone, FolderOpen,
  Link2, LinkIcon, LogOut, ExternalLink, BookOpen, Mail, MessageCircle,
  Users,
} from 'lucide-react'

type AdminUser = {
  id: string
  name: string
  email: string
  role: string
  permissions: string[]
  active: boolean
}

type NavItem = {
  href: string
  label: string
  icon: React.ElementType
  /** Permission key required. Undefined = always visible. 'superadmin' = superadmin only. */
  permission?: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/admin/pecas',       label: 'Peças',        icon: Tag,            permission: 'pecas' },
  { href: '/admin/categorias',  label: 'Categorias',   icon: FolderOpen,     permission: 'categorias' },
  { href: '/admin/sugestoes',   label: 'Sugestões',    icon: Inbox,          permission: 'sugestoes' },
  { href: '/admin/links',       label: 'Links',        icon: LinkIcon,       permission: 'links' },
  { href: '/admin/comentarios', label: 'Comentários',  icon: MessageCircle,  permission: 'comentarios' },
  { href: '/admin/manuais',     label: 'Manuais',      icon: BookOpen,       permission: 'manuais' },
  { href: '/admin/mensagens',   label: 'Mensagens',    icon: Mail,           permission: 'mensagens' },
  { href: '/admin/anuncios',    label: 'Anúncios',     icon: Megaphone,      permission: 'anuncios' },
  { href: '/admin/afiliados',   label: 'Afiliados',    icon: Link2,          permission: 'afiliados' },
  { href: '/admin/usuarios',    label: 'Usuários',     icon: Users,          permission: 'superadmin' },
]

function canSeeItem(item: NavItem, user: AdminUser | null): boolean {
  // While loading (user is null): show only Dashboard
  if (!user) return !item.permission
  // superadmin sees everything
  if (user.role === 'superadmin') return true
  // no permission required = always visible
  if (!item.permission) return true
  // superadmin-only items
  if (item.permission === 'superadmin') return false
  // editor: check their permissions array
  return user.permissions.includes(item.permission)
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null)

  useEffect(() => {
    if (pathname === '/admin/login') return
    fetch('/api/admin/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setCurrentUser(data) })
      .catch(() => {/* ignore */})
  }, [pathname])

  if (pathname === '/admin/login') return <>{children}</>

  const visibleNavItems = NAV_ITEMS.filter((item) => canSeeItem(item, currentUser))

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">

      {/* Sidebar */}
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
          {visibleNavItems.map(({ href, label, icon: Icon }) => {
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
          {currentUser && currentUser.id !== 'legacy' && (
            <div className="hidden rounded-xl border border-zinc-800 bg-zinc-800/50 px-3 py-2 md:block">
              <p className="truncate text-xs font-semibold text-white">{currentUser.name}</p>
              <p className="truncate text-[10px] text-zinc-500">{currentUser.email}</p>
            </div>
          )}
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

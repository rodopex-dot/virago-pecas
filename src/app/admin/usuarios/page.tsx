'use client'

import { useEffect, useState } from 'react'
import { Users, Plus, Pencil, Trash2, X, Check, Loader2, Shield, UserCheck, UserX } from 'lucide-react'
import { ADMIN_SECTIONS } from '@/lib/adminSections'

type AdminUser = {
  id: string
  name: string
  email: string
  role: string
  permissions: string[]
  active: boolean
  createdAt: string
}

type CurrentUser = {
  id: string
  role: string
}

const ROLE_LABELS: Record<string, string> = {
  superadmin: 'Super Admin',
  editor: 'Editor',
}

const ROLE_COLORS: Record<string, string> = {
  superadmin: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  editor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
}

// ─── Create/Edit Modal ────────────────────────────────────────────────────────

function UserModal({
  user,
  currentUserId,
  onClose,
  onSaved,
}: {
  user: AdminUser | null
  currentUserId: string
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = Boolean(user)
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(user?.role ?? 'editor')
  const [permissions, setPermissions] = useState<string[]>(user?.permissions ?? [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const togglePermission = (key: string) => {
    setPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const body: Record<string, unknown> = { name, role, permissions }
      if (!isEdit) { body.email = email; body.password = password }
      if (isEdit && password) body.password = password

      const res = await fetch(
        isEdit ? `/api/admin/usuarios/${user!.id}` : '/api/admin/usuarios',
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
      )
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Erro ao salvar.')
        return
      }
      onSaved()
      onClose()
    } catch {
      setError('Erro de conexão.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <h2 className="text-base font-bold text-white">
            {isEdit ? 'Editar usuário' : 'Novo usuário'}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Nome</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                placeholder="Nome completo"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              >
                <option value="editor">Editor</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>
          </div>

          {!isEdit && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                placeholder="usuario@exemplo.com"
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Senha {isEdit && <span className="font-normal normal-case text-zinc-500">(deixe em branco para não alterar)</span>}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!isEdit}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              placeholder="••••••••"
            />
          </div>

          {role === 'editor' && (
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Permissões</label>
              <div className="grid grid-cols-3 gap-2">
                {ADMIN_SECTIONS.map((s) => (
                  <label
                    key={s.key}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                      permissions.includes(s.key)
                        ? 'border-orange-500/50 bg-orange-500/10 text-orange-400'
                        : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={permissions.includes(s.key)}
                      onChange={() => togglePermission(s.key)}
                    />
                    {permissions.includes(s.key) && <Check className="h-3 w-3 shrink-0" />}
                    {s.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalUser, setModalUser] = useState<AdminUser | null | undefined>(undefined)
  // undefined = closed, null = create new, AdminUser = edit
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const [usersRes, meRes] = await Promise.all([
        fetch('/api/admin/usuarios'),
        fetch('/api/admin/me'),
      ])
      if (usersRes.ok) setUsers(await usersRes.json())
      if (meRes.ok) setCurrentUser(await meRes.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return
    setDeletingId(id)
    try {
      await fetch(`/api/admin/usuarios/${id}`, { method: 'DELETE' })
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleActive = async (user: AdminUser) => {
    setTogglingId(user.id)
    try {
      const res = await fetch(`/api/admin/usuarios/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !user.active }),
      })
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, active: !u.active } : u)),
        )
      }
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-orange-500/10 p-2.5">
            <Users className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Usuários</h1>
            <p className="text-sm text-zinc-500">Gerenciamento de acesso ao painel</p>
          </div>
        </div>
        <button
          onClick={() => setModalUser(null)}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Novo usuário</span>
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 py-16 text-center">
          <Users className="mx-auto mb-3 h-8 w-8 text-zinc-600" />
          <p className="text-zinc-500">Nenhum usuário cadastrado.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Usuário</th>
                <th className="hidden px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 md:table-cell">Role</th>
                <th className="hidden px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 lg:table-cell">Permissões</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-900/30">
              {users.map((user) => (
                <tr key={user.id} className="transition hover:bg-zinc-800/30">
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-semibold text-white">{user.name}</p>
                      <p className="text-xs text-zinc-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="hidden px-5 py-4 md:table-cell">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${ROLE_COLORS[user.role] ?? 'bg-zinc-700/50 text-zinc-400 border-zinc-600'}`}>
                      <Shield className="h-3 w-3" />
                      {ROLE_LABELS[user.role] ?? user.role}
                    </span>
                  </td>
                  <td className="hidden px-5 py-4 lg:table-cell">
                    {user.role === 'superadmin' ? (
                      <span className="text-xs text-zinc-500">Acesso total</span>
                    ) : user.permissions.length === 0 ? (
                      <span className="text-xs text-zinc-600">Sem permissões</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {user.permissions.map((p) => {
                          const section = ADMIN_SECTIONS.find((s) => s.key === p)
                          return (
                            <span key={p} className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                              {section?.label ?? p}
                            </span>
                          )
                        })}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      user.active
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-zinc-700/50 text-zinc-500'
                    }`}>
                      {user.active ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                      {user.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleActive(user)}
                        disabled={togglingId === user.id || currentUser?.id === user.id}
                        title={user.active ? 'Desativar' : 'Ativar'}
                        className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-700 hover:text-white disabled:opacity-30"
                      >
                        {togglingId === user.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : user.active
                            ? <UserX className="h-4 w-4" />
                            : <UserCheck className="h-4 w-4" />
                        }
                      </button>
                      <button
                        onClick={() => setModalUser(user)}
                        title="Editar"
                        className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-700 hover:text-white"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={deletingId === user.id || currentUser?.id === user.id}
                        title="Excluir"
                        className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-red-500/15 hover:text-red-400 disabled:opacity-30"
                      >
                        {deletingId === user.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Trash2 className="h-4 w-4" />
                        }
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalUser !== undefined && (
        <UserModal
          user={modalUser}
          currentUserId={currentUser?.id ?? ''}
          onClose={() => setModalUser(undefined)}
          onSaved={load}
        />
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Wrench, Lock, Loader2, Eye, EyeOff } from 'lucide-react'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Erro ao fazer login.')
        return
      }
      router.push('/admin/dashboard')
    } catch {
      setError('Erro de conexão.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      {/* Glow de fundo */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-96 w-96 rounded-full bg-orange-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4">
            <Wrench className="h-8 w-8 text-orange-500" />
          </div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-widest text-white">
            Admin
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Virago 250 Peças</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
          <div className="mb-6">
            <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
              <Lock className="h-3.5 w-3.5" />
              Senha de acesso
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                placeholder="••••••••••"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 pr-12 text-white placeholder-zinc-600 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 font-display font-bold uppercase tracking-wider text-white transition hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

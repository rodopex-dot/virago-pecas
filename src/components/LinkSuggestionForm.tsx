'use client'

import { useState } from 'react'
import { Link2, X, Loader2, CheckCircle, ShoppingCart } from 'lucide-react'

interface Props {
  compatiblePartId: string
  compatiblePartName: string
}

export default function LinkSuggestionForm({ compatiblePartId, compatiblePartName }: Props) {
  const [mode, setMode] = useState<boolean>(false)
  const [form, setForm] = useState({ purchaseLink: '', submitterEmail: '', notes: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.purchaseLink.trim()) {
      setError('Informe o link de compra.')
      return
    }
    setStatus('loading')
    setError('')
    try {
      const res = await fetch('/api/link-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ compatiblePartId, ...form }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erro ao enviar.')
      }
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido.')
      setStatus('error')
    }
  }

  const handleClose = () => {
    setMode(false)
    setForm({ purchaseLink: '', submitterEmail: '', notes: '' })
    setStatus('idle')
    setError('')
  }

  const inputClass = 'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-600'
  const labelClass = 'mb-1 block text-xs font-semibold text-zinc-500 dark:text-zinc-400'

  if (status === 'success') {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-600 dark:text-green-400">
        <CheckCircle className="h-4 w-4 shrink-0" />
        Sugestão enviada! Será analisada pela equipe.
        <button onClick={handleClose} className="ml-auto text-xs underline opacity-70 hover:opacity-100">fechar</button>
      </div>
    )
  }

  return (
    <div className="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
      {!mode ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 dark:text-zinc-500">Conhece um link?</span>
          <button
            onClick={() => setMode(true)}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:border-orange-500 hover:bg-orange-500/5 hover:text-orange-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-orange-500/50 dark:hover:text-orange-400"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Sugerir compra
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 dark:bg-orange-500/5">
          <div className="mb-3 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400">
              <ShoppingCart className="h-3.5 w-3.5" />
              Sugerir link de compra —{' '}
              <span className="font-normal text-zinc-600 dark:text-zinc-400">{compatiblePartName}</span>
            </p>
            <button onClick={handleClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
                <label className={labelClass}>Link de compra</label>
                <input
                  type="url"
                  value={form.purchaseLink}
                  onChange={e => setForm(f => ({ ...f, purchaseLink: e.target.value }))}
                  placeholder="https://www.mercadolivre.com.br/..."
                  className={inputClass}
                  autoFocus
                />
              </div>

            <div>
              <label className={labelClass}>Observação (opcional)</label>
              <input
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Ex: testei pessoalmente, encaixe perfeito"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Seu e-mail (opcional)</label>
              <input
                type="email"
                value={form.submitterEmail}
                onChange={e => setForm(f => ({ ...f, submitterEmail: e.target.value }))}
                placeholder="para@exemplo.com"
                className={inputClass}
              />
            </div>

            {(status === 'error' || error) && (
              <p className="text-xs text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600 disabled:opacity-50"
            >
              {status === 'loading'
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
                : <><Link2 className="h-4 w-4" /> Enviar sugestão</>}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

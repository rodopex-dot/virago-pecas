'use client'

import { useState } from 'react'
import {
  MessageSquare, BookOpen, Megaphone,
  Send, CheckCircle, Loader2, AlertCircle
} from 'lucide-react'

const TYPE_OPTIONS = [
  { value: 'duvida',     label: 'Dúvida',       icon: MessageSquare, desc: 'Preciso de ajuda ou informação' },
  { value: 'sugestao',   label: 'Sugestão',      icon: BookOpen,      desc: 'Tenho uma ideia ou melhoria' },
  { value: 'anunciante', label: 'Anunciante',    icon: Megaphone,     desc: 'Quero anunciar no site' },
]

export default function ContactForm() {
  const [form, setForm] = useState({
    name: '', email: '', type: '', subject: '', message: '',
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.type || !form.message) return

    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setStatus('success')
        setForm({ name: '', email: '', type: '', subject: '', message: '' })
      } else {
        const data = await res.json()
        setErrorMsg(data.error ?? 'Erro ao enviar mensagem.')
        setStatus('error')
      }
    } catch {
      setErrorMsg('Erro de conexão. Tente novamente.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="rounded-full bg-green-500/10 p-4">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
        <div>
          <p className="font-display font-bold uppercase tracking-wide text-zinc-900 dark:text-white">
            Mensagem enviada!
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Recebemos seu contato e retornaremos em breve.
          </p>
        </div>
        <button
          onClick={() => setStatus('idle')}
          className="mt-2 rounded-xl border border-zinc-200 px-5 py-2 text-sm font-semibold text-zinc-600 transition hover:border-orange-500 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-400"
        >
          Enviar outra mensagem
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Tipo */}
      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-500">
          Motivo do contato *
        </label>
        <div className="grid gap-2 sm:grid-cols-3">
          {TYPE_OPTIONS.map(({ value, label, icon: Icon, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleChange('type', value)}
              className={`flex flex-col items-start gap-1.5 rounded-xl border p-3.5 text-left transition ${
                form.type === value
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-zinc-200 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500'
              }`}
            >
              <Icon className={`h-4 w-4 ${form.type === value ? 'text-orange-500' : 'text-zinc-400'}`} />
              <span className={`text-sm font-semibold ${form.type === value ? 'text-orange-500' : 'text-zinc-900 dark:text-white'}`}>
                {label}
              </span>
              <span className="text-[11px] text-zinc-500">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">
            Nome *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => handleChange('name', e.target.value)}
            placeholder="Seu nome"
            required
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-600"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">
            E-mail *
          </label>
          <input
            type="email"
            value={form.email}
            onChange={e => handleChange('email', e.target.value)}
            placeholder="seu@email.com"
            required
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-600"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">
          Título (opcional)
        </label>
        <input
          type="text"
          value={form.subject}
          onChange={e => handleChange('subject', e.target.value)}
          placeholder="Resumo breve do contato"
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-600"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">
          Mensagem *
        </label>
        <textarea
          value={form.message}
          onChange={e => handleChange('message', e.target.value)}
          rows={5}
          placeholder="Descreva sua dúvida, sugestão ou interesse em anunciar..."
          required
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-600"
        />
      </div>

      {status === 'error' && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <p className="text-sm text-red-400">{errorMsg}</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={status === 'sending' || !form.name || !form.email || !form.type || !form.message}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === 'sending' ? (
            <><Loader2 className="h-4 w-4 animate-spin" />Enviando...</>
          ) : (
            <><Send className="h-4 w-4" />Enviar Mensagem</>
          )}
        </button>
      </div>
    </form>
  )
}

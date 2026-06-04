'use client'

import { useEffect, useState } from 'react'
import {
  Mail, MessageSquare, BookOpen, Megaphone,
  Loader2, CheckCircle, Trash2, Eye, EyeOff, AlertCircle
} from 'lucide-react'

interface ContactMessage {
  id: string
  name: string
  email: string
  type: string
  subject?: string
  message: string
  read: boolean
  createdAt: string
}

const TYPE_META: Record<string, { label: string; icon: typeof Mail; color: string }> = {
  duvida:     { label: 'Dúvida',      icon: MessageSquare, color: 'blue' },
  sugestao:   { label: 'Sugestão',    icon: BookOpen,      color: 'amber' },
  anunciante: { label: 'Anunciante',  icon: Megaphone,     color: 'green' },
}

function formatDate(date: string) {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function AdminMensagensPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const showFeedback = (type: 'success' | 'error', msg: string) => {
    setFeedback({ type, msg })
    setTimeout(() => setFeedback(null), 3000)
  }

  useEffect(() => {
    setLoading(true)
    const param = filter === 'all' ? '' : `?read=${filter === 'read'}`
    fetch(`/api/admin/contact-messages${param}`)
      .then(r => r.json())
      .then(setMessages)
      .finally(() => setLoading(false))
  }, [filter])

  const handleToggleRead = async (msg: ContactMessage) => {
    const res = await fetch(`/api/admin/contact-messages/${msg.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: !msg.read }),
    })
    if (res.ok) {
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: !m.read } : m))
    }
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/contact-messages/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setMessages(prev => prev.filter(m => m.id !== id))
      setDeleteConfirm(null)
      showFeedback('success', 'Mensagem excluída.')
    } else {
      showFeedback('error', 'Erro ao excluir.')
    }
  }

  const unreadCount = messages.filter(m => !m.read).length

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display flex items-center gap-3 text-3xl font-bold uppercase tracking-wide text-white">
            <Mail className="h-7 w-7 text-orange-500" />
            Mensagens de Contato
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Mensagens enviadas pelo formulário da página Sobre.
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-bold text-orange-400">
                {unreadCount} não lida{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`mb-6 flex items-center gap-2 rounded-xl border px-4 py-3 ${
          feedback.type === 'success'
            ? 'border-green-500/30 bg-green-500/10 text-green-400'
            : 'border-red-500/30 bg-red-500/10 text-red-400'
        }`}>
          {feedback.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span className="text-sm">{feedback.msg}</span>
        </div>
      )}

      {/* Filtros */}
      <div className="mb-6 flex gap-2">
        {(['all', 'unread', 'read'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              filter === f
                ? 'bg-orange-500 text-white'
                : 'border border-zinc-700 text-zinc-400 hover:text-white'
            }`}
          >
            {f === 'all' ? 'Todas' : f === 'unread' ? 'Não lidas' : 'Lidas'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      ) : messages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-700 p-16 text-center">
          <Mail className="mx-auto mb-4 h-10 w-10 text-zinc-700" />
          <p className="font-display font-bold uppercase tracking-wide text-zinc-600">Nenhuma mensagem</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map(msg => {
            const meta = TYPE_META[msg.type] ?? { label: msg.type, icon: Mail, color: 'zinc' }
            const TypeIcon = meta.icon
            const isExpanded = expanded === msg.id

            return (
              <div
                key={msg.id}
                className={`rounded-2xl border transition ${
                  msg.read
                    ? 'border-zinc-800 bg-zinc-900'
                    : 'border-orange-500/20 bg-zinc-900'
                }`}
              >
                {/* Cabeçalho */}
                <div
                  className="flex cursor-pointer items-center gap-4 p-5"
                  onClick={() => {
                    setExpanded(isExpanded ? null : msg.id)
                    if (!msg.read) handleToggleRead(msg)
                  }}
                >
                  {/* Indicador não lido */}
                  <div className={`h-2 w-2 shrink-0 rounded-full ${msg.read ? 'bg-transparent' : 'bg-orange-500'}`} />

                  <div className={`rounded-lg p-2 bg-${meta.color}-500/10`}>
                    <TypeIcon className={`h-4 w-4 text-${meta.color}-400`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${msg.read ? 'text-zinc-300' : 'text-white'}`}>
                        {msg.name}
                      </span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold border-${meta.color}-500/30 text-${meta.color}-400`}>
                        {meta.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-zinc-500">{msg.email}</span>
                      {msg.subject && (
                        <>
                          <span className="text-zinc-700">·</span>
                          <span className="truncate text-xs text-zinc-500">{msg.subject}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <span className="shrink-0 text-xs text-zinc-600">{formatDate(msg.createdAt)}</span>
                </div>

                {/* Conteúdo expandido */}
                {isExpanded && (
                  <div className="border-t border-zinc-800 px-5 pb-5 pt-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                      {msg.message}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <a
                        href={`mailto:${msg.email}?subject=Re: ${msg.subject || 'Contato Virago 250 Peças'}`}
                        className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:border-orange-500 hover:text-orange-400"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Responder por e-mail
                      </a>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleRead(msg)}
                          className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white"
                          title={msg.read ? 'Marcar como não lida' : 'Marcar como lida'}
                        >
                          {msg.read ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          {msg.read ? 'Não lida' : 'Lida'}
                        </button>

                        {deleteConfirm === msg.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(msg.id)}
                              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(msg.id)}
                            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 p-1.5 text-zinc-500 hover:border-red-500/50 hover:text-red-400"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

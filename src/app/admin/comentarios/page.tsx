'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  MessageCircle, CheckCircle, Trash2, Loader2,
  ThumbsUp, Eye, EyeOff, AlertCircle,
} from 'lucide-react'

interface Comment {
  id: string
  authorName: string
  authorEmail: string
  content: string
  likes: number
  approved: boolean
  createdAt: string
  compatiblePart: {
    name: string
    part: { name: string }
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

type Filter = 'pending' | 'approved' | 'all'

export default function AdminComentariosPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('pending')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const showFeedback = (type: 'success' | 'error', msg: string) => {
    setFeedback({ type, msg })
    setTimeout(() => setFeedback(null), 3000)
  }

  const load = useCallback(() => {
    setLoading(true)
    const param =
      filter === 'pending' ? '?approved=false' :
      filter === 'approved' ? '?approved=true' : ''
    fetch(`/api/admin/comments${param}`)
      .then(r => r.json())
      .then(setComments)
      .finally(() => setLoading(false))
  }, [filter])

  useEffect(() => { load() }, [load])

  const handleApprove = async (comment: Comment) => {
    const newApproved = !comment.approved
    const res = await fetch(`/api/admin/comments/${comment.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved: newApproved }),
    })
    if (res.ok) {
      setComments(prev => prev.map(c =>
        c.id === comment.id ? { ...c, approved: newApproved } : c
      ))
      showFeedback('success', newApproved ? 'Comentário aprovado!' : 'Comentário ocultado.')
    }
  }

  const handleApproveAll = async () => {
    const pending = comments.filter(c => !c.approved)
    if (!pending.length) return
    await Promise.all(
      pending.map(c =>
        fetch(`/api/admin/comments/${c.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ approved: true }),
        })
      )
    )
    setComments(prev => prev.map(c => ({ ...c, approved: true })))
    showFeedback('success', `${pending.length} comentário(s) aprovado(s)!`)
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/comments/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setComments(prev => prev.filter(c => c.id !== id))
      setDeleteConfirm(null)
      showFeedback('success', 'Comentário excluído.')
    } else {
      showFeedback('error', 'Erro ao excluir.')
    }
  }

  const pendingCount = comments.filter(c => !c.approved).length

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display flex items-center gap-3 text-3xl font-bold uppercase tracking-wide text-white">
            <MessageCircle className="h-7 w-7 text-orange-500" />
            Comentários
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Modere os comentários enviados pela comunidade.
            {filter === 'pending' && pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-bold text-orange-400">
                {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>

        {filter === 'pending' && pendingCount > 0 && (
          <button
            onClick={handleApproveAll}
            className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4" />
            Aprovar todos ({pendingCount})
          </button>
        )}
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
        {([
          { key: 'pending',  label: 'Pendentes' },
          { key: 'approved', label: 'Aprovados' },
          { key: 'all',      label: 'Todos' },
        ] as { key: Filter; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              filter === key
                ? 'bg-orange-500 text-white'
                : 'border border-zinc-700 text-zinc-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-700 p-16 text-center">
          <MessageCircle className="mx-auto mb-4 h-10 w-10 text-zinc-700" />
          <p className="font-display font-bold uppercase tracking-wide text-zinc-600">
            Nenhum comentário {filter === 'pending' ? 'pendente' : filter === 'approved' ? 'aprovado' : ''}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map(comment => (
            <div
              key={comment.id}
              className={`rounded-2xl border p-5 transition ${
                comment.approved
                  ? 'border-zinc-800 bg-zinc-900'
                  : 'border-orange-500/20 bg-zinc-900'
              }`}
            >
              {/* Cabeçalho */}
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500/20 text-xs font-bold text-orange-400">
                      {comment.authorName.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-white">{comment.authorName}</span>
                    <span className="text-xs text-zinc-500">{comment.authorEmail}</span>
                    {!comment.approved && (
                      <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold text-orange-400">
                        Pendente
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                    <span>{formatDate(comment.createdAt)}</span>
                    <span>·</span>
                    <span>
                      <span className="text-zinc-400">{comment.compatiblePart.part.name}</span>
                      {' → '}
                      <span className="text-zinc-400">{comment.compatiblePart.name}</span>
                    </span>
                    {comment.likes > 0 && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {comment.likes}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(comment)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                      comment.approved
                        ? 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
                        : 'border-green-500/40 bg-green-500/10 text-green-400 hover:bg-green-500/20'
                    }`}
                  >
                    {comment.approved ? (
                      <><EyeOff className="h-3.5 w-3.5" />Ocultar</>
                    ) : (
                      <><Eye className="h-3.5 w-3.5" />Aprovar</>
                    )}
                  </button>

                  {deleteConfirm === comment.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(comment.id)}
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
                      onClick={() => setDeleteConfirm(comment.id)}
                      className="rounded-lg border border-zinc-700 p-1.5 text-zinc-500 hover:border-red-500/50 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Conteúdo */}
              <p className="whitespace-pre-wrap rounded-lg bg-zinc-800 px-4 py-3 text-sm leading-relaxed text-zinc-300">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

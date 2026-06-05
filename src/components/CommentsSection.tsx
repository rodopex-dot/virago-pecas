'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  MessageCircle, ChevronDown, ChevronUp,
  ThumbsUp, Send, Loader2, CheckCircle, AlertCircle, RefreshCw,
} from 'lucide-react'

interface Comment {
  id: string
  authorName: string
  content: string
  likes: number
  createdAt: string
}

interface Props {
  compatiblePartId: string
  initialCount: number
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) return 'agora mesmo'
  if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d atrás`
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const inputClass =
  'w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-600'

export default function CommentsSection({ compatiblePartId, initialCount }: Props) {
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [count, setCount] = useState(initialCount)
  const [loadingComments, setLoadingComments] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())

  // Captcha
  const [captcha, setCaptcha] = useState<{ question: string; token: string } | null>(null)
  const [loadingCaptcha, setLoadingCaptcha] = useState(false)

  // Form
  const [form, setForm] = useState({ name: '', email: '', content: '', captchaAnswer: '', honeypot: '' })
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [submitError, setSubmitError] = useState('')

  // Load liked IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('liked_comments')
      if (stored) setLikedIds(new Set(JSON.parse(stored)))
    } catch { /* ignore */ }
  }, [])

  const fetchCaptcha = useCallback(async () => {
    setLoadingCaptcha(true)
    try {
      const res = await fetch('/api/captcha')
      setCaptcha(await res.json())
    } finally {
      setLoadingCaptcha(false)
    }
  }, [])

  const fetchComments = useCallback(async () => {
    setLoadingComments(true)
    try {
      const res = await fetch(`/api/comments?compatiblePartId=${compatiblePartId}`)
      const data = await res.json()
      setComments(data)
      setCount(data.length)
      setLoaded(true)
    } finally {
      setLoadingComments(false)
    }
  }, [compatiblePartId])

  const handleOpen = () => {
    setOpen(true)
    if (!loaded) fetchComments()
    if (!captcha) fetchCaptcha()
  }

  const handleClose = () => setOpen(false)

  const handleLike = async (commentId: string) => {
    const isLiked = likedIds.has(commentId)
    const newLiked = new Set(likedIds)
    const action = isLiked ? 'unlike' : 'like'

    // Optimistic update
    if (isLiked) newLiked.delete(commentId)
    else newLiked.add(commentId)
    setLikedIds(newLiked)
    try { localStorage.setItem('liked_comments', JSON.stringify([...newLiked])) } catch { /* ignore */ }

    setComments(prev =>
      prev.map(c =>
        c.id === commentId ? { ...c, likes: isLiked ? Math.max(0, c.likes - 1) : c.likes + 1 } : c
      )
    )

    try {
      await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
    } catch { /* ignore on error */ }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.honeypot) return // honeypot

    setSubmitStatus('loading')
    setSubmitError('')
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compatiblePartId,
          authorName: form.name,
          authorEmail: form.email,
          content: form.content,
          captchaToken: captcha?.token,
          captchaAnswer: form.captchaAnswer,
          honeypot: form.honeypot,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erro ao enviar.')
      }
      setSubmitStatus('success')
      setForm({ name: '', email: '', content: '', captchaAnswer: '', honeypot: '' })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro desconhecido.')
      setSubmitStatus('error')
      // Refresh captcha on error
      fetchCaptcha()
    }
  }

  const handleNewComment = () => {
    setSubmitStatus('idle')
    setSubmitError('')
    fetchCaptcha()
  }

  return (
    <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
      {/* Toggle button */}
      <button
        onClick={open ? handleClose : handleOpen}
        className="flex items-center gap-2 rounded-lg px-1 py-0.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-800 dark:hover:text-zinc-300"
      >
        <MessageCircle className="h-4 w-4" />
        <span>
          {count === 0
            ? 'Comentários'
            : `${count} comentário${count !== 1 ? 's' : ''}`}
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          {/* Lista de comentários */}
          {loadingComments ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
            </div>
          ) : (
            <>
              {comments.length === 0 ? (
                <p className="text-sm text-zinc-400 dark:text-zinc-500">
                  Nenhum comentário ainda. Seja o primeiro a comentar!
                </p>
              ) : (
                <div className="space-y-3">
                  {comments.map(comment => (
                    <div
                      key={comment.id}
                      className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50"
                    >
                      {/* Autor + data */}
                      <div className="mb-2 flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-xs font-bold text-orange-600 dark:text-orange-400">
                          {comment.authorName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                          {comment.authorName}
                        </span>
                        <span className="text-xs text-zinc-400">{formatDate(comment.createdAt)}</span>
                      </div>

                      {/* Conteúdo */}
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                        {comment.content}
                      </p>

                      {/* Like */}
                      <button
                        onClick={() => handleLike(comment.id)}
                        className={`mt-2.5 flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                          likedIds.has(comment.id)
                            ? 'bg-orange-500/10 text-orange-500'
                            : 'text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-300'
                        }`}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                        {comment.likes > 0 && <span>{comment.likes}</span>}
                        <span>{likedIds.has(comment.id) ? 'Curtido' : 'Curtir'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Formulário */}
              <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
                {submitStatus === 'success' ? (
                  <div className="flex flex-col items-center gap-3 py-4 text-center">
                    <div className="rounded-full bg-green-500/10 p-3">
                      <CheckCircle className="h-7 w-7 text-green-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-white">Comentário enviado!</p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        Será revisado pela equipe e publicado em breve.
                      </p>
                    </div>
                    <button
                      onClick={handleNewComment}
                      className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:border-zinc-700 dark:hover:text-white"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Comentar novamente
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                      Deixar um comentário
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Pode incluir links de vídeo, dicas ou sua experiência com a peça.
                    </p>

                    {/* Honeypot oculto */}
                    <input
                      type="text"
                      value={form.honeypot}
                      onChange={e => setForm(f => ({ ...f, honeypot: e.target.value }))}
                      className="hidden"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                    />

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-zinc-500">
                          Nome *
                        </label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="Seu nome"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-zinc-500">
                          E-mail *
                        </label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                          placeholder="Não será exibido"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-zinc-500">
                        Comentário *
                      </label>
                      <textarea
                        required
                        value={form.content}
                        onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                        rows={3}
                        minLength={10}
                        maxLength={2000}
                        placeholder="Compartilhe sua experiência, dicas ou links de vídeo referentes a esta peça..."
                        className={inputClass}
                      />
                      <p className="mt-1 text-right text-[10px] text-zinc-400">
                        {form.content.length}/2000
                      </p>
                    </div>

                    {/* Captcha */}
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-zinc-500">
                        {loadingCaptcha ? 'Carregando...' : (captcha?.question ?? 'Verificação')} *
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          required
                          value={form.captchaAnswer}
                          onChange={e => setForm(f => ({ ...f, captchaAnswer: e.target.value }))}
                          placeholder="Resposta"
                          className={`${inputClass} w-28`}
                          disabled={!captcha}
                        />
                        <button
                          type="button"
                          onClick={fetchCaptcha}
                          className="rounded-lg border border-zinc-200 p-2 text-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:hover:text-white"
                          title="Nova pergunta"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {submitStatus === 'error' && submitError && (
                      <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
                        <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                        <p className="text-xs text-red-400">{submitError}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitStatus === 'loading' || !captcha}
                      className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitStatus === 'loading' ? (
                        <><Loader2 className="h-4 w-4 animate-spin" />Enviando...</>
                      ) : (
                        <><Send className="h-4 w-4" />Enviar comentário</>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

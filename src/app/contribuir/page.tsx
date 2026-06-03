'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, PlusCircle, Loader2 } from 'lucide-react'

type CompatibilityLevel = 'ENCAIXE_PERFEITO' | 'ADAPTACAO_SIMPLES' | 'ADAPTACAO_COMPLEXA'

const levelOptions: { value: CompatibilityLevel; label: string; description: string; base: string; selected: string }[] = [
  {
    value: 'ENCAIXE_PERFEITO',
    label: 'Encaixe Perfeito (Plug & Play)',
    description: 'Não exige nenhuma modificação. Monta diretamente.',
    base: 'border-zinc-700 bg-zinc-900 hover:border-green-500/50',
    selected: 'border-green-500 bg-green-500/10',
  },
  {
    value: 'ADAPTACAO_SIMPLES',
    label: 'Adaptação Simples',
    description: 'Exige pequenos ajustes: arruela, bucha, leve lixamento, etc.',
    base: 'border-zinc-700 bg-zinc-900 hover:border-yellow-500/50',
    selected: 'border-yellow-500 bg-yellow-500/10',
  },
  {
    value: 'ADAPTACAO_COMPLEXA',
    label: 'Adaptação Complexa',
    description: 'Exige solda, cortes ou alterações estruturais significativas.',
    base: 'border-zinc-700 bg-zinc-900 hover:border-red-500/50',
    selected: 'border-red-500 bg-red-500/10',
  },
]

const inputClass = 'w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
const labelClass = 'mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500'
const cardClass = 'rounded-xl border border-zinc-800 bg-zinc-900 p-5'

function ContribuirForm() {
  const searchParams = useSearchParams()
  const initialPart = searchParams.get('peca') ?? ''

  const [form, setForm] = useState({
    partName: initialPart,
    compatiblePartName: '',
    brand: '',
    purchaseLink: '',
    compatibilityLevel: '' as CompatibilityLevel | '',
    adaptationText: '',
    videoLinks: '',
    submitterEmail: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const needsAdaptation =
    form.compatibilityLevel === 'ADAPTACAO_SIMPLES' ||
    form.compatibilityLevel === 'ADAPTACAO_COMPLEXA'

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/sugestoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erro ao enviar sugestão.')
      }
      setStatus('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro desconhecido.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full border border-green-500/30 bg-green-500/10 p-6">
            <CheckCircle className="h-12 w-12 text-green-400" />
          </div>
        </div>
        <h2 className="font-display mb-2 text-3xl font-bold uppercase tracking-wide text-white">
          Sugestão enviada!
        </h2>
        <p className="mb-8 text-zinc-400">
          Obrigado pela contribuição. Sua sugestão será analisada e publicada em breve.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/"
            className="rounded-xl bg-orange-500 px-5 py-2.5 font-semibold text-white hover:bg-orange-600"
          >
            Voltar para a busca
          </Link>
          <button
            onClick={() => {
              setForm({ partName: '', compatiblePartName: '', brand: '', purchaseLink: '',
                compatibilityLevel: '', adaptationText: '', videoLinks: '', submitterEmail: '' })
              setStatus('idle')
            }}
            className="rounded-xl border border-zinc-700 px-5 py-2.5 font-semibold text-zinc-300 hover:border-zinc-500"
          >
            Enviar outra
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-orange-400">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <div className="mb-8">
        <h1 className="font-display flex items-center gap-3 text-3xl font-bold uppercase tracking-wide text-white">
          <PlusCircle className="h-7 w-7 text-orange-500" />
          Contribuir com uma Peça
        </h1>
        <p className="mt-2 text-zinc-400">
          Ajude outros donos de Virago 250 compartilhando seu conhecimento.
          Sua sugestão passa por moderação antes de ser publicada.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Peça original */}
        <div className={cardClass}>
          <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-orange-500">
            Peça original da Virago
          </h2>
          <label className={labelClass}>Nome da peça original *</label>
          <input
            name="partName" value={form.partName} onChange={handleChange} required
            placeholder="Ex: Amortecedor traseiro, Pastilha de freio dianteira..."
            className={inputClass}
          />
        </div>

        {/* Peça compatível */}
        <div className={cardClass}>
          <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-orange-500">
            Peça compatível encontrada
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Nome da peça compatível *</label>
              <input
                name="compatiblePartName" value={form.compatiblePartName} onChange={handleChange} required
                placeholder="Ex: Amortecedor Showa 330mm Universal"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Marca</label>
              <input name="brand" value={form.brand} onChange={handleChange}
                placeholder="Ex: Showa, Cofap, EBC..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Link de compra *</label>
              <input name="purchaseLink" type="url" value={form.purchaseLink} onChange={handleChange}
                required placeholder="https://..." className={inputClass} />
            </div>
          </div>
        </div>

        {/* Nível de compatibilidade */}
        <div className={cardClass}>
          <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-orange-500">
            Nível de compatibilidade *
          </h2>
          <div className="space-y-2">
            {levelOptions.map((opt) => (
              <label
                key={opt.value}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3.5 transition ${
                  form.compatibilityLevel === opt.value ? opt.selected : opt.base
                }`}
              >
                <input
                  type="radio" name="compatibilityLevel" value={opt.value}
                  checked={form.compatibilityLevel === opt.value}
                  onChange={handleChange} required className="mt-0.5 accent-orange-500"
                />
                <div>
                  <p className="text-sm font-semibold text-white">{opt.label}</p>
                  <p className="text-xs text-zinc-500">{opt.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Adaptação (condicional) */}
        {needsAdaptation && (
          <div className={cardClass}>
            <h2 className="mb-1 font-display text-sm font-bold uppercase tracking-widest text-orange-500">
              Como fazer a adaptação *
            </h2>
            <p className="mb-3 text-xs text-zinc-600">
              Descreva o processo com o máximo de detalhes para ajudar outros donos.
            </p>
            <textarea
              name="adaptationText" value={form.adaptationText} onChange={handleChange}
              required={needsAdaptation} rows={5}
              placeholder="Materiais necessários, passo a passo, dicas importantes..."
              className={inputClass}
            />
            <div className="mt-4">
              <label className={labelClass}>Links de vídeos (YouTube, Instagram, TikTok)</label>
              <textarea
                name="videoLinks" value={form.videoLinks} onChange={handleChange} rows={3}
                placeholder={"Cole os links (um por linha)\nhttps://youtube.com/...\nhttps://instagram.com/..."}
                className={inputClass}
              />
            </div>
          </div>
        )}

        {/* Email */}
        <div className={cardClass}>
          <label className={labelClass}>Seu e-mail (opcional)</label>
          <input name="submitterEmail" type="email" value={form.submitterEmail} onChange={handleChange}
            placeholder="para@exemplo.com" className={inputClass} />
          <p className="mt-1.5 text-xs text-zinc-700">
            Usado apenas para notificá-lo quando sua sugestão for aprovada.
          </p>
        </div>

        {status === 'error' && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {errorMsg}
          </div>
        )}

        <button
          type="submit" disabled={status === 'loading'}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 font-display text-base font-bold uppercase tracking-wider text-white transition hover:bg-orange-600 disabled:opacity-50"
        >
          {status === 'loading' ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Enviando...</>
          ) : (
            <><PlusCircle className="h-5 w-5" /> Enviar Sugestão</>
          )}
        </button>
      </form>
    </div>
  )
}

export default function ContribuirPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-2xl px-4 py-8 text-center text-zinc-600">Carregando...</div>
    }>
      <ContribuirForm />
    </Suspense>
  )
}

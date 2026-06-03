'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, PlusCircle, Loader2 } from 'lucide-react'

type CompatibilityLevel = 'ENCAIXE_PERFEITO' | 'ADAPTACAO_SIMPLES' | 'ADAPTACAO_COMPLEXA'

const levelOptions: { value: CompatibilityLevel; label: string; description: string; color: string }[] = [
  {
    value: 'ENCAIXE_PERFEITO',
    label: 'Encaixe Perfeito (Plug & Play)',
    description: 'Não exige nenhuma modificação. Monta diretamente.',
    color: 'border-green-400 bg-green-50',
  },
  {
    value: 'ADAPTACAO_SIMPLES',
    label: 'Adaptação Simples',
    description: 'Exige pequenos ajustes: arruela, bucha, leve lixamento, etc.',
    color: 'border-yellow-400 bg-yellow-50',
  },
  {
    value: 'ADAPTACAO_COMPLEXA',
    label: 'Adaptação Complexa',
    description: 'Exige solda, cortes ou alterações estruturais significativas.',
    color: 'border-red-400 bg-red-50',
  },
]

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

  const needsAdaptationText =
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
        <div className="mb-4 flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Sugestão enviada!</h2>
        <p className="mb-6 text-gray-600">
          Obrigado pela contribuição. Sua sugestão será analisada por um moderador e publicada em breve.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-orange-600 px-5 py-2.5 font-semibold text-white hover:bg-orange-700"
          >
            Voltar para a busca
          </Link>
          <button
            onClick={() => {
              setForm({
                partName: '',
                compatiblePartName: '',
                brand: '',
                purchaseLink: '',
                compatibilityLevel: '',
                adaptationText: '',
                videoLinks: '',
                submitterEmail: '',
              })
              setStatus('idle')
            }}
            className="rounded-lg border border-gray-300 px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Enviar outra
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <PlusCircle className="h-6 w-6 text-orange-600" />
          Contribuir com uma Peça
        </h1>
        <p className="mt-1 text-gray-600">
          Ajude outros donos de Virago 250 compartilhando seu conhecimento sobre peças compatíveis.
          Sua sugestão passa por moderação antes de ser publicada.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Peça original */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-800">Peça original da Virago</h2>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Nome da peça original *
            </label>
            <input
              name="partName"
              value={form.partName}
              onChange={handleChange}
              required
              placeholder="Ex: Amortecedor traseiro, Pastilha de freio dianteira..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
        </div>

        {/* Peça compatível */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-800">Peça compatível encontrada</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Nome da peça compatível *
              </label>
              <input
                name="compatiblePartName"
                value={form.compatiblePartName}
                onChange={handleChange}
                required
                placeholder="Ex: Amortecedor Showa 330mm Universal"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Marca</label>
              <input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="Ex: Showa, Cofap, EBC..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Link de compra *
              </label>
              <input
                name="purchaseLink"
                type="url"
                value={form.purchaseLink}
                onChange={handleChange}
                required
                placeholder="https://..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>
        </div>

        {/* Nível de compatibilidade */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-800">Nível de compatibilidade *</h2>
          <div className="space-y-2">
            {levelOptions.map((opt) => (
              <label
                key={opt.value}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3 transition ${
                  form.compatibilityLevel === opt.value
                    ? opt.color
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="compatibilityLevel"
                  value={opt.value}
                  checked={form.compatibilityLevel === opt.value}
                  onChange={handleChange}
                  required
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{opt.label}</p>
                  <p className="text-xs text-gray-600">{opt.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Texto de adaptação (condicional) */}
        {needsAdaptationText && (
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-1 font-semibold text-gray-800">Como fazer a adaptação *</h2>
            <p className="mb-3 text-xs text-gray-500">
              Descreva o processo com o máximo de detalhes possível para ajudar outros donos.
            </p>
            <textarea
              name="adaptationText"
              value={form.adaptationText}
              onChange={handleChange}
              required={needsAdaptationText}
              rows={5}
              placeholder="Descreva os materiais necessários, o passo a passo do processo, dicas importantes..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />

            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Links de vídeos (YouTube, Instagram, TikTok)
              </label>
              <textarea
                name="videoLinks"
                value={form.videoLinks}
                onChange={handleChange}
                rows={3}
                placeholder="Cole os links de vídeos (um por linha)&#10;https://youtube.com/...&#10;https://instagram.com/..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>
        )}

        {/* Contato (opcional) */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Seu e-mail (opcional)
          </label>
          <input
            name="submitterEmail"
            type="email"
            value={form.submitterEmail}
            onChange={handleChange}
            placeholder="para@exemplo.com"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
          />
          <p className="mt-1 text-xs text-gray-400">
            Opcional. Usado apenas para notificá-lo quando sua sugestão for aprovada.
          </p>
        </div>

        {status === 'error' && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-3.5 font-semibold text-white transition hover:bg-orange-700 disabled:opacity-60"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <PlusCircle className="h-4 w-4" />
              Enviar Sugestão
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default function ContribuirPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl px-4 py-8 text-center text-gray-400">Carregando...</div>}>
      <ContribuirForm />
    </Suspense>
  )
}

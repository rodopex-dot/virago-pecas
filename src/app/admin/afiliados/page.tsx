'use client'

import { useEffect, useState } from 'react'
import {
  Link2, ToggleLeft, ToggleRight, Save, Loader2,
  CheckCircle, Info, AlertTriangle,
} from 'lucide-react'
import { PLATFORM_META } from '@/lib/affiliateLinks'

interface AffiliateConfig {
  id: string
  platform: string
  active: boolean
  value?: string | null
}

function PlatformCard({
  config,
  onSave,
}: {
  config: AffiliateConfig
  onSave: (id: string, active: boolean, value: string) => Promise<void>
}) {
  const [active, setActive] = useState(config.active)
  const [value, setValue] = useState(config.value ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const meta = PLATFORM_META[config.platform]
  if (!meta) return null

  const dirty = active !== config.active || value !== (config.value ?? '')
  const hasValue = value.trim().length > 0
  const isReady = active && hasValue

  const handleSave = async () => {
    setSaving(true)
    await onSave(config.id, active, value)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className={`rounded-2xl border bg-zinc-900 transition-all ${
      isReady ? 'border-green-500/40' : active ? 'border-orange-500/30' : 'border-zinc-800'
    }`}>
      <div className="flex items-start justify-between gap-4 p-6">
        {/* Info */}
        <div className="flex items-start gap-4">
          <div className={`rounded-xl border p-3 text-2xl leading-none ${
            isReady ? 'border-green-500/30 bg-green-500/10' : 'border-zinc-700 bg-zinc-800'
          }`}>
            {meta.logo}
          </div>
          <div>
            <h3 className="font-display font-bold uppercase tracking-wide text-white">{meta.label}</h3>
            <p className="mt-0.5 text-xs text-zinc-500">{meta.description}</p>
          </div>
        </div>

        {/* Toggle */}
        <button
          onClick={() => setActive(a => !a)}
          className="flex shrink-0 items-center gap-2 text-sm font-semibold"
        >
          {active ? (
            <><ToggleRight className="h-7 w-7 text-orange-500" /><span className="text-orange-400">Ativo</span></>
          ) : (
            <><ToggleLeft className="h-7 w-7 text-zinc-600" /><span className="text-zinc-500">Inativo</span></>
          )}
        </button>
      </div>

      {/* Status */}
      <div className="mx-6 mb-4">
        {isReady && (
          <div className="flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2.5">
            <CheckCircle className="h-4 w-4 shrink-0 text-green-400" />
            <p className="text-xs text-green-300">
              Ativo — links de <strong>{meta.label}</strong> serão convertidos automaticamente.
            </p>
          </div>
        )}
        {active && !hasValue && (
          <div className="flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-400" />
            <p className="text-xs text-yellow-300">Ativo mas sem ID/URL configurado. Preencha o campo abaixo.</p>
          </div>
        )}
        {!active && (
          <div className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5">
            <Info className="h-4 w-4 shrink-0 text-zinc-500" />
            <p className="text-xs text-zinc-500">Inativo — links não serão convertidos.</p>
          </div>
        )}
      </div>

      {/* Campo de configuração */}
      <div className="px-6 pb-6">
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">
          {meta.method === 'param' ? 'ID / Tag de Afiliado' : 'URL base de rastreamento'}
        </label>
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={meta.placeholder}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 font-mono text-sm text-zinc-300 placeholder-zinc-700 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
        />
        <p className="mt-1.5 flex items-start gap-1.5 text-xs text-zinc-600">
          <Info className="mt-0.5 h-3 w-3 shrink-0" />
          {meta.hint}
        </p>

        {/* Preview */}
        {hasValue && (
          <div className="mt-3 rounded-xl border border-zinc-700 bg-zinc-800/50 p-3">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-600">Exemplo de conversão</p>
            <p className="break-all font-mono text-[10px] text-zinc-500">
              {meta.method === 'param'
                ? `https://${meta.domains[0]}/produto?${meta.paramName}=${value.trim()}`
                : `${value.trim().endsWith('=') ? value.trim() : value.trim() + '?url='}https%3A%2F%2F${meta.domains[0]}%2Fproduto`}
            </p>
          </div>
        )}

        <div className="mt-4 flex items-center justify-end gap-3">
          {dirty && <span className="text-xs text-zinc-500">Alterações não salvas</span>}
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition ${
              saved ? 'bg-green-600 text-white'
              : dirty ? 'bg-orange-500 text-white hover:bg-orange-600'
              : 'cursor-not-allowed border border-zinc-700 text-zinc-600'
            } disabled:opacity-60`}
          >
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Salvando...</>
            : saved  ? <><CheckCircle className="h-4 w-4" />Salvo!</>
            : <><Save className="h-4 w-4" />Salvar</>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AfiliadosPage() {
  const [configs, setConfigs] = useState<AffiliateConfig[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/affiliates')
      .then(r => r.json())
      .then(setConfigs)
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (id: string, active: boolean, value: string) => {
    const res = await fetch(`/api/admin/affiliates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active, value }),
    })
    if (res.ok) {
      const updated = await res.json()
      setConfigs(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c))
    }
  }

  // Ordena pela ordem definida em PLATFORM_META
  const order = Object.keys(PLATFORM_META)
  const sorted = [...configs].sort((a, b) => order.indexOf(a.platform) - order.indexOf(b.platform))

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display flex items-center gap-3 text-3xl font-bold uppercase tracking-wide text-white">
          <Link2 className="h-7 w-7 text-orange-500" />
          Links de Afiliados
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Configure seus IDs de afiliado. Quando ativo, os links de compra são convertidos
          automaticamente para o programa de afiliados da plataforma correspondente.
        </p>
      </div>

      {/* Como funciona */}
      <div className="mb-8 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-300">
          <Info className="h-4 w-4" />
          Como funciona
        </p>
        <ul className="space-y-1 text-xs text-blue-400/80">
          <li>• O sistema detecta automaticamente a plataforma do link de compra (Amazon, ML, Shopee…)</li>
          <li>• Se a plataforma estiver ativa e configurada, o link é convertido para afiliado na hora da exibição</li>
          <li>• O visitante clica no botão "Comprar" e já chega à loja com seu rastreamento de afiliado</li>
          <li>• Links de plataformas não configuradas são exibidos normalmente, sem alteração</li>
        </ul>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map(config => (
            <PlatformCard key={config.id} config={config} onSave={handleSave} />
          ))}
        </div>
      )}
    </div>
  )
}

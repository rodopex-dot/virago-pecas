'use client'

import { useEffect, useState } from 'react'
import {
  Link2, ToggleLeft, ToggleRight, Save, Loader2,
  CheckCircle, Info, AlertTriangle, FlaskConical,
  ArrowRight, ExternalLink, XCircle, Copy,
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
          {meta.method === 'param' ? 'ID / Tag de Afiliado'
            : meta.method === 'ml-params' ? 'Link de afiliado gerado no painel do ML'
            : 'URL base de rastreamento'}
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
                : meta.method === 'ml-params'
                ? `https://${meta.domains[0]}/produto-x?matt_tool=XXXX&matt_word=XXXX&ref=XXXX`
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

// ─── Testador de conversão ────────────────────────────────────────────────────
interface TestResult {
  original: string
  converted: string
  changed: boolean
  platform: string | null
}

function LinkTester() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState<TestResult | null>(null)
  const [testing, setTesting] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    setTesting(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/affiliates/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      setResult(data)
    } finally {
      setTesting(false)
    }
  }

  const handleCopy = () => {
    if (!result) return
    navigator.clipboard.writeText(result.converted)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const platformLabel = result?.platform ? (PLATFORM_META[result.platform]?.label ?? result.platform) : null

  return (
    <div className="mb-8 rounded-2xl border border-orange-500/20 bg-zinc-900 p-6">
      <h2 className="font-display mb-1 flex items-center gap-2 text-lg font-bold uppercase tracking-wide text-white">
        <FlaskConical className="h-5 w-5 text-orange-500" />
        Testador de Conversão
      </h2>
      <p className="mb-4 text-xs text-zinc-500">
        Cole qualquer link de produto para ver como ele ficará após a conversão de afiliado.
      </p>

      <form onSubmit={handleTest} className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://www.mercadolivre.com.br/produto/... ou amazon.com.br/..."
          className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
        />
        <button
          type="submit"
          disabled={testing || !url.trim()}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50"
        >
          {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FlaskConical className="h-4 w-4" />}
          Testar
        </button>
      </form>

      {result && (
        <div className="mt-4 space-y-3">
          {/* Plataforma detectada */}
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>Plataforma detectada:</span>
            <span className={`font-semibold ${platformLabel ? 'text-orange-400' : 'text-zinc-600'}`}>
              {platformLabel ?? 'Não reconhecida'}
            </span>
          </div>

          {/* Original */}
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-600">URL original</p>
            <p className="break-all rounded-lg border border-zinc-800 bg-zinc-800/50 px-3 py-2 font-mono text-xs text-zinc-500">
              {result.original}
            </p>
          </div>

          {/* Convertida */}
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-600">URL convertida</p>
            <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 ${
              result.changed
                ? 'border-green-500/30 bg-green-500/5'
                : 'border-zinc-700 bg-zinc-800/50'
            }`}>
              <p className={`flex-1 break-all font-mono text-xs ${result.changed ? 'text-green-300' : 'text-zinc-500'}`}>
                {result.converted}
              </p>
            </div>
          </div>

          {/* Resultado */}
          {result.changed ? (
            <div className="flex items-center justify-between rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <p className="text-xs text-green-300 font-semibold">
                  Conversão bem-sucedida — o link de afiliado está sendo gerado corretamente.
                </p>
              </div>
              <div className="flex shrink-0 gap-2 ml-4">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg border border-green-500/40 px-3 py-1.5 text-xs font-semibold text-green-400 hover:bg-green-500/10"
                >
                  {copied ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
                <a
                  href={result.converted}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Abrir e verificar
                </a>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
              <XCircle className="h-4 w-4 shrink-0 text-yellow-400" />
              <p className="text-xs text-yellow-300">
                {!platformLabel
                  ? 'Plataforma não reconhecida. Verifique se o domínio é suportado.'
                  : `Plataforma ${platformLabel} reconhecida mas sem afiliado ativo/configurado.`}
              </p>
            </div>
          )}

          {/* Diff visual */}
          {result.changed && (
            <div className="flex items-center gap-2 text-[10px] text-zinc-600">
              <ArrowRight className="h-3 w-3 text-orange-500" />
              <span>Parâmetros adicionados ao link original para rastrear sua comissão</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────
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

      {/* Testador */}
      <LinkTester />

      {/* Cards de plataforma */}
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

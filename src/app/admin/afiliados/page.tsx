'use client'

import { useEffect, useState } from 'react'
import {
  Link2, ToggleLeft, ToggleRight, Save, Loader2,
  CheckCircle, Info, AlertTriangle,
  ExternalLink, XCircle, Copy,
  Zap, KeyRound, Cookie, Tag, RefreshCw, Eye, EyeOff, Lock,
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

  const isManual = meta.method === 'manual'
  const dirty = active !== config.active || value !== (config.value ?? '')
  const hasValue = value.trim().length > 0
  const isReady = isManual ? false : (active && hasValue)

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

      <div className="mx-6 mb-4">
        {isReady && (
          <div className="flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2.5">
            <CheckCircle className="h-4 w-4 shrink-0 text-green-400" />
            <p className="text-xs text-green-300">
              Ativo — links de <strong>{meta.label}</strong> serão convertidos automaticamente.
            </p>
          </div>
        )}
        {isManual && (
          <div className="flex items-start gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
            <div className="text-xs text-blue-300 space-y-1">
              <p className="font-semibold">Configuração manual por produto</p>
              <p>{meta.hint}</p>
            </div>
          </div>
        )}
        {!isManual && active && !hasValue && (
          <div className="flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-400" />
            <p className="text-xs text-yellow-300">Ativo mas sem ID/URL configurado. Preencha o campo abaixo.</p>
          </div>
        )}
        {!isManual && !active && (
          <div className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5">
            <Info className="h-4 w-4 shrink-0 text-zinc-500" />
            <p className="text-xs text-zinc-500">Inativo — links não serão convertidos.</p>
          </div>
        )}
      </div>

      {!isManual && (
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
      )}
    </div>
  )
}

// ─── Shopee — Open API (short links shope.ee) ─────────────────────────────────
function ShopeeApiCard({
  config,
  onSave,
}: {
  config: AffiliateConfig
  onSave: (id: string, active: boolean, value: string) => Promise<void>
}) {
  const [active, setActive] = useState(config.active)
  const [appId, setAppId] = useState('')
  const [secret, setSecret] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [testUrl, setTestUrl] = useState('')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ url?: string; error?: string; raw?: unknown } | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (config.value) {
      try {
        const parsed = JSON.parse(config.value)
        if (parsed.appId)  setAppId(String(parsed.appId))
        if (parsed.secret) setSecret(String(parsed.secret))
      } catch { /* valor antigo não-JSON — ignora */ }
    }
  }, [config.value])

  const hasCredentials = appId.trim().length > 0 && secret.trim().length > 0
  const isReady = active && hasCredentials

  const handleSave = async () => {
    setSaving(true)
    await onSave(config.id, active, JSON.stringify({ appId: appId.trim(), secret: secret.trim() }))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!testUrl.startsWith('http')) return
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/admin/affiliates/shopee-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: testUrl }),
      })
      const data = await res.json()
      if (res.ok) setTestResult({ url: data.affiliateUrl })
      else        setTestResult({ error: data.error ?? 'Erro desconhecido', raw: data.raw ?? null })
    } finally { setTesting(false) }
  }

  return (
    <div className={`mb-6 rounded-2xl border bg-zinc-900 transition-all ${
      isReady ? 'border-orange-500/40' : 'border-zinc-800'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-zinc-800 p-6">
        <div className="flex items-start gap-4">
          <div className={`rounded-xl border p-3 text-2xl leading-none ${
            isReady ? 'border-orange-500/30 bg-orange-500/10' : 'border-zinc-700 bg-zinc-800'
          }`}>🟠</div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold uppercase tracking-wide text-white">Shopee Brasil</h3>
              <span className="flex items-center gap-1 rounded-full bg-orange-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-400">
                <Zap className="h-3 w-3" /> API
              </span>
            </div>
            <p className="mt-0.5 text-xs text-zinc-500">
              Gera links curtos (shope.ee) via Shopee Affiliate Open API — requer App ID e Senha.
            </p>
          </div>
        </div>
        <button onClick={() => setActive(a => !a)} className="flex shrink-0 items-center gap-2 text-sm font-semibold">
          {active ? (
            <><ToggleRight className="h-7 w-7 text-orange-500" /><span className="text-orange-400">Ativo</span></>
          ) : (
            <><ToggleLeft className="h-7 w-7 text-zinc-600" /><span className="text-zinc-500">Inativo</span></>
          )}
        </button>
      </div>

      {/* Status */}
      <div className="space-y-2 px-6 pt-5">
        <div className="flex flex-wrap gap-2">
          <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
            appId.trim() ? 'border-orange-500/40 bg-orange-500/10 text-orange-400' : 'border-zinc-700 bg-zinc-800 text-zinc-500'
          }`}>
            <KeyRound className="h-3.5 w-3.5" />
            App ID {appId.trim() ? '✓' : 'não configurado'}
          </div>
          <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
            secret.trim() ? 'border-orange-500/40 bg-orange-500/10 text-orange-400' : 'border-zinc-700 bg-zinc-800 text-zinc-500'
          }`}>
            <Lock className="h-3.5 w-3.5" />
            Senha {secret.trim() ? '✓ configurada' : 'não configurada'}
          </div>
        </div>

        {isReady && (
          <div className="flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2.5">
            <CheckCircle className="h-4 w-4 shrink-0 text-green-400" />
            <p className="text-xs text-green-300">
              Ativo — links da Shopee serão convertidos automaticamente para links curtos <strong>shope.ee</strong>.
            </p>
          </div>
        )}
        {active && !hasCredentials && (
          <div className="flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-400" />
            <p className="text-xs text-yellow-300">Ativo mas sem credenciais. Preencha App ID e Senha abaixo.</p>
          </div>
        )}
        {!active && (
          <div className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5">
            <Info className="h-4 w-4 shrink-0 text-zinc-500" />
            <p className="text-xs text-zinc-500">Inativo — links não serão convertidos.</p>
          </div>
        )}
      </div>

      {/* Credenciais */}
      <div className="space-y-4 p-6">
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-zinc-500">
            <KeyRound className="h-3.5 w-3.5" /> App ID
          </label>
          <input
            type="text"
            value={appId}
            onChange={e => setAppId(e.target.value)}
            placeholder="18331440429"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 font-mono text-sm text-zinc-300 placeholder-zinc-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
          />
          <p className="mt-1 text-xs text-zinc-600">Encontre em portal.affiliate.shopee.com.br → Ferramentas API → App ID</p>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-zinc-500">
              <Lock className="h-3.5 w-3.5" /> Senha (Secret Key)
            </label>
            <button type="button" onClick={() => setShowSecret(s => !s)} className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-400">
              {showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {showSecret ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          <input
            type={showSecret ? 'text' : 'password'}
            value={secret}
            onChange={e => setSecret(e.target.value)}
            placeholder="••••••••••••••••••••••••••••••••"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 font-mono text-sm text-zinc-300 placeholder-zinc-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
          />
          <p className="mt-1 text-xs text-zinc-600">Encontre em portal.affiliate.shopee.com.br → Ferramentas API → Secret Key</p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition ${
              saved ? 'bg-green-600 text-white' : 'bg-orange-500 text-white hover:bg-orange-600'
            } disabled:opacity-50`}
          >
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Salvando...</>
            : saved  ? <><CheckCircle className="h-4 w-4" />Salvo!</>
            : <><Save className="h-4 w-4" />Salvar credenciais</>}
          </button>
        </div>
      </div>

      {/* Teste */}
      {hasCredentials && (
        <div className="border-t border-zinc-800 p-6">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <Zap className="h-4 w-4 text-orange-400" />
            Testar geração de link
          </h4>
          <form onSubmit={handleTest} className="flex gap-2">
            <input
              type="url"
              value={testUrl}
              onChange={e => setTestUrl(e.target.value)}
              placeholder="https://shopee.com.br/produto/..."
              className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-orange-500/70"
            />
            <button
              type="submit"
              disabled={testing || !testUrl.startsWith('http')}
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Gerar
            </button>
          </form>

          {testResult && (
            <div className="mt-3">
              {testResult.url ? (
                <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-xs font-semibold text-green-300">Link gerado com sucesso!</span>
                  </div>
                  <p className="mb-3 break-all font-mono text-xs text-green-200">{testResult.url}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (testResult.url) navigator.clipboard.writeText(testResult.url)
                        setCopied(true); setTimeout(() => setCopied(false), 2000)
                      }}
                      className="flex items-center gap-1.5 rounded-lg border border-green-500/40 px-3 py-1.5 text-xs font-semibold text-green-400 hover:bg-green-500/10"
                    >
                      {copied ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? 'Copiado!' : 'Copiar'}
                    </button>
                    <a
                      href={testResult.url}
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
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                    <p className="text-xs text-red-300">{testResult.error}</p>
                  </div>
                  {testResult.raw !== undefined && testResult.raw !== null && (
                    <div>
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-red-600">Resposta bruta da API Shopee:</p>
                      <pre className="max-h-40 overflow-auto rounded-lg bg-black/30 p-3 font-mono text-[10px] text-red-200 whitespace-pre-wrap break-all">
                        {JSON.stringify(testResult.raw, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Geração automática de links ML ──────────────────────────────────────────
function MLAutoCard() {
  const [tag,       setTag]       = useState('')
  const [cookies,   setCookies]   = useState('')
  const [csrf,      setCsrf]      = useState('')
  const [status,    setStatus]    = useState<{
    hasCookies: boolean; hasCsrfToken: boolean; cookiesUpdatedAt: string | null
  } | null>(null)
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [showCookies, setShowCookies] = useState(false)
  const [testUrl,   setTestUrl]   = useState('')
  const [testing,   setTesting]   = useState(false)
  const [testResult, setTestResult] = useState<{ url?: string; error?: string; raw?: unknown } | null>(null)
  const [copied,    setCopied]    = useState(false)

  useEffect(() => {
    fetch('/api/admin/affiliates/ml-config')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return
        setTag(d.tag ?? '')
        setStatus({ hasCookies: d.hasCookies, hasCsrfToken: d.hasCsrfToken, cookiesUpdatedAt: d.cookiesUpdatedAt })
      })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const body: Record<string, string> = { tag }
    if (cookies.trim()) body.cookies = cookies.trim()
    if (csrf.trim())    body.csrfToken = csrf.trim()

    const res = await fetch('/api/admin/affiliates/ml-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setCookies('')
      setCsrf('')
      setTimeout(() => setSaved(false), 2500)
      const updated = await fetch('/api/admin/affiliates/ml-config').then(r => r.json())
      setStatus({ hasCookies: updated.hasCookies, hasCsrfToken: updated.hasCsrfToken, cookiesUpdatedAt: updated.cookiesUpdatedAt })
    }
  }

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!testUrl.startsWith('http')) return
    setTesting(true); setTestResult(null)
    try {
      const res = await fetch('/api/admin/affiliates/ml-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: testUrl }),
      })
      const data = await res.json()
      if (res.ok) setTestResult({ url: data.affiliateUrl })
      else        setTestResult({ error: data.error ?? 'Erro desconhecido', raw: data.raw ?? data })
    } finally { setTesting(false) }
  }

  const handleCopy = () => {
    if (testResult?.url) {
      navigator.clipboard.writeText(testResult.url)
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatDate = (iso: string | null) => {
    if (!iso) return null
    return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
  }

  return (
    <div className="mb-6 rounded-2xl border border-yellow-500/30 bg-zinc-900">
      <div className="flex items-start justify-between gap-4 border-b border-zinc-800 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-2xl leading-none">🟡</div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold uppercase tracking-wide text-white">Mercado Livre</h3>
              <span className="flex items-center gap-1 rounded-full bg-yellow-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-yellow-400">
                <Zap className="h-3 w-3" /> Auto
              </span>
            </div>
            <p className="mt-0.5 text-xs text-zinc-500">
              Gera links de afiliado automaticamente usando a API interna do ML — requer cookies de sessão do painel de afiliados.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2 px-6 pt-5">
        <div className="flex flex-wrap gap-2">
          <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
            status?.hasCookies ? 'border-green-500/40 bg-green-500/10 text-green-400' : 'border-zinc-700 bg-zinc-800 text-zinc-500'
          }`}>
            <Cookie className="h-3.5 w-3.5" />
            Cookies {status?.hasCookies ? '✓' : 'não configurados'}
          </div>
          <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
            status?.hasCsrfToken ? 'border-green-500/40 bg-green-500/10 text-green-400' : 'border-zinc-700 bg-zinc-800 text-zinc-500'
          }`}>
            <KeyRound className="h-3.5 w-3.5" />
            CSRF Token {status?.hasCsrfToken ? '✓' : 'não configurado'}
          </div>
          {status?.cookiesUpdatedAt && (
            <div className="flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs text-zinc-500">
              <RefreshCw className="h-3.5 w-3.5" />
              Atualizado em {formatDate(status.cookiesUpdatedAt)}
            </div>
          )}
        </div>

        {(!status?.hasCookies || !status?.hasCsrfToken) && (
          <div className="flex items-start gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
            <div className="space-y-1 text-xs text-blue-300">
              <p className="font-semibold">Como obter cookies e CSRF token:</p>
              <p>1. Acesse <strong>mercadolivre.com.br/afiliados/linkbuilder</strong> logado na sua conta</p>
              <p>2. Abra DevTools (F12) → aba <strong>Network</strong> → filtre por <code className="rounded bg-blue-900/40 px-1">createLink</code></p>
              <p>3. Gere qualquer link manualmente → copie o header <strong>cookie</strong> e <strong>x-csrf-token</strong> da requisição</p>
              <p>4. Ou: DevTools → aba <strong>Application</strong> → Cookies → copie todos os cookies como string</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 p-6">
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-zinc-500">
            <Tag className="h-3.5 w-3.5" /> Tag de Afiliado
          </label>
          <input
            type="text"
            value={tag}
            onChange={e => setTag(e.target.value)}
            placeholder="ex: virago250-20"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 font-mono text-sm text-zinc-300 placeholder-zinc-700 outline-none focus:border-yellow-500/70 focus:ring-2 focus:ring-yellow-500/10"
          />
          <p className="mt-1 text-xs text-zinc-600">Sua tag do programa de afiliados ML (campo &quot;tag&quot; na requisição createLink)</p>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-zinc-500">
              <Cookie className="h-3.5 w-3.5" /> Cookies de Sessão
              {status?.hasCookies && <span className="text-green-400">✓ já salvos</span>}
            </label>
            <button
              type="button"
              onClick={() => setShowCookies(s => !s)}
              className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-400"
            >
              {showCookies ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {showCookies ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          <textarea
            value={cookies}
            onChange={e => setCookies(e.target.value)}
            placeholder={status?.hasCookies
              ? 'Deixe em branco para manter os cookies salvos. Cole aqui para atualizar.'
              : 'Cole aqui os cookies copiados do header "cookie" da requisição createLink no DevTools'}
            rows={showCookies ? 5 : 2}
            className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 font-mono text-xs text-zinc-300 placeholder-zinc-700 outline-none focus:border-yellow-500/70 focus:ring-2 focus:ring-yellow-500/10"
          />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-zinc-500">
            <KeyRound className="h-3.5 w-3.5" /> CSRF Token
            {status?.hasCsrfToken && <span className="text-green-400">✓ já salvo</span>}
          </label>
          <input
            type="text"
            value={csrf}
            onChange={e => setCsrf(e.target.value)}
            placeholder={status?.hasCsrfToken
              ? 'Deixe em branco para manter o token salvo. Cole aqui para atualizar.'
              : 'Cole o valor do header "x-csrf-token" do DevTools'}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 font-mono text-sm text-zinc-300 placeholder-zinc-700 outline-none focus:border-yellow-500/70 focus:ring-2 focus:ring-yellow-500/10"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition ${
              saved ? 'bg-green-600 text-white' : 'bg-yellow-500 text-zinc-900 hover:bg-yellow-400'
            } disabled:opacity-50`}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" />
            : saved  ? <CheckCircle className="h-4 w-4" />
            : <Save className="h-4 w-4" />}
            {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar configuração'}
          </button>
        </div>
      </div>

      {status?.hasCookies && status?.hasCsrfToken && (
        <div className="border-t border-zinc-800 p-6">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <Zap className="h-4 w-4 text-yellow-400" />
            Testar geração de link
          </h4>
          <form onSubmit={handleTest} className="flex gap-2">
            <input
              type="url"
              value={testUrl}
              onChange={e => setTestUrl(e.target.value)}
              placeholder="https://www.mercadolivre.com.br/produto/..."
              className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-yellow-500/70"
            />
            <button
              type="submit"
              disabled={testing || !testUrl.startsWith('http')}
              className="flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-2.5 text-sm font-bold text-zinc-900 hover:bg-yellow-400 disabled:opacity-50"
            >
              {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Gerar
            </button>
          </form>

          {testResult && (
            <div className="mt-3">
              {testResult.url ? (
                <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-xs font-semibold text-green-300">Link gerado com sucesso!</span>
                  </div>
                  <p className="mb-3 break-all font-mono text-xs text-green-200">{testResult.url}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 rounded-lg border border-green-500/40 px-3 py-1.5 text-xs font-semibold text-green-400 hover:bg-green-500/10"
                    >
                      {copied ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? 'Copiado!' : 'Copiar'}
                    </button>
                    <a
                      href={testResult.url}
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
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                    <p className="text-xs text-red-300">{testResult.error}</p>
                  </div>
                  {testResult.raw !== undefined && (
                    <div>
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-red-600">Resposta bruta da API ML:</p>
                      <pre className="max-h-40 overflow-auto rounded-lg bg-black/30 p-3 font-mono text-[10px] text-red-200 whitespace-pre-wrap break-all">
                        {JSON.stringify(testResult.raw, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
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

  // ML e Shopee têm cards próprios — não exibir via PlatformCard genérico
  const AUTO_MANAGED = ['mercadolivre', 'shopee']

  const order = Object.keys(PLATFORM_META)
  const sorted = [...configs]
    .filter(c => !AUTO_MANAGED.includes(c.platform))
    .sort((a, b) => order.indexOf(a.platform) - order.indexOf(b.platform))

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

      <div className="mb-8 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-300">
          <Info className="h-4 w-4" />
          Como funciona
        </p>
        <ul className="space-y-1 text-xs text-blue-400/80">
          <li>• O sistema detecta automaticamente a plataforma do link de compra (Amazon, ML, Shopee…)</li>
          <li>• Se a plataforma estiver ativa e configurada, o link é convertido para afiliado na hora da exibição</li>
          <li>• O visitante clica no botão &quot;Comprar&quot; e já chega à loja com seu rastreamento de afiliado</li>
          <li>• Links de plataformas não configuradas são exibidos normalmente, sem alteração</li>
        </ul>
      </div>

      {/* Shopee — Open API (short links) */}
      {!loading && (() => {
        const shopee = configs.find(c => c.platform === 'shopee')
        return shopee ? <ShopeeApiCard config={shopee} onSave={handleSave} /> : null
      })()}

      {/* ML Auto-geração (cookie-based) */}
      <MLAutoCard />

      {/* Cards de plataforma — Amazon, AliExpress, Magalu */}
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

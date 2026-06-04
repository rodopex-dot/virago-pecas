'use client'

import { useEffect, useState } from 'react'
import {
  Megaphone, ToggleLeft, ToggleRight, Save,
  Loader2, CheckCircle, Info, Code2,
  LayoutTemplate, PanelRight, SplitSquareHorizontal,
  Globe,
} from 'lucide-react'

interface AdSpace {
  id: string
  slot: string
  label: string
  description?: string
  active: boolean
  adCode?: string
}

const slotMeta: Record<string, { icon: typeof LayoutTemplate; dims: string; preview: string }> = {
  top:     { icon: LayoutTemplate,        dims: '728 × 90',  preview: 'h-10 w-full max-w-2xl' },
  sidebar: { icon: PanelRight,            dims: '300 × 250', preview: 'h-32 w-48' },
  inline:  { icon: SplitSquareHorizontal, dims: '468 × 60',  preview: 'h-8 w-80' },
}

function AdCard({
  space, onSave,
}: {
  space: AdSpace
  onSave: (id: string, active: boolean, adCode: string) => Promise<void>
}) {
  const [active, setActive]   = useState(space.active)
  const [adCode, setAdCode]   = useState(space.adCode ?? '')
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [showCode, setShowCode] = useState(false)

  const meta = slotMeta[space.slot]
  const Icon = meta?.icon ?? LayoutTemplate
  const dirty = active !== space.active || adCode !== (space.adCode ?? '')

  const handleSave = async () => {
    setSaving(true)
    await onSave(space.id, active, adCode)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className={`rounded-2xl border bg-zinc-900 transition-all ${
      active ? 'border-orange-500/40' : 'border-zinc-800'
    }`}>
      {/* Header do card */}
      <div className="flex items-start justify-between gap-4 p-6">
        <div className="flex items-start gap-4">
          <div className={`rounded-xl border p-3 ${active ? 'border-orange-500/30 bg-orange-500/10' : 'border-zinc-700 bg-zinc-800'}`}>
            <Icon className={`h-5 w-5 ${active ? 'text-orange-400' : 'text-zinc-500'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold uppercase tracking-wide text-white">{space.label}</h3>
              <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-500">
                {meta?.dims}
              </span>
            </div>
            {space.description && (
              <p className="mt-1 text-xs text-zinc-500">{space.description}</p>
            )}
          </div>
        </div>

        {/* Toggle ativo/inativo */}
        <button
          onClick={() => setActive(!active)}
          className="flex shrink-0 items-center gap-2 text-sm font-semibold"
        >
          {active ? (
            <>
              <ToggleRight className="h-7 w-7 text-orange-500" />
              <span className="text-orange-400">Ativo</span>
            </>
          ) : (
            <>
              <ToggleLeft className="h-7 w-7 text-zinc-600" />
              <span className="text-zinc-500">Inativo</span>
            </>
          )}
        </button>
      </div>

      {/* Preview visual do espaço */}
      <div className="mx-6 mb-4 flex justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-800/50 py-4">
        <div
          className={`flex items-center justify-center rounded-lg border text-[10px] uppercase tracking-widest ${
            active && adCode
              ? 'border-green-500/30 bg-green-500/5 text-green-600'
              : active && !adCode
              ? 'border-yellow-500/30 bg-yellow-500/5 text-yellow-600'
              : 'border-zinc-700 bg-zinc-800 text-zinc-600'
          } ${meta?.preview}`}
        >
          {active && adCode ? 'Anúncio ativo' : active && !adCode ? 'Sem código' : 'Inativo'}
        </div>
      </div>

      {/* Status info */}
      <div className="mx-6 mb-4">
        {active && !adCode && (
          <div className="flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
            <Info className="h-4 w-4 shrink-0 text-yellow-400" />
            <p className="text-xs text-yellow-300">
              Espaço ativo, mas sem código configurado. Cole o código do AdSense abaixo.
            </p>
          </div>
        )}
        {!active && (
          <div className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3">
            <Info className="h-4 w-4 shrink-0 text-zinc-500" />
            <p className="text-xs text-zinc-500">
              Quando inativo, nenhum elemento é exibido no site — sem espaço em branco ou placeholder.
            </p>
          </div>
        )}
        {active && adCode && (
          <div className="flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3">
            <CheckCircle className="h-4 w-4 shrink-0 text-green-400" />
            <p className="text-xs text-green-300">
              Anúncio configurado e ativo. Será exibido no site.
            </p>
          </div>
        )}
      </div>

      {/* Código AdSense */}
      <div className="px-6 pb-6">
        <button
          type="button"
          onClick={() => setShowCode(!showCode)}
          className="mb-3 flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-300"
        >
          <Code2 className="h-3.5 w-3.5" />
          {showCode ? 'Ocultar código' : 'Editar código AdSense'}
        </button>

        {showCode && (
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">
              Código do Google AdSense
            </label>
            <textarea
              value={adCode}
              onChange={(e) => setAdCode(e.target.value)}
              rows={6}
              placeholder={`Cole aqui o código do AdSense para este espaço.\n\nExemplo:\n<ins class="adsbygoogle"\n     style="display:block"\n     data-ad-client="ca-pub-XXXXXXXX"\n     data-ad-slot="XXXXXXXX"\n     data-ad-format="auto"></ins>`}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 font-mono text-xs text-zinc-300 placeholder-zinc-700 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
            <p className="mt-1 text-xs text-zinc-600">
              Dica: adicione também o script principal do AdSense no <code className="text-zinc-500">layout.tsx</code> uma única vez.
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          {dirty && (
            <span className="text-xs text-zinc-500">Alterações não salvas</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition ${
              saved
                ? 'bg-green-600 text-white'
                : dirty
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'border border-zinc-700 text-zinc-600 cursor-not-allowed'
            } disabled:opacity-60`}
          >
            {saving ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</>
            ) : saved ? (
              <><CheckCircle className="h-4 w-4" /> Salvo!</>
            ) : (
              <><Save className="h-4 w-4" /> Salvar</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AnunciosPage() {
  const [adSpaces, setAdSpaces] = useState<AdSpace[]>([])
  const [loading, setLoading] = useState(true)
  const [adsenseId, setAdsenseId] = useState('')
  const [adsenseSaved, setAdsenseSaved] = useState(false)
  const [adsenseSaving, setAdsenseSaving] = useState(false)
  const [adsenseDirty, setAdsenseDirty] = useState(false)
  const [originalAdsenseId, setOriginalAdsenseId] = useState('')

  useEffect(() => {
    fetch('/api/admin/ad-spaces')
      .then(r => r.json())
      .then(setAdSpaces)
      .finally(() => setLoading(false))

    fetch('/api/admin/site-config')
      .then(r => r.json())
      .then(data => {
        const id = data.adsense_publisher_id ?? ''
        setAdsenseId(id)
        setOriginalAdsenseId(id)
      })
  }, [])

  const handleAdsenseChange = (val: string) => {
    setAdsenseId(val)
    setAdsenseDirty(val !== originalAdsenseId)
  }

  const handleAdsenseSave = async () => {
    setAdsenseSaving(true)
    await fetch('/api/admin/site-config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'adsense_publisher_id', value: adsenseId }),
    })
    setOriginalAdsenseId(adsenseId)
    setAdsenseDirty(false)
    setAdsenseSaving(false)
    setAdsenseSaved(true)
    setTimeout(() => setAdsenseSaved(false), 2500)
  }

  const handleSave = async (id: string, active: boolean, adCode: string) => {
    const res = await fetch(`/api/admin/ad-spaces/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active, adCode }),
    })
    if (res.ok) {
      const updated = await res.json()
      setAdSpaces(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s))
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-white flex items-center gap-3">
            <Megaphone className="h-7 w-7 text-orange-500" />
            Espaços de Anúncio
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Configure os espaços publicitários do site. Quando inativo, o espaço simplesmente
            não é renderizado — sem placeholder ou espaço em branco visível.
          </p>
        </div>
      </div>

      {/* Guia de uso */}
      <div className="mb-8 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-300">
          <Info className="h-4 w-4" />
          Como ativar o Google AdSense
        </p>
        <ol className="space-y-1 text-xs text-blue-400/80">
          <li>1. Crie uma conta em <span className="font-mono text-blue-300">adsense.google.com</span> e adicione o site</li>
          <li>2. Aguarde a aprovação (pode levar alguns dias)</li>
          <li>3. Crie unidades de anúncio e copie o código HTML de cada uma</li>
          <li>4. Cole o código de cada unidade de anúncio no campo correspondente abaixo e ative</li>
          <li>5. Cole seu ID de publisher (ca-pub-...) no campo de script global abaixo</li>
        </ol>
      </div>

      {/* Cards dos espaços */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="space-y-4">
          {adSpaces.map(space => (
            <AdCard key={space.id} space={space} onSave={handleSave} />
          ))}
        </div>
      )}

      {/* Script global do AdSense — campo editável */}
      <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="font-display mb-1 flex items-center gap-2 text-lg font-bold uppercase tracking-wide text-white">
          <Globe className="h-5 w-5 text-orange-500" />
          Script Global do AdSense
        </h2>
        <p className="mb-5 text-xs text-zinc-500">
          Cole seu ID de publisher abaixo. O script será injetado automaticamente em todas as páginas do site.
        </p>

        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">
              ID de Publisher (ca-pub-...)
            </label>
            <input
              type="text"
              value={adsenseId}
              onChange={e => handleAdsenseChange(e.target.value)}
              placeholder="ca-pub-XXXXXXXXXXXXXXXX"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 font-mono text-sm text-white placeholder-zinc-600 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
            <p className="mt-1.5 text-xs text-zinc-600">
              Encontre em <span className="text-zinc-500">adsense.google.com → Conta → Informações da conta</span>
            </p>
          </div>

          {/* Preview do script gerado */}
          {adsenseId.startsWith('ca-pub-') && (
            <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-3">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-600">Script que será injetado no site</p>
              <pre className="overflow-x-auto text-[11px] text-green-400">{`<Script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}"
  crossOrigin="anonymous"
  strategy="afterInteractive"
/>`}</pre>
            </div>
          )}

          {/* Status */}
          {adsenseId && !adsenseId.startsWith('ca-pub-') && (
            <p className="text-xs text-yellow-500">⚠ O ID deve começar com <span className="font-mono">ca-pub-</span></p>
          )}
          {!adsenseId && originalAdsenseId && (
            <p className="text-xs text-zinc-500">Script removido — salve para confirmar.</p>
          )}
          {!adsenseId && !originalAdsenseId && (
            <div className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3">
              <Info className="h-4 w-4 shrink-0 text-zinc-500" />
              <p className="text-xs text-zinc-500">Sem ID configurado — o script do AdSense não será carregado.</p>
            </div>
          )}
          {originalAdsenseId && adsenseId === originalAdsenseId && (
            <div className="flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3">
              <CheckCircle className="h-4 w-4 shrink-0 text-green-400" />
              <p className="text-xs text-green-300">Script ativo — AdSense será carregado em todas as páginas.</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            {adsenseDirty && <span className="text-xs text-zinc-500">Alterações não salvas</span>}
            <button
              onClick={handleAdsenseSave}
              disabled={adsenseSaving || !adsenseDirty}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                adsenseSaved ? 'bg-green-600 text-white'
                : adsenseDirty ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'cursor-not-allowed border border-zinc-700 text-zinc-600'
              } disabled:opacity-60`}
            >
              {adsenseSaving ? <><Loader2 className="h-4 w-4 animate-spin" />Salvando...</>
              : adsenseSaved ? <><CheckCircle className="h-4 w-4" />Salvo!</>
              : <><Save className="h-4 w-4" />Salvar</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

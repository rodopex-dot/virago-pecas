import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const SHOPEE_API = 'https://open-api.affiliate.shopee.com.br/graphql'

function buildGenerateQuery(originUrl: string): string {
  const escaped = originUrl.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  return `mutation { generateShortLink(originUrl: "${escaped}") { shortLink longLink } }`
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req.headers.get('cookie'))
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { url } = (await req.json()) as { url?: string }
  if (!url?.startsWith('http')) {
    return NextResponse.json({ error: 'URL inválida.' }, { status: 400 })
  }

  // Lê config direto do banco para diagnóstico detalhado
  const config = await prisma.affiliateConfig.findUnique({ where: { platform: 'shopee' } })

  if (!config) {
    return NextResponse.json({ error: 'Config Shopee não encontrada no banco. Recarregue a página.' }, { status: 400 })
  }
  if (!config.active) {
    return NextResponse.json({ error: 'Shopee está inativo. Ative o toggle e salve antes de testar.' }, { status: 400 })
  }
  if (!config.value?.trim()) {
    return NextResponse.json({ error: 'Credenciais não salvas. Preencha App ID + Senha e clique em Salvar.' }, { status: 400 })
  }

  let appId: string, secret: string
  try {
    const parsed = JSON.parse(config.value)
    appId = String(parsed.appId ?? '').trim()
    secret = String(parsed.secret ?? '').trim()
  } catch {
    return NextResponse.json({ error: 'Formato inválido no banco (esperado JSON). Salve as credenciais novamente.' }, { status: 400 })
  }

  if (!appId || !secret) {
    return NextResponse.json({ error: 'App ID ou Senha ausentes. Preencha e salve os dois campos.' }, { status: 400 })
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const body = JSON.stringify({ query: buildGenerateQuery(url) })

  const signature = crypto.createHash('sha256').update(`${appId}${timestamp}${body}${secret}`).digest('hex')

  let rawText = ''
  try {
    const res = await fetch(SHOPEE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `SHA256 Credential=${appId}, Timestamp=${timestamp}, Signature=${signature}`,
      },
      body,
    })

    rawText = await res.text()

    if (!res.ok) {
      return NextResponse.json({
        error: `API Shopee retornou HTTP ${res.status}`,
        raw: rawText,
      }, { status: 400 })
    }

    const data = JSON.parse(rawText)
    const shortLink = data?.data?.generateShortLink?.shortLink as string | undefined

    if (shortLink) {
      return NextResponse.json({ affiliateUrl: shortLink })
    }

    return NextResponse.json({
      error: 'API Shopee não retornou shortLink. Verifique as credenciais.',
      raw: data,
    }, { status: 400 })

  } catch (e) {
    return NextResponse.json({
      error: `Erro ao chamar a API Shopee: ${e instanceof Error ? e.message : String(e)}`,
      raw: rawText || null,
    }, { status: 500 })
  }
}

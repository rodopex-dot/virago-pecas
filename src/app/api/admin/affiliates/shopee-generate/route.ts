/**
 * POST /api/admin/affiliates/shopee-generate
 * Body: { url: string }
 *
 * Replica o workflow n8n Shopee:
 *  1. Busca appId + appSecret do SiteConfig
 *  2. Gera timestamp Unix (segundos)
 *  3. Monta mutation GraphQL: generateShortLink(input: { originUrl })
 *  4. Calcula SHA256(appId + timestamp + rawBody + appSecret)
 *  5. POST para https://open-api.affiliate.shopee.com.br/graphql
 *  6. Retorna { affiliateUrl }
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/adminAuth'

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req.headers.get('cookie'))
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { url } = (await req.json()) as { url?: string }
  if (!url?.startsWith('http')) {
    return NextResponse.json({ error: 'URL inválida.' }, { status: 400 })
  }

  // ── 1. Buscar credenciais ────────────────────────────────────────────────────
  const rows = await prisma.siteConfig.findMany({
    where: { key: { in: ['shopee_app_id', 'shopee_app_secret'] } },
  })
  const cfg = Object.fromEntries(rows.map(r => [r.key, r.value ?? '']))

  if (!cfg.shopee_app_id || !cfg.shopee_app_secret) {
    return NextResponse.json({
      error: 'Credenciais da Shopee não configuradas. Acesse Admin → Afiliados → Shopee Auto.',
    }, { status: 400 })
  }

  const appId     = cfg.shopee_app_id
  const appSecret = cfg.shopee_app_secret
  const timestamp = Math.floor(Date.now() / 1000).toString()

  // ── 2. Montar GraphQL mutation (nó "Preparar Request Shopee") ────────────────
  const graphqlQuery = `mutation { generateShortLink(input: { originUrl: "${url}" }) { shortLink } }`
  const payload      = { query: graphqlQuery }
  const rawBody      = JSON.stringify(payload)

  // ── 3. Calcular assinatura SHA256 (nó "Crypto") ──────────────────────────────
  const signature = crypto
    .createHash('sha256')
    .update(appId + timestamp + rawBody + appSecret)
    .digest('hex')

  const authorization = `SHA256 Credential=${appId},Timestamp=${timestamp},Signature=${signature}`

  // ── 4. Chamar API GraphQL da Shopee ──────────────────────────────────────────
  let apiRes: Response
  try {
    apiRes = await fetch('https://open-api.affiliate.shopee.com.br/graphql', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': authorization,
      },
      body: rawBody,
    })
  } catch (err) {
    console.error('[shopee-generate] Erro de rede:', err)
    return NextResponse.json({ error: 'Erro de rede ao chamar API da Shopee.' }, { status: 502 })
  }

  if (!apiRes.ok) {
    const text = await apiRes.text().catch(() => '')
    console.error('[shopee-generate] API retornou', apiRes.status, text)
    return NextResponse.json({
      error: `API da Shopee retornou ${apiRes.status}. Verifique as credenciais.`,
      details: text,
    }, { status: 502 })
  }

  const data = await apiRes.json()

  // ── 5. Extrair link ──────────────────────────────────────────────────────────
  const affiliateUrl = data?.data?.generateShortLink?.shortLink ?? null

  if (!affiliateUrl) {
    console.error('[shopee-generate] Formato inesperado:', JSON.stringify(data))
    return NextResponse.json({
      error: 'Formato de resposta inesperado da API da Shopee.',
      raw: data,
    }, { status: 502 })
  }

  return NextResponse.json({ affiliateUrl })
}

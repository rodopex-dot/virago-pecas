/**
 * Geração server-side de links de afiliado da Shopee.
 * Replica o workflow n8n: SHA256(appId + timestamp + body + appSecret) → GraphQL API.
 */

import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { isAlreadyAffiliateLink } from '@/lib/affiliateLinks'

function isShopeeUrl(url: string): boolean {
  try {
    const h = new URL(url).hostname.toLowerCase()
    return h.includes('shopee.com.br') || h.includes('shopee.com')
  } catch { return false }
}

/**
 * Calcula assinatura SHA256 igual ao nó Crypto do n8n:
 * SHA256( appId + timestamp + rawBody + appSecret )
 */
function buildSignature(appId: string, timestamp: string, rawBody: string, appSecret: string): string {
  return crypto.createHash('sha256')
    .update(appId + timestamp + rawBody + appSecret)
    .digest('hex')
}

/**
 * Tenta converter uma URL da Shopee em link de afiliado (shope.ee/...).
 * Retorna o link curto ou a URL original em caso de falha.
 */
export async function generateShopeeAffiliateLink(url: string): Promise<string> {
  if (!isShopeeUrl(url) || isAlreadyAffiliateLink(url)) return url

  // Busca credenciais no banco
  const rows = await prisma.siteConfig.findMany({
    where: { key: { in: ['shopee_app_id', 'shopee_app_secret'] } },
  })
  const cfg = Object.fromEntries(rows.map(r => [r.key, r.value ?? '']))

  if (!cfg.shopee_app_id || !cfg.shopee_app_secret) {
    console.warn('[shopee-affiliate] Credenciais não configuradas — usando URL original.')
    return url
  }

  const appId     = cfg.shopee_app_id
  const appSecret = cfg.shopee_app_secret
  const timestamp = Math.floor(Date.now() / 1000).toString()

  // GraphQL mutation (igual ao nó "Preparar Request Shopee")
  const graphqlQuery = `mutation { generateShortLink(input: { originUrl: "${url}" }) { shortLink } }`
  const payload    = { query: graphqlQuery }
  const rawBody    = JSON.stringify(payload)

  // Assinatura SHA256
  const signature = buildSignature(appId, timestamp, rawBody, appSecret)

  // Header Authorization (formato exato do n8n)
  const authorization = `SHA256 Credential=${appId},Timestamp=${timestamp},Signature=${signature}`

  try {
    const res = await fetch('https://open-api.affiliate.shopee.com.br/graphql', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': authorization,
      },
      body: rawBody,
    })

    if (!res.ok) {
      console.warn('[shopee-affiliate] API retornou', res.status, '— usando URL original.')
      return url
    }

    const data = await res.json()
    const shortLink = data?.data?.generateShortLink?.shortLink
    if (shortLink) return shortLink

    console.warn('[shopee-affiliate] Formato inesperado:', JSON.stringify(data))
  } catch (e) {
    console.warn('[shopee-affiliate] Erro na chamada:', e)
  }

  return url
}

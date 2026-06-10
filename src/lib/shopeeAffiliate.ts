import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { isAlreadyAffiliateLink } from '@/lib/affiliateLinks'

const SHOPEE_API = 'https://open-api.affiliate.shopee.com.br/graphql'

function buildGenerateQuery(originUrl: string): string {
  const escaped = originUrl.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  return `mutation { generateShortLink(input: {originUrl: "${escaped}"}) { shortLink longLink } }`
}

export function isShopeeUrl(url: string): boolean {
  try {
    const h = new URL(url).hostname.toLowerCase()
    return h.includes('shopee.com.br') || h.includes('shopee.com')
  } catch { return false }
}

function buildSignature(appId: string, secret: string, timestamp: number, payload: string): string {
  // SHA256(AppId + Timestamp + Payload + Secret) — não é HMAC
  return crypto.createHash('sha256').update(`${appId}${timestamp}${payload}${secret}`).digest('hex')
}

function parseCredentials(raw: string): { appId: string; secret: string } | null {
  try {
    const parsed = JSON.parse(raw)
    const appId = String(parsed.appId ?? '').trim()
    const secret = String(parsed.secret ?? '').trim()
    if (!appId || !secret) return null
    return { appId, secret }
  } catch {
    return null
  }
}

/**
 * Converte URL da Shopee em link curto (shope.ee) via Shopee Affiliate Open API.
 * Credenciais armazenadas em affiliateConfig.value como JSON: {"appId":"...","secret":"..."}.
 */
export async function generateShopeeAffiliateLink(url: string): Promise<string> {
  if (!isShopeeUrl(url) || isAlreadyAffiliateLink(url)) return url

  const config = await prisma.affiliateConfig.findUnique({
    where: { platform: 'shopee' },
  })

  if (!config?.active || !config.value?.trim()) {
    console.warn('[shopee-affiliate] Config inativa ou sem credenciais.')
    return url
  }

  const creds = parseCredentials(config.value)
  if (!creds) {
    console.warn('[shopee-affiliate] Credenciais inválidas — formato esperado: {"appId":"...","secret":"..."}')
    return url
  }

  const { appId, secret } = creds
  const timestamp = Math.floor(Date.now() / 1000)
  const body = JSON.stringify({ query: buildGenerateQuery(url) })

  const signature = buildSignature(appId, secret, timestamp, body)

  try {
    const res = await fetch(SHOPEE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `SHA256 Credential=${appId}, Timestamp=${timestamp}, Signature=${signature}`,
      },
      body,
    })

    const text = await res.text()

    if (!res.ok) {
      console.warn('[shopee-affiliate] API HTTP error:', res.status, text)
      return url
    }

    const data = JSON.parse(text)
    const shortLink = data?.data?.generateShortLink?.shortLink as string | undefined
    if (shortLink) return shortLink

    const gqlErrors = data?.errors
    console.warn('[shopee-affiliate] Resposta sem shortLink:', JSON.stringify(gqlErrors ?? data))
    return url
  } catch (e) {
    console.warn('[shopee-affiliate] Erro na chamada API:', e)
    return url
  }
}

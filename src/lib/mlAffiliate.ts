/**
 * Geração server-side de links de afiliado do Mercado Livre.
 * Chamado automaticamente ao salvar qualquer link de compra ML.
 */

import { prisma } from '@/lib/prisma'
import { isAlreadyAffiliateLink } from '@/lib/affiliateLinks'

function isMLUrl(url: string): boolean {
  try {
    const h = new URL(url).hostname.toLowerCase()
    return h.includes('mercadolivre.com') || h.includes('mercadolibre.com')
  } catch { return false }
}

function mergeCookies(oldStr: string, setCookieHeaders: string[]): string {
  const map: Record<string, string> = {}
  if (oldStr) {
    for (const part of oldStr.split(';')) {
      const [k, ...v] = part.trim().split('=')
      if (k) map[k.trim()] = v.join('=')
    }
  }
  for (const header of setCookieHeaders) {
    const pair = header.split(';')[0].trim()
    const [k, ...v] = pair.split('=')
    if (k) map[k.trim()] = v.join('=')
  }
  return Object.entries(map).map(([k, v]) => `${k}=${v}`).join('; ')
}

function getSetCookies(res: Response): string[] {
  if (typeof (res.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie === 'function') {
    return (res.headers as unknown as { getSetCookie: () => string[] }).getSetCookie()
  }
  const raw = res.headers.get('set-cookie')
  if (!raw) return []
  return raw.split(/,(?=\s*\w+=)/).map(s => s.trim())
}

function findUrl(obj: unknown): string | null {
  if (!obj || typeof obj !== 'object') return null
  if (Array.isArray(obj)) {
    for (const item of obj) { const f = findUrl(item); if (f) return f }
    return null
  }
  const o = obj as Record<string, unknown>
  for (const field of ['short_url', 'shortLink', 'shortUrl', 'link', 'affiliateUrl', 'generatedUrl', 'outputUrl']) {
    if (typeof o[field] === 'string' && (o[field] as string).startsWith('http')) return o[field] as string
  }
  for (const field of ['urls', 'links', 'items', 'data', 'result', 'response']) {
    if (o[field]) { const f = findUrl(o[field]); if (f) return f }
  }
  return null
}

/**
 * Tenta converter uma URL do ML em link de afiliado.
 * Retorna o link de afiliado (meli.la/...) ou a URL original em caso de falha.
 */
export async function generateMLAffiliateLink(url: string): Promise<string> {
  // Só processa URLs do ML que ainda não são links de afiliado
  if (!isMLUrl(url) || isAlreadyAffiliateLink(url)) return url

  // Busca configurações no banco
  const rows = await prisma.siteConfig.findMany({
    where: { key: { in: ['ml_affiliate_tag', 'ml_cookies', 'ml_csrf_token'] } },
  })
  const cfg = Object.fromEntries(rows.map(r => [r.key, r.value ?? '']))

  if (!cfg.ml_cookies) {
    console.warn('[ml-affiliate] Cookies não configurados — usando URL original.')
    return url
  }

  const tag       = cfg.ml_affiliate_tag || 'virago250'
  const csrfToken = cfg.ml_csrf_token || ''
  let   cookies   = cfg.ml_cookies

  // Renovar cookies
  try {
    const refreshRes = await fetch('https://www.mercadolivre.com.br/afiliados/linkbuilder', {
      method:  'GET',
      headers: {
        cookie:           cookies,
        'user-agent':     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
        accept:           'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'pt-BR,pt;q=0.9',
      },
      redirect: 'manual',
    })
    const newCookies = getSetCookies(refreshRes)
    if (newCookies.length > 0) {
      cookies = mergeCookies(cookies, newCookies)
      await prisma.siteConfig.upsert({
        where:  { key: 'ml_cookies' },
        update: { value: cookies },
        create: { key: 'ml_cookies', value: cookies },
      })
      await prisma.siteConfig.upsert({
        where:  { key: 'ml_cookies_updated_at' },
        update: { value: new Date().toISOString() },
        create: { key: 'ml_cookies_updated_at', value: new Date().toISOString() },
      })
    }
  } catch (e) {
    console.warn('[ml-affiliate] Falha ao renovar cookies:', e)
  }

  // Chamar API createLink
  const headers: Record<string, string> = {
    accept:             'application/json, text/plain, */*',
    'accept-language':  'pt-BR,pt;q=0.9',
    'content-type':     'application/json',
    origin:             'https://www.mercadolivre.com.br',
    referer:            'https://www.mercadolivre.com.br/afiliados/linkbuilder',
    'user-agent':       'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
    'sec-fetch-dest':   'empty',
    'sec-fetch-mode':   'cors',
    'sec-fetch-site':   'same-origin',
    dnt:                '1',
    cookie:             cookies,
  }
  if (csrfToken) headers['x-csrf-token'] = csrfToken

  try {
    const res = await fetch(
      'https://www.mercadolivre.com.br/affiliate-program/api/v2/affiliates/createLink',
      { method: 'POST', headers, body: JSON.stringify({ urls: [url], tag }) }
    )
    if (!res.ok) {
      console.warn('[ml-affiliate] API retornou', res.status, '— usando URL original.')
      return url
    }
    const data = await res.json()
    const affiliateUrl = findUrl(data)
    if (affiliateUrl) return affiliateUrl
    console.warn('[ml-affiliate] Formato desconhecido:', JSON.stringify(data))
  } catch (e) {
    console.warn('[ml-affiliate] Erro na chamada:', e)
  }

  return url
}

/**
 * POST /api/admin/affiliates/ml-generate
 * Body: { url: string }
 *
 * Replica o workflow n8n de geração de link de afiliado do Mercado Livre:
 *  1. Busca cookies + tag + csrf armazenados no SiteConfig
 *  2. Faz GET em /afiliados/linkbuilder para renovar os cookies (merge set-cookie)
 *  3. Salva cookies atualizados no banco
 *  4. Chama POST /affiliate-program/api/v2/affiliates/createLink com o produto
 *  5. Retorna { affiliateUrl }
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/adminAuth'

/** Mesclagem de cookies — equivalente ao nó "merge cookies" do n8n */
function mergeCookies(oldStr: string, setCookieHeaders: string[]): string {
  const map: Record<string, string> = {}

  // Parseia cookies antigos
  if (oldStr) {
    for (const part of oldStr.split(';')) {
      const [k, ...v] = part.trim().split('=')
      if (k) map[k.trim()] = v.join('=')
    }
  }

  // Mescla novos set-cookie (cada item pode ser "name=value; Path=/; ...")
  for (const header of setCookieHeaders) {
    const pair = header.split(';')[0].trim()
    const [k, ...v] = pair.split('=')
    if (k) map[k.trim()] = v.join('=')
  }

  return Object.entries(map).map(([k, v]) => `${k}=${v}`).join('; ')
}

/** Extrai array de set-cookie de um Response do fetch (Node.js) */
function getSetCookies(res: Response): string[] {
  // Node 18+ expõe getSetCookie() no Headers
  if (typeof (res.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie === 'function') {
    return (res.headers as unknown as { getSetCookie: () => string[] }).getSetCookie()
  }
  const raw = res.headers.get('set-cookie')
  if (!raw) return []
  // Fallback: divide por vírgula (não ideal para valores com vírgulas, mas suficiente)
  return raw.split(/,(?=\s*\w+=)/).map(s => s.trim())
}

const BROWSER_HEADERS = {
  'accept':              'application/json, text/plain, */*',
  'accept-language':     'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
  'content-type':        'application/json',
  'dnt':                 '1',
  'origin':              'https://www.mercadolivre.com.br',
  'referer':             'https://www.mercadolivre.com.br/afiliados/linkbuilder',
  'sec-ch-ua':           '"Not(A:Brand";v="8", "Chromium";v="144", "Microsoft Edge";v="144"',
  'sec-ch-ua-mobile':    '?0',
  'sec-ch-ua-platform':  '"Windows"',
  'sec-fetch-dest':      'empty',
  'sec-fetch-mode':      'cors',
  'sec-fetch-site':      'same-origin',
  'user-agent':          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0',
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req.headers.get('cookie'))
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { url } = (await req.json()) as { url?: string }
  if (!url?.startsWith('http')) {
    return NextResponse.json({ error: 'URL inválida.' }, { status: 400 })
  }

  // ── 1. Buscar configurações armazenadas ──────────────────────────────────────
  const rows = await prisma.siteConfig.findMany({
    where: { key: { in: ['ml_affiliate_tag', 'ml_cookies', 'ml_csrf_token'] } },
  })
  const cfg = Object.fromEntries(rows.map(r => [r.key, r.value ?? '']))

  if (!cfg.ml_cookies) {
    return NextResponse.json({
      error: 'Cookies do ML não configurados. Acesse Admin → Afiliados e configure a seção "Mercado Livre — Auto".',
    }, { status: 400 })
  }

  const tag       = cfg.ml_affiliate_tag || 'virago250'
  const csrfToken = cfg.ml_csrf_token || ''
  let   cookies   = cfg.ml_cookies

  // ── 2. Renovar cookies (GET no linkbuilder) ──────────────────────────────────
  try {
    const refreshRes = await fetch('https://www.mercadolivre.com.br/afiliados/linkbuilder', {
      method:  'GET',
      headers: {
        'cookie':       cookies,
        'user-agent':   BROWSER_HEADERS['user-agent'],
        'accept':       'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'pt-BR,pt;q=0.9',
      },
      redirect: 'manual', // não seguir redirects — só pegar os set-cookie
    })

    const newCookies = getSetCookies(refreshRes)
    if (newCookies.length > 0) {
      cookies = mergeCookies(cookies, newCookies)
      // Salvar cookies atualizados
      await prisma.siteConfig.upsert({
        where: { key: 'ml_cookies' },
        update: { value: cookies },
        create: { key: 'ml_cookies', value: cookies },
      })
      await prisma.siteConfig.upsert({
        where: { key: 'ml_cookies_updated_at' },
        update: { value: new Date().toISOString() },
        create: { key: 'ml_cookies_updated_at', value: new Date().toISOString() },
      })
    }
  } catch (err) {
    // Renovação falhou — continua com cookies existentes
    console.warn('[ml-generate] Falha ao renovar cookies:', err)
  }

  // ── 3. Chamar API de criação de link ─────────────────────────────────────────
  const createHeaders: Record<string, string> = {
    ...BROWSER_HEADERS,
    'cookie': cookies,
  }
  if (csrfToken) createHeaders['x-csrf-token'] = csrfToken

  let createRes: Response
  try {
    createRes = await fetch(
      'https://www.mercadolivre.com.br/affiliate-program/api/v2/affiliates/createLink',
      {
        method:  'POST',
        headers: createHeaders,
        body:    JSON.stringify({ urls: [url], tag }),
      }
    )
  } catch (err) {
    console.error('[ml-generate] Erro de rede:', err)
    return NextResponse.json({ error: 'Erro de rede ao chamar API do ML.' }, { status: 502 })
  }

  if (!createRes.ok) {
    const text = await createRes.text().catch(() => '')
    console.error('[ml-generate] API ML retornou', createRes.status, text)
    return NextResponse.json({
      error: `API do ML retornou ${createRes.status}. Verifique se os cookies e CSRF token estão atualizados.`,
      details: text,
    }, { status: 502 })
  }

  const data = await createRes.json()

  // ── 4. Extrair URL do link de afiliado ───────────────────────────────────────
  // A API pode retornar vários formatos. Tentamos todos conhecidos:
  const item = Array.isArray(data) ? data[0] : (data?.links?.[0] ?? data)
  const affiliateUrl =
    item?.shortLink ??
    item?.link ??
    item?.affiliateUrl ??
    item?.url ??
    null

  if (!affiliateUrl) {
    console.error('[ml-generate] Formato de resposta desconhecido:', JSON.stringify(data))
    return NextResponse.json({
      error: 'Resposta inesperada da API do ML. Veja o console para detalhes.',
      raw: data,
    }, { status: 502 })
  }

  return NextResponse.json({ affiliateUrl })
}

export interface AffiliateConfig {
  platform: string
  active: boolean
  value?: string | null
}

/**
 * Metadados estáticos de cada plataforma.
 *
 * method:
 *  'param'   — injeta um query param na URL do produto (Amazon, AliExpress)
 *  'redirect' — prefixa a URL com um link de redirect (Shopee, Magalu)
 *  'manual'  — não há conversão automática; o admin gera e cola o link direto
 */
export const PLATFORM_META: Record<string, {
  label: string
  logo: string
  description: string
  hint: string
  placeholder: string
  method: 'param' | 'redirect' | 'manual'
  paramName?: string
  domains: string[]
  affiliateDomains?: string[] // domínios que já são links de afiliado (não converter)
}> = {
  amazon: {
    label: 'Amazon Brasil',
    logo: '🛒',
    description: 'Programa Amazon Associates. Cole sua tag de afiliado.',
    hint: 'Formato: seutag-20  (encontre em associados.amazon.com.br)',
    placeholder: 'seutag-20',
    method: 'param',
    paramName: 'tag',
    domains: ['amazon.com.br', 'amzn.to', 'amazon.com'],
  },
  mercadolivre: {
    label: 'Mercado Livre',
    logo: '🟡',
    description:
      'O ML exige geração manual de link por produto. Use o "Gerador de produtos recomendados" no painel de afiliados e cole o link gerado diretamente no campo "Link de compra".',
    hint: 'Acesse: mercadolivre.com.br/afiliados → Gerador de produtos → cole a URL do produto → copie o link gerado (meli.la/... ou o link completo)',
    placeholder: '(não necessário — cole o meli.la/... direto no campo Link de compra)',
    method: 'manual',
    domains: ['mercadolivre.com.br', 'mercadolibre.com.br', 'produto.mercadolivre.com.br'],
    affiliateDomains: ['meli.la'], // já é link de afiliado, não precisa converter
  },
  shopee: {
    label: 'Shopee Brasil',
    logo: '🟠',
    description: 'Programa Shopee Affiliates. Cole a URL base do seu link de afiliado.',
    hint: 'Gere em shopee.com.br/affiliates → copie o link base',
    placeholder: 'https://shope.ee/XXXXXXXX',
    method: 'redirect',
    domains: ['shopee.com.br'],
    affiliateDomains: ['shope.ee'],
  },
  aliexpress: {
    label: 'AliExpress',
    logo: '🔴',
    description: 'Programa AliExpress Portals. Cole seu ID de afiliado.',
    hint: 'Encontre em portals.aliexpress.com → seu "aff_fcid"',
    placeholder: 'SEU_AFF_FCID',
    method: 'param',
    paramName: 'aff_fcid',
    domains: ['aliexpress.com', 'pt.aliexpress.com', 'a.aliexpress.com', 's.click.aliexpress.com'],
  },
  magalu: {
    label: 'Magazine Luiza',
    logo: '🔵',
    description: 'Programa Parceiros Magalu. Cole a URL base de rastreamento.',
    hint: 'Gere em parceiros.magazineluiza.com.br → copie a URL base',
    placeholder: 'https://click.magazineluiza.com.br/trackerLink?XXXXXXX&url=',
    method: 'redirect',
    domains: ['magazineluiza.com.br', 'magazinevoce.com.br'],
  },
}

/**
 * Retorna true se a URL já é um link de afiliado (não precisa converter).
 * Ex: meli.la/..., shope.ee/...
 */
export function isAlreadyAffiliateLink(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, '')
    for (const meta of Object.values(PLATFORM_META)) {
      if (meta.affiliateDomains?.some(d => hostname === d || hostname.endsWith('.' + d))) {
        return true
      }
    }
    // Links ML /social/... com ref= já são afiliados
    if (hostname.includes('mercadolivre.com.br') || hostname.includes('mercadolibre.com.br')) {
      const u = new URL(url)
      if (u.pathname.includes('/social/') && u.searchParams.has('ref')) return true
    }
  } catch { /* noop */ }
  return false
}

/**
 * Converte uma URL de compra para link de afiliado com base nas configs ativas.
 * Retorna a URL original se nenhuma config corresponder ou se já for afiliado.
 */
export function convertToAffiliateLink(
  url: string,
  configs: AffiliateConfig[]
): string {
  if (!url) return url

  // Se já é um link de afiliado, retorna como está
  if (isAlreadyAffiliateLink(url)) return url

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return url
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '')

  for (const config of configs) {
    if (!config.active || !config.value?.trim()) continue

    const meta = PLATFORM_META[config.platform]
    if (!meta) continue

    // Plataformas manuais não têm conversão automática
    if (meta.method === 'manual') continue

    const matches = meta.domains.some(d => hostname === d || hostname.endsWith('.' + d))
    if (!matches) continue

    const affiliateValue = config.value.trim()

    // Amazon, AliExpress — injeta ?param=valor na URL do produto
    if (meta.method === 'param' && meta.paramName) {
      parsed.searchParams.delete(meta.paramName)
      parsed.searchParams.set(meta.paramName, affiliateValue)
      return parsed.toString()
    }

    // Shopee, Magalu — prefixa URL com redirect de afiliado
    if (meta.method === 'redirect') {
      const base = affiliateValue.endsWith('=') || affiliateValue.endsWith('?')
        ? affiliateValue
        : affiliateValue + (affiliateValue.includes('?') ? '&url=' : '?url=')
      return `${base}${encodeURIComponent(url)}`
    }
  }

  return url
}

/** Detecta qual plataforma a URL pertence */
export function detectPlatform(url: string): string | null {
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, '')
    for (const [key, meta] of Object.entries(PLATFORM_META)) {
      const allDomains = [...meta.domains, ...(meta.affiliateDomains ?? [])]
      if (allDomains.some(d => hostname === d || hostname.endsWith('.' + d))) return key
    }
  } catch { /* noop */ }
  return null
}

/**
 * Retorna a URL limpa de um produto ML (remove hash e params de sessão de busca),
 * pronta para ser colada no Gerador de Produtos Recomendados do ML.
 */
export function cleanMLProductUrl(url: string): string {
  try {
    const parsed = new URL(url)
    if (!parsed.hostname.includes('mercadolivre') && !parsed.hostname.includes('mercadolibre')) {
      return url
    }
    parsed.hash = ''
    const sessionParams = ['tracking_id', 'sid', 'position', 'search_layout', 'type',
      'be_origin', 'forceInApp', 'matt_word', 'matt_tool', 'matt_source', 'ref']
    sessionParams.forEach(p => parsed.searchParams.delete(p))
    return parsed.toString()
  } catch {
    return url
  }
}

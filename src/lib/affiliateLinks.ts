export interface AffiliateConfig {
  platform: string
  active: boolean
  value?: string | null
}

/** Metadados estáticos de cada plataforma (lógica de conversão hardcoded) */
export const PLATFORM_META: Record<string, {
  label: string
  logo: string
  description: string
  hint: string
  placeholder: string
  method: 'param' | 'redirect' | 'ml-params'
  paramName?: string
  domains: string[]
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
    description: 'Programa nativo do ML. Cole o link de afiliado gerado no painel (mercadolivre.com.br/social/…).',
    hint: 'Acesse mercadolivre.com.br/afiliados → gere um link → cole o link completo aqui.',
    placeholder: 'https://www.mercadolivre.com.br/social/SEU_USUARIO?matt_word=...&matt_tool=...&ref=...',
    method: 'ml-params',
    domains: ['mercadolivre.com.br', 'mercadolibre.com.br', 'produto.mercadolivre.com.br'],
  },
  shopee: {
    label: 'Shopee Brasil',
    logo: '🟠',
    description: 'Programa Shopee Affiliates. Cole a URL base do seu link de afiliado.',
    hint: 'Gere em shopee.com.br/affiliates → copie o link base',
    placeholder: 'https://shope.ee/XXXXXXXX',
    method: 'redirect',
    domains: ['shopee.com.br'],
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
 * Extrai os parâmetros de rastreamento de um link de afiliado do Mercado Livre
 * no formato: mercadolivre.com.br/social/USER?matt_word=X&matt_tool=Y&ref=Z
 */
function extractMLParams(affiliateUrl: string): Record<string, string> {
  try {
    const u = new URL(affiliateUrl)
    const params: Record<string, string> = {}
    // Parâmetros de rastreamento nativos do ML
    for (const key of ['matt_word', 'matt_tool', 'matt_source', 'matt_campaign', 'ref']) {
      const val = u.searchParams.get(key)
      if (val) params[key] = val
    }
    return params
  } catch {
    return {}
  }
}

/**
 * Converte uma URL de compra para link de afiliado com base nas configs ativas.
 * Retorna a URL original se nenhuma config corresponder.
 */
export function convertToAffiliateLink(
  url: string,
  configs: AffiliateConfig[]
): string {
  if (!url) return url

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

    const matches = meta.domains.some(d => hostname === d || hostname.endsWith('.' + d))
    if (!matches) continue

    const affiliateValue = config.value.trim()

    // Amazon, AliExpress — injeta ?param=valor na URL do produto
    if (meta.method === 'param' && meta.paramName) {
      parsed.searchParams.delete(meta.paramName)
      parsed.searchParams.set(meta.paramName, affiliateValue)
      return parsed.toString()
    }

    // Mercado Livre — extrai matt_tool, matt_word, ref do link de afiliado
    // e injeta na URL do produto
    if (meta.method === 'ml-params') {
      const mlParams = extractMLParams(affiliateValue)
      if (Object.keys(mlParams).length === 0) return url // link inválido, não converte
      for (const [key, val] of Object.entries(mlParams)) {
        parsed.searchParams.set(key, val)
      }
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
      if (meta.domains.some(d => hostname === d || hostname.endsWith('.' + d))) return key
    }
  } catch { /* noop */ }
  return null
}

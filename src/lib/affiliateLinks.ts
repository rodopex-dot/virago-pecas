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
  method: 'param' | 'redirect'
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
    description: 'Programa de Afiliados via Impact Radius. Cole a URL base de rastreamento.',
    hint: 'Gere em afiliados.mercadolivre.com.br → copie a URL até "?u="',
    placeholder: 'https://mercadolivre.sjv.io/c/XXXXX/XXXXX/XXXXX?u=',
    method: 'redirect',
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
    return url // URL inválida, retorna como está
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '')

  for (const config of configs) {
    if (!config.active || !config.value?.trim()) continue

    const meta = PLATFORM_META[config.platform]
    if (!meta) continue

    const matches = meta.domains.some(d => hostname === d || hostname.endsWith('.' + d))
    if (!matches) continue

    const affiliateValue = config.value.trim()

    if (meta.method === 'param' && meta.paramName) {
      // Injeta parâmetro na URL original (ex: Amazon ?tag=, AliExpress ?aff_fcid=)
      // Remove o param existente para não duplicar
      parsed.searchParams.delete(meta.paramName)
      parsed.searchParams.set(meta.paramName, affiliateValue)
      return parsed.toString()
    }

    if (meta.method === 'redirect') {
      // Prefixa a URL com o redirect de afiliado
      // Garante que o valor termina com "=" ou "?" para facilitar concatenação
      const base = affiliateValue.endsWith('=') || affiliateValue.endsWith('?')
        ? affiliateValue
        : affiliateValue + (affiliateValue.includes('?') ? '&url=' : '?url=')
      return `${base}${encodeURIComponent(url)}`
    }
  }

  return url // Nenhuma plataforma correspondeu
}

/** Detecta qual plataforma a URL pertence (para exibição no admin, etc.) */
export function detectPlatform(url: string): string | null {
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, '')
    for (const [key, meta] of Object.entries(PLATFORM_META)) {
      if (meta.domains.some(d => hostname === d || hostname.endsWith('.' + d))) return key
    }
  } catch { /* noop */ }
  return null
}

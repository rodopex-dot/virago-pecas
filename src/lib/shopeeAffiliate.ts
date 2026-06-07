/**
 * Geração server-side de links de afiliado da Shopee.
 * Injeta mmp_pid + UTM params na URL do produto (sem API, sem cookies).
 * Formato: ?mmp_pid=an_XXXXX&utm_source=an_XXXXX&utm_medium=affiliates&utm_content=----
 */

import { prisma } from '@/lib/prisma'
import { isAlreadyAffiliateLink } from '@/lib/affiliateLinks'

function isShopeeUrl(url: string): boolean {
  try {
    const h = new URL(url).hostname.toLowerCase()
    return h.includes('shopee.com.br') || h.includes('shopee.com')
  } catch { return false }
}

/**
 * Converte uma URL da Shopee em link de afiliado injetando mmp_pid + UTM params.
 * Retorna a URL com parâmetros ou a URL original em caso de falha.
 */
export async function generateShopeeAffiliateLink(url: string): Promise<string> {
  if (!isShopeeUrl(url) || isAlreadyAffiliateLink(url)) return url

  // Busca configuração do afiliado Shopee no banco
  const config = await prisma.affiliateConfig.findUnique({
    where: { platform: 'shopee' },
  })

  if (!config?.active || !config.value?.trim()) {
    console.warn('[shopee-affiliate] Config inativa ou sem valor — usando URL original.')
    return url
  }

  const publisherId = config.value.trim() // ex: "an_18331440429"

  try {
    const parsed = new URL(url)
    parsed.searchParams.set('mmp_pid',      publisherId)
    parsed.searchParams.set('utm_source',   publisherId)
    parsed.searchParams.set('utm_medium',   'affiliates')
    parsed.searchParams.set('utm_content',  '----')
    return parsed.toString()
  } catch (e) {
    console.warn('[shopee-affiliate] Erro ao montar URL:', e)
    return url
  }
}

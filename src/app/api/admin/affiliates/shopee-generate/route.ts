/**
 * POST /api/admin/affiliates/shopee-generate
 * Body: { url: string }
 *
 * Converte URL da Shopee para link de afiliado injetando mmp_pid + UTM params.
 * Usa a configuração da tabela AffiliateConfig (platform = 'shopee').
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/adminAuth'
import { generateShopeeAffiliateLink } from '@/lib/shopeeAffiliate'

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req.headers.get('cookie'))
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { url } = (await req.json()) as { url?: string }
  if (!url?.startsWith('http')) {
    return NextResponse.json({ error: 'URL inválida.' }, { status: 400 })
  }

  const affiliateUrl = await generateShopeeAffiliateLink(url)

  if (affiliateUrl === url) {
    return NextResponse.json({
      error: 'Shopee não configurado ou URL não é da Shopee. Configure em Admin → Afiliados.',
    }, { status: 400 })
  }

  return NextResponse.json({ affiliateUrl })
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { detectPlatform } from '@/lib/affiliateLinks'
import { generateMLAffiliateLink } from '@/lib/mlAffiliate'
import { getCurrentUser } from '@/lib/adminAuth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; cpId: string }> }
) {
  const user = await getCurrentUser(request.headers.get('cookie'))
  if (!user) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  if (user.role !== 'superadmin') return NextResponse.json({ error: 'Apenas superadmin pode adicionar links de compra.' }, { status: 403 })

  try {
    const { cpId } = await params
    const { url } = await request.json()

    if (!url?.trim().startsWith('http')) {
      return NextResponse.json({ error: 'URL inválida.' }, { status: 400 })
    }

    // Converte automaticamente links ML para link de afiliado
    const finalUrl = await generateMLAffiliateLink(url.trim())
    const platform = detectPlatform(finalUrl) ?? 'other'

    const link = await prisma.purchaseLink.create({
      data: { compatiblePartId: cpId, url: finalUrl, platform },
    })

    return NextResponse.json(link, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro ao adicionar link.' }, { status: 500 })
  }
}

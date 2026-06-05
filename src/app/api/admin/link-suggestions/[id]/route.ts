import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { detectPlatform } from '@/lib/affiliateLinks'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { action } = await request.json() // 'approve' | 'reject'

    const suggestion = await prisma.linkSuggestion.findUnique({
      where: { id },
      include: { compatiblePart: true },
    })
    if (!suggestion) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 })

    if (action === 'reject') {
      await prisma.linkSuggestion.update({ where: { id }, data: { status: 'REJEITADA' } })
      return NextResponse.json({ ok: true, status: 'REJEITADA' })
    }

    if (action === 'approve') {
      // Cria novo PurchaseLink (não substitui — adiciona ao conjunto)
      if (suggestion.purchaseLink) {
        const url = suggestion.purchaseLink.trim()
        const platform = detectPlatform(url) ?? 'other'
        // Evita duplicata exata
        const exists = await prisma.purchaseLink.findFirst({
          where: { compatiblePartId: suggestion.compatiblePartId, url },
        })
        if (!exists) {
          await prisma.purchaseLink.create({
            data: { compatiblePartId: suggestion.compatiblePartId, url, platform },
          })
        }
      }

      // Aplica links de vídeo se fornecidos
      if (suggestion.videoLinks) {
        const urls = suggestion.videoLinks.split('\n').map(u => u.trim()).filter(Boolean)
        for (const url of urls) {
          const platform = url.includes('youtube') || url.includes('youtu.be') ? 'youtube'
            : url.includes('instagram') ? 'instagram'
            : url.includes('tiktok') ? 'tiktok' : 'outros'

          // Evita duplicata
          const exists = await prisma.videoReference.findFirst({
            where: { url, compatiblePartId: suggestion.compatiblePartId },
          })
          if (!exists) {
            await prisma.videoReference.create({
              data: { url, platform, compatiblePartId: suggestion.compatiblePartId },
            })
          }
        }
      }

      await prisma.linkSuggestion.update({ where: { id }, data: { status: 'APROVADA' } })
      return NextResponse.json({ ok: true, status: 'APROVADA' })
    }

    return NextResponse.json({ error: 'Ação inválida.' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Erro ao processar.' }, { status: 500 })
  }
}

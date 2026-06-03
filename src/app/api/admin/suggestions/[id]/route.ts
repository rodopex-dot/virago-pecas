import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CompatibilityLevel } from '@prisma/client'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const suggestion = await prisma.suggestion.findUnique({ where: { id } })
    if (!suggestion) return NextResponse.json({ error: 'Não encontrada.' }, { status: 404 })
    return NextResponse.json(suggestion)
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar sugestão.' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await request.json()
    const { action, partId: existingPartId } = body

    const suggestion = await prisma.suggestion.findUnique({ where: { id } })
    if (!suggestion) return NextResponse.json({ error: 'Sugestão não encontrada.' }, { status: 404 })

    if (action === 'reject') {
      const updated = await prisma.suggestion.update({
        where: { id },
        data: { status: 'REJEITADA' },
      })
      return NextResponse.json(updated)
    }

    if (action === 'approve') {
      // Determina o partId: usa existente ou cria nova peça
      let partId = existingPartId

      if (!partId) {
        // Verificar se já existe uma peça com esse nome
        let part = await prisma.part.findFirst({
          where: { name: { equals: suggestion.partName, mode: 'insensitive' } },
        })
        if (!part) {
          part = await prisma.part.create({
            data: {
              name: suggestion.partName,
              category: 'Geral',
            },
          })
        }
        partId = part.id
      }

      // Parsear links de vídeos
      const videos: { url: string; platform: string }[] = []
      if (suggestion.videoLinks) {
        const lines = suggestion.videoLinks.split('\n').map(l => l.trim()).filter(Boolean)
        for (const url of lines) {
          const platform = url.includes('youtube') || url.includes('youtu.be') ? 'youtube'
            : url.includes('instagram') ? 'instagram'
            : url.includes('tiktok') ? 'tiktok' : 'outros'
          videos.push({ url, platform })
        }
      }

      // Criar peça compatível
      await prisma.compatiblePart.create({
        data: {
          partId,
          name: suggestion.compatiblePartName,
          brand: suggestion.brand,
          purchaseLink: suggestion.purchaseLink,
          compatibilityLevel: suggestion.compatibilityLevel as CompatibilityLevel,
          adaptationText: suggestion.adaptationText,
          videos: videos.length ? { create: videos } : undefined,
        },
      })

      const updated = await prisma.suggestion.update({
        where: { id },
        data: { status: 'APROVADA' },
      })
      return NextResponse.json({ ...updated, partId })
    }

    return NextResponse.json({ error: 'Ação inválida.' }, { status: 400 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro ao processar sugestão.' }, { status: 500 })
  }
}

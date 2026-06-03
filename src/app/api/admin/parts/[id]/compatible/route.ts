import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CompatibilityLevel } from '@prisma/client'

const VALID_LEVELS: CompatibilityLevel[] = ['ENCAIXE_PERFEITO', 'ADAPTACAO_SIMPLES', 'ADAPTACAO_COMPLEXA']

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: partId } = await params
  try {
    const body = await request.json()
    const { name, brand, partNumber, price, purchaseLink, compatibilityLevel, adaptationText, notes, videoLinks } = body

    if (!name?.trim() || !purchaseLink?.trim() || !VALID_LEVELS.includes(compatibilityLevel)) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 })
    }

    const videos: { url: string; platform: string; title?: string }[] = []
    if (videoLinks) {
      const lines = (videoLinks as string).split('\n').map((l: string) => l.trim()).filter(Boolean)
      for (const url of lines) {
        const platform = url.includes('youtube') || url.includes('youtu.be') ? 'youtube'
          : url.includes('instagram') ? 'instagram'
          : url.includes('tiktok') ? 'tiktok' : 'outros'
        videos.push({ url, platform })
      }
    }

    const cp = await prisma.compatiblePart.create({
      data: {
        partId,
        name: name.trim(),
        brand: brand?.trim() || null,
        partNumber: partNumber?.trim() || null,
        price: price ? parseFloat(price) : null,
        purchaseLink: purchaseLink.trim(),
        compatibilityLevel,
        adaptationText: adaptationText?.trim() || null,
        notes: notes?.trim() || null,
        videos: videos.length ? { create: videos } : undefined,
      },
      include: { videos: true },
    })
    return NextResponse.json(cp, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro ao criar peça compatível.' }, { status: 500 })
  }
}

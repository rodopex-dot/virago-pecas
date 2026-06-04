import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CompatibilityLevel } from '@prisma/client'
import { fetchOgImage } from '@/lib/fetchOgImage'

const VALID_LEVELS: CompatibilityLevel[] = ['ENCAIXE_PERFEITO', 'ADAPTACAO_SIMPLES', 'ADAPTACAO_COMPLEXA']

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: partId } = await params
  try {
    const body = await request.json()
    const { name, brand, partNumber, price, purchaseLink, compatibilityLevel, adaptationText, notes, videoLinks, imageUrl: providedImageUrl } = body

    if (!name?.trim() || !VALID_LEVELS.includes(compatibilityLevel)) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 })
    }

    // Auto-busca imagem se link fornecido e imagem não fornecida
    const cleanLink = purchaseLink?.trim() || null
    const imageUrl = providedImageUrl || (cleanLink ? await fetchOgImage(cleanLink).catch(() => null) : null)

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
        purchaseLink: cleanLink,
        imageUrl: imageUrl || null,
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

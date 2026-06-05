import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { detectPlatform } from '@/lib/affiliateLinks'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; cpId: string }> }
) {
  try {
    const { cpId } = await params
    const { url } = await request.json()

    if (!url?.trim().startsWith('http')) {
      return NextResponse.json({ error: 'URL inválida.' }, { status: 400 })
    }

    const trimmed = url.trim()
    const platform = detectPlatform(trimmed) ?? 'other'

    const link = await prisma.purchaseLink.create({
      data: { compatiblePartId: cpId, url: trimmed, platform },
    })

    return NextResponse.json(link, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro ao adicionar link.' }, { status: 500 })
  }
}

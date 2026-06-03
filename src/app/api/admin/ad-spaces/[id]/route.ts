import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { active, adCode } = await request.json()
    const adSpace = await prisma.adSpace.update({
      where: { id },
      data: {
        active: Boolean(active),
        adCode: adCode?.trim() || null,
      },
    })
    return NextResponse.json(adSpace)
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar espaço.' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { active, value } = await request.json()
    const config = await prisma.affiliateConfig.update({
      where: { id },
      data: {
        active: Boolean(active),
        value: value?.trim() || null,
      },
    })
    return NextResponse.json(config)
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar config.' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const part = await prisma.part.findUnique({
      where: { id },
      include: {
        compatibleParts: {
          include: { videos: true },
          orderBy: { compatibilityLevel: 'asc' },
        },
      },
    })

    if (!part) {
      return NextResponse.json({ error: 'Peça não encontrada.' }, { status: 404 })
    }

    return NextResponse.json(part)
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar peça.' }, { status: 500 })
  }
}

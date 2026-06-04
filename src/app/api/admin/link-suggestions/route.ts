import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') ?? 'PENDENTE'

  try {
    const suggestions = await prisma.linkSuggestion.findMany({
      where: status === 'TODAS' ? {} : { status: status as never },
      include: {
        compatiblePart: {
          include: { part: { select: { name: true, category: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(suggestions)
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar sugestões.' }, { status: 500 })
  }
}

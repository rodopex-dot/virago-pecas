import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  try {
    const suggestions = await prisma.suggestion.findMany({
      where: status ? { status: status as 'PENDENTE' | 'APROVADA' | 'REJEITADA' } : undefined,
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(suggestions)
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar sugestões.' }, { status: 500 })
  }
}

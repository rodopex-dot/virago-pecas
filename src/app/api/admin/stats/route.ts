import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [parts, compatibleParts, pendingSuggestions, totalSuggestions, recentSuggestions] =
      await Promise.all([
        prisma.part.count(),
        prisma.compatiblePart.count(),
        prisma.suggestion.count({ where: { status: 'PENDENTE' } }),
        prisma.suggestion.count(),
        prisma.suggestion.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
      ])

    return NextResponse.json({
      parts,
      compatibleParts,
      pendingSuggestions,
      totalSuggestions,
      recentSuggestions,
    })
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar estatísticas.' }, { status: 500 })
  }
}

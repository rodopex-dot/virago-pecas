import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  try {
    const parts = await prisma.part.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query } },
              { category: { contains: query } },
              { description: { contains: query } },
            ],
          }
        : undefined,
      include: {
        compatibleParts: {
          select: { id: true, compatibilityLevel: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(parts)
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar peças.' }, { status: 500 })
  }
}

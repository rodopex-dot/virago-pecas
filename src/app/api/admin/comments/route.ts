import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('approved') // 'true' | 'false' | null

    const where = filter !== null ? { approved: filter === 'true' } : {}

    const comments = await prisma.comment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        compatiblePart: {
          select: {
            name: true,
            part: { select: { name: true } },
          },
        },
      },
    })

    return NextResponse.json(comments)
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar comentários.' }, { status: 500 })
  }
}

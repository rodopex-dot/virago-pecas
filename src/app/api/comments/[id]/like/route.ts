import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/comments/[id]/like  body: { action: 'like' | 'unlike' }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const action = body.action === 'unlike' ? 'unlike' : 'like'

    const comment = await prisma.comment.update({
      where: { id, approved: true },
      data: {
        likes: action === 'like' ? { increment: 1 } : { decrement: 1 },
      },
      select: { likes: true },
    })

    // Ensure likes never go negative
    if (comment.likes < 0) {
      await prisma.comment.update({ where: { id }, data: { likes: 0 } })
      return NextResponse.json({ likes: 0 })
    }

    return NextResponse.json({ likes: comment.likes })
  } catch {
    return NextResponse.json({ error: 'Erro ao registrar curtida.' }, { status: 500 })
  }
}

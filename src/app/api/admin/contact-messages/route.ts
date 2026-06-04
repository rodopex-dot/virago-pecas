import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('read') // 'true' | 'false' | null (todas)

    const where = filter !== null ? { read: filter === 'true' } : {}

    const messages = await prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(messages)
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar mensagens.' }, { status: 500 })
  }
}

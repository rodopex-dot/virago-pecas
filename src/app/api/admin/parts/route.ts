import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const parts = await prisma.part.findMany({
      include: { _count: { select: { compatibleParts: true } } },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    })
    return NextResponse.json(parts)
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar peças.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, category } = body

    if (!name?.trim() || !category?.trim()) {
      return NextResponse.json({ error: 'Nome e categoria são obrigatórios.' }, { status: 400 })
    }

    const part = await prisma.part.create({
      data: { name: name.trim(), description: description?.trim() || null, category: category.trim() },
    })
    return NextResponse.json(part, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro ao criar peça.' }, { status: 500 })
  }
}

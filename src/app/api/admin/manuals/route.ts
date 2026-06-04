import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const manuals = await prisma.manual.findMany({
      orderBy: [{ category: 'asc' }, { title: 'asc' }],
    })
    return NextResponse.json(manuals)
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar manuais.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, fileUrl, category, active } = body

    if (!title?.trim() || !fileUrl?.trim()) {
      return NextResponse.json({ error: 'Título e URL são obrigatórios.' }, { status: 400 })
    }

    const manual = await prisma.manual.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        fileUrl: fileUrl.trim(),
        category: category?.trim() || 'Manual',
        active: active ?? true,
      },
    })

    return NextResponse.json(manual, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro ao criar manual.' }, { status: 500 })
  }
}

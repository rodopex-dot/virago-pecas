import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, description, fileUrl, category, active } = body

    if (!title?.trim() || !fileUrl?.trim()) {
      return NextResponse.json({ error: 'Título e URL são obrigatórios.' }, { status: 400 })
    }

    const manual = await prisma.manual.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        fileUrl: fileUrl.trim(),
        category: category?.trim() || 'Manual',
        active: active ?? true,
      },
    })

    return NextResponse.json(manual)
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar manual.' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.manual.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao excluir manual.' }, { status: 500 })
  }
}

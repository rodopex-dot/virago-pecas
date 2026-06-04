import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { name, description } = await request.json()
    const category = await prisma.category.update({
      where: { id },
      data: { name: name.trim(), description: description?.trim() || null },
    })
    return NextResponse.json(category)
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar categoria.' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao excluir categoria.' }, { status: 500 })
  }
}

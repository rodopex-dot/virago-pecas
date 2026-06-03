import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const part = await prisma.part.findUnique({
      where: { id },
      include: { compatibleParts: { include: { videos: true }, orderBy: { compatibilityLevel: 'asc' } } },
    })
    if (!part) return NextResponse.json({ error: 'Peça não encontrada.' }, { status: 404 })
    return NextResponse.json(part)
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar peça.' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const { name, description, category } = await request.json()
    if (!name?.trim() || !category?.trim()) {
      return NextResponse.json({ error: 'Nome e categoria são obrigatórios.' }, { status: 400 })
    }
    const part = await prisma.part.update({
      where: { id },
      data: { name: name.trim(), description: description?.trim() || null, category: category.trim() },
    })
    return NextResponse.json(part)
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar peça.' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await prisma.part.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao excluir peça.' }, { status: 500 })
  }
}

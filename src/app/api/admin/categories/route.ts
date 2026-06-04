import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
    return NextResponse.json(categories)
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar categorias.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json()
    if (!name?.trim()) return NextResponse.json({ error: 'Nome obrigatório.' }, { status: 400 })
    const category = await prisma.category.create({
      data: { name: name.trim(), description: description?.trim() || null },
    })
    return NextResponse.json(category, { status: 201 })
  } catch (e: unknown) {
    const msg = e instanceof Error && e.message.includes('Unique') ? 'Categoria já existe.' : 'Erro ao criar categoria.'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

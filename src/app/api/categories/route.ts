import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, description: true },
    })
    return NextResponse.json(categories)
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar categorias.' }, { status: 500 })
  }
}

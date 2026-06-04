import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const manuals = await prisma.manual.findMany({
      where: { active: true },
      orderBy: [{ category: 'asc' }, { title: 'asc' }],
    })
    return NextResponse.json(manuals)
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar manuais.' }, { status: 500 })
  }
}

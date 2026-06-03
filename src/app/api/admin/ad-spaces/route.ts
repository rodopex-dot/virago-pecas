import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const adSpaces = await prisma.adSpace.findMany({ orderBy: { slot: 'asc' } })
    return NextResponse.json(adSpaces)
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar espaços.' }, { status: 500 })
  }
}

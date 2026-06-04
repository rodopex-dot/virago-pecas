import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const configs = await prisma.affiliateConfig.findMany({ orderBy: { platform: 'asc' } })
    return NextResponse.json(configs)
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar configs.' }, { status: 500 })
  }
}

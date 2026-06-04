import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const configs = await prisma.siteConfig.findMany()
    const result: Record<string, string | null> = {}
    configs.forEach(c => { result[c.key] = c.value ?? null })
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar configs.' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json() // { key: string, value: string }
    const { key, value } = body
    if (!key) return NextResponse.json({ error: 'key obrigatório.' }, { status: 400 })

    const config = await prisma.siteConfig.upsert({
      where: { key },
      update: { value: value?.trim() || null },
      create: { key, value: value?.trim() || null },
    })
    return NextResponse.json(config)
  } catch {
    return NextResponse.json({ error: 'Erro ao salvar config.' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/adminAuth'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req.headers.get('cookie'))
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const banners = await prisma.banner.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(banners)
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req.headers.get('cookie'))
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json() as {
    name: string
    imageUrl: string
    linkUrl?: string
    altText?: string
    locations: string[]
    active?: boolean
    order?: number
  }

  if (!body.name?.trim() || !body.imageUrl?.trim() || !body.locations?.length) {
    return NextResponse.json({ error: 'Nome, imagem e ao menos uma localização são obrigatórios.' }, { status: 400 })
  }

  const banner = await prisma.banner.create({
    data: {
      name:      body.name.trim(),
      imageUrl:  body.imageUrl.trim(),
      linkUrl:   body.linkUrl?.trim()  || null,
      altText:   body.altText?.trim()  || null,
      locations: body.locations,
      active:    body.active  ?? true,
      order:     body.order   ?? 0,
    },
  })
  return NextResponse.json(banner, { status: 201 })
}

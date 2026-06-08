import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/adminAuth'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(req.headers.get('cookie'))
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const banner = await prisma.banner.update({
    where: { id },
    data: {
      ...(body.name      !== undefined && { name:      body.name.trim() }),
      ...(body.imageUrl  !== undefined && { imageUrl:  body.imageUrl.trim() }),
      ...(body.linkUrl   !== undefined && { linkUrl:   body.linkUrl?.trim() || null }),
      ...(body.altText   !== undefined && { altText:   body.altText?.trim() || null }),
      ...(body.locations !== undefined && { locations: body.locations }),
      ...(body.active    !== undefined && { active:    Boolean(body.active) }),
      ...(body.order     !== undefined && { order:     Number(body.order) }),
    },
  })
  return NextResponse.json(banner)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(req.headers.get('cookie'))
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  await prisma.banner.delete({ where: { id } })
  return NextResponse.json({ success: true })
}

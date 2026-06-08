import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/banners?location=topo
export async function GET(req: NextRequest) {
  const location = req.nextUrl.searchParams.get('location')

  const banners = await prisma.banner.findMany({
    where: {
      active: true,
      ...(location ? { locations: { has: location } } : {}),
    },
    orderBy: { order: 'asc' },
    select: {
      id: true, name: true, imageUrl: true,
      linkUrl: true, altText: true, locations: true,
    },
  })
  return NextResponse.json(banners)
}

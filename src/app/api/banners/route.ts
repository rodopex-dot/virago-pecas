import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/banners?location=topo
// Retorna banners ativos para uma localização (público, sem autenticação)
export async function GET(req: NextRequest) {
  const location = req.nextUrl.searchParams.get('location')

  const banners = await prisma.banner.findMany({
    where: { active: true, ...(location ? { location } : {}) },
    orderBy: { order: 'asc' },
    select: {
      id: true, name: true, imageUrl: true, linkUrl: true,
      altText: true, width: true, height: true, location: true,
    },
  })
  return NextResponse.json(banners)
}

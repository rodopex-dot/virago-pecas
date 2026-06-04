import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { convertToAffiliateLink, detectPlatform } from '@/lib/affiliateLinks'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    if (!url?.trim()) return NextResponse.json({ error: 'URL obrigatória.' }, { status: 400 })

    const configs = await prisma.affiliateConfig.findMany()
    const converted = convertToAffiliateLink(url.trim(), configs)
    const platform = detectPlatform(url.trim())

    return NextResponse.json({
      original: url.trim(),
      converted,
      changed: converted !== url.trim(),
      platform,
    })
  } catch {
    return NextResponse.json({ error: 'Erro ao testar conversão.' }, { status: 500 })
  }
}

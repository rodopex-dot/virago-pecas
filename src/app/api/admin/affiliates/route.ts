import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PLATFORM_META } from '@/lib/affiliateLinks'

export async function GET() {
  try {
    // Garante que todas as plataformas do PLATFORM_META existam no banco
    const platforms = Object.keys(PLATFORM_META)

    await Promise.all(
      platforms.map(platform =>
        prisma.affiliateConfig.upsert({
          where:  { platform },
          update: {},                        // não sobrescreve configs existentes
          create: { platform, active: false, value: null },
        })
      )
    )

    const configs = await prisma.affiliateConfig.findMany({
      where:   { platform: { in: platforms } },
      orderBy: { platform: 'asc' },
    })

    return NextResponse.json(configs)
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar configs.' }, { status: 500 })
  }
}

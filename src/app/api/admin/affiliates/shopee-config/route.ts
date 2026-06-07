import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/adminAuth'

const KEYS = ['shopee_app_id', 'shopee_app_secret'] as const

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req.headers.get('cookie'))
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const rows = await prisma.siteConfig.findMany({ where: { key: { in: [...KEYS] } } })
  const map  = Object.fromEntries(rows.map(r => [r.key, r.value ?? '']))

  return NextResponse.json({
    appId:        map.shopee_app_id ?? '',
    hasAppSecret: !!map.shopee_app_secret,
  })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req.headers.get('cookie'))
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json() as { appId?: string; appSecret?: string }

  const updates: { key: string; value: string }[] = []
  if (body.appId     !== undefined) updates.push({ key: 'shopee_app_id',     value: body.appId })
  if (body.appSecret !== undefined) updates.push({ key: 'shopee_app_secret', value: body.appSecret })

  await Promise.all(
    updates.map(u =>
      prisma.siteConfig.upsert({
        where:  { key: u.key },
        update: { value: u.value },
        create: { key: u.key, value: u.value },
      })
    )
  )

  return NextResponse.json({ success: true })
}

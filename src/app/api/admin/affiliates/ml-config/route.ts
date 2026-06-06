import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/adminAuth'

const KEYS = ['ml_affiliate_tag', 'ml_cookies', 'ml_csrf_token', 'ml_cookies_updated_at'] as const

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req.headers.get('cookie'))
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const rows = await prisma.siteConfig.findMany({ where: { key: { in: [...KEYS] } } })
  const map = Object.fromEntries(rows.map(r => [r.key, r.value ?? '']))

  return NextResponse.json({
    tag:              map.ml_affiliate_tag ?? '',
    hasCookies:       !!map.ml_cookies,
    hasCsrfToken:     !!map.ml_csrf_token,
    cookiesUpdatedAt: map.ml_cookies_updated_at ?? null,
  })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req.headers.get('cookie'))
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json() as { tag?: string; cookies?: string; csrfToken?: string }

  const updates: { key: string; value: string }[] = []
  if (body.tag       !== undefined) updates.push({ key: 'ml_affiliate_tag', value: body.tag })
  if (body.cookies   !== undefined) {
    updates.push({ key: 'ml_cookies',            value: body.cookies })
    updates.push({ key: 'ml_cookies_updated_at', value: new Date().toISOString() })
  }
  if (body.csrfToken !== undefined) updates.push({ key: 'ml_csrf_token', value: body.csrfToken })

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

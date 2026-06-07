import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/adminAuth'

const KEYS = [
  'shopee_cookies',
  'shopee_csrf_token',
  'shopee_sec_headers',
  'shopee_cookies_updated_at',
] as const

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req.headers.get('cookie'))
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const rows = await prisma.siteConfig.findMany({ where: { key: { in: [...KEYS] } } })
  const map  = Object.fromEntries(rows.map(r => [r.key, r.value ?? '']))

  return NextResponse.json({
    hasCookies:       !!map.shopee_cookies,
    hasCsrfToken:     !!map.shopee_csrf_token,
    hasSecHeaders:    !!map.shopee_sec_headers,
    cookiesUpdatedAt: map.shopee_cookies_updated_at ?? null,
  })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req.headers.get('cookie'))
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json() as {
    cookies?:    string
    csrfToken?:  string
    secHeaders?: string
  }

  const updates: { key: string; value: string }[] = []

  if (body.cookies !== undefined) {
    updates.push({ key: 'shopee_cookies',             value: body.cookies })
    updates.push({ key: 'shopee_cookies_updated_at',  value: new Date().toISOString() })
  }
  if (body.csrfToken  !== undefined) updates.push({ key: 'shopee_csrf_token',  value: body.csrfToken })
  if (body.secHeaders !== undefined) updates.push({ key: 'shopee_sec_headers', value: body.secHeaders })

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

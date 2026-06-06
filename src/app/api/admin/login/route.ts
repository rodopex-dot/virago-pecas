import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createSession } from '@/lib/adminAuth'

function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set('admin_auth', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body as { email?: string; password: string }

    if (!password) {
      return NextResponse.json({ error: 'Senha obrigatória.' }, { status: 400 })
    }

    // --- Path 1: email provided — try AdminUser login ---
    if (email?.trim()) {
      const user = await prisma.adminUser.findUnique({
        where: { email: email.trim().toLowerCase() },
      })

      if (user && user.active) {
        const valid = await bcrypt.compare(password, user.password)
        if (valid) {
          const token = createSession(user.id)
          const response = NextResponse.json({ ok: true })
          setAuthCookie(response, token)
          return response
        }
      }

      return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 })
    }

    // --- Path 2: no email — check if any AdminUser exists ---
    const userCount = await prisma.adminUser.count()

    if (userCount > 0) {
      // There are admin users but no email was provided
      // Only allow legacy password login if ADMIN_PASSWORD matches
      const adminPassword = process.env.ADMIN_PASSWORD
      if (!adminPassword || password !== adminPassword) {
        return NextResponse.json({ error: 'Senha incorreta.' }, { status: 401 })
      }
      const token = createSession('legacy')
      const response = NextResponse.json({ ok: true })
      setAuthCookie(response, token)
      return response
    }

    // --- Path 3: no users in DB — legacy ADMIN_PASSWORD only ---
    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword || password !== adminPassword) {
      return NextResponse.json({ error: 'Senha incorreta.' }, { status: 401 })
    }

    const token = createSession('legacy')
    const response = NextResponse.json({ ok: true })
    setAuthCookie(response, token)
    return response
  } catch {
    return NextResponse.json({ error: 'Erro no servidor.' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'

function getAuthToken(password: string) {
  return Buffer.from(`virago:${password}`).toString('base64')
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword || password !== adminPassword) {
      return NextResponse.json({ error: 'Senha incorreta.' }, { status: 401 })
    }

    const token = getAuthToken(adminPassword)
    const response = NextResponse.json({ ok: true })
    response.cookies.set('admin_auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    })
    return response
  } catch {
    return NextResponse.json({ error: 'Erro no servidor.' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { verifySessionNode } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie')
    const match = cookieHeader?.match(/admin_auth=([^;]+)/)
    if (!match) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const token = decodeURIComponent(match[1])
    const userId = verifySessionNode(token)

    if (!userId) {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 })
    }

    if (userId === 'legacy') {
      return NextResponse.json({
        id: 'legacy',
        name: 'Admin',
        email: '',
        role: 'superadmin',
        permissions: [],
        active: true,
      })
    }

    const user = await prisma.adminUser.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, permissions: true, active: true },
    })

    if (!user || !user.active) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 })
  }
}

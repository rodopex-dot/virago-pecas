import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/adminAuth'

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser(request.headers.get('cookie'))
  if (!currentUser || currentUser.role !== 'superadmin') {
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })
  }

  const users = await prisma.adminUser.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      permissions: true,
      active: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(users)
}

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser(request.headers.get('cookie'))
  if (!currentUser || currentUser.role !== 'superadmin') {
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { name, email, password, role, permissions } = body as {
      name: string
      email: string
      password: string
      role?: string
      permissions?: string[]
    }

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos.' }, { status: 400 })
    }

    const existing = await prisma.adminUser.findUnique({
      where: { email: email.trim().toLowerCase() },
    })
    if (existing) {
      return NextResponse.json({ error: 'E-mail já cadastrado.' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.adminUser.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashed,
        role: role ?? 'editor',
        permissions: permissions ?? [],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
        active: true,
        createdAt: true,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro ao criar usuário.' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/adminAuth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const currentUser = await getCurrentUser(request.headers.get('cookie'))
  if (!currentUser || currentUser.role !== 'superadmin') {
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })
  }

  const { id } = await params

  try {
    const body = await request.json()
    const { name, role, permissions, active, password } = body as {
      name?: string
      role?: string
      permissions?: string[]
      active?: boolean
      password?: string
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name.trim()
    if (role !== undefined) updateData.role = role
    if (permissions !== undefined) updateData.permissions = permissions
    if (active !== undefined) updateData.active = active
    if (password) updateData.password = await bcrypt.hash(password, 10)

    const user = await prisma.adminUser.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar usuário.' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const currentUser = await getCurrentUser(request.headers.get('cookie'))
  if (!currentUser || currentUser.role !== 'superadmin') {
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })
  }

  const { id } = await params

  if (currentUser.id === id) {
    return NextResponse.json({ error: 'Não é possível deletar a si mesmo.' }, { status: 400 })
  }

  try {
    await prisma.adminUser.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao remover usuário.' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/adminAuth'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(req.headers.get('cookie'))
  if (!user) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  if (user.role !== 'superadmin') return NextResponse.json({ error: 'Apenas superadmin pode remover links de compra.' }, { status: 403 })

  try {
    const { id } = await params
    await prisma.purchaseLink.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao excluir link.' }, { status: 500 })
  }
}

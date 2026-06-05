import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const comment = await prisma.comment.update({
      where: { id },
      data: { approved: Boolean(body.approved) },
    })
    return NextResponse.json(comment)
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar comentário.' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.comment.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao excluir comentário.' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { read } = body

    const msg = await prisma.contactMessage.update({
      where: { id },
      data: { read: Boolean(read) },
    })

    return NextResponse.json(msg)
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar mensagem.' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.contactMessage.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao excluir mensagem.' }, { status: 500 })
  }
}

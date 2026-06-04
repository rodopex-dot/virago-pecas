import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { compatiblePartId, purchaseLink, videoLinks, submitterEmail, notes } = await request.json()

    if (!compatiblePartId) {
      return NextResponse.json({ error: 'ID da peça obrigatório.' }, { status: 400 })
    }
    if (!purchaseLink?.trim() && !videoLinks?.trim()) {
      return NextResponse.json({ error: 'Informe ao menos um link de compra ou vídeo.' }, { status: 400 })
    }

    // Verifica se a peça existe
    const cp = await prisma.compatiblePart.findUnique({ where: { id: compatiblePartId } })
    if (!cp) {
      return NextResponse.json({ error: 'Peça não encontrada.' }, { status: 404 })
    }

    const suggestion = await prisma.linkSuggestion.create({
      data: {
        compatiblePartId,
        purchaseLink: purchaseLink?.trim() || null,
        videoLinks: videoLinks?.trim() || null,
        submitterEmail: submitterEmail?.trim() || null,
        notes: notes?.trim() || null,
      },
    })

    return NextResponse.json(suggestion, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro ao enviar sugestão.' }, { status: 500 })
  }
}

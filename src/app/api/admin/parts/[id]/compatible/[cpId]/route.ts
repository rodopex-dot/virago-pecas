import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CompatibilityLevel } from '@prisma/client'

const VALID_LEVELS: CompatibilityLevel[] = ['ENCAIXE_PERFEITO', 'ADAPTACAO_SIMPLES', 'ADAPTACAO_COMPLEXA']

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; cpId: string }> }
) {
  const { cpId } = await params
  try {
    const body = await request.json()
    const { name, brand, partNumber, price, purchaseLink, compatibilityLevel, adaptationText, notes, imageUrl } = body

    if (!name?.trim() || !purchaseLink?.trim() || !VALID_LEVELS.includes(compatibilityLevel)) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 })
    }

    const cp = await prisma.compatiblePart.update({
      where: { id: cpId },
      data: {
        name: name.trim(),
        brand: brand?.trim() || null,
        partNumber: partNumber?.trim() || null,
        price: price ? parseFloat(price) : null,
        purchaseLink: purchaseLink.trim(),
        imageUrl: imageUrl || null,
        compatibilityLevel,
        adaptationText: adaptationText?.trim() || null,
        notes: notes?.trim() || null,
      },
    })
    return NextResponse.json(cp)
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar.' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; cpId: string }> }
) {
  const { cpId } = await params
  try {
    await prisma.compatiblePart.delete({ where: { id: cpId } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao excluir.' }, { status: 500 })
  }
}

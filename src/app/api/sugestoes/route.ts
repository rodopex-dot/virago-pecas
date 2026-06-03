import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CompatibilityLevel } from '@prisma/client'

const VALID_LEVELS: CompatibilityLevel[] = [
  'ENCAIXE_PERFEITO',
  'ADAPTACAO_SIMPLES',
  'ADAPTACAO_COMPLEXA',
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      partName,
      compatiblePartName,
      brand,
      purchaseLink,
      compatibilityLevel,
      adaptationText,
      videoLinks,
      submitterEmail,
    } = body

    if (!partName?.trim()) {
      return NextResponse.json({ error: 'Nome da peça original é obrigatório.' }, { status: 400 })
    }
    if (!compatiblePartName?.trim()) {
      return NextResponse.json(
        { error: 'Nome da peça compatível é obrigatório.' },
        { status: 400 }
      )
    }
    if (!purchaseLink?.trim()) {
      return NextResponse.json({ error: 'Link de compra é obrigatório.' }, { status: 400 })
    }
    if (!VALID_LEVELS.includes(compatibilityLevel)) {
      return NextResponse.json(
        { error: 'Nível de compatibilidade inválido.' },
        { status: 400 }
      )
    }
    if (
      (compatibilityLevel === 'ADAPTACAO_SIMPLES' ||
        compatibilityLevel === 'ADAPTACAO_COMPLEXA') &&
      !adaptationText?.trim()
    ) {
      return NextResponse.json(
        { error: 'Texto de adaptação é obrigatório para este nível de compatibilidade.' },
        { status: 400 }
      )
    }

    const suggestion = await prisma.suggestion.create({
      data: {
        partName: partName.trim(),
        compatiblePartName: compatiblePartName.trim(),
        brand: brand?.trim() || null,
        purchaseLink: purchaseLink.trim(),
        compatibilityLevel,
        adaptationText: adaptationText?.trim() || null,
        videoLinks: videoLinks?.trim() || null,
        submitterEmail: submitterEmail?.trim() || null,
        status: 'PENDENTE',
      },
    })

    return NextResponse.json(suggestion, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro ao salvar sugestão.' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const suggestions = await prisma.suggestion.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(suggestions)
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar sugestões.' }, { status: 500 })
  }
}

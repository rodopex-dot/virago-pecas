import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchOgImage } from '@/lib/fetchOgImage'

export const maxDuration = 60 // Vercel: até 60s para planos Hobby

export async function POST() {
  try {
    // Busca todas as peças compatíveis sem imagem
    const parts = await prisma.compatiblePart.findMany({
      where: { imageUrl: null },
      select: { id: true, purchaseLink: true, name: true },
    })

    if (parts.length === 0) {
      return NextResponse.json({ updated: 0, message: 'Todas as peças já possuem imagem.' })
    }

    let updated = 0
    let failed = 0
    const results: { name: string; status: string; imageUrl?: string }[] = []

    // Processa em lotes de 3 para não sobrecarregar
    const batchSize = 3
    for (let i = 0; i < parts.length; i += batchSize) {
      const batch = parts.slice(i, i + batchSize)
      await Promise.all(
        batch.map(async (part) => {
          try {
            const imageUrl = await fetchOgImage(part.purchaseLink)
            if (imageUrl) {
              await prisma.compatiblePart.update({
                where: { id: part.id },
                data: { imageUrl },
              })
              updated++
              results.push({ name: part.name, status: 'ok', imageUrl })
            } else {
              failed++
              results.push({ name: part.name, status: 'not_found' })
            }
          } catch {
            failed++
            results.push({ name: part.name, status: 'error' })
          }
        })
      )
    }

    return NextResponse.json({
      total: parts.length,
      updated,
      failed,
      results,
    })
  } catch {
    return NextResponse.json({ error: 'Erro ao processar.' }, { status: 500 })
  }
}

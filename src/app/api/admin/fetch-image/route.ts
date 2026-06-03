import { NextRequest, NextResponse } from 'next/server'
import { fetchOgImage } from '@/lib/fetchOgImage'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    if (!url?.startsWith('http')) {
      return NextResponse.json({ error: 'URL inválida.' }, { status: 400 })
    }

    const imageUrl = await fetchOgImage(url)
    if (!imageUrl) {
      return NextResponse.json({ error: 'Imagem não encontrada neste link.' }, { status: 404 })
    }

    return NextResponse.json({ imageUrl })
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar imagem.' }, { status: 500 })
  }
}

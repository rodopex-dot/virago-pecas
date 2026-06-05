import { NextRequest, NextResponse } from 'next/server'
import { fetchProductData } from '@/lib/fetchOgImage'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    if (!url?.startsWith('http')) {
      return NextResponse.json({ error: 'URL inválida.' }, { status: 400 })
    }

    const { imageUrl, price } = await fetchProductData(url)
    if (!imageUrl && price === null) {
      return NextResponse.json({ error: 'Dados não encontrados neste link.' }, { status: 404 })
    }

    return NextResponse.json({ imageUrl, price })
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar dados do produto.' }, { status: 500 })
  }
}

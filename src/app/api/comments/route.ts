import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyCaptcha } from '@/lib/captcha'

// GET /api/comments?compatiblePartId=xxx
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const compatiblePartId = searchParams.get('compatiblePartId')

  if (!compatiblePartId) {
    return NextResponse.json({ error: 'compatiblePartId obrigatório.' }, { status: 400 })
  }

  try {
    const comments = await prisma.comment.findMany({
      where: { compatiblePartId, approved: true },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        authorName: true,
        content: true,
        likes: true,
        createdAt: true,
      },
    })
    return NextResponse.json(comments)
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar comentários.' }, { status: 500 })
  }
}

// POST /api/comments
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { compatiblePartId, authorName, authorEmail, content, captchaToken, captchaAnswer, honeypot } = body

    // Honeypot check
    if (honeypot) {
      return NextResponse.json({ success: true }) // silently ignore bots
    }

    // Validation
    if (!authorName?.trim() || !authorEmail?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Nome, e-mail e comentário são obrigatórios.' }, { status: 400 })
    }
    if (!compatiblePartId) {
      return NextResponse.json({ error: 'Peça não identificada.' }, { status: 400 })
    }
    if (content.trim().length < 10) {
      return NextResponse.json({ error: 'Comentário muito curto (mínimo 10 caracteres).' }, { status: 400 })
    }
    if (content.trim().length > 2000) {
      return NextResponse.json({ error: 'Comentário muito longo (máximo 2000 caracteres).' }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(authorEmail)) {
      return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 })
    }

    // Captcha validation
    if (!captchaToken || !captchaAnswer) {
      return NextResponse.json({ error: 'Resolva o captcha para continuar.' }, { status: 400 })
    }
    if (!verifyCaptcha(captchaToken, captchaAnswer)) {
      return NextResponse.json({ error: 'Resposta do captcha incorreta.' }, { status: 400 })
    }

    // Check part exists
    const part = await prisma.compatiblePart.findUnique({ where: { id: compatiblePartId } })
    if (!part) {
      return NextResponse.json({ error: 'Peça não encontrada.' }, { status: 404 })
    }

    await prisma.comment.create({
      data: {
        compatiblePartId,
        authorName: authorName.trim(),
        authorEmail: authorEmail.trim().toLowerCase(),
        content: content.trim(),
        approved: false,
      },
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro ao salvar comentário.' }, { status: 500 })
  }
}

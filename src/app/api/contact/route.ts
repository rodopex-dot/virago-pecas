import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, type, subject, message } = body

    if (!name?.trim() || !email?.trim() || !type?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos.' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 })
    }

    const validTypes = ['duvida', 'sugestao', 'anunciante']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Tipo inválido.' }, { status: 400 })
    }

    const msg = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        type,
        subject: subject?.trim() || null,
        message: message.trim(),
      },
    })

    return NextResponse.json({ success: true, id: msg.id }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro ao enviar mensagem.' }, { status: 500 })
  }
}

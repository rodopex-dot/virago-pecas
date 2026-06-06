import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

const SESSION_SECRET = process.env.SESSION_SECRET ?? 'virago-session-secret'

export function createSession(userId: string): string {
  const timestamp = Date.now().toString()
  const payload = `${userId}|${timestamp}`
  const hmac = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex')
  return `${payload}|${hmac}`
}

export function verifySessionNode(token: string): string | null {
  try {
    if (!token.includes('|')) return null
    const parts = token.split('|')
    if (parts.length !== 3) return null
    const [userId, timestamp, hmac] = parts
    const payload = `${userId}|${timestamp}`
    const expected = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex')
    if (!crypto.timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(expected, 'hex'))) return null
    return userId
  } catch {
    return null
  }
}

export type AdminUser = {
  id: string
  name: string
  email: string
  password: string
  role: string
  permissions: string[]
  active: boolean
  createdAt: Date
  updatedAt: Date
}

/** Usuário virtual para sessões legadas (login só com ADMIN_PASSWORD) */
const LEGACY_USER: AdminUser = {
  id: 'legacy',
  name: 'Admin',
  email: '',
  password: '',
  role: 'superadmin',
  permissions: [],
  active: true,
  createdAt: new Date(0),
  updatedAt: new Date(0),
}

export async function getCurrentUser(cookieHeader: string | null): Promise<AdminUser | null> {
  if (!cookieHeader) return null
  const match = cookieHeader.match(/admin_auth=([^;]+)/)
  if (!match) return null
  const token = decodeURIComponent(match[1])
  const userId = verifySessionNode(token)
  if (!userId) return null
  // Sessão legada (login só com ADMIN_PASSWORD): superadmin virtual
  if (userId === 'legacy') return LEGACY_USER
  try {
    const user = await prisma.adminUser.findUnique({ where: { id: userId } })
    if (!user || !user.active) return null
    return user
  } catch {
    return null
  }
}

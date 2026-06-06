import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SESSION_SECRET = process.env.SESSION_SECRET ?? 'virago-session-secret'

/** Legacy format: base64("virago:{password}") */
function getAuthTokenLegacy(password: string) {
  return btoa(`virago:${password}`)
}

async function verifyNewFormat(token: string): Promise<boolean> {
  try {
    const parts = token.split('|')
    if (parts.length !== 3) return false
    const [userId, timestamp, hmac] = parts
    const payload = `${userId}|${timestamp}`

    const enc = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(SESSION_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    )

    // Convert hex hmac to Uint8Array
    const hmacBytes = new Uint8Array(
      hmac.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)),
    )

    return await crypto.subtle.verify(
      'HMAC',
      keyMaterial,
      hmacBytes,
      enc.encode(payload),
    )
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAdminRoute =
    pathname.startsWith('/admin') || pathname.startsWith('/api/admin')
  const isPublicAdminRoute =
    pathname === '/admin/login' || pathname === '/api/admin/login'

  if (!isAdminRoute || isPublicAdminRoute) return NextResponse.next()

  const authCookie = request.cookies.get('admin_auth')
  const token = authCookie?.value

  if (!token) {
    return redirectOrUnauthorized(request, pathname)
  }

  let isAuthenticated = false

  if (token.includes('|')) {
    // New HMAC-based session
    isAuthenticated = await verifyNewFormat(token)
  } else {
    // Legacy base64 session
    const adminPassword = process.env.ADMIN_PASSWORD
    if (adminPassword) {
      const expected = getAuthTokenLegacy(adminPassword)
      isAuthenticated = token === expected
    }
  }

  if (!isAuthenticated) {
    return redirectOrUnauthorized(request, pathname)
  }

  return NextResponse.next()
}

function redirectOrUnauthorized(request: NextRequest, pathname: string) {
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const loginUrl = new URL('/admin/login', request.url)
  loginUrl.searchParams.set('redirect', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function getAuthToken(password: string) {
  return Buffer.from(`virago:${password}`).toString('base64')
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin')
  const isPublicAdminRoute =
    pathname === '/admin/login' || pathname === '/api/admin/login'

  if (!isAdminRoute || isPublicAdminRoute) return NextResponse.next()

  const adminPassword = process.env.ADMIN_PASSWORD
  const authCookie = request.cookies.get('admin_auth')
  const expectedToken = adminPassword ? getAuthToken(adminPassword) : null

  const isAuthenticated = authCookie && expectedToken && authCookie.value === expectedToken

  if (!isAuthenticated) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}

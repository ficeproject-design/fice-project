import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AUTH_COOKIE, verifySessionToken } from '@/lib/auth'

function unauthorized(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname.startsWith('/api')) {
    return NextResponse.json(
      { success: false, error: 'Sesi admin tidak valid. Silakan login kembali.' },
      { status: 401 }
    )
  }
  return NextResponse.redirect(new URL('/admin/login', req.url))
}

export async function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl
  const method = req.method

  const isLoginFlow =
    pathname === '/admin/login' ||
    pathname.startsWith('/api/admin/login') ||
    pathname.startsWith('/api/admin/logout')
  if (isLoginFlow) return NextResponse.next()

  const authed = await verifySessionToken(req.cookies.get(AUTH_COOKIE)?.value)
  if (authed) {
    if (pathname === '/admin/login') {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
    return NextResponse.next()
  }

  const needsAdmin =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api/admin/') ||
    (pathname === '/api/settings' && method !== 'GET') ||
    (pathname === '/api/orders' && method === 'GET' && !searchParams.has('phone')) ||
    (/^\/api\/orders\/[^/]+$/.test(pathname) && method === 'PATCH')

  if (!needsAdmin) return NextResponse.next()
  return unauthorized(req)
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/orders/:path*', '/api/settings'],
}

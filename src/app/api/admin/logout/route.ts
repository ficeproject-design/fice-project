import { NextRequest, NextResponse } from 'next/server'
import { AUTH_COOKIE, revokeSessionToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  revokeSessionToken(req.cookies.get(AUTH_COOKIE)?.value)
  const res = NextResponse.json({ success: true })
  res.cookies.set(AUTH_COOKIE, '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 })
  return res
}

import { NextRequest, NextResponse } from 'next/server'
import { AUTH_COOKIE, SESSION_TTL_SECONDS, checkPassword, createSessionToken } from '@/lib/auth'

// Sliding-window limiter (per proses): 8 attempt / 15 mnt / IP.
// ponytail: in-memory, cukup untuk instance tunggal; pindah ke Redis/DB bila multi-instance.
const LOGIN_WINDOW_MS = 15 * 60 * 1000
const LOGIN_MAX_ATTEMPTS = 8
const loginHits = new Map<string, number[]>()

function isLoginRateLimited(ip: string): boolean {
  const now = Date.now()
  const hits = (loginHits.get(ip) || []).filter((t) => now - t < LOGIN_WINDOW_MS)
  if (hits.length >= LOGIN_MAX_ATTEMPTS) {
    loginHits.set(ip, hits)
    return true
  }
  hits.push(now)
  loginHits.set(ip, hits)
  return false
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown'
    if (isLoginRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: 'Terlalu banyak percobaan login. Coba lagi 15 menit.' },
        { status: 429 }
      )
    }

    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, error: 'Server belum dikonfigurasi. Set ADMIN_PASSWORD di .env.local.' },
        { status: 500 }
      )
    }

    const { password } = await req.json()
    if (!(await checkPassword(password))) {
      return NextResponse.json(
        { success: false, error: 'Password salah. Coba lagi.' },
        { status: 401 }
      )
    }

    const token = await createSessionToken()
    const res = NextResponse.json({ success: true })
    res.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: SESSION_TTL_SECONDS,
    })
    return res
  } catch {
    return NextResponse.json(
      { success: false, error: 'Permintaan tidak valid.' },
      { status: 400 }
    )
  }
}

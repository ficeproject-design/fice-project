import { NextRequest, NextResponse } from 'next/server'
import { AUTH_COOKIE, SESSION_TTL_SECONDS, checkPassword, createSessionToken } from '@/lib/auth'
import { clientIp, createRateLimiter } from '@/lib/rate-limit'

// 8 attempt / 15 mnt / IP + 30 attempt / 15 mnt total.
const loginLimiter = createRateLimiter(8, 15 * 60 * 1000)
const loginLimiterGlobal = createRateLimiter(30, 15 * 60 * 1000)

export async function POST(req: NextRequest) {
  try {
    // Login = endpoint kredensial. Batas global (selain per-IP) supaya spoof
    // X-Forwarded-For tidak memberi percobaan tanpa batas.
    if (
      loginLimiter.limited(`login:${clientIp(req.headers)}`) ||
      loginLimiterGlobal.limited('login:global')
    ) {
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

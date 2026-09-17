import { NextRequest, NextResponse } from 'next/server'
import { AUTH_COOKIE, SESSION_TTL_SECONDS, checkPassword, createSessionToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
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

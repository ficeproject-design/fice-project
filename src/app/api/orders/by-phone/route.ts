import { NextRequest, NextResponse } from 'next/server';
import { getOrdersByPhone } from '@/lib/db';
import { isValidPhone, PHONE_HINT } from '@/lib/phone';

// Sliding-window limiter (per process): 30 lookups / 5 min / IP.
// Menaikkan biaya enumerasi nomor HP (tracking publik = capability terbuka).
const LOOKUP_WINDOW_MS = 5 * 60 * 1000;
const LOOKUP_MAX = 30;
const lookupHits = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const hits = (lookupHits.get(key) || []).filter((t) => now - t < LOOKUP_WINDOW_MS);
  if (hits.length >= LOOKUP_MAX) {
    lookupHits.set(key, hits);
    return true;
  }
  hits.push(now);
  lookupHits.set(key, hits);
  return false;
}

export async function GET(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';
    if (isRateLimited(`by-phone:${ip}`)) {
      return NextResponse.json(
        { success: false, error: 'Terlalu banyak percobaan. Coba lagi beberapa menit.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone') || '';
    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { success: false, error: PHONE_HINT },
        { status: 400 }
      );
    }

    const orders = getOrdersByPhone(phone);
    if (orders.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada pesanan untuk nomor ini.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error phone lookup:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mencari pesanan' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getOrdersByPhone } from '@/lib/db';
import { isValidPhone, PHONE_HINT } from '@/lib/phone';
import { clientIp, createRateLimiter } from '@/lib/rate-limit';

// 30 lookups / 5 menit / IP.
// Menaikkan biaya enumerasi nomor HP (tracking publik = capability terbuka).
const lookupLimiter = createRateLimiter(30, 5 * 60 * 1000);

export async function GET(req: NextRequest) {
  try {
    if (lookupLimiter.limited(`by-phone:${clientIp(req.headers)}`)) {
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

    // Ringkasan saja: nomor HP bukan rahasia, jadi alamat/koordinat tidak ikut.
    // Detail lengkap hanya lewat nomor invoice (capability).
    const summary = orders.map((o) => ({
      id: o.id,
      invoiceNumber: o.invoiceNumber,
      status: o.status,
      createdAt: o.createdAt,
      pickupDate: o.pickupDate,
      itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
      totalAmount: o.totalAmount,
    }));

    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    console.error('Error phone lookup:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mencari pesanan' },
      { status: 500 }
    );
  }
}

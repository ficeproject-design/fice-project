import { NextRequest, NextResponse } from 'next/server';
import { listPromosForOrder } from '@/lib/db';

// Daftar promo publik untuk dropdown di halaman order.
// phone dipakai untuk cek batas per pelanggan; tanpa phone promo itu tetap tampil.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subtotal = Number(searchParams.get('subtotal'));
    const phone = searchParams.get('phone') || undefined;

    if (!Number.isFinite(subtotal) || subtotal <= 0) {
      return NextResponse.json(
        { success: false, message: 'Nilai subtotal tidak valid' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: listPromosForOrder(subtotal, phone) });
  } catch (error) {
    console.error('Error fetching promo list:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat daftar kode promo' },
      { status: 500 }
    );
  }
}
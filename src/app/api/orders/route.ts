import { NextRequest, NextResponse } from 'next/server';
import {
  getOrders,
  createOrder,
  getSettings,
  getServices,
  validatePromoCode,
} from '@/lib/db';
import { validateOrderInput } from '@/lib/order-input';
import { computeDiscount } from '@/lib/promo';
import { clientIp, createRateLimiter } from '@/lib/rate-limit';

// 10 POSTs / 5 menit / IP.
const orderLimiter = createRateLimiter(10, 5 * 60 * 1000);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    // Daftar order penuh = khusus admin (dijaga proxy.ts). Dulu ada query ?phone=
    // publik berbasis digit akhir — vektor enumeration PII, sudah dihapus.
    // Pelacakan publik memakai /api/orders/[id] (invoice = capability tak tertebak).
    let orders = getOrders();

    if (status) {
      orders = orders.filter((o) => o.status === status);
    }

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat data pesanan' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (orderLimiter.limited(`order:${clientIp(req.headers)}`)) {
      return NextResponse.json(
        { success: false, error: 'Terlalu banyak pesanan. Coba lagi beberapa menit.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Data pesanan tidak valid' },
        { status: 400 }
      );
    }

    // Satu kali baca katalog + settings per request (bukan per item).
    const settings = getSettings();
    const input = validateOrderInput(body, getServices(), settings);
    if (!input.ok) {
      return NextResponse.json({ success: false, error: input.error }, { status: input.status });
    }
    const { value } = input;

    const subtotal = value.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    let promoCode: string | undefined;
    let discountAmount = 0;
    if (value.promoCode) {
      // phone dipakai untuk cek batas pemakaian per pelanggan (mis. promo baru 1x)
      const promoResult = validatePromoCode(value.promoCode, subtotal, value.customer.phone);
      if (!promoResult.valid) {
        return NextResponse.json(
          { success: false, error: promoResult.message },
          { status: 400 }
        );
      }
      if (promoResult.promo) {
        promoCode = promoResult.promo.code;
        discountAmount = computeDiscount(promoResult.promo, subtotal);
      }
    }

    const orderData: Parameters<typeof createOrder>[0] = {
      customer: value.customer,
      items: value.items,
      pickupDate: value.pickupDate,
      pickupSlot: value.pickupSlot,
      status: 'WAITING_PICKUP',
      paymentModel: 'MODEL_B', // ponytail: kolom legacy dibiarkan untuk data lama; hapus bareng type saat DB bermigrasi
      paymentStatus: 'UNPAID',
      paymentMethod: 'TRANSFER',
      distanceKm: value.distanceKm,
      pickupFee: 0, // Always FREE
      subtotal,
      promoCode,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
      totalAmount: Math.max(0, subtotal - discountAmount),
      notes: value.notes,
    };

    const newOrder = createOrder(orderData);

    return NextResponse.json({
      success: true,
      data: newOrder,
      message: 'Pesanan berhasil dibuat!',
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat membuat pesanan' },
      { status: 500 }
    );
  }
}

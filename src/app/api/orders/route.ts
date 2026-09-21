import { NextRequest, NextResponse } from 'next/server';
import { getOrders, createOrder, getSettings, getServiceById } from '@/lib/db';
import { checkOrderEligibility } from '@/lib/haversine';
import { isValidPhone, PHONE_HINT, cleanPhoneDigits } from '@/lib/phone';
import { Order } from '@/lib/types';

// In-memory sliding-window limiter (per process): 10 POSTs / 5 min / IP.
const ORDER_POST_WINDOW_MS = 5 * 60 * 1000;
const ORDER_POST_MAX = 10;
const orderPostHits = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const hits = (orderPostHits.get(key) || []).filter((t) => now - t < ORDER_POST_WINDOW_MS);
  if (hits.length >= ORDER_POST_MAX) {
    orderPostHits.set(key, hits);
    return true;
  }
  hits.push(now);
  orderPostHits.set(key, hits);
  return false;
}

/** Normalize 62… / 0… to a comparable 0… form. */
function normPhone(digits: string): string {
  if (digits.startsWith('62')) return '0' + digits.slice(2);
  return digits;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    const status = searchParams.get('status');

    let orders = getOrders();

    if (phone) {
      const cleanPhone = normPhone(cleanPhoneDigits(phone));
      // Anti-harvest: require at least 4 digits; match exact or trailing
      // digits only (e.g. full number or last-4), never substring/prefix scans.
      if (cleanPhone.length < 4) {
        return NextResponse.json(
          { success: false, error: 'Pencarian nomor minimal 4 digit terakhir.' },
          { status: 400 }
        );
      }
      orders = orders.filter((o) => {
        const stored = normPhone(cleanPhoneDigits(o.customer.phone));
        return stored === cleanPhone || stored.endsWith(cleanPhone);
      });
    }

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
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';
    if (isRateLimited(`order:${ip}`)) {
      return NextResponse.json(
        { success: false, error: 'Terlalu banyak pesanan. Coba lagi beberapa menit.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const settings = getSettings();

    // Required fields validation
    if (!body.customer || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Data pelanggan dan item layanan wajib diisi' },
        { status: 400 }
      );
    }

    const { customer, items, pickupDate, pickupSlot, notes } = body;

    if (
      typeof customer?.name !== 'string' || !customer.name.trim() ||
      typeof customer?.phone !== 'string' || !customer.phone.trim() ||
      typeof customer?.address !== 'string' || !customer.address.trim() ||
      typeof customer?.latitude !== 'number' ||
      typeof customer?.longitude !== 'number' ||
      !pickupDate
    ) {
      return NextResponse.json(
        { success: false, error: 'Data pelanggan atau tanggal jemput tidak lengkap' },
        { status: 400 }
      );
    }

    if (!isValidPhone(customer.phone)) {
      return NextResponse.json(
        { success: false, error: PHONE_HINT },
        { status: 400 }
      );
    }

    // Prices come from the catalog, never from the client
    const pricedItems = [];
    for (let i = 0; i < items.length; i++) {
      const svc = getServiceById(items[i].serviceId);
      if (!svc) {
        return NextResponse.json(
          { success: false, error: `Layanan tidak ditemukan: ${items[i].serviceId}` },
          { status: 400 }
        );
      }
      const qty = Number(items[i].quantity);
      if (!Number.isInteger(qty) || qty < 1 || qty > 50) {
        return NextResponse.json(
          { success: false, error: 'Jumlah tiap layanan harus antara 1 - 50' },
          { status: 400 }
        );
      }
      pricedItems.push({
        id: `item-${Date.now()}-${i}`,
        serviceId: svc.id,
        serviceName: svc.name,
        category: svc.category,
        price: svc.price,
        quantity: qty,
        itemNotes:
          typeof items[i].itemNotes === 'string'
            ? items[i].itemNotes.trim().slice(0, 200)
            : undefined,
      });
    }

    const totalItemsCount = pricedItems.reduce((sum, i) => sum + i.quantity, 0);

    // Business rule validation: Distance & Item count check
    const eligibility = checkOrderEligibility(
      customer.latitude,
      customer.longitude,
      totalItemsCount,
      settings.workshopLat,
      settings.workshopLng,
      settings.freeRadiusKm,
      settings.minItemsBeyondRadius
    );

    if (
      customer.latitude === settings.workshopLat &&
      customer.longitude === settings.workshopLng
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Titik peta masih di workshop. Geser pin merah ke lokasi rumah Anda sebelum memesan.',
        },
        { status: 400 }
      );
    }

    if (!eligibility.allowed) {
      return NextResponse.json(
        { success: false, error: eligibility.message, eligibility },
        { status: 400 }
      );
    }

    // Calculate subtotal and total
    const subtotal = pricedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // Validate promo code if provided
    let promoCode: string | undefined = undefined;
    let discountAmount = 0;

    if (body.promoCode) {
      const { validatePromoCode } = await import('@/lib/db');
      const promoResult = validatePromoCode(body.promoCode, subtotal);
      if (promoResult.valid && promoResult.discountAmount) {
        promoCode = promoResult.promo?.code || body.promoCode.toUpperCase();
        discountAmount = promoResult.discountAmount;
      }
    }

    const totalAmount = Math.max(0, subtotal - discountAmount);

    const orderData: Omit<Order, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt' | 'qcPhotos'> = {
      customer: {
        ...customer,
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        address: customer.address.trim(),
        district: typeof customer.district === 'string' ? customer.district.trim() : customer.district,
        city: typeof customer.city === 'string' ? customer.city.trim() : customer.city,
        notes: typeof customer.notes === 'string' ? customer.notes.trim() : customer.notes,
      },
      items: pricedItems,
      pickupDate,
      pickupSlot: pickupSlot === 'afternoon' ? 'afternoon' : 'morning',
      status: 'WAITING_PICKUP',
      paymentModel: 'MODEL_B', // ponytail: kolom legacy dibiarkan untuk data lama; hapus bareng type saat DB bermigrasi
      paymentStatus: 'UNPAID',
      paymentMethod: 'TRANSFER',
      distanceKm: eligibility.distanceKm,
      pickupFee: 0, // Always FREE
      subtotal,
      promoCode,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
      totalAmount,
      notes: typeof notes === 'string' ? notes.trim().slice(0, 500) : undefined,
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

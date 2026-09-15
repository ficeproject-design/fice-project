import { NextRequest, NextResponse } from 'next/server';
import { getOrders, createOrder, getSettings } from '@/lib/db';
import { checkOrderEligibility } from '@/lib/haversine';
import { Order } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    const status = searchParams.get('status');

    let orders = getOrders();

    if (phone) {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      orders = orders.filter((o) => o.customer.phone.replace(/[^0-9]/g, '').includes(cleanPhone));
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
    const body = await req.json();
    const settings = getSettings();

    // Required fields validation
    if (!body.customer || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Data pelanggan dan item layanan wajib diisi' },
        { status: 400 }
      );
    }

    const { customer, items, pickupDate, pickupSlot, paymentModel, notes } = body;
    const totalItemsCount = items.reduce((sum: number, i: { quantity: number }) => sum + i.quantity, 0);

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

    if (!eligibility.allowed) {
      return NextResponse.json(
        { success: false, error: eligibility.message, eligibility },
        { status: 400 }
      );
    }

    // Calculate subtotal and total
    const subtotal = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );

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
      customer,
      items,
      pickupDate,
      pickupSlot: pickupSlot || 'morning',
      status: 'WAITING_PICKUP',
      paymentModel: paymentModel || 'MODEL_B',
      paymentStatus: 'UNPAID',
      paymentMethod: paymentModel === 'MODEL_C' ? 'COD' : undefined,
      distanceKm: eligibility.distanceKm,
      pickupFee: 0, // Always FREE
      subtotal,
      promoCode,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
      totalAmount,
      notes,
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

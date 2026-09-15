import { NextRequest, NextResponse } from 'next/server';
import { validatePromoCode } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, subtotal } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Kode promo wajib diisi' },
        { status: 400 }
      );
    }

    if (typeof subtotal !== 'number' || subtotal <= 0) {
      return NextResponse.json(
        { success: false, message: 'Nilai subtotal tidak valid' },
        { status: 400 }
      );
    }

    const result = validatePromoCode(code, subtotal);

    if (!result.valid) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || 'Kode promo tidak valid',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        code: result.promo?.code,
        discountAmount: result.discountAmount,
        discountType: result.promo?.discountType,
        discountValue: result.promo?.discountValue,
        description: result.promo?.description,
        message: result.message,
      },
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem saat memvalidasi kode promo' },
      { status: 500 }
    );
  }
}

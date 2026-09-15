import { NextRequest, NextResponse } from 'next/server';
import {
  getPromos,
  createPromo,
  updatePromo,
  deletePromo,
} from '@/lib/db';

export async function GET() {
  try {
    const promos = getPromos();
    return NextResponse.json({ success: true, data: promos });
  } catch (error) {
    console.error('Error fetching promos:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat daftar kode promo' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      validUntil,
      usageLimit,
      description,
      isActive,
    } = body;

    if (!code || typeof code !== 'string' || !code.trim()) {
      return NextResponse.json(
        { success: false, error: 'Kode promo wajib diisi' },
        { status: 400 }
      );
    }

    if (!discountType || (discountType !== 'PERCENT' && discountType !== 'FIXED')) {
      return NextResponse.json(
        { success: false, error: 'Tipe diskon harus PERCENT atau FIXED' },
        { status: 400 }
      );
    }

    if (typeof discountValue !== 'number' || discountValue <= 0) {
      return NextResponse.json(
        { success: false, error: 'Nilai diskon harus berupa angka lebih dari 0' },
        { status: 400 }
      );
    }

    const created = createPromo({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : undefined,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      validUntil: validUntil || undefined,
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      description: description?.trim() || undefined,
      isActive: typeof isActive === 'boolean' ? isActive : true,
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Kode promo berhasil dibuat!',
    });
  } catch (error) {
    console.error('Error creating promo:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat membuat kode promo' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID promo wajib disertakan' },
        { status: 400 }
      );
    }

    const updated = updatePromo(id, updateData);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Kode promo tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Kode promo berhasil diperbarui!',
    });
  } catch (error) {
    console.error('Error updating promo:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat memperbarui kode promo' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Parameter ID promo wajib disertakan' },
        { status: 400 }
      );
    }

    const deleted = deletePromo(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Kode promo tidak ditemukan atau gagal dihapus' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Kode promo berhasil dihapus!',
    });
  } catch (error) {
    console.error('Error deleting promo:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat menghapus kode promo' },
      { status: 500 }
    );
  }
}

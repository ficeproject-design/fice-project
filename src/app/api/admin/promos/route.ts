import { NextRequest, NextResponse } from 'next/server';
import {
  getPromos,
  getPromoById,
  createPromo,
  updatePromo,
  deletePromo,
} from '@/lib/db';
import { validatePromoDraft } from '@/lib/promo';

// Field opsional: null/kosong = hapus fieldnya (spread + JSON.stringify menghapus key).
const OPTIONAL_KEYS = [
  'minOrderAmount',
  'maxDiscount',
  'validUntil',
  'usageLimit',
  'usageLimitPerCustomer',
] as const;

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
      usageLimitPerCustomer,
      description,
      isActive,
    } = body;

    const error = validatePromoDraft(
      {
        code: typeof code === 'string' ? code : '',
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscount,
        validUntil,
        usageLimit,
        usageLimitPerCustomer,
      },
      { others: getPromos() }
    );
    if (error) {
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    const created = createPromo({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : undefined,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      validUntil: validUntil || undefined,
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      usageLimitPerCustomer: usageLimitPerCustomer ? Number(usageLimitPerCustomer) : undefined,
      usedBy: [],
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

    const existing = getPromoById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Kode promo tidak ditemukan' },
        { status: 404 }
      );
    }

    // Nilai yang tidak dikirim di body dipakai dari promo yang tersimpan.
    const error = validatePromoDraft(
      {
        code: updateData.code ?? existing.code,
        discountType: updateData.discountType ?? existing.discountType,
        discountValue: updateData.discountValue ?? existing.discountValue,
        minOrderAmount: updateData.minOrderAmount,
        maxDiscount: updateData.maxDiscount,
        validUntil: updateData.validUntil,
        usageLimit: updateData.usageLimit,
        usageLimitPerCustomer: updateData.usageLimitPerCustomer,
      },
      { others: getPromos(), editingId: id, currentUsedCount: existing.usedCount }
    );
    if (error) {
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    // Hanya key yang benar-benar dikirim yang disentuh, supaya field lain tidak ikut terhapus.
    for (const key of OPTIONAL_KEYS) {
      if (key in updateData && (updateData[key] === null || updateData[key] === '')) {
        updateData[key] = undefined;
      }
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

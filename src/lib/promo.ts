// Perhitungan & aturan promo: murni (tanpa fs) supaya bisa diuji tanpa file DB.
// Dipakai bersama oleh validatePromoCode (kode dari luar) dan listPromosForOrder (dropdown).
import { formatRupiah } from './invoice.ts';
import { normalizeIdPhone } from './phone.ts';
import type { PromoCode, PromoDiscountType } from './types';

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

export function computeDiscount(
  promo: { discountType: PromoDiscountType; discountValue: number; maxDiscount?: number },
  subtotal: number
): number {
  const base = Math.max(0, subtotal);
  let discount =
    promo.discountType === 'PERCENT'
      ? Math.round((base * promo.discountValue) / 100)
      : promo.discountValue;

  if (promo.discountType === 'PERCENT' && promo.maxDiscount) {
    discount = Math.min(discount, promo.maxDiscount);
  }
  return Math.min(Math.max(0, discount), base);
}

/** `validUntil` = tanggal WIB inklusif (YYYY-MM-DD). Berlaku sampai 23:59:59 WIB. */
export function isPromoExpired(validUntil: string | undefined, now: Date = new Date()): boolean {
  if (!validUntil) return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(validUntil.trim());
  if (!match) return false;
  const [, y, m, d] = match;
  const endOfDayWib = Date.UTC(Number(y), Number(m) - 1, Number(d), 23, 59, 59, 999) - WIB_OFFSET_MS;
  return now.getTime() > endOfDayWib;
}

export interface PromoEvaluation {
  valid: boolean;
  message: string; // teks panjang buat halaman validate
  reason: string; // teks pendek buat label dropdown yang disabled
  discountAmount: number; // 0 kalau belum valid
}

export function evaluatePromo(
  promo: PromoCode,
  subtotal: number,
  phone?: string
): PromoEvaluation {
  if (!promo.isActive) {
    return {
      valid: false,
      message: 'Kode promo ini sedang tidak aktif.',
      reason: 'Sedang tidak aktif',
      discountAmount: 0,
    };
  }

  if (isPromoExpired(promo.validUntil)) {
    const tanggal = promo.validUntil ? new Date(promo.validUntil).toLocaleDateString('id-ID') : '';
    return {
      valid: false,
      message: `Masa berlaku kode promo ini telah berakhir pada ${tanggal}.`,
      reason: `Berakhir ${tanggal}`,
      discountAmount: 0,
    };
  }

  if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
    return {
      valid: false,
      message: 'Kuota penggunaan kode promo ini sudah habis.',
      reason: 'Kuota habis',
      discountAmount: 0,
    };
  }

  // Batas per pelanggan (mis. promo pelanggan baru, 1x per nomor WA)
  if (promo.usageLimitPerCustomer && phone) {
    const key = normalizeIdPhone(phone);
    if (key !== '' && (promo.usedBy || []).includes(key)) {
      return {
        valid: false,
        message: `Nomor Anda sudah pernah memakai kode ${promo.code}. Promo ini maksimal ${promo.usageLimitPerCustomer}x per pelanggan.`,
        reason: 'Sudah dipakai nomor ini',
        discountAmount: 0,
      };
    }
  }

  if (promo.minOrderAmount && subtotal < promo.minOrderAmount) {
    return {
      valid: false,
      message: `Kode promo ini membutuhkan minimal belanja ${formatRupiah(promo.minOrderAmount)} (Total saat ini: ${formatRupiah(subtotal)}).`,
      reason: `Kurang ${formatRupiah(promo.minOrderAmount - subtotal)}`,
      discountAmount: 0,
    };
  }

  const discountAmount = computeDiscount(promo, subtotal);

  return {
    valid: true,
    message: `Kode ${promo.code} berhasil digunakan! Anda hemat ${formatRupiah(discountAmount)}.`,
    reason: '',
    discountAmount,
  };
}

export interface PromoOption {
  code: string;
  description?: string;
  discountType: PromoCode['discountType'];
  discountValue: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  eligible: boolean;
  reason: string; // kosong kalau eligible
  discountAmount: number;
}

/** Eligible dulu (diskon terbesar), lalu sisanya dari yang paling dekat syaratnya. */
export function rankPromos(
  promos: PromoCode[],
  subtotal: number,
  phone?: string
): PromoOption[] {
  return promos
    .map((p) => {
      const e = evaluatePromo(p, subtotal, phone);
      return {
        code: p.code,
        description: p.description,
        discountType: p.discountType,
        discountValue: p.discountValue,
        maxDiscount: p.maxDiscount,
        minOrderAmount: p.minOrderAmount,
        eligible: e.valid,
        reason: e.reason,
        discountAmount: e.discountAmount,
      };
    })
    .sort((a, b) => {
      if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
      if (a.eligible) return b.discountAmount - a.discountAmount;
      return (a.minOrderAmount ?? 0) - (b.minOrderAmount ?? 0);
    });
}

/** Teks potongan yang tampil ke customer, dipakai dropdown order + preview admin. */
export function promoDiscountLabel(p: {
  code: string;
  discountType: PromoCode['discountType'];
  discountValue: number;
  maxDiscount?: number | null;
}): string {
  const diskon =
    p.discountType === 'PERCENT'
      ? `Diskon ${p.discountValue}%${p.maxDiscount ? ` (maks ${formatRupiah(p.maxDiscount)})` : ''}`
      : `Potongan ${formatRupiah(p.discountValue)}`;
  return `${p.code} - ${diskon}`;
}

export interface PromoDraft {
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount?: number | null;
  maxDiscount?: number | null;
  validUntil?: string | null;
  usageLimit?: number | null;
  usageLimitPerCustomer?: number | null;
}

/**
 * Aturan form admin (pure, dipakai POST + PATCH). Balikin pesan error, atau null kalau lolos.
 * others = promo yang sudah ada; editingId = id yang sedang diedit supaya kodenya sendiri tidak dianggap bentrok.
 */
export function validatePromoDraft(
  draft: PromoDraft,
  opts: { others?: { id: string; code: string }[]; editingId?: string; currentUsedCount?: number } = {}
): string | null {
  const code = draft.code.trim().toUpperCase();

  if (!code) return 'Kode promo wajib diisi';
  if (draft.discountType !== 'PERCENT' && draft.discountType !== 'FIXED')
    return 'Tipe diskon harus PERCENT atau FIXED';
  if (typeof draft.discountValue !== 'number' || !Number.isFinite(draft.discountValue) || draft.discountValue <= 0)
    return 'Nilai diskon harus berupa angka lebih dari 0';
  if (draft.discountType === 'PERCENT' && draft.discountValue > 100)
    return 'Diskon persentase tidak boleh melebihi 100%';

  const bentrok = (opts.others || []).find(
    (p) => p.id !== opts.editingId && p.code.trim().toUpperCase() === code
  );
  if (bentrok) {
    return `Kode ${code} sudah dipakai promo lain. Pakai kode berbeda atau edit promo yang sudah ada.`;
  }

  const terpakai = opts.currentUsedCount || 0;
  if (draft.usageLimit != null && draft.usageLimit < terpakai) {
    return `Batas kuota tidak boleh lebih kecil dari yang sudah terpakai (${terpakai}x).`;
  }

  if (draft.validUntil) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(draft.validUntil) < today) {
      return 'Tanggal berlaku sudah lewat. Pilih hari ini atau setelahnya.';
    }
  }

  return null;
}
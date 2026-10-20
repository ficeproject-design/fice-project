// Perhitungan diskon promo: murni supaya bisa diuji tanpa file DB.
import type { PromoDiscountType } from './types.ts';

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

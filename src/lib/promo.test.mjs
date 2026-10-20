import test from 'node:test';
import assert from 'node:assert/strict';
import { computeDiscount, isPromoExpired } from './promo.ts';

test('diskon persen dibulatkan, di-cap maxDiscount', () => {
  assert.equal(computeDiscount({ discountType: 'PERCENT', discountValue: 15 }, 100_000), 15_000);
  assert.equal(computeDiscount({ discountType: 'PERCENT', discountValue: 15, maxDiscount: 25_000 }, 200_000), 25_000);
  assert.equal(computeDiscount({ discountType: 'PERCENT', discountValue: 15 }, 65_000), 9_750);
});

test('diskon fixed tidak melebihi subtotal, tidak pernah negatif', () => {
  assert.equal(computeDiscount({ discountType: 'FIXED', discountValue: 10_000 }, 65_000), 10_000);
  assert.equal(computeDiscount({ discountType: 'FIXED', discountValue: 99_000 }, 65_000), 65_000);
  assert.equal(computeDiscount({ discountType: 'PERCENT', discountValue: -20 }, 65_000), 0);
});

test('promo kedaluwarsa dihitung di WIB, bukan zona server', () => {
  // 2026-12-31 23:59 WIB == 2026-12-31T16:59Z
  assert.equal(isPromoExpired('2026-12-31', new Date('2026-12-31T16:59:00Z')), false);
  // 2027-01-01 00:00 WIB == 2026-12-31T17:00Z -> sudah lewat
  assert.equal(isPromoExpired('2026-12-31', new Date('2026-12-31T17:00:00Z')), true);
  // 2027-01-01 06:00 WIB (server UTC masih 2026-12-31) -> tetap lewat
  assert.equal(isPromoExpired('2026-12-31', new Date('2026-12-31T23:00:00Z')), true);
});

test('promo tanpa tanggal tidak pernah kedaluwarsa', () => {
  assert.equal(isPromoExpired(undefined, new Date('2030-01-01T00:00:00Z')), false);
});

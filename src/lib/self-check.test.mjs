// Self-check murni (node --test). Hanya modul tanpa fs/env: haversine, phone, invoice.
// db.ts (butuh file) dan validatePromoCode (butuh db) tercakup lewat alur manual admin.
import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateDistanceKm, checkOrderEligibility, estimateRoadDistanceKm, DEFAULT_WORKSHOP_COORDS } from './haversine.ts';
import { isValidPhone, cleanPhoneDigits, normalizeIdPhone } from './phone.ts';
import { generateInvoiceNumber, formatRupiah, createWhatsAppUrl } from './invoice.ts';

const W = DEFAULT_WORKSHOP_COORDS;

test('jarak haversine kemang -> workshop masuk akal (~11 km)', () => {
  const d = calculateDistanceKm(W.lat, W.lng, -6.2625, 106.8228);
  assert.ok(d > 8 && d < 15, `dapat ${d} km`);
});

test('estimasi jalan = 1.3x garis lurus; kemang ~11 garis lurus -> ~14 jalan', () => {
  const straight = calculateDistanceKm(W.lat, W.lng, -6.2625, 106.8228);
  const road = estimateRoadDistanceKm(W.lat, W.lng, -6.2625, 106.8228);
  assert.ok(Math.abs(road - straight * 1.3) < 0.2, `jalan ${road} vs lurus ${straight}`);
});

test('eligibilitas radius 15 jalan: dalam radius bebas; >radius butuh min 3', () => {
  const dekat = checkOrderEligibility(W.lat, W.lng + 0.05, 1, W.lat, W.lng, 15, 3);
  assert.equal(dekat.allowed, true);
  assert.equal(dekat.isBeyondRadius, false);

  const jauh = checkOrderEligibility(W.lat + 0.25, W.lng, 2, W.lat, W.lng, 15, 3);
  assert.equal(jauh.allowed, false);
  assert.equal(jauh.isBeyondRadius, true);
  assert.equal(jauh.missingItemsCount, 1);

  const jauhCukup = checkOrderEligibility(W.lat + 0.25, W.lng, 3, W.lat, W.lng, 15, 3);
  assert.equal(jauhCukup.allowed, true);
});

test('validasi nomor WA Indonesia', () => {
  assert.equal(isValidPhone('081234567890'), true);
  assert.equal(isValidPhone('+62 812-3456-7890'), true);
  assert.equal(isValidPhone('123'), false);
  assert.equal(isValidPhone('312345678901'), false);
  assert.equal(normalizeIdPhone(cleanPhoneDigits('62812345678')), '0812345678');
});

test('nomor invoice: format tetap; duplikat jarang (createOrder punya guard retry)', () => {
  const seen = new Set();
  for (let i = 0; i < 20; i++) {
    const inv = generateInvoiceNumber(0);
    assert.match(inv, /^INV-\d{6}-[A-Z0-9]{6}$/);
    seen.add(inv);
  }
  // ruang random 3 char = 46656; peluang >=2 duplikat dari 20 sampel ~0.1%
  assert.ok(seen.size >= 19, `terlalu banyak duplikat: ${seen.size}/20`);
});

test('format rupiah + URL whatsapp', () => {
  assert.ok(formatRupiah(65000).includes('65.000'));
  assert.ok(createWhatsAppUrl('081234567890', 'halo').startsWith('https://wa.me/6281234567890'));
});

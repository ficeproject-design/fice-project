// Self-check murni (node --test). Hanya modul tanpa fs/env: haversine, phone, invoice, promo.
// db.ts (butuh file) dan alur promo di db.ts tercakup lewat alur manual admin.
import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateDistanceKm, checkOrderEligibility, estimateRoadDistanceKm, DEFAULT_WORKSHOP_COORDS } from './haversine.ts';
import { isValidPhone, cleanPhoneDigits, normalizeIdPhone } from './phone.ts';
import { generateInvoiceNumber, formatRupiah, createWhatsAppUrl } from './invoice.ts';
import { evaluatePromo, rankPromos, promoDiscountLabel, validatePromoDraft } from './promo.ts';

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

const promo = (over = {}) => ({
  id: 'p-test',
  code: 'TESTPROMO',
  discountType: 'PERCENT',
  discountValue: 10,
  usedCount: 0,
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  ...over,
});

test('promo: eligible dihitung; syarat min order kurang -> alasan singkat', () => {
  const p = promo({ code: 'FICEBARU', discountValue: 15, maxDiscount: 25000, minOrderAmount: 65000 });

  const ok = evaluatePromo(p, 65000);
  assert.equal(ok.valid, true);
  assert.equal(ok.discountAmount, 9750); // 15% 65000
  assert.equal(ok.reason, '');

  const kurang = evaluatePromo(p, 50000);
  assert.equal(kurang.valid, false);
  assert.equal(kurang.discountAmount, 0);
  assert.ok(kurang.reason.includes('Kurang'), kurang.reason);
  assert.ok(kurang.reason.includes('15.000'), kurang.reason);
});

test('promo: kuota habis dan batas per pelanggan ditolak dengan alasan', () => {
  assert.equal(evaluatePromo(promo({ usageLimit: 5, usedCount: 5 }), 100000).reason, 'Kuota habis');

  const sekali = promo({ usageLimitPerCustomer: 1, usedBy: ['0812345678'] });
  assert.equal(evaluatePromo(sekali, 100000, '62812345678').reason, 'Sudah dipakai nomor ini');
  assert.equal(evaluatePromo(sekali, 100000, '08199999999').valid, true);
});

test('promo: urutan dropdown = eligible (diskon terbesar) dulu, sisanya terdekat syaratnya', () => {
  const list = rankPromos(
    [
      promo({ code: 'KECIL', discountType: 'FIXED', discountValue: 10000, minOrderAmount: 100000 }),
      promo({ code: 'BESAR', discountType: 'FIXED', discountValue: 20000, minOrderAmount: 65000 }),
      promo({ code: 'DEKAT', discountType: 'FIXED', discountValue: 5000, minOrderAmount: 70000 }),
    ],
    65000
  );

  assert.deepEqual(list.map((p) => p.code), ['BESAR', 'DEKAT', 'KECIL']);
  assert.equal(list[0].eligible, true);
  assert.equal(list[1].eligible, false);
  assert.ok(list[1].reason.includes('Kurang'), list[1].reason);
});

test('promo admin: kode duplikat, kuota turun di bawah terpakai, tanggal lewat ditolak', () => {
  const others = [{ id: 'promo-1', code: 'FICEBARU' }];
  const sehat = {
    code: 'BARU10',
    discountType: 'PERCENT',
    discountValue: 10,
    minOrderAmount: 65000,
    maxDiscount: 20000,
    validUntil: '2099-12-31',
    usageLimit: 50,
    usageLimitPerCustomer: 1,
  };

  assert.equal(validatePromoDraft(sehat, { others }), null);

  // huruf kecil tetap dianggap bentrok; edit promo sendiri tidak dianggap bentrok
  assert.match(validatePromoDraft({ ...sehat, code: 'ficebaru' }, { others }), /sudah dipakai/);
  assert.equal(validatePromoDraft({ ...sehat, code: 'FICEBARU' }, { others, editingId: 'promo-1' }), null);

  assert.match(
    validatePromoDraft({ ...sehat, usageLimit: 5 }, { others, currentUsedCount: 8 }),
    /sudah terpakai/
  );
  assert.match(validatePromoDraft({ ...sehat, validUntil: '2020-01-01' }, { others }), /sudah lewat/);
  assert.match(validatePromoDraft({ ...sehat, discountValue: 0 }, { others }), /lebih dari 0/);
});

test('promo: label dropdown sama untuk admin dan customer', () => {
  assert.equal(
    promoDiscountLabel({ code: 'FICEBARU', discountType: 'PERCENT', discountValue: 15, maxDiscount: 25000 }),
    'FICEBARU - Diskon 15% (maks Rp\u00a025.000)'
  );
  assert.equal(
    promoDiscountLabel({ code: 'BERSIH10K', discountType: 'FIXED', discountValue: 10000 }),
    'BERSIH10K - Potongan Rp\u00a010.000'
  );
});

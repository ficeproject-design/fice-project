import test from 'node:test';
import assert from 'node:assert/strict';
import { validateOrderInput, MAX_ORDER_ITEMS } from './order-input.ts';
import { DEFAULT_WORKSHOP_COORDS } from './haversine.ts';

const W = DEFAULT_WORKSHOP_COORDS;
const SERVICES = [
  { id: 'srv-a', category: 'shoes', name: 'A', description: '', estimatedDays: '2', price: 65_000 },
];
const SETTINGS = {
  workshopLat: W.lat,
  workshopLng: W.lng,
  freeRadiusKm: 15,
  minItemsBeyondRadius: 3,
};
const NEAR = { latitude: W.lat + 0.05, longitude: W.lng };

function body(over = {}) {
  return {
    customer: {
      name: 'Budi',
      phone: '081234567890',
      address: 'Jl Mawar 1',
      district: 'Serpong',
      city: 'Kota Tangerang Selatan',
      ...NEAR,
    },
    items: [{ serviceId: 'srv-a', quantity: 1 }],
    pickupDate: '2999-01-05',
    pickupSlot: 'morning',
    ...over,
  };
}

const NOW = new Date('2026-10-20T04:00:00Z'); // 11:00 WIB

test('body valid diterima dan hanya field pelanggan yang diizinkan yang lolos', () => {
  const r = validateOrderInput(
    body({ customer: { ...body().customer, id: 'cust-HACK', totalOrders: 999, createdAt: '1999-01-01' } }),
    SERVICES,
    SETTINGS,
    NOW
  );
  assert.equal(r.ok, true);
  assert.equal(r.value.customer.id, undefined);
  assert.equal(r.value.customer.totalOrders, undefined);
  assert.equal(r.value.customer.createdAt, undefined);
  assert.equal(r.value.customer.name, 'Budi');
});

test('items bukan array atau kosong ditolak', () => {
  assert.equal(validateOrderInput(body({ items: {} }), SERVICES, SETTINGS, NOW).ok, false);
  assert.equal(validateOrderInput(body({ items: [] }), SERVICES, SETTINGS, NOW).ok, false);
  assert.equal(validateOrderInput(body({ items: 'abc' }), SERVICES, SETTINGS, NOW).ok, false);
});

test('items melebihi batas ditolak', () => {
  const many = Array.from({ length: MAX_ORDER_ITEMS + 1 }, () => ({ serviceId: 'srv-a', quantity: 1 }));
  const r = validateOrderInput(body({ items: many }), SERVICES, SETTINGS, NOW);
  assert.equal(r.ok, false);
  assert.match(r.error, /maksimal/i);
});

test('promoCode bukan string tidak bikin 500', () => {
  const r = validateOrderInput(body({ promoCode: 123 }), SERVICES, SETTINGS, NOW);
  assert.equal(r.ok, false);
  assert.equal(r.status, 400);
});

test('tanggal jemput harus format YYYY-MM-DD dan tidak boleh lampau', () => {
  assert.equal(validateOrderInput(body({ pickupDate: '2020-01-01' }), SERVICES, SETTINGS, NOW).ok, false);
  assert.equal(validateOrderInput(body({ pickupDate: 'besok' }), SERVICES, SETTINGS, NOW).ok, false);
  assert.equal(
    validateOrderInput(body({ pickupDate: '2026-10-20', pickupSlot: 'afternoon' }), SERVICES, SETTINGS, NOW).ok,
    true
  );
});

test('slot pagi untuk hari ini ditolak (slot pagi 09.00-13.00 sudah lewat)', () => {
  const r = validateOrderInput(body({ pickupDate: '2026-10-20', pickupSlot: 'morning' }), SERVICES, SETTINGS, NOW);
  assert.equal(r.ok, false);
  assert.match(r.error, /pagi/i);
});

test('hari ini ditolak setelah cut-off, besok tetap boleh', () => {
  const afterCutoff = new Date('2026-10-20T07:00:00Z'); // 14:00 WIB
  assert.equal(
    validateOrderInput(body({ pickupDate: '2026-10-20', pickupSlot: 'afternoon' }), SERVICES, SETTINGS, afterCutoff).ok,
    false
  );
  assert.equal(
    validateOrderInput(body({ pickupDate: '2026-10-21', pickupSlot: 'morning' }), SERVICES, SETTINGS, afterCutoff).ok,
    true
  );
});

test('slot tidak dikenal ditolak, bukan diam-diam jadi pagi', () => {
  const r = validateOrderInput(body({ pickupSlot: 'midnight' }), SERVICES, SETTINGS, NOW);
  assert.equal(r.ok, false);
});

test('jarak di luar batas keras ditolak walau item banyak', () => {
  const far = {
    ...body().customer,
    latitude: -7.2575,
    longitude: 112.7521, // Surabaya
  };
  const r = validateOrderInput(
    body({ customer: far, items: [1, 2, 3].map(() => ({ serviceId: 'srv-a', quantity: 1 })) }),
    SERVICES,
    SETTINGS,
    NOW
  );
  assert.equal(r.ok, false);
  assert.match(r.error, /jangkauan/i);
});

test('kota di luar area layanan ditolak', () => {
  const r = validateOrderInput(
    body({ customer: { ...body().customer, city: 'Kota Bandung' } }),
    SERVICES,
    SETTINGS,
    NOW
  );
  assert.equal(r.ok, false);
  assert.match(r.error, /area/i);
});

test('layanan tidak dikenal ditolak', () => {
  const r = validateOrderInput(body({ items: [{ serviceId: 'nope', quantity: 1 }] }), SERVICES, SETTINGS, NOW);
  assert.equal(r.ok, false);
  assert.equal(r.status, 400);
});

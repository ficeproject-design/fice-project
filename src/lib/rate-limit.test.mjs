import test from 'node:test';
import assert from 'node:assert/strict';
import { clientIp, createRateLimiter } from './rate-limit.ts';

function h(pairs) {
  const m = new Map(Object.entries(pairs).map(([k, v]) => [k.toLowerCase(), v]));
  return { get: (k) => m.get(k.toLowerCase()) ?? null };
}

test('clientIp ambil entri TERAKHIR x-forwarded-for (yang ditambahkan proxy)', () => {
  assert.equal(clientIp(h({ 'x-forwarded-for': '1.2.3.4, 10.0.0.1' })), '10.0.0.1');
  assert.equal(clientIp(h({ 'x-forwarded-for': '1.2.3.4' })), '1.2.3.4');
  assert.equal(clientIp(h({ 'x-real-ip': '9.9.9.9' })), '9.9.9.9');
  assert.equal(clientIp(h({})), 'unknown');
});

test('clientIp: header kosong / spasi tidak menghasilkan key kosong', () => {
  assert.equal(clientIp(h({ 'x-forwarded-for': ' ,  ' })), 'unknown');
  assert.equal(clientIp(h({ 'x-forwarded-for': '' })), 'unknown');
});

test('limiter: blokir setelah max dalam window, pulih setelah window lewat', () => {
  const rl = createRateLimiter(3, 1000);
  assert.equal(rl.limited('a', 0), false);
  assert.equal(rl.limited('a', 1), false);
  assert.equal(rl.limited('a', 2), false);
  assert.equal(rl.limited('a', 3), true);
  assert.equal(rl.limited('a', 2000), false, 'window sudah lewat');
  assert.equal(rl.limited('b', 3), false, 'key lain tidak terpengaruh');
});

test('limiter: key basi dibuang, ukuran map tidak tumbuh selamanya', () => {
  const rl = createRateLimiter(5, 1000);
  for (let i = 0; i < 500; i++) rl.limited(`ip-${i}`, 0);
  assert.ok(rl.size() > 0);
  rl.limited('fresh', 10_000);
  assert.ok(rl.size() <= 50, `size=${rl.size()} harus menyusut setelah sweep`);
});

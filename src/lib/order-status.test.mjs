import test from 'node:test';
import assert from 'node:assert/strict';
import { canTransition, ALLOWED_TRANSITIONS } from './order-status.ts';

test('alur normal maju satu langkah diizinkan', () => {
  assert.equal(canTransition('WAITING_PICKUP', 'PICKING_UP'), true);
  assert.equal(canTransition('PICKING_UP', 'IN_WORKSHOP'), true);
  assert.equal(canTransition('IN_WORKSHOP', 'IN_PROGRESS'), true);
  assert.equal(canTransition('IN_PROGRESS', 'READY_TO_DELIVER'), true);
  assert.equal(canTransition('READY_TO_DELIVER', 'DELIVERING'), true);
  assert.equal(canTransition('DELIVERING', 'COMPLETED'), true);
});

test('tidak boleh lompat status atau mundur sembarangan', () => {
  assert.equal(canTransition('WAITING_PICKUP', 'COMPLETED'), false);
  assert.equal(canTransition('IN_PROGRESS', 'WAITING_PICKUP'), false);
});

test('status terminal tidak punya jalan keluar', () => {
  assert.deepEqual(ALLOWED_TRANSITIONS.COMPLETED, []);
  assert.deepEqual(ALLOWED_TRANSITIONS.CANCELLED, []);
});

test('batal hanya dari status yang belum selesai, dan mundur satu langkah diizinkan', () => {
  assert.equal(canTransition('IN_PROGRESS', 'CANCELLED'), true);
  assert.equal(canTransition('DELIVERING', 'READY_TO_DELIVER'), true);
  assert.equal(canTransition('PICKING_UP', 'WAITING_PICKUP'), true);
  assert.equal(canTransition('COMPLETED', 'CANCELLED'), false);
});

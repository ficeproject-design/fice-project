import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldSeedDemo } from './seed.ts';

test('data demo tidak ikut ter-seed di production', () => {
  assert.equal(shouldSeedDemo('production'), false);
  assert.equal(shouldSeedDemo('development'), true);
  assert.equal(shouldSeedDemo(undefined), true);
});

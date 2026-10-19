const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseSequence, simulate, workingSet } = require('./algorithms.js');
test('standard reference string: FIFO 10 faults, LRU 9 faults', () => {
  const pages = [7,0,1,2,0,3,0,4,2,3,0,3,2];
  assert.equal(simulate(pages, 3, 'FIFO').at(-1).faults, 10);
  assert.equal(simulate(pages, 3, 'LRU').at(-1).faults, 9);
});
test('hits update recency but do not change FIFO eviction order', () => {
  const pages = [1,2,1,3];
  assert.equal(simulate(pages, 2, 'FIFO').at(-1).evicted, 1);
  assert.equal(simulate(pages, 2, 'LRU').at(-1).evicted, 2);
});
test('page zero, one frame and independent snapshots', () => {
  const run = simulate([0,0,1,0], 1, 'LRU');
  assert.equal(run.at(-1).faults, 3);
  assert.deepEqual(run[0].frames, [0]);
  assert.equal(run[2].evicted, 0);
  assert.equal(run[0].evicted, null);
});
test('working set deduplicates only the selected trailing window', () => {
  assert.deepEqual(workingSet([1,2,3,2,4,3], 6, 4), { recent:[3,2,4,3], pages:[2,3,4] });
  assert.deepEqual(workingSet([1], 0, 4).pages, []);
});
test('input accepts separators and rejects invalid or excessive input', () => {
  assert.deepEqual(parseSequence('0, 1  2\n3'), [0,1,2,3]);
  for (const value of ['', '-1', '1.5', '1e2', '<script>', '10000', Array(61).fill('1').join(',')]) assert.throws(() => parseSequence(value));
  assert.throws(() => simulate([1], 0, 'FIFO'));
  assert.throws(() => workingSet([1], 1, 0));
});

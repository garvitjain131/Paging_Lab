/* Pure algorithm functions, shared by the browser and the Node tests. */
(function (root) {
  'use strict';
  function parseSequence(value) {
    const tokens = value.trim().split(/[\s,]+/).filter(Boolean);
    if (!tokens.length || tokens.length > 60) throw new Error('Enter between 1 and 60 page references.');
    if (tokens.some(t => !/^\d+$/.test(t) || !Number.isSafeInteger(Number(t)) || Number(t) > 9999)) {
      throw new Error('Use whole page numbers from 0 to 9999, separated by commas or spaces.');
    }
    return tokens.map(Number);
  }
  function simulate(pages, capacity, policy) {
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 8) throw new Error('RAM frames must be between 1 and 8.');
    if (!['FIFO', 'LRU'].includes(policy)) throw new Error('Unknown replacement policy.');
    const frames = Array(capacity).fill(null);
    const loadedAt = Array(capacity).fill(-1);
    const lastUsed = Array(capacity).fill(-1);
    let faults = 0;
    return pages.map((page, time) => {
      let slot = frames.indexOf(page);
      const hit = slot !== -1;
      let evicted = null;
      if (!hit) {
        faults++;
        slot = frames.indexOf(null);
        if (slot === -1) {
          const timestamps = policy === 'FIFO' ? loadedAt : lastUsed;
          slot = timestamps.indexOf(Math.min(...timestamps));
          evicted = frames[slot];
        }
        frames[slot] = page;
        loadedAt[slot] = time;
      }
      lastUsed[slot] = time;
      return { page, hit, evicted, slot, frames: [...frames], faults, hits: time + 1 - faults };
    });
  }
  function workingSet(pages, step, windowSize) {
    if (!Number.isInteger(windowSize) || windowSize < 1 || windowSize > 20) throw new Error('Window size must be between 1 and 20.');
    const recent = pages.slice(Math.max(0, step - windowSize), step);
    return { recent, pages: [...new Set(recent)].sort((a, b) => a - b) };
  }
  const api = { parseSequence, simulate, workingSet };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Paging = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

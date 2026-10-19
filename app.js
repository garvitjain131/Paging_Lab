'use strict';
const $ = selector => document.querySelector(selector);
let pages = [], capacity = 3, windowSize = 4, step = 0, runs = {}, timer = null;
function stop() { clearInterval(timer); timer = null; $('#play').textContent = 'Play'; }
function metric(label, value) { return `<div><strong>${value}</strong><span>${label}</span></div>`; }
function render() {
  $('#progress').textContent = `${step} / ${pages.length}`;
  $('#current').textContent = step ? `Access page ${pages[step - 1]}` : 'Ready. Step through the first request.';
  $('#back').disabled = step === 0;
  $('#next').disabled = step === pages.length;
  $('#play').disabled = step === pages.length;
  $('#reset').disabled = step === 0;
  $('#timeline').replaceChildren(...pages.map((page, i) => {
    const button = document.createElement('button');
    button.textContent = page;
    button.className = i === step - 1 ? 'active' : i < step ? 'visited' : '';
    button.setAttribute('aria-label', `Request ${i + 1}: page ${page}`);
    button.setAttribute('aria-pressed', String(i === step - 1));
    button.addEventListener('click', () => { stop(); step = i + 1; render(); });
    return button;
  }));
  for (const name of ['FIFO', 'LRU']) {
    const panel = $(`#${name.toLowerCase()}`), state = runs[name][step - 1];
    const memory = state ? state.frames : Array(capacity).fill(null);
    panel.querySelector('.frames').innerHTML = memory.map((page, i) => `<div class="frame ${state && i === state.slot ? state.hit ? 'hit' : 'fault' : ''}"><span>FRAME ${i + 1}</span><strong>${page ?? '—'}</strong></div>`).join('');
    panel.querySelector('.metrics').innerHTML = metric('Page faults', state?.faults ?? 0) + metric('Hits', state?.hits ?? 0) + metric('Hit rate', `${step ? Math.round(state.hits / step * 100) : 0}%`);
    const event = panel.querySelector('.event');
    event.className = `event ${state ? state.hit ? 'success' : 'warning' : ''}`;
    event.textContent = !state ? 'RAM is empty. No requests processed yet.' : state.hit ? `HIT · Page ${state.page} is already in RAM.` : `FAULT · Loaded page ${state.page}. ${state.evicted === null ? 'Used an empty frame.' : `Evicted page ${state.evicted}.`}`;
  }
  const working = Paging.workingSet(pages, step, windowSize);
  $('#window-label').textContent = windowSize;
  $('#window-refs').textContent = `Recent requests: ${working.recent.join(', ') || 'none yet'}`;
  $('#working-pages').innerHTML = working.pages.length ? working.pages.map(p => `<span>${p}</span>`).join('') : '<span class="empty-set">Empty set</span>';
  const pressure = working.pages.length > capacity;
  $('#pressure').className = pressure ? 'warning' : 'success';
  $('#pressure').textContent = !step ? 'Process a request to track the working set.' : `${working.pages.length} active pages / ${capacity} frames. ${pressure ? 'Memory pressure: working set exceeds capacity.' : 'The recent working set fits in RAM.'}`;
}
function run() {
  stop();
  try {
    const nextPages = Paging.parseSequence($('#sequence').value);
    const nextCapacity = Number($('#frames').value), nextWindow = Number($('#window').value);
    const fifo = Paging.simulate(nextPages, nextCapacity, 'FIFO');
    const lru = Paging.simulate(nextPages, nextCapacity, 'LRU');
    Paging.workingSet(nextPages, 0, nextWindow);
    pages = nextPages; capacity = nextCapacity; windowSize = nextWindow;
    runs = { FIFO: fifo, LRU: lru }; step = 0; $('#error').hidden = true;
    const f = fifo.at(-1).faults, l = lru.at(-1).faults;
    $('#verdict').textContent = f === l ? `Both algorithms produce ${f} faults on this sequence.` : `${f < l ? 'FIFO' : 'LRU'} produces ${Math.abs(f - l)} fewer faults on this sequence. Performance depends on the access pattern.`;
    $('#results').innerHTML = Object.entries(runs).map(([name, states]) => { const end = states.at(-1); return `<tr><th scope="row">${name}</th><td>${end.faults}</td><td>${end.hits}</td><td>${Math.round(end.hits / pages.length * 100)}%</td></tr>`; }).join('');
    render();
  } catch (error) { $('#error').textContent = error.message; $('#error').hidden = false; }
}
$('#settings').addEventListener('submit', event => { event.preventDefault(); run(); });
$('#next').addEventListener('click', () => { stop(); if (step < pages.length) step++; render(); });
$('#back').addEventListener('click', () => { stop(); if (step > 0) step--; render(); });
$('#reset').addEventListener('click', () => { stop(); step = 0; render(); });
$('#play').addEventListener('click', () => {
  if (timer) { stop(); return; }
  $('#play').textContent = 'Pause';
  timer = setInterval(() => { step++; if (step >= pages.length) stop(); render(); }, 800);
});
$('#example').addEventListener('click', () => { $('#sequence').value = '1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4'; $('#frames').value = 3; $('#window').value = 4; run(); });
run();

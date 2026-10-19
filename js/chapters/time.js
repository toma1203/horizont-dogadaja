// Poglavlje IV — gravitacijska dilatacija vremena za statičnog promatrača: dτ/dt = √(1 − Rs/r).
import { $, YEAR, sci, loc, dur, addAnim } from '../util.js';

function drawTicks(g) {
  let s = '';
  for (let i = 0; i < 60; i++) {
    const a = (i * 6 * Math.PI) / 180, l = i % 5 ? 6 : 12;
    s += `<line x1="${100 + 86 * Math.sin(a)}" y1="${100 - 86 * Math.cos(a)}" x2="${100 + (86 - l) * Math.sin(a)}" y2="${100 - (86 - l) * Math.cos(a)}" stroke="${i % 5 ? '#2a3042' : '#8e94a6'}" stroke-width="${i % 5 ? 1 : 2}"/>`;
  }
  g.innerHTML = s;
}

export function initTime() {
  drawTicks($('ticksFar'));
  drawTicks($('ticksNear'));
  const slider = $('tSlider');
  let factor = 0.577, tFar = 0, tNear = 0;

  function update() {
    // Klizač je logaritamski: r/Rs = 1 + 10^(−4 … 1)
    const x = 1 + Math.pow(10, -4 + (5 * +slider.value) / 1000);
    factor = Math.sqrt(1 - 1 / x);
    $('tOut').textContent = (x < 1.01 ? x.toLocaleString('hr-HR', { maximumFractionDigits: 5 }) : loc(x)) + ' Rs';
    $('tRate').textContent = sci(factor);
    $('tInv').textContent = dur(3600 / factor) + ' vani';
    $('tYear').textContent = dur(YEAR / factor) + ' vani';
  }
  slider.addEventListener('input', () => { update(); tFar = 0; tNear = 0; });
  update();

  const fmt = (s) => s.toLocaleString('hr-HR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' s';
  addAnim(document.querySelector('.clocks'), (t, dt) => {
    tFar += dt;
    tNear += dt * factor;
    $('handFar').setAttribute('transform', `rotate(${(tFar * 36) % 360} 100 100)`);
    $('handNear').setAttribute('transform', `rotate(${(tNear * 36) % 360} 100 100)`);
    $('cntFar').textContent = fmt(tFar);
    $('cntNear').textContent = fmt(tNear);
  });
}

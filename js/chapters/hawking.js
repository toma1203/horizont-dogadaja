// Poglavlje VI — Hawkingova temperatura i vrijeme isparavanja.
// T = ħc³ / (8πGMk_B),  t = 5120πG²M³ / (ħc⁴)
import { $, G, C, HBAR, KB, YEAR, COL, sci, sup, len, dur, fitCanvas, onResize } from '../util.js';

const T_CMB = 2.725;
const AGE = 13.8e9 * YEAR;
const temp = (M) => (HBAR * C ** 3) / (8 * Math.PI * G * M * KB);
const lifetime = (M) => (5120 * Math.PI * G * G * M ** 3) / (HBAR * C ** 4);

export function initHawking() {
  const slider = $('hkSlider');
  const cv = $('hkCanvas');

  function update() {
    const M = Math.pow(10, +slider.value);
    const T = temp(M);
    const life = lifetime(M);
    $('hkOut').textContent = sci(M) + ' kg';
    $('hkT').textContent = sci(T) + ' K';
    $('hkLife').textContent = dur(life);
    $('hkRs').textContent = len((2 * G * M) / (C * C));

    const v = $('hkVerdict');
    if (T < T_CMB) {
      v.classList.remove('warn');
      v.textContent = 'Hladnija od kozmičkog pozadinskog zračenja (2,725 K). Danas raste upijanjem tog zračenja i ne isparava.';
    } else if (life < AGE) {
      v.classList.add('warn');
      v.textContent = 'Kraće živi od svemira (13,8 milijardi godina). Primordijalna crna rupa ove mase već bi isparila.';
    } else {
      v.classList.add('warn');
      v.textContent = 'Toplija od pozadinskog zračenja, pa polako gubi masu, ali je nadživjela dosadašnju povijest svemira.';
    }

    document.querySelectorAll('#hkPresets button').forEach((b) =>
      b.classList.toggle('on', Math.abs(Math.log10(+b.dataset.kg) - +slider.value) < 0.01));

    // Graf log T – log M s linijom pozadinskog zračenja
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    const pad = { l: 44, r: 12, t: 10, b: 24 };
    const mx0 = 8, mx1 = 41;
    const Tl = (m) => Math.log10(temp(Math.pow(10, m)));
    const ty0 = Tl(mx1) - 0.5, ty1 = Tl(mx0) + 0.5;
    const X = (m) => pad.l + ((m - mx0) / (mx1 - mx0)) * (w - pad.l - pad.r);
    const Y = (t) => pad.t + (1 - (t - ty0) / (ty1 - ty0)) * (h - pad.t - pad.b);

    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = COL.dim; ctx.strokeStyle = COL.line;
    for (let t = -10; t <= 15; t += 5) {
      ctx.beginPath(); ctx.moveTo(pad.l, Y(t)); ctx.lineTo(w - pad.r, Y(t)); ctx.stroke();
      ctx.textAlign = 'right'; ctx.fillText('10' + sup(t), pad.l - 6, Y(t) + 3);
    }
    for (let m = 10; m <= 40; m += 10) { ctx.textAlign = 'center'; ctx.fillText('10' + sup(m) + ' kg', X(m), h - 7); }

    const cmb = Math.log10(T_CMB);
    ctx.strokeStyle = COL.ion; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(pad.l, Y(cmb)); ctx.lineTo(w - pad.r, Y(cmb)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = COL.ion; ctx.textAlign = 'left'; ctx.fillText('pozadinsko zračenje 2,7 K', pad.l + 6, Y(cmb) - 5);

    ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(X(mx0), Y(Tl(mx0))); ctx.lineTo(X(mx1), Y(Tl(mx1))); ctx.stroke();
    const m = +slider.value;
    ctx.fillStyle = COL.ember; ctx.beginPath(); ctx.arc(X(m), Y(Tl(m)), 5, 0, 7); ctx.fill();
  }

  slider.addEventListener('input', update);
  $('hkPresets').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    slider.value = Math.log10(+b.dataset.kg);
    update();
  });
  onResize(update);
  update();
}

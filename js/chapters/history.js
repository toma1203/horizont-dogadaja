// Poglavlje VII — tablica poznatih crnih rupa i ilustrativni "chirp" gravitacijskog vala.
import { $, G, C, MSUN, COL, sci, len, fitCanvas, addAnim, reduceMotion } from '../util.js';

const KNOWN = [
  ['Ostatak GW150914', 62, '≈ 1,3 milijarde sv. god.'],
  ['Cygnus X-1', 21.2, '≈ 7 200 sv. god.'],
  ['Sgr A*', 4.3e6, '≈ 26 700 sv. god.'],
  ['M87*', 6.5e9, '≈ 53 milijuna sv. god.'],
];

export function initHistory() {
  $('bhTable').innerHTML = KNOWN.map(([n, m, d]) =>
    `<tr><td>${n}</td><td class="num">${sci(m)}</td><td class="num">${len((2 * G * m * MSUN) / (C * C))}</td><td>${d}</td></tr>`
  ).join('');

  const cv = $('gwCanvas');
  addAnim(cv, (t) => {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    const cy = h / 2;
    ctx.strokeStyle = COL.line; ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();

    const T = 4.0;                                         // trenutak spajanja (s, ilustrativno)
    const tm = reduceMotion ? T * 0.98 : t % (T + 1.2);    // dokle je signal "stigao"
    ctx.lineWidth = 1.6; ctx.strokeStyle = COL.accent; ctx.beginPath();
    for (let i = 0; i <= w; i++) {
      const tt = (i / w) * (T + 0.6);
      if (tt > tm) break;
      let y;
      if (tt < T) {
        // Inspiral: faza ∝ τ^(5/8), amplituda ∝ τ^(−1/4) (Newtonov kvadrupolni red)
        const tau = Math.max(T - tt, 0.004);
        y = Math.pow(tau, -0.25) * 0.22 * Math.cos(-2 * Math.pow(tau, 0.625) * 28);
      } else {
        // Ringdown: prigušena sinusoida
        const d = tt - T;
        y = Math.pow(0.004, -0.25) * 0.22 * Math.exp(-d * 14) * Math.cos(d * 95);
      }
      y = Math.max(-1, Math.min(1, y * 0.5));
      i ? ctx.lineTo(i, cy - y * h * 0.42) : ctx.moveTo(i, cy - y * h * 0.42);
    }
    ctx.stroke();
    ctx.font = '10px "Geist Mono", monospace'; ctx.fillStyle = COL.dim;
    ctx.textAlign = 'left'; ctx.fillText('naprezanje h(t)', 8, 14);
    ctx.textAlign = 'right'; ctx.fillText('spajanje', (w * T) / (T + 0.6) - 4, h - 8);
  });
}

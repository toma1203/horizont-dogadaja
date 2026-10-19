// Poglavlje I — Schwarzschildov polumjer, sjena i prosječna gustoća.
import { $, G, C, MSUN, AU, COL, sci, len, loc, fitCanvas, onResize, paintRange } from '../util.js';

const REFS = [
  { n: 'grašak', r: 0.004 },
  { n: 'nogometno igralište', r: 52 },
  { n: 'Zagreb', r: 15000 },
  { n: 'Zemlja', r: 6.371e6 },
  { n: 'Sunce', r: 6.96e8 },
  { n: 'Zemljina orbita', r: AU },
  { n: 'Neptunova orbita', r: 30 * AU },
  { n: 'Sunčev sustav (heliopauza)', r: 120 * AU },
];

export function initRadius() {
  const slider = $('mSlider');
  const cv = $('rsCanvas');

  function draw() {
    const Msun = Math.pow(10, +slider.value);
    const M = Msun * MSUN;
    const rs = 2 * G * M / (C * C);

    $('mOut').textContent = sci(Msun) + ' M☉';
    $('rsR').textContent = len(rs);
    $('rsShadow').textContent = len(rs * Math.sqrt(27)); // promjer sjene = 2 · (√27/2) Rs
    const rho = 3 * Math.pow(C, 6) / (32 * Math.PI * G ** 3 * M * M);
    $('rsRho').textContent = sci(rho) + ' kg/m³';

    let best = REFS[0];
    for (const r of REFS) if (r.r <= rs * 1.5) best = r;
    let cmp;
    if (rho < 1.2) cmp = 'Rjeđe od zraka na razini mora';
    else if (rho < 1000) cmp = 'Rjeđe od vode';
    else cmp = `Horizont ≈ ${loc(rs / best.r, 2)}× ${best.n}`;
    $('rsCmp').textContent = cmp;

    document.querySelectorAll('#mPresets button').forEach((b) =>
      b.classList.toggle('on', Math.abs(Math.log10(+b.dataset.m) - +slider.value) < 0.01));

    // Usporedba: horizont (lijevo) i referentni objekt (desno) u istom mjerilu
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    const maxR = Math.max(rs, best.r);
    const scale = Math.min(w * 0.4, h * 0.42) / maxR;
    const cx1 = w * 0.3, cx2 = w * 0.72, cy = h * 0.5;

    ctx.strokeStyle = COL.ion; ctx.lineWidth = 1.2; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.arc(cx2, cy, Math.max(1.5, best.r * scale), 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);

    const R = Math.max(1.5, rs * scale);
    const g = ctx.createRadialGradient(cx1, cy, R * 0.9, cx1, cy, R * 2.2);
    g.addColorStop(0, 'rgba(184,255,92,.55)');
    g.addColorStop(1, 'rgba(184,255,92,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx1, cy, R * 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(cx1, cy, R, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = COL.accent; ctx.lineWidth = 1.5; ctx.stroke();

    ctx.fillStyle = COL.dim; ctx.font = '11px "Geist Mono", monospace'; ctx.textAlign = 'center';
    ctx.fillText('HORIZONT', cx1, h - 10);
    ctx.fillText(best.n.toUpperCase(), cx2, h - 10);
  }

  slider.addEventListener('input', draw);
  $('mPresets').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    slider.value = Math.log10(+b.dataset.m);
    paintRange(slider);
    draw();
  });
  onResize(draw);
  draw();
}

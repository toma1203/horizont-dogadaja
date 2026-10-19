// Poglavlje III — efektivni potencijal i numerički integrirane geodezije masivne čestice.
// Jedinice: G = c = M = 1, horizont na r = 2.
// Orbitna jednadžba (Binet): u'' = 1/L² − u + 3u², gdje je u = 1/r, a ' = d/dφ.
import { $, COL, loc, fitCanvas, addAnim, onResize, reduceMotion } from '../util.js';

const V2 = (r, L) => (1 - 2 / r) * (1 + (L * L) / (r * r));

export function initOrbits() {
  const lSlider = $('lSlider');
  const r0Slider = $('r0Slider');
  const potCv = $('potCanvas');
  const orbCv = $('orbCanvas');

  let path = [];   // [r, φ]
  let k = 0;       // indeks trenutne točke (float)
  let holdT = 0;

  function compute() {
    const L = +lSlider.value, r0 = +r0Slider.value;
    $('lOut').textContent = loc(L, 3);
    $('r0Out').textContent = loc(r0) + ' M';

    // RK4 u varijabli φ; čestica kreće iz mirovanja u radijalnom smjeru (u' = 0) na r0
    let u = 1 / r0, w = 0, phi = 0;
    const h = 0.01;
    const f = (u) => 1 / (L * L) - u + 3 * u * u;
    path = [[r0, 0]];
    let fate = 'bound';
    for (let i = 0; i < 9000; i++) {
      const k1u = w, k1w = f(u);
      const k2u = w + 0.5 * h * k1w, k2w = f(u + 0.5 * h * k1u);
      const k3u = w + 0.5 * h * k2w, k3w = f(u + 0.5 * h * k2u);
      const k4u = w + h * k3w, k4w = f(u + h * k3u);
      u += (h / 6) * (k1u + 2 * k2u + 2 * k3u + k4u);
      w += (h / 6) * (k1w + 2 * k2w + 2 * k3w + k4w);
      phi += h;
      if (u >= 0.5) { path.push([2, phi]); fate = 'plunge'; break; }
      if (u <= 1 / 80) { path.push([80, phi]); fate = 'escape'; break; }
      path.push([1 / u, phi]);
    }
    k = 0;

    const v = $('orbVerdict');
    v.classList.remove('warn');
    const disc = 1 - 12 / (L * L);
    let txt;
    if (fate === 'plunge') {
      txt = disc < 0
        ? 'L je ispod √12: potencijal nema minimum, nijedna orbita nije stabilna. Čestica pada kroz horizont.'
        : 'Čestica ima dovoljno energije da prijeđe vrh potencijala i pada kroz horizont.';
      v.classList.add('warn');
    } else if (fate === 'escape') {
      txt = 'Energija je veća od 1: čestica nije vezana i odlazi u beskonačnost.';
    } else {
      let rmin = 1e9, rmax = 0;
      path.forEach((p) => { rmin = Math.min(rmin, p[0]); rmax = Math.max(rmax, p[0]); });
      const peri = [];
      for (let i = 1; i < path.length - 1; i++) {
        if (path[i][0] < path[i - 1][0] && path[i][0] <= path[i + 1][0]) peri.push(path[i][1]);
      }
      const prec = peri.length > 1 ? ((peri[1] - peri[0]) * 180) / Math.PI - 360 : null;
      txt = `Vezana orbita između ${loc(rmin)} M i ${loc(rmax)} M.` +
        (prec !== null && rmax - rmin > 0.05 ? ` Perihel se pomiče za ${loc(prec)}° po obilasku.` : ' Gotovo kružna orbita.');
    }
    v.textContent = txt;
    drawPotential();
  }

  function drawPotential() {
    const L = +lSlider.value, r0 = +r0Slider.value;
    const { ctx, w, h } = fitCanvas(potCv);
    ctx.clearRect(0, 0, w, h);
    const pad = { l: 40, r: 12, t: 12, b: 26 };
    const rMin = 2, rMax = 40, yMin = 0.84, yMax = 1.12;
    const X = (r) => pad.l + ((r - rMin) / (rMax - rMin)) * (w - pad.l - pad.r);
    const Y = (v) => pad.t + (1 - (v - yMin) / (yMax - yMin)) * (h - pad.t - pad.b);

    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = COL.dim; ctx.strokeStyle = COL.line; ctx.lineWidth = 1;
    [0.9, 1, 1.1].forEach((v) => {
      ctx.beginPath(); ctx.moveTo(pad.l, Y(v)); ctx.lineTo(w - pad.r, Y(v)); ctx.stroke();
      ctx.textAlign = 'right'; ctx.fillText(loc(v, 2), pad.l - 6, Y(v) + 3);
    });
    [2, 6, 10, 20, 30, 40].forEach((r) => { ctx.textAlign = 'center'; ctx.fillText(r, X(r), h - 8); });
    ctx.textAlign = 'left'; ctx.fillText('r / M', w - pad.r - 36, h - 8);

    ctx.strokeStyle = 'rgba(255,173,92,.35)'; ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.moveTo(X(6), pad.t); ctx.lineTo(X(6), h - pad.b); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,173,92,.6)'; ctx.fillText('ISCO', X(6) + 4, pad.t + 10);

    ctx.save();
    ctx.beginPath(); ctx.rect(pad.l, pad.t, w - pad.l - pad.r, h - pad.t - pad.b); ctx.clip();
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.8; ctx.beginPath();
    for (let i = 0; i <= 300; i++) {
      const r = rMin + ((rMax - rMin) * i) / 300;
      const y = Y(V2(r, L));
      i ? ctx.lineTo(X(r), y) : ctx.moveTo(X(r), y);
    }
    ctx.stroke();

    const E2 = V2(r0, L);
    ctx.strokeStyle = COL.ember; ctx.lineWidth = 1.2; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(pad.l, Y(E2)); ctx.lineTo(w - pad.r, Y(E2)); ctx.stroke(); ctx.setLineDash([]);

    const d = 1 - 12 / (L * L);
    if (d >= 0) {
      const rp = ((L * L) / 2) * (1 + Math.sqrt(d)); // minimum (stabilna kružna orbita)
      const rm = ((L * L) / 2) * (1 - Math.sqrt(d)); // maksimum (nestabilna)
      ctx.fillStyle = COL.ion;
      [rp, rm].forEach((r) => { ctx.beginPath(); ctx.arc(X(r), Y(V2(r, L)), 3, 0, 7); ctx.fill(); });
    }

    const cr = path.length ? path[Math.min(path.length - 1, Math.floor(k))][0] : r0;
    ctx.fillStyle = COL.ember; ctx.beginPath(); ctx.arc(X(cr), Y(E2), 4.5, 0, 7); ctx.fill();
    ctx.restore();

    ctx.fillStyle = COL.dim; ctx.textAlign = 'left'; ctx.fillText('V²eff', pad.l + 4, pad.t + 10);
    ctx.fillStyle = COL.ember; ctx.fillText('E²', w - pad.r - 20, Y(E2) - 5);
  }

  function drawOrbit(t, dt) {
    if (!path.length) return;
    const { ctx, w, h } = fitCanvas(orbCv);
    ctx.clearRect(0, 0, w, h);
    let rmax = 0;
    for (const p of path) rmax = Math.max(rmax, p[0]);
    rmax = Math.min(Math.max(rmax, 8), 45);
    const s = (Math.min(w, h) * 0.46) / rmax, cx = w / 2, cy = h / 2;

    ctx.lineWidth = 1;
    [[3, 'rgba(147,201,255,.35)'], [6, 'rgba(255,173,92,.35)']].forEach(([r, c]) => {
      ctx.strokeStyle = c; ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.arc(cx, cy, r * s, 0, 7); ctx.stroke();
    });
    ctx.setLineDash([]);
    const g = ctx.createRadialGradient(cx, cy, 2 * s, cx, cy, 2 * s * 2.2);
    g.addColorStop(0, 'rgba(255,173,92,.35)'); g.addColorStop(1, 'rgba(255,173,92,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 2 * s * 2.2, 0, 7); ctx.fill();
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(cx, cy, 2 * s, 0, 7); ctx.fill();
    ctx.strokeStyle = COL.ember; ctx.stroke();

    // Brzina napredovanja ∝ dφ/dτ = L·u² (približno Keplerov tempo)
    const L = +lSlider.value;
    const idx = Math.min(path.length - 1, Math.floor(k));
    const u = 1 / path[idx][0];
    k += Math.max(0.6, ((L * u * u * 62) / 0.01) * dt * (reduceMotion ? 0.3 : 1));
    if (k >= path.length - 1) {
      k = path.length - 1;
      if (!holdT) holdT = t;
      if (t - holdT > 1.6) { k = 0; holdT = 0; }
    }
    const ki = Math.floor(k);

    ctx.lineWidth = 1.4;
    const start = Math.max(0, ki - 2600);
    for (let i = start + 1; i <= ki; i++) {
      if (i % 3 !== 0 && i !== ki) continue;
      const a = (i - start) / (ki - start + 1);
      const p0 = path[Math.max(start, i - 3)], p1 = path[i];
      ctx.strokeStyle = `rgba(255,173,92,${0.08 + 0.8 * a * a})`;
      ctx.beginPath();
      ctx.moveTo(cx + p0[0] * s * Math.cos(p0[1]), cy - p0[0] * s * Math.sin(p0[1]));
      ctx.lineTo(cx + p1[0] * s * Math.cos(p1[1]), cy - p1[0] * s * Math.sin(p1[1]));
      ctx.stroke();
    }
    const p = path[ki];
    ctx.fillStyle = COL.ink; ctx.beginPath();
    ctx.arc(cx + p[0] * s * Math.cos(p[1]), cy - p[0] * s * Math.sin(p[1]), 4, 0, 7); ctx.fill();
    ctx.font = '10px "JetBrains Mono", monospace'; ctx.fillStyle = COL.dim; ctx.textAlign = 'left';
    ctx.fillText(`r = ${loc(p[0])} M`, 10, 16);

    if (Math.floor(t * 10) % 3 === 0) drawPotential();
  }

  lSlider.addEventListener('input', compute);
  r0Slider.addEventListener('input', compute);
  addAnim(orbCv, drawOrbit);
  onResize(drawPotential);
  compute();
}

// Zajedničke konstante, formatiranje brojeva (hr-HR) i pomoćne funkcije za canvas/animaciju.

export const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Fizikalne konstante (SI)
export const G = 6.674e-11;
export const C = 2.998e8;
export const MSUN = 1.989e30;
export const HBAR = 1.0546e-34;
export const KB = 1.381e-23;
export const YEAR = 3.156e7;
export const AU = 1.496e11;
export const LY = 9.461e15;

// Boje za crtanje na canvasu (usklađene s tokenima u css/style.css)
export const COL = {
  ink: '#ebe6dc', dim: '#8e94a6', line: '#1c2130',
  ember: '#ffad5c', ion: '#93c9ff', void: '#05060b',
};

export const $ = (id) => document.getElementById(id);

const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
export const sup = (n) => String(n).split('').map((ch) => SUP[ch] || ch).join('');

export const loc = (x, d = 3) => x.toLocaleString('hr-HR', { maximumSignificantDigits: d });

/** Znanstveni zapis s hrvatskim decimalnim zarezom: 1,23 × 10⁶ */
export function sci(x, d = 3) {
  if (!isFinite(x)) return '∞';
  if (x === 0) return '0';
  const e = Math.floor(Math.log10(Math.abs(x)));
  if (e >= -2 && e < 6) return loc(x, d);
  return loc(x / Math.pow(10, e), d) + ' × 10' + sup(e);
}

/** Duljina u metrima → čitljiv zapis (mm, m, km, AJ, sv. god.) */
export function len(m) {
  if (m < 1e-3) return sci(m * 1000) + ' mm';
  if (m < 1) return loc(m * 1000) + ' mm';
  if (m < 1000) return loc(m) + ' m';
  if (m < 0.05 * AU) return sci(m / 1000) + ' km';
  if (m < 0.05 * LY) return sci(m / AU) + ' AJ';
  return sci(m / LY) + ' sv. god.';
}

/** Trajanje u sekundama → čitljiv zapis */
export function dur(s) {
  const y = s / YEAR;
  if (s < 1) return sci(s) + ' s';
  if (s < 3600) return loc(s) + ' s';
  if (s < 86400 * 2) return loc(s / 3600) + ' h';
  if (y < 1) return loc(s / 86400) + ' dana';
  return sci(y) + ' god.';
}

/** Prilagođava canvas širini elementa i DPR-u; visina dolazi iz atributa height. */
export function fitCanvas(cv) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = cv.clientWidth;
  const h = +cv.getAttribute('height');
  cv.style.height = h + 'px';
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
  }
  const ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}

/* ---------- Jedna petlja animacije; svaka animacija radi samo dok je vidljiva ---------- */
const anims = [];
export function addAnim(el, fn) {
  const a = { el, fn, vis: false };
  anims.push(a);
  new IntersectionObserver((es) => { a.vis = es[0].isIntersecting; }, { rootMargin: '100px' }).observe(el);
}

let lastT = performance.now();
function loop(t) {
  const dt = Math.min(0.05, (t - lastT) / 1000);
  lastT = t;
  for (const a of anims) if (a.vis) a.fn(t / 1000, dt);
  requestAnimationFrame(loop);
}
export function startLoop() { requestAnimationFrame(loop); }

/* ---------- Ponovno crtanje statičkih grafova pri promjeni veličine ---------- */
const resizers = [];
export function onResize(fn) { resizers.push(fn); }
let rT;
addEventListener('resize', () => {
  clearTimeout(rT);
  rT = setTimeout(() => resizers.forEach((f) => f()), 120);
});

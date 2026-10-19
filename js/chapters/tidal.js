// Poglavlje V — plimne sile i špagetifikacija: Δa ≈ 2GMℓ / r³.
import { $, G, C, MSUN, sci, len } from '../util.js';

const BODY_LENGTH = 2;           // m
const LETHAL = 10 * 9.81;        // ilustrativni prag: 10 g razlike glava–stopala

export function initTidal() {
  const slider = $('tdSlider');

  function update() {
    const Ms = Math.pow(10, +slider.value);
    const M = Ms * MSUN;
    const rs = (2 * G * M) / (C * C);
    const aH = (2 * G * M * BODY_LENGTH) / Math.pow(rs, 3);
    const rT = Math.cbrt((2 * G * M * BODY_LENGTH) / LETHAL);

    $('tdOut').textContent = sci(Ms) + ' M☉';
    $('tdHor').textContent = sci(aH / 9.81) + ' g';
    $('tdSpag').textContent = len(rT) + ' od središta';
    $('tdRs').textContent = len(rs) + ' od središta';

    const v = $('tdVerdict');
    if (rT > rs) {
      v.classList.add('warn');
      v.textContent = `Rastezanje postaje smrtonosno ${len(rT - rs)} prije horizonta. Netko izvana mogao bi vidjeti kako se to događa.`;
    } else {
      v.classList.remove('warn');
      v.textContent = `Horizont prelaziš neozlijeđen. Plimna razlika tamo je samo ${sci(aH / 9.81)} g. Rastezanje te čeka unutra, gdje ga nitko izvana ne može vidjeti.`;
    }

    // Figura: rastegnuta uzduž, stisnuta poprijeko (očuvanje volumena ~ 1/√st)
    const st = Math.min(3.2, 1 + Math.max(0, Math.log10(aH / 9.81 + 1)) * 0.28);
    const sq = 1 / Math.sqrt(st);
    $('bodyE').setAttribute('ry', 44 * st * 0.85);
    $('bodyE').setAttribute('rx', 14 * sq);
    $('bodyH').setAttribute('cy', -44 * st * 0.85 - 9 * Math.min(st, 1.6));
    $('bodyH').setAttribute('r', 9 * Math.max(0.55, sq));
    const H = 44 * st * 0.85 + 9 * Math.min(st, 1.6) + 9;
    $('bodyG').setAttribute('transform', `translate(60 ${Math.max(110, H + 6)}) scale(${Math.min(1, 104 / H)})`);
  }

  slider.addEventListener('input', update);
  update();
}

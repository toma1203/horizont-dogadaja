// Poglavlje II — karakteristični polumjeri (SVG u index.html, ovdje interakcija).
import { $, addAnim, reduceMotion } from '../util.js';

const ZONES = [
  { id: 'r-sing', n: 'Singularnost', r: 'r = 0', d: 'Prema općoj relativnosti sva masa završava u točki beskonačne gustoće. To vjerojatno znači da teorija ovdje prestaje vrijediti, a ne da je priroda doista beskonačna. Opis zahtijeva kvantnu gravitaciju.' },
  { id: 'r-horizon', n: 'Horizont događaja', r: '1 Rs', d: 'Granica bez povratka. Nije materijalna površina; padajući promatrač ne bi primijetio ništa lokalno. Unutar nje sve budućnosti vode prema singularnosti: prostor i vrijeme mijenjaju uloge.' },
  { id: 'r-photon', n: 'Fotonska sfera', r: '1,5 Rs', d: 'Na toj udaljenosti svjetlost može kružiti oko crne rupe. Orbita je nestabilna: najmanji poremećaj šalje foton unutra ili van. Odatle dolazi tanki fotonski prsten na slikama.' },
  { id: 'r-shadow', n: 'Rub sjene', r: '≈ 2,6 Rs', d: 'Prividni polumjer sjene je √27/2 · Rs. Svaka zraka usmjerena prema crnoj rupi s manjim parametrom sudara bit će uhvaćena. Upravo tu veličinu mjeri Event Horizon Telescope.' },
  { id: 'r-isco', n: 'ISCO', r: '3 Rs', d: 'Najmanja stabilna kružna orbita (Innermost Stable Circular Orbit). Ispod nje materija ne može stabilno kružiti i brzo pada unutra. Ovdje je unutarnji rub akrecijskog diska.' },
  { id: 'r-disk', n: 'Akrecijski disk', r: '3 Rs – stotine Rs', d: 'Plin koji spiralno pada trenjem se zagrijava do milijuna kelvina i zrači u X-području. Pretvara do 6 % mase mirovanja u energiju kod nerotirajuće rupe, do 42 % kod brzo rotirajuće, puno više od nuklearne fuzije (0,7 %).' },
];

export function initAnatomy() {
  const list = $('anatList');

  function select(i) {
    ZONES.forEach((z, j) => {
      list.children[j].firstChild.setAttribute('aria-pressed', i === j);
      const el = $(z.id);
      if (el.classList.contains('ring')) el.classList.toggle('on', i === j);
    });
    $('r-sing').setAttribute('r', i === 0 ? 5 : 2.5);
    $('anatDesc').innerHTML = `<span class="label">${ZONES[i].r}</span><h3>${ZONES[i].n}</h3><p>${ZONES[i].d}</p>`;
  }

  ZONES.forEach((z, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.innerHTML = `<span>${z.n}</span><span>${z.r}</span>`;
    b.addEventListener('click', () => select(i));
    li.appendChild(b);
    list.appendChild(li);
  });
  select(1);

  // Foton koji kruži po fotonskoj sferi + polagana rotacija diska
  const dot = $('photonDot');
  const disk = $('aDisk');
  let a = 0;
  addAnim(document.querySelector('.anat'), (t, dt) => {
    a += dt * (reduceMotion ? 0.3 : 1.4);
    dot.setAttribute('transform', `translate(${260 + 48 * Math.cos(a)} ${260 + 48 * Math.sin(a)})`);
    disk.setAttribute('transform', `rotate(${(t * 8) % 360} 260 260)`);
  });
}

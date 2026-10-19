// Ulazna točka: inicijalizira simulaciju i sva poglavlja, zatim pokreće zajedničku petlju animacije.
import { startLoop } from './util.js';
import { initBlackHole } from './blackhole/renderer.js';
import { initRadius } from './chapters/radius.js';
import { initAnatomy } from './chapters/anatomy.js';
import { initOrbits } from './chapters/orbits.js';
import { initTime } from './chapters/time.js';
import { initTidal } from './chapters/tidal.js';
import { initHawking } from './chapters/hawking.js';
import { initHistory } from './chapters/history.js';
import { initNav } from './nav.js';

initBlackHole();
initRadius();
initAnatomy();
initOrbits();
initTime();
initTidal();
initHawking();
initHistory();
initNav();
startLoop();

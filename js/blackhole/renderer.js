// WebGL renderer za hero simulaciju: kamera, kontrole, adaptivna rezolucija.
import { VERTEX_SHADER, FRAGMENT_SHADER } from './shaders.js';
import { $, loc, addAnim, reduceMotion } from '../util.js';

export function initBlackHole() {
  const stage = $('stage');
  const cv = $('gl');
  const gl = cv.getContext('webgl', { antialias: false, preserveDrawingBuffer: false, powerPreference: 'high-performance' });

  // Stanje simulacije (udaljenost u Rs, kutovi u stupnjevima / radijanima)
  const S = { dist: 22, inc: 9, yaw: -1.25, bright: 1, disk: true, dop: true, rot: !reduceMotion, scale: 0.75 };

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s)); return null; }
    return s;
  };

  let prog = null;
  const U = {};
  if (gl) {
    const v = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
    const f = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (v && f) {
      prog = gl.createProgram();
      gl.attachShader(prog, v);
      gl.attachShader(prog, f);
      gl.linkProgram(prog);
      gl.useProgram(prog);
      const b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const attr = gl.getAttribLocation(prog, 'p');
      gl.enableVertexAttribArray(attr);
      gl.vertexAttribPointer(attr, 2, gl.FLOAT, false, 0, 0);
      ['uRes', 'uTime', 'uPos', 'uFwd', 'uRight', 'uUp', 'uDisk', 'uDop', 'uBright', 'uOuter']
        .forEach((n) => { U[n] = gl.getUniformLocation(prog, n); });
    }
  }
  if (!prog) {
    const d = document.createElement('div');
    d.className = 'nogl';
    d.textContent = 'Tvoj preglednik ne podržava WebGL, pa se simulacija ne može prikazati. Ostala poglavlja rade normalno.';
    stage.appendChild(d);
  }

  let simTime = 0, frames = 0, ftAcc = 0;

  function render(t, dt) {
    if (!prog) return;
    if (S.rot) S.yaw += dt * 0.06;
    simTime += dt * (reduceMotion ? 0.2 : 1);

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const W = Math.max(2, Math.round(stage.clientWidth * dpr * S.scale));
    const H = Math.max(2, Math.round(stage.clientHeight * dpr * S.scale));
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }

    // Kamera na sferi oko crne rupe, gleda u ishodište
    const p = S.inc * Math.PI / 180;
    const pos = [S.dist * Math.cos(p) * Math.cos(S.yaw), S.dist * Math.sin(p), S.dist * Math.cos(p) * Math.sin(S.yaw)];
    const L = Math.hypot(...pos);
    const fw = pos.map((x) => -x / L);
    let rt = [-fw[2], 0, fw[0]]; // fw × (0,1,0)
    const rl = Math.hypot(...rt);
    rt = rt.map((x) => x / rl);
    const up = [rt[1] * fw[2] - rt[2] * fw[1], rt[2] * fw[0] - rt[0] * fw[2], rt[0] * fw[1] - rt[1] * fw[0]];

    gl.viewport(0, 0, W, H);
    gl.uniform2f(U.uRes, W, H);
    gl.uniform1f(U.uTime, simTime);
    gl.uniform3fv(U.uPos, pos);
    gl.uniform3fv(U.uFwd, fw);
    gl.uniform3fv(U.uRight, rt);
    gl.uniform3fv(U.uUp, up);
    gl.uniform1f(U.uDisk, S.disk ? 1 : 0);
    gl.uniform1f(U.uDop, S.dop ? 1 : 0);
    gl.uniform1f(U.uBright, S.bright);
    gl.uniform1f(U.uOuter, 14.0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // Adaptivna rezolucija: cilj ~30–55 fps
    frames++; ftAcc += dt;
    if (frames >= 24) {
      const ms = ftAcc / frames * 1000;
      frames = 0; ftAcc = 0;
      if (ms > 30 && S.scale > 0.4) S.scale = Math.max(0.4, S.scale * 0.85);
      else if (ms < 18 && S.scale < 1) S.scale = Math.min(1, S.scale * 1.08);
    }
  }
  addAnim(stage, render);

  /* ---------- Kontrole ---------- */
  const hud = $('hud');
  const updHud = () => {
    hud.textContent = `r = ${loc(S.dist)} Rs · nagib ${Math.round(S.inc)}° · ${S.dop ? 'Doppler uključen' : 'bez Dopplera'}`;
  };

  function bindRange(id, out, fmt, cb) {
    const el = $(id);
    const f = () => { const v = +el.value; $(out).textContent = fmt(v); cb(v); updHud(); };
    el.addEventListener('input', f);
    f();
    return el;
  }
  const cDist = bindRange('cDist', 'oDist', (v) => loc(v) + ' Rs', (v) => { S.dist = v; });
  const cInc = bindRange('cInc', 'oInc', (v) => Math.round(v) + '°', (v) => { S.inc = v; });
  bindRange('cBright', 'oBright', (v) => loc(v, 2) + '×', (v) => { S.bright = v; });

  function bindToggle(id, key) {
    const b = $(id);
    b.setAttribute('aria-pressed', S[key]);
    b.addEventListener('click', () => { S[key] = !S[key]; b.setAttribute('aria-pressed', S[key]); updHud(); });
  }
  bindToggle('tDisk', 'disk');
  bindToggle('tDop', 'dop');
  bindToggle('tRot', 'rot');

  // Povlačenje mišem / prstom i kotačić za zoom
  let drag = null;
  stage.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY }; stage.setPointerCapture(e.pointerId); });
  stage.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag = { x: e.clientX, y: e.clientY };
    S.yaw -= dx * 0.006;
    S.inc = Math.max(-80, Math.min(80, S.inc + dy * 0.25));
    cInc.value = S.inc;
    $('oInc').textContent = Math.round(S.inc) + '°';
    updHud();
  });
  stage.addEventListener('pointerup', () => { drag = null; });
  stage.addEventListener('pointercancel', () => { drag = null; });
  stage.addEventListener('wheel', (e) => {
    e.preventDefault();
    S.dist = Math.max(6, Math.min(45, S.dist * (1 + e.deltaY * 0.001)));
    cDist.value = S.dist;
    $('oDist').textContent = loc(S.dist) + ' Rs';
    updHud();
  }, { passive: false });

  updHud();
}

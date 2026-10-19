# Horizont događaja — kontekst za Claude Code

Edukativna web aplikacija na **hrvatskom jeziku** koja približava fiziku crnih rupa kroz kvalitetnu grafiku i interaktivne instrumente. Projekt je nastao u Claude chatu (prva verzija bila je jedan HTML artifact) i ovdje je razdvojen u module.

## Pokretanje
Statički site, bez build koraka. ES moduli ne rade preko `file://`, zato treba lokalni server:
```
python -m http.server 8766
```
pa otvori http://localhost:8766. Ako `.claude/launch.json` ne postoji, napravi ga (python -m http.server 8766, port 8766), po uzoru na `projekt 1`.

## Struktura
```
index.html               markup svih poglavlja (SVG dijagrami su inline)
css/style.css            dizajn tokeni na :root, sav stil
js/main.js               ulaz, poziva init*() svakog modula
js/util.js               konstante (SI), formatiranje hr-HR (sci, len, dur), fitCanvas, addAnim, onResize
js/nav.js                isticanje aktivnog poglavlja u navigaciji
js/blackhole/shaders.js  GLSL: raytracing geodezija fotona u Schwarzschildovoj metrici
js/blackhole/renderer.js WebGL setup, kamera, kontrole, adaptivna rezolucija
js/chapters/*.js         po jedan modul za poglavlja I–VII
```

## Poglavlja (stanje)
- **Hero** — WebGL raytracer: sjena, fotonski prsten, lećenje diska, Doppler + gravitacijski crveni pomak, Shakura–Sunjajev temperaturni profil, zvjezdano nebo. Jedinice Rs = 1, disk 3–14 Rs.
- **I Polumjer** — Rs = 2GM/c², promjer sjene √27·Rs, prosječna gustoća.
- **II Anatomija** — singularnost, horizont, fotonska sfera, rub sjene, ISCO, disk.
- **III Orbite** — V²eff, RK4 integracija Binetove jednadžbe u'' = 1/L² − u + 3u² (G=c=M=1), precesija.
- **IV Vrijeme** — dτ/dt = √(1 − Rs/r), dva sata.
- **V Plima** — Δa ≈ 2GMℓ/r³, špagetifikacija.
- **VI Hawking** — temperatura, vrijeme isparavanja, usporedba s CMB.
- **VII Povijest** — vremenska crta 1783–2022, tablica, ilustrativni chirp signal.

## Dizajn
- Jedan namjerno taman izgled (bez svijetle teme): `--void #05060b`, `--panel`, `--line`, `--ink #ebe6dc`, `--dim`, `--ember #ffad5c` (akcent), `--ion #93c9ff` (sekundarni).
- Fontovi: Bodoni Moda (naslovi, rimski brojevi poglavlja, kurziv), Figtree (tekst), JetBrains Mono (oznake, brojevi).
- Svako poglavlje: lijevo teorija (`.prose`, formule u `.eq`), desno instrument (`.inst`) s klizačima, canvasom i očitanjima (`.readouts`).
- Brojevi uvijek kroz `sci()` / `len()` / `dur()` iz util.js (decimalni zarez, ×10ⁿ).
- Animacije idu kroz `addAnim(el, fn)` (rade samo dok je element vidljiv) i poštuju `reduceMotion`.
- Mora raditi na mobitelu (~400 px) bez horizontalnog scrolla.

## Sljedeći korak: poglavlja prema intervjuima Briana Coxa
Korisnik želi dodati vizualizacije koncepata o kojima Brian Cox govori u intervjuima i u knjizi *Black Holes: The Key to Understanding the Universe* (Cox & Forshaw). Dogovoreni prijedlog:

**Blok A: Vrijeme i geometrija**
1. *Sat mjeri duljinu puta.* Prostor-vrijeme dijagram s dva događaja. Korisnik crta putanju, sat se puni prema vlastitom vremenu (paradoks blizanaca).
2. *Sat pada u crnu rupu.* Podijeljeni ekran: izvana se sat usporava, crveni i "smrzava" na horizontu; padajući promatrač vidi normalno kucanje.
3. *Penroseov dijagram.* Interaktivni svjetlosni konusi koji se iza horizonta naginju prema singularnosti; animacija kolapsa zvijezde.

**Blok B: Informacija**
4. *Entropija = površina.* Horizont popločan Planckovim "pikselima" (bitovima), ubačeni objekt povećava površinu.
5. *Hawkingovo zračenje i paradoks informacije.* Parovi čestica s nitima isprepletenosti, crna rupa se skuplja, uživo se crta **Pageova krivulja** s prekidačem "Hawking 1974" i "otoci 2019".
6. *Holografski princip.* Hiperbolični (Poincaréov) disk, odabir luka na rubu iscrtava Ryu–Takayanagi geodeziju; brisanje dijela ruba pokazuje kvantnu korekciju pogrešaka (HaPPY kod).
7. *Prostor iz isprepletenosti.* Mreža čvorova se rasteže i kida kad se isprepletenost smanji (ER = EPR ideja).
8. *Komplementarnost i vatreni zid (AMPS).*
9. *Kraj vremena.* Satovi kao termodinamički strojevi staju dok se svemir hladi prema jednolikoj temperaturi.

Za nova poglavlja zadrži isti obrazac (`js/chapters/<ime>.js` s `export function init…()`, markup u index.html, unos u nav).

## Konvencije
- Sav korisnički tekst je na hrvatskom, prirodan i izravan.
- Fizika mora biti točna; ilustrativna pojednostavljenja označi u `.note`.
- Bez frameworka i bez build alata, osim ako korisnik ne zatraži drugačije.

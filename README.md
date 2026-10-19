# Horizont događaja

Interaktivni vodič kroz fiziku crnih rupa, na hrvatskom jeziku.

- **Simulacija u stvarnom vremenu.** WebGL raytracer prati zrake svjetlosti kroz zakrivljeni prostor-vrijeme oko Schwarzschildove crne rupe: sjena, fotonski prsten, gravitacijska leća, Dopplerov efekt na akrecijskom disku.
- **Sedam poglavlja:** Schwarzschildov polumjer, anatomija crne rupe, orbite i efektivni potencijal, dilatacija vremena, plimne sile, Hawkingovo zračenje, povijest otkrića.

## Pokretanje

```bash
python -m http.server 8766
```

Otvori <http://localhost:8766>. Lokalni server je potreban jer preglednik ne učitava ES module preko `file://`.

## Tehnologija

Čisti HTML, CSS i JavaScript (ES moduli), WebGL 1 i Canvas 2D. Nema ovisnosti ni build koraka. Fontovi se učitavaju s Google Fontsa.

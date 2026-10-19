"""Upisuje verziju (hash sadržaja) uz svaku CSS/JS datoteku u index.html.

GitHub Pages sve datoteke šalje s Cache-Control: max-age=600, pa bi preglednik
nakon deploya mogao pomiješati staru i novu verziju modula. Kad se sadržaj
datoteke promijeni, promijeni se i njezin URL (?v=…), pa je preglednik mora
ponovno dohvatiti. JS moduli se međusobno uvoze relativnim putanjama, zato se
njihove verzije zadaju kroz <script type="importmap">.

Pokreni prije svakog commita:  python tools/verzija.py
"""
import hashlib
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
INDEX = ROOT / 'index.html'


def ver(path: pathlib.Path) -> str:
    # Normaliziraj kraj reda da hash ne ovisi o git autocrlf postavkama.
    return hashlib.sha1(path.read_bytes().replace(b'\r\n', b'\n')).hexdigest()[:8]


def main() -> None:
    html = INDEX.read_text(encoding='utf-8')

    css = ROOT / 'css' / 'style.css'
    html, n = re.subn(r'href="css/style\.css(\?v=\w+)?"', f'href="css/style.css?v={ver(css)}"', html)
    assert n == 1, 'link na css/style.css nije pronađen'

    mods = sorted(p.relative_to(ROOT).as_posix() for p in (ROOT / 'js').rglob('*.js'))
    imports = {f'./{m}': f'./{m}?v={ver(ROOT / m)}' for m in mods}
    block = ('<script type="importmap">\n'
             + json.dumps({'imports': imports}, indent=2, ensure_ascii=False)
             + '\n</script>')
    if '<script type="importmap">' in html:
        html = re.sub(r'<script type="importmap">.*?</script>', lambda _: block, html, flags=re.S)
    else:
        html = html.replace('<script type="module"', block + '\n<script type="module"', 1)

    html, n = re.subn(r'src="js/main\.js(\?v=\w+)?"', f'src="{imports["./js/main.js"][2:]}"', html)
    assert n == 1, 'script js/main.js nije pronađen'

    INDEX.write_text(html, encoding='utf-8', newline='\n')
    print(f'Verzije upisane: style.css + {len(mods)} JS modula')


if __name__ == '__main__':
    main()

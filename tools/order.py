"""Ders sirasini tek yerden yonetir ve dort dosyaya da uygular.

Sira: Dersler (Turkce -> Tarih -> Cografya -> Vatandaslik)
     + Denemeler (Turkce Testleri -> Turkce Cikmis Sorular -> KPSS Tam Deneme)

Dokunulan dosyalar:
  - galeri.html       : LIBRARY dizisi (uygulamanin kullandigi sira, ilk ders acilis dersi)
  - oku.html          : LIBRARY dizisi (kitap modu okuma sirasi, ilk ders acilis dersi)
  - manifest.json     : ders listesi
  - tools/render.py   : SUBJECTS listesi (yeniden uretimde sira bozulmasin)

Kullanim: python tools/order.py
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HERE = os.path.dirname(os.path.abspath(__file__))

ORDER = ["turkce", "tarih", "cografya", "vatandaslik", "turkce-test", "turkce-cikmis", "deneme"]


def read_text(path):
    """Metni okur, satir sonunu korumak icin EOL bilgisini de dondurur."""
    with open(path, encoding="utf-8", newline="") as f:
        raw = f.read()
    eol = "\r\n" if "\r\n" in raw else "\n"
    return raw.replace("\r\n", "\n"), eol


def write_text(path, text, eol):
    if eol != "\n":
        text = text.replace("\n", eol)
    with open(path, "w", encoding="utf-8", newline="") as f:
        f.write(text)


def rank(key):
    return ORDER.index(key) if key in ORDER else len(ORDER)


def ordered(blocks):
    """Bloklari ORDER'a gore dizer; bilinmeyen anahtarlar sona duser."""
    keys = [re.search(r"key['\"]?\s*[:=]\s*['\"]([a-z-]+)['\"]", b).group(1) for b in blocks]
    pairs = sorted(zip(keys, blocks), key=lambda p: rank(p[0]))
    sonuc = [k for k, _ in pairs]
    if sonuc != sorted(sonuc, key=rank):
        raise SystemExit("siralama uygulanamadi")
    return [b for _, b in pairs]


def fix_library_in_html(name):
    path = os.path.join(ROOT, name)
    text, eol = read_text(path)
    m = re.search(r"(const LIBRARY = \[)(.*?)(\n\];)", text, re.S)
    if not m:
        raise SystemExit(f"{name} icinde LIBRARY bulunamadi")
    body = m.group(2)
    lines = body.split("\n")
    entries = [l.rstrip() for l in lines if l.strip().startswith("{")]
    if len(entries) != len(ORDER):
        raise SystemExit(f"{name} LIBRARY icinde {len(entries)} kayit var, {len(ORDER)} bekleniyordu")
    # virgulleri yeniden dagit: sonda virgul olmaz (JSON/JS dizisi kurali)
    entries = [re.sub(r",$", "", e) for e in entries]
    entries = [e + "," for e in entries[:-1]] + [entries[-1]]
    yeni = "\n" + "\n".join(ordered(entries))
    text = text[:m.start(2)] + yeni + text[m.end(2):]
    write_text(path, text, eol)
    print(f"{name} LIBRARY sirasi:",
          [re.search(r"key: '([a-z-]+)'", b).group(1) for b in ordered(entries)])


def fix_manifest():
    path = os.path.join(ROOT, "manifest.json")
    with open(path, encoding="utf-8") as f:
        items = json.load(f)
    items.sort(key=lambda s: rank(s["key"]))
    with open(path, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print("manifest.json sirasi:", [s["key"] for s in items])


def fix_render_py():
    path = os.path.join(HERE, "render.py")
    text, eol = read_text(path)
    m = re.search(r"(SUBJECTS = \[)(.*?)(\n\])", text, re.S)
    if not m:
        raise SystemExit("render.py icinde SUBJECTS bulunamadi")
    blocks = re.findall(r"\n    \{.*?\n    \},?", m.group(2), re.S)
    if len(blocks) != len(ORDER):
        raise SystemExit(f"SUBJECTS icinde {len(blocks)} kayit var, {len(ORDER)} bekleniyordu")
    yeni = "".join(ordered(blocks))
    text = text[:m.start(2)] + yeni + text[m.end(2):]
    write_text(path, text, eol)
    print("render.py SUBJECTS sirasi:",
          [re.search(r'"key": "([a-z-]+)"', b).group(1) for b in ordered(blocks)])


if __name__ == "__main__":
    fix_library_in_html("galeri.html")
    fix_library_in_html("oku.html")
    fix_manifest()
    fix_render_py()
    print("sira uygulandi:", " -> ".join(ORDER))

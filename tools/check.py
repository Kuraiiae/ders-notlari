"""index.html (tanim sayfasi), galeri.html ve oku.html icindeki script'leri
ayiklar (soz dizimi kontrolu icin) ve manifestteki tum sayfa gorsellerinin
(orijinal + temizlenmis) var oldugunu dogrular.

index.html script icermez (statik tanitim sayfasi) -> yalnizca baglanti kontrolu.
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HERE = os.path.dirname(os.path.abspath(__file__))

STATIC = {"index.html"}

for name, out in (("index.html", None), ("galeri.html", "app.js"), ("oku.html", "oku.js")):
    with open(os.path.join(ROOT, name), encoding="utf-8") as f:
        html = f.read()
    if name in STATIC:
        links = ("oku.html" in html and "galeri.html" in html
                 and "oku.html?ders=turkce" in html and "oku.html?ders=vatandaslik" in html
                 and "turkce-ozet.html" in html
                 and "assets/turkce/clean/page-001.jpg" in html)
        print(name, "| chars:", len(html), "| statik: True | ders-linkleri:", links)
        assert links, f"{name} icinde ders baglantilari eksik"
        continue
    m = re.search(r"<script>(.*?)</script>", html, re.S)
    assert m, f"script blogu bulunamadi: {name}"
    with open(os.path.join(HERE, out), "w", encoding="utf-8") as f:
        f.write(m.group(1))
    leftover = "__MANIFEST__" in html or "<!--SCRIPT" in html
    link_ok = True
    if name == "galeri.html":
        link_ok = "oku.html" in html
    if name == "oku.html":
        link_ok = "index.html" in html and "galeri.html" in html
    print(name, "| chars:", len(html), "| placeholder:", leftover, "| capraz-link:", link_ok)

with open(os.path.join(ROOT, "manifest.json"), encoding="utf-8") as f:
    manifest = json.load(f)

missing = []
for s in manifest:
    for n in range(1, s["pages"] + 1):
        for rel in (f"assets/{s['key']}/page-{n:03d}.jpg",
                    f"assets/{s['key']}/thumbs/page-{n:03d}.jpg",
                    f"assets/{s['key']}/clean/page-{n:03d}.jpg"):
            if not os.path.exists(os.path.join(ROOT, rel.replace("/", os.sep))):
                missing.append(rel)

print("eksik dosya:", len(missing))
for x in missing[:20]:
    print("  -", x)
print("dersler:", [(s["key"], s["pages"]) for s in manifest])

# --- Konu ozeti: turkce-ozet.html + oku.html icindeki gomulu JSON ---
with open(os.path.join(ROOT, "oku.html"), encoding="utf-8") as f:
    oku = f.read()
mb = re.search(r"OZET-DATA-BEGIN -->\s*<script[^>]*id=\"ozetData\">(.*?)</script>\s*<!-- OZET-DATA-END",
               oku, re.S)
assert mb, "oku.html icinde ozetData script blogu yok -> python tools/ozet.py"
ozet = json.loads(mb.group(1))
assert "turkce" in ozet, "ozet verisi ders anahtariyla sarilmali (turkce)"
d = ozet["turkce"]
assert d["key"] == "turkce", "ozet verisi turkce dersine bagli degil"
assert len(d["bolumler"]) == 3, "ozet bolum sayisi 3 olmali"
assert "</script" not in mb.group(1).lower(), "gomulu JSON script etiketini kirabilir"
assert "<!--" not in mb.group(1), "gomulu JSON icinde HTML yorumu var (JSON.parse kirilir)"
blok = sum(len(b.get("bloklar") or []) for b in d["bolumler"])
madde = sum(len(x.get("maddeler") or []) for b in d["bolumler"] for x in (b.get("bloklar") or []))
if "ozDrawer" not in oku or "ozToggle" not in oku:
    raise AssertionError("oku.html icinde ozet cekmecesi kodu eksik")

with open(os.path.join(ROOT, "turkce-ozet.html"), encoding="utf-8") as f:
    sayfa = f.read()
assert "__BODY__" not in sayfa, "turkce-ozet.html sablonu doldurulmamis"
for anahtar in ("Ses Bilgisi", "Noktalama", "Fiilimsiler", "Sözel Mant", "Paragraf"):
    assert anahtar in sayfa, f"turkce-ozet.html icinde eksik baslik: {anahtar}"

# Ayri basliklara bolunmus sozcuk turu / fiilimsi konulari kaybolmasin.
TUR_BASLIKLARI = ("Sıfat (Ön Ad)", "Zamir (Adıl)", "Zarf (Belirteç)", "Edat (İlgeç)",
                  "Bağlaç", "Sıfat – Zamir – Zarf – Edat – Bağlaç Ayrımı",
                  "Fiilimsiler (Eylemsiler)",
                  "Fiilimsilerde Adlaşma, Kalıcı İsim ve Tuzaklar")
for anahtar in TUR_BASLIKLARI:
    assert anahtar in sayfa, f"turkce-ozet.html icinde eksik konu basligi: {anahtar}"
adlar = [x.get("ad") for b in d["bolumler"] for x in (b.get("bloklar") or [])]
for anahtar in TUR_BASLIKLARI:
    if anahtar.startswith("Fiilimsiler"):
        continue
    assert anahtar in adlar, f"gomulu JSON icinde eksik konu blogu: {anahtar}"
assert adlar.count("Fiilimsiler (Eylemsiler)") == 1, "fiilimsi blogu tek olmali"

# --- Capraz baglantilar: ozet sayfasi her giris noktasindan erisilebilmeli ---
BEKLENEN = {
    "index.html": ("oku.html", "galeri.html", "turkce-ozet.html"),
    "galeri.html": ("index.html", "oku.html", "turkce-ozet.html"),
    "oku.html": ("galeri.html", "turkce-ozet.html"),
    "turkce-ozet.html": ("oku.html", "index.html"),
}
for ad, hedefler in BEKLENEN.items():
    with open(os.path.join(ROOT, ad), encoding="utf-8") as f:
        t = f.read()
    for h in hedefler:
        assert h in t, f"{ad} icinde {h} baglantisi yok"

print("ozet: bolum", len(d["bolumler"]), "| blok", blok, "| madde", madde,
      "| sayfa karakter", len(sayfa))

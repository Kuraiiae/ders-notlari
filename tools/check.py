"""index.html (tanim sayfasi), galeri.html ve oku.html icindeki script'leri
ayiklar (soz dizimi kontrolu icin), manifestteki tum sayfa gorsellerinin
(orijinal + temizlenmis) var oldugunu, Turkce konu ozeti ile Kart Modu test
modunun (gomulu quiz indeksi + soru kokleri + cevap anahtari filtresi)
tutarli oldugunu dogrular.

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
                 and "assets/cover-v2.jpg" in html)
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

# --- Konu ozeti: <ders>-ozet.html + oku.html icindeki gomulu JSON ---
with open(os.path.join(ROOT, "oku.html"), encoding="utf-8") as f:
    oku = f.read()
mb = re.search(r"OZET-DATA-BEGIN -->\s*<script[^>]*id=\"ozetData\">(.*?)</script>\s*<!-- OZET-DATA-END",
               oku, re.S)
assert mb, "oku.html icinde ozetData script blogu yok -> python tools/ozet.py"
ozet = json.loads(mb.group(1))
assert "turkce" in ozet, "ozet verisi ders anahtariyla sarilmali (turkce)"
assert "tarih" in ozet, "tarih ozeti gomulu degil -> python tools/ozet.py"
d = ozet["turkce"]
assert d["key"] == "turkce", "ozet verisi turkce dersine bagli degil"
assert len(d["bolumler"]) == 3, "ozet bolum sayisi 3 olmali"
assert "</script" not in mb.group(1).lower(), "gomulu JSON script etiketini kirabilir"
assert "<!--" not in mb.group(1), "gomulu JSON icinde HTML yorumu var (JSON.parse kirilir)"
if "ozDrawer" not in oku or "ozToggle" not in oku:
    raise AssertionError("oku.html icinde ozet cekmecesi kodu eksik")
if "ozTable" not in oku:
    raise AssertionError("oku.html icinde ozTable (karsilastirma tablosu) kodu eksik")

# Her ozetli ders kendi bagimsiz sayfasini uretmis olmali ve ozet cekmecesi
# icindeki "Tam sayfa ozet" linki sabit kodlanmis olmamali.
OZET_DERSSLERI = sorted(ozet)
for key in OZET_DERSSLERI:
    v = ozet[key]
    assert v["key"] == key, f"ozet verisi {key} dersine bagli degil"
    for alan in ("baslik", "ders_adi", "aciklama", "lead", "giris", "not", "vurgu", "bolumler"):
        assert alan in v, f"{key} ozetinde eksik alan: {alan}"
    assert v["bolumler"], f"{key} ozetinde bolum yok"
    p = os.path.join(ROOT, "%s-ozet.html" % key)
    assert os.path.exists(p), f"{key} icin ozet sayfasi yok: {key}-ozet.html -> python tools/ozet.py"
    with open(p, encoding="utf-8") as f:
        s = f.read()
    assert "__BODY__" not in s, f"{key}-ozet.html sablonu doldurulmamis"
    assert "<title>" + v["baslik"] + "</title>" in s, f"{key}-ozet.html basligi gomulu ozetle uyusmuyor"
    assert 'href="oku.html?ders=%s"' % key in s, f"{key}-ozet.html kitap modu linki yanlis"
    assert "enhancements.js" in s, f"{key}-ozet.html icinde enhancements.js yok"
    # Blok semasi: her blokta en fazla biri (maddeler / tablo) ve dolu olmali.
    for b in v["bolumler"]:
        for x in (b.get("bloklar") or []):
            assert not (x.get("tablo") and x.get("maddeler")), \
                f"{key} / {x.get('ad')}: bir blokta hem tablo hem maddeler var"
            assert x.get("tablo") or x.get("maddeler") or x.get("notlar"), \
                f"{key} / {x.get('ad')}: bos blok"
            for t in ([x["tablo"]] if x.get("tablo") else []):
                assert t["basliklar"] and t["satirlar"], f"{key} / {x.get('ad')}: bos tablo"
                for r in t["satirlar"]:
                    assert len(r) == len(t["basliklar"]), \
                        f"{key} / {x.get('ad')}: tablo satirinda {len(r)} hucre, " \
                        f"baslikta {len(t['basliklar'])} var"

# --- Tarih ozeti: karsilastirma tablosu + kritik ilkler sayfada gorunmeli ---
dt = ozet["tarih"]
assert len(dt["bolumler"]) == 16, "tarih ozeti 15 konu + 1 ezber listesi icermeli"
tablo_sayi = sum(1 for b in dt["bolumler"] for x in (b.get("bloklar") or []) if x.get("tablo"))
assert tablo_sayi >= 4, f"tarih ozetinde karsilastirma tablosu yok ({tablo_sayi} adet)"
with open(os.path.join(ROOT, "tarih-ozet.html"), encoding="utf-8") as f:
    tsayfa = f.read()
for anahtar in ("Büyük Selçuklu", "En Kritik Ezber Listesi", "Orhun Yazıtları",
                "Kapıkulu", "Tımar", "Müsadere", "Balkan Savaşları"):
    assert anahtar in tsayfa, f"tarih-ozet.html icinde eksik baslik: {anahtar}"
assert '<table class="ozt">' in tsayfa, "tarih-ozet.html icinde tablo islenmemis"

with open(os.path.join(ROOT, "turkce-ozet.html"), encoding="utf-8") as f:
    sayfa = f.read()
assert "__BODY__" not in sayfa, "turkce-ozet.html sablonu doldurulmamis"
for anahtar in ("Ses Bilgisi", "Noktalama", "Fiilimsiler", "Sözel Mant", "Paragraf"):
    assert anahtar in sayfa, f"turkce-ozet.html icinde eksik baslik: {anahtar}"
blok = sum(len(b.get("bloklar") or []) for b in d["bolumler"])
madde = sum(len(x.get("maddeler") or []) for b in d["bolumler"] for x in (b.get("bloklar") or []))

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

# --- Test modu: gomulu quiz indeksi + soru kokleri ---
# (tools/quiz-embed.py ve tools/quiz-text-embed.py uretir; isaretleme ile
#  cevap anahtari oku.html + viewer.html + galeri.html icine birlikte gomulur.)
def quiz_blogu(metin, ad, kimlik):
    etiket = "QUIZ-DATA-BEGIN" if ad == "quizData" else "QUIZ-TEXT-BEGIN"
    return re.search(etiket + r" -->\s*<script[^>]*id=\"" + kimlik + r"\">(.*?)</script>",
                     metin, re.S)

with open(os.path.join(ROOT, "viewer.html"), encoding="utf-8") as f:
    izl = f.read()
with open(os.path.join(ROOT, "galeri.html"), encoding="utf-8") as f:
    gal = f.read()
for ad, kimlik in (("quizData", "quizData"), ("quizText", "quizText")):
    for dosya, metin in (("oku.html", oku), ("viewer.html", izl), ("galeri.html", gal)):
        m = quiz_blogu(metin, ad, kimlik)
        assert m, f"{dosya} icinde {kimlik} blogu yok -> python tools/quiz-embed.py"
        assert "</script" not in m.group(1).lower(), f"{dosya}: gomulu {ad} script etiketini kirabilir"
        assert "<!--" not in m.group(1), f"{dosya}: gomulu {ad} icinde HTML yorumu var"
qb = quiz_blogu(oku, "quizData", "quizData")
tb = quiz_blogu(oku, "quizText", "quizText")
quiz = json.loads(qb.group(1))
qtext = json.loads(tb.group(1))

with open(os.path.join(ROOT, "quiz-data.json"), encoding="utf-8") as f:
    kaynak = json.load(f)
with open(os.path.join(HERE, "quiz-keys.json"), encoding="utf-8") as f:
    anahtar = json.load(f)

TEST_SETLERI = {"turkce-test", "turkce-cikmis", "deneme"}
assert set(quiz) == TEST_SETLERI, f"gomulu test setleri eksik/fazla: {sorted(quiz)}"
assert set(qtext) <= TEST_SETLERI, f"gomulu kok metni setleri tanimsiz: {sorted(qtext)}"
toplam_soru = 0

for key, v in quiz.items():
    beklenen = {p: sorted({int(q["n"]) for q in e.get("q", [])})
                for p, e in (kaynak[key].get("pages") or {}).items()}
    beklenen = {p: n for p, n in beklenen.items() if n}
    assert v["pages"] == beklenen, f"{key}: gomulu soru indeksi quiz-data.json ile ayni degil"
    toplam_soru += sum(len(n) for n in v["pages"].values())
    # anahtar yalnizca o sayfada gorunen sorulari kapsar ve A-E icinde kalir
    for p, m in v["keys"].items():
        assert p in v["pages"], f"{key} s.{p}: soru olmayan sayfada anahtar var"
        for n, h in m.items():
            assert int(n) in v["pages"][p], f"{key} s.{p}: S.{n} o sayfada yok"
            assert h in "ABCDE", f"{key} s.{p} S.{n}: gecersiz sik '{h}'"
    # kaynak anahtar dosyasindaki eslesen kayitlar birebir gomulmus olmali
    for p, m in (anahtar.get(key) or {}).items():
        kalan = {str(int(n)): str(h).strip().upper() for n, h in m.items()
                 if int(n) in v["pages"].get(p, []) and str(h).strip().upper() in "ABCDE"}
        if kalan:
            assert v["keys"].get(p) == kalan, f"{key} s.{p}: anahtar filtresi bozuk"
    # kok metinleri yalnizca var olan sorular icin ve sinirli uzunlukta
    for p, m in (qtext.get(key) or {}).items():
        assert p in v["pages"], f"{key} s.{p}: kok var ama soru yok"
        for n, kok in m.items():
            assert int(n) in v["pages"][p], f"{key} s.{p}: S.{n} kok metni sahipsiz"
            assert 0 < len(kok) <= 900, f"{key} s.{p} S.{n}: kok uzunlugu sinir disi"

# Kart Modu: secenekler her soruda sabit A-E uretilir, anahtar kartta gosterilmez
for parca in ("const QUIZ_SIKLAR = ['A', 'B', 'C', 'D', 'E']",
              "'<button data-h=\"' + h + '\"",
              "id=\"quizScoreBox\"", "id=\"quizWait\"", "quizBarGuncelle",
              "role=\"group\"", "aria-label=\"Soru '",
              "touch-action:manipulation"):
    assert parca in oku, f"oku.html icinde test modu kodu eksik: {parca}"
# anahtar arayuzde yalnizca Acik modda gorunur ("Anahtari goster" ya da
# "Denemeyi bitir" sonrasi). Kart dugmeleri acik degilken anahtari kullanmaz.
# Online sinav: bitirme/anahtar sonrasi isaretleme kilitlidir (tum A-E
# dugmeleri sinav bitmeden once tiklanabilir kalir).
assert "function quizGorunur" in oku and "acik && a" in oku, \
    "kart dugmeleri acik-mod disi anahtari kullaniyor"
assert "quizState.bitir && a" not in oku, \
    "kart dugmeleri eski bitir-kilidine bagli kalmis"
for kilit in ("if (quizState.bitir || quizState.anahtar) return;",
              "if(qzState.bitir||qzState.anahtar)return;",
              "if (qzState.bitir || qzState.anahtar) return;"):
    assert kilit in (oku + izl + gal), \
        f"isaretleme kilidi eksik (bitir/anahtar sonrasi kilit): {kilit}"
# viewer + galeri hotspot erisilebilirlik + dokunmatik hedef tasir
for ad, metin in (("oku.html", oku), ("viewer.html", izl), ("galeri.html", gal)):
    for parca in ("qhotspot", "qh-badge"):
        assert parca in metin, f"{ad} icinde gorsel ustu hotspot kodu eksik: {parca}"

# Galeri + Sunum gorunumunde test modu kart akisi vardir; uc dosyanin gomulu
# quiz blogu birebir ayni olmali (tek komutla birlikte yazilir).
for ad, kimlik in (("quizData", "quizData"), ("quizText", "quizText")):
    mo = quiz_blogu(oku, ad, kimlik).group(1)
    for dosya, metin in (("viewer.html", izl), ("galeri.html", gal)):
        mx = quiz_blogu(metin, ad, kimlik).group(1)
        assert mx == mo, f"{dosya} icindeki {kimlik} oku.html ile ayni degil"
# anahtar / kok kapsami yalnizca var olan sorulari kapsar (oku blogu uzerinden
# tek kez dogrulanir; uc dosya birebir ayni oldugu icin tekrar sayilmaz).

print("test modu: set", len(quiz), "| kartli soru", toplam_soru,
      "| anahtar", sum(len(m) for v in quiz.values() for m in v["keys"].values()),
      "| kok metni", sum(len(m) for v in qtext.values() for m in v.values()))

# --- Cevap anahtari: iki kaynak, 10 celiski (UYARI, hata degil) -------------
# Cevap anahtari iki yerde tutuluyor:
#   tools/quiz-keys.json  -> 702 kayit (TAM)  -> quiz-embed.py bunu gomulur
#   quiz-data.json k[]    -> 159 kayit (KISMI) -> HICBIR YERDE OKUNMAZ
# Ortusen kayitlarin bir kismi celisiliyor. Hangisinin dogru oldugu ancak
# kaynak PDF'e bakilarak anlasilir (PDF'ler diskte degil), bu yuzden burada
# yalnizca RAPORLANIR, duzeltilmez. Karar: dokunma, isaretle.
# Bkz. docs/superpowers/specs/...-design.md bolum 3.4
celiski = []
for key, v in kaynak.items():
    gomulu = ((anahtar.get(key) or {}))
    for p, e in (v.get("pages") or {}).items():
        for kayit in (e.get("k") or []):
            n = str(kayit["n"])
            harf = (gomulu.get(p) or {}).get(n)
            if harf is not None and str(harf).strip().upper() != kayit["a"]:
                celiski.append((key, p, n, kayit["a"], str(harf).strip().upper()))
if celiski:
    print()
    print("!! UYARI - cevap anahtari celiskisi (%d adet, DUZELTILMEDI):" % len(celiski))
    print("   %-14s %-6s %-6s %-18s %s" % ("set", "sayfa", "soru",
                                          "quiz-data.json k", "quiz-keys.json"))
    for key, p, n, a, b in celiski:
        print("   %-14s %-6s %-6s %-18s %s" % (key, p, n, a, b))
    print("   -> Uygulama quiz-keys.json'i kullanir. Dogru kaynak PDF'e")
    print("      bakilarak belirlenmeli; bkz. spec bolum 3.4.")
else:
    print("cevap anahtari celiskisi: yok")

# --- Capraz baglantilar: ozet sayfasi her giris noktasindan erisilebilmeli ---
# --- Capraz baglantilar: ozet sayfasi her giris noktasindan erisilebilmeli ---
# oku.html istisna: ozet sayfasi linki sabit kodlu degil, JS ile uretilir
# (ozSayfaAd(key) -> "<key>-ozet.html"), bu yuzden literal ad yerine uretici
# isareti aranir.
BEKLENEN = {
    "index.html": ("oku.html", "galeri.html", "turkce-ozet.html", "tarih-ozet.html", "cografya-ozet.html", "vatandaslik-ozet.html"),
    "galeri.html": ("index.html", "oku.html", "turkce-ozet.html"),
    "turkce-ozet.html": ("oku.html", "index.html"),
    "tarih-ozet.html": ("oku.html", "index.html"),
    "cografya-ozet.html": ("oku.html", "index.html"),
    "vatandaslik-ozet.html": ("oku.html", "index.html"),
}
for ad, hedefler in BEKLENEN.items():
    with open(os.path.join(ROOT, ad), encoding="utf-8") as f:
        t = f.read()
    for h in hedefler:
        assert h in t, f"{ad} icinde {h} baglantisi yok"
assert "ozSayfaAd" in oku, "oku.html ozet sayfasi linki ozSayfaAd(key) ile uretilmeli"
assert "-ozet.html" in oku, "oku.html ozSayfaAd() icinde '<key>-ozet.html' deseni yok"
assert "turkce-ozet.html" not in oku, \
    "oku.html ozet linki yeniden sabit kodlanmis, ozSayfaAd(key) kullanilmali"

# --- Site adi: her giris noktasi ayni adi kullanmali ---
# Kitaplik adi tek yerden degismedigi icin burada dogrulanir:
# turkce-ozet.html adini ozet.py BASLIK belirler.
SITE_ADI = "KPSS Orta Öğretim"
for ad in ("index.html", "oku.html", "galeri.html", "404.html", "viewer.html"):
    with open(os.path.join(ROOT, ad), encoding="utf-8") as f:
        t = f.read()
    assert SITE_ADI in t, f"{ad} icinde site adi yok: {SITE_ADI}"
    assert "KPSS Orta Ogretim" not in t, f"{ad} icinde bozuk (ASCII) site adi kalmis"
assert SITE_ADI in sayfa, "turkce-ozet.html icinde site adi yok: " + SITE_ADI
assert "<title>" + d["baslik"] + "</title>" in sayfa, \
    "turkce-ozet.html basligi gomulu ozet basligiyla ayni olmali"
assert "<h1>" + d["baslik"] + "</h1>" in sayfa, \
    "turkce-ozet.html h1'i gomulu ozet basligiyla ayni olmali"

print("ozet: bolum", len(d["bolumler"]), "| blok", blok, "| madde", madde,
      "| sayfa karakter", len(sayfa), "| site adi", SITE_ADI)

# --- quiz-core.js butunlugu (K5) -------------------------------------------
# Sik kutulari hizalamasi, soru korumasi ve yayinevi bandi ONCE uc modda
# ayri ayri kopyalandiydi; kopyalar birbirinden ayri evrilmisti (K5).
# Artik ucu de quiz-core.js'e bagli. Asagidaki denetimler, bir kopya geri
# geldiginde veya cekirdek dosya eksik kaldiginda yakalar.
CEKIRDEK = os.path.join(ROOT, "quiz-core.js")
assert os.path.exists(CEKIRDEK), "quiz-core.js yok -> simetri/cekim tek kaynaginiz kalmamis"
with open(CEKIRDEK, encoding="utf-8") as f:
    cek = f.read()
for parca in ("hizalaSiklar", "cizilenSiklar", "soruyuKoru", "module.exports"):
    assert parca in cek, f"quiz-core.js icinde {parca} yok"

# Uc mod da cekirdegi yuklemeli ve kendi kopyasini SILMIS olmali.
for ad, metin in (("oku.html", oku), ("viewer.html", izl), ("galeri.html", gal)):
    assert metin.count('src="quiz-core.js"') == 1, \
        f"{ad} icinde quiz-core.js etiketi tam 1 kez olmali (bulunan: {metin.count(chr(34).join(['src=', 'quiz-core.js', '']))})"
    assert metin.count("QuizCore.hizalaSiklar") == 1, \
        f"{ad} icinde QuizCore.hizalaSiklar cagrisi tam 1 kez olmali"
    # 2026-10-05 K8: cozum maskesi + yayinevi bandi kalici kaldirildi.
    # Sayfa uzerinde HICBIR sey gizlenmemeli; yalnizca A-E secilebilir.
    # Bu denetim geri gelirse yakalar — gizleme alani yeniden dogmus olur.
    for yasak in ("qsolution-mask", "qsolution-toggle", "qsol-icon", "qsol-text",
                  "SolutionMaskKoy", "PublisherMaskKoy", "yayineviMaskKoy",
                  "qpub-mask"):
        assert yasak not in metin, \
            f"{ad} icinde '{yasak}' var -> cozum/yayinevi gizleme alani geri gelmis"
    assert "qzHotHiza" not in metin, \
        f"{ad} icinde qzHotHiza kaldi -> uc mod tek kaynaga baglanmamis (K5)"
    # Cekirdek, kendisini kullanan koddan ONCE yuklenmelidir.
    i_cek = metin.find('src="quiz-core.js"')
    i_kul = metin.find("QuizCore.hizalaSiklar")
    assert 0 <= i_cek < i_kul, f"{ad}: quiz-core.js kullanimdan sonra yukleniyor"
print("quiz-core: 3 mod bagli | fonksiyon 3/3 | kopya qzHotHiza 0/3")

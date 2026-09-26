# -*- coding: utf-8 -*-
"""quiz-data.json + tools/quiz-keys.json -> UC SUNUM MODUNA gomulu test indeksi.

Gomulen dosyalar: oku.html (Kitap Modu), viewer.html (Dinamik Sunum),
galeri.html (Galeri Modu). Uc mod da ayni veriyi ve ayni `oku.quiz.<set>`
isaret anahtarini kullandigi icin bir modda isaretlenen soru digerlerinde de
isaretli gorunur.

Gomme bicimi (ozet.py / quiz-text-embed.py ile ayni kalip):
  <!-- QUIZ-DATA-BEGIN -->
  <script type="application/json" id="quizData">{...}</script>
  <!-- QUIZ-DATA-END -->

Gomulen veri bilerek MINIK tutulur:

  {"<ders>": {"pages": {"<sayfa>": [soru no, ...]},
              "keys":  {"<sayfa>": {"<soru no>": "B"}}}}

- Kart modu A–E dugmelerini veriden degil SABIT uretir (her soru 5
  seceneklidir), sayfa gorseli uzerine kaplama cizilmez -> HTML'de soru/sik
  koordinat kutularina gerek yoktur. Koordinatlarin tamami quiz-data.json'da
  durur (ileride sayfa uzerine isaret kaplamasi icin kaynak orasidir).
- `keys`: cevap anahtari. ARAYUZDE ASLA gosterilmez; yalnizca "Denemeyi
  bitir" sonrasi puanlamada kullanilir. Sayfa bazinda FILTRELENIR: bir
  sayfanin anahtari yalnizca o sayfada gorunen sorularla eslesir, baska
  yapragin anahtari bulasmaz.

Cevap anahtari sonradan eklenirse: degerleri tools/quiz-keys.json icine
yazip `python tools/quiz-embed.py` calistirmak yeterlidir; arayuz puanlamayi
otomatik acar (anahtar yoksa yalnizca isaretleme modu calisir).

Anahtar arayuzde kendiliginden gorunmez; "Denemeyi bitir" sonrasi puanlamada
kullanilir. Ogrenme icin istege bagli "Cevap anahtarini goster" dugmesi
vardir: tiklaninca o bolumun anahtari ve dogru/yanlis isaretleri gorunur,
tekrar tiklaninca gizlenir.

ANAHTARI VAR AMA SORUSU CIKARILAMAMIS pozisyonlar: anahtarda bir soru
numarasi olup metin katmanindan o soru cikarilamadiysa (gorsel tabanli soru)
sayfa listesine BOS KART YUVASI eklenir. Kart yalnizca "Soru N" + A–E
dugmelerini gosterir; boylece o anahtar da isaretlenebilir ve puanlanabilir
kalir.

Gomulen dosyalar: oku.html (Kitap Modu), viewer.html (Dinamik Sunum),
galeri.html (Galeri Modu). Uc mod ayni veriyi ve ayni `oku.quiz.<set>`
isaret anahtarini kullanir; bir modda isaretlenen soru digerlerinde de
isaretli gorunur. file:// uzerinden fetch/CORS calismadigi icin veri
dogrudan HTML icine gomulmek zorundadir.

"""
import io
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

# Test modu olan setler (tools/quiz.py TEST_KEYS ile ayni).
TEST_KEYS = ("turkce-test", "turkce-cikmis", "deneme")

# Gomulen dosyalar: test modu uc sunum modunda da calisir.
HEDEFLER = ("oku.html", "viewer.html", "galeri.html")
TEMIZLENECEK = ()

SIKLAR = "ABCDE"

BAS = "<!-- QUIZ-DATA-BEGIN -->"
BIT = "<!-- QUIZ-DATA-END -->"


def yukle():
    d = json.load(io.open(os.path.join(ROOT, "quiz-data.json"), encoding="utf-8"))
    k = {}
    kp = os.path.join(HERE, "quiz-keys.json")
    if os.path.exists(kp):
        k = json.load(io.open(kp, encoding="utf-8"))
    out, atilan, yuva = {}, 0, 0
    for key in TEST_KEYS:
        if key not in d:
            continue
        sayfalar, anahtarlar = {}, {}
        for p, e in (d[key].get("pages") or {}).items():
            nos = sorted({int(q["n"]) for q in e.get("q", [])})
            # anahtari olup sorusu cikarilamamis pozisyonlar icin bos kart yuvasi
            for n in (k.get(key, {}).get(p) or {}):
                if int(n) not in nos:
                    nos.append(int(n))
                    yuva += 1
            nos = sorted(nos)
            if not nos:
                continue
            sayfalar[p] = nos
            # anahtar yalnizca ayni sayfada gorunen sorularla eslesir
            m = {}
            for n, harf in (k.get(key, {}).get(p) or {}).items():
                harf = str(harf).strip().upper()
                if int(n) in nos and harf in SIKLAR:
                    m[str(int(n))] = harf
                else:
                    atilan += 1
            if m:
                anahtarlar[p] = m
        # secenek koordinatlari (c)
        choices = {}
        solutions = {}
        for p, e in (d[key].get("pages") or {}).items():
            pq = {}
            for q in e.get("q", []):
                n = str(q["n"])
                c = q.get("c", {})
                if c:
                    pq[n] = {h: [round(v, 4) for v in c[h]] for h in SIKLAR if h in c}
            if pq:
                choices[p] = pq
            if key == "turkce-cikmis" and e.get("qs"):
                solutions[p] = [int(n) for n in e["qs"]]
        if sayfalar:
            out[key] = {"pages": sayfalar, "keys": anahtarlar, "choices": choices, "qs": solutions}
    return out, atilan, yuva


def gom(dosya, veri_json):
    yol = os.path.join(ROOT, dosya)
    t = io.open(yol, encoding="utf-8").read()
    blok = (BAS + "\n<script type=\"application/json\" id=\"quizData\">\n"
            + veri_json + "\n</script>\n" + BIT)
    if BAS in t and BIT in t:
        t = re.sub(re.escape(BAS) + r".*?" + re.escape(BIT), lambda _: blok, t,
                   count=1, flags=re.S)
    else:
        isaret = "</body>" if "</body>" in t else "</html>"
        t = t.replace(isaret, blok + "\n" + isaret, 1)
    io.open(yol, "w", encoding="utf-8", newline="\n").write(t)
    return os.path.getsize(yol)


def sil(dosya):
    """Test modu olmayan sayfadan eski gomulu blok kalmasin."""
    yol = os.path.join(ROOT, dosya)
    t = io.open(yol, encoding="utf-8").read()
    if BAS not in t or BIT not in t:
        return None
    t2 = re.sub(re.escape(BAS) + r".*?" + re.escape(BIT) + r"\n?", "", t,
                count=1, flags=re.S)
    io.open(yol, "w", encoding="utf-8", newline="\n").write(t2)
    return os.path.getsize(yol)


def main():
    veri, atilan, yuva = yukle()
    js = json.dumps(veri, ensure_ascii=False, separators=(",", ":"))
    assert "</script" not in js.lower(), "gomulu JSON script etiketini kirabilir"
    assert "<!--" not in js, "gomulu JSON icinde HTML yorumu var"
    for ad in HEDEFLER:
        boy = gom(ad, js)
        print(ad, "-> quiz indeksi gomuldu,", len(js), "bayt JSON,", boy, "bayt dosya")
    for ad in TEMIZLENECEK:
        boy = sil(ad)
        if boy:
            print(ad, "-> test disi sayfa, eski blok silindi,", boy, "bayt dosya")
    for key, v in veri.items():
        ns = sum(len(x) for x in v["pages"].values())
        nk = sum(len(m) for m in v["keys"].values())
        print(" ", key, "| kartli soru:", ns, "| anahtar:", nk,
              "| anahtar bekleyen soru:", ns - nk, "| sayfa:", len(v["pages"]))
    if atilan:
        print("  (eslesmeyen anahtar atildi:", atilan, ")")
    if yuva:
        print("  (sorusu cikarilamayan anahtar icin bos kart yuvasi:", yuva, ")")
    print("Cevap anahtari eklemek icin tools/quiz-keys.json icine")
    print('  {"<ders>": {"<sayfa>": {"<soru no>": "<A-E>"}}} yazip bu betigi yeniden calistirin.')


if __name__ == "__main__":
    sys.exit(main())

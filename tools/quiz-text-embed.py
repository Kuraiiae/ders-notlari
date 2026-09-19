"""quiz-text.json icindeki SORU KOK metinlerini UC SUNUM MODUNA gomer
(oku.html = Kitap Modu, viewer.html = Dinamik Sunum, galeri.html = Galeri).

Gomme bicimi (ozet.py / quiz-embed.py ile ayni kalip):
  <!-- QUIZ-TEXT-BEGIN -->
  <script type="application/json" id="quizText">{...}</script>
  <!-- QUIZ-TEXT-END -->

Gomulen bicim yalnizca kok metnidir (kart akisi A–E harflerini sabit
urettigi, sik METINLERINI gostermedigi icin quiz-text.json'daki `sik`
metinleri HTML'e girmez):

  {"<ders>": {"<sayfa>": {"<soru no>": "soru kok metni"}}}

Her kok en fazla KOK_MAX karaktere kirpilir: PDF metin katmaninda kacan
satirlar kart gorunumunu bozmasin ve gomulu JSON sismesin.

Test modu olan tum setler gomulur (turkce-test, turkce-cikmis, deneme);
kart modu cevap anahtari GEREKTIRMEZ, anahtar yalnizca puanlamayi acar.
file:// uzerinden fetch/CORS calismadigi icin veri dogrudan HTML icine
gomulmek zorundadir.

Kullanim:  python tools/quiz-text.py && python tools/quiz-text-embed.py
"""
import io
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

# Gomulecek setler (tools/quiz.py TEST_KEYS ile ayni).
EMBED_KEYS = ("turkce-test", "turkce-cikmis", "deneme")

KOK_MAX = 900

BAS = "<!-- QUIZ-TEXT-BEGIN -->"
BIT = "<!-- QUIZ-TEXT-END -->"


def yukle():
    d = json.load(io.open(os.path.join(ROOT, "quiz-text.json"), encoding="utf-8"))
    out = {}
    for k in EMBED_KEYS:
        if k not in d:
            continue
        sayfa = {}
        for p, s in (d[k] or {}).items():
            m = {}
            for n, r in s.items():
                kok = str((r or {}).get("kok", "")).strip()[:KOK_MAX]
                if kok:
                    m[str(n)] = kok
            if m:
                sayfa[p] = m
        if sayfa:
            out[k] = sayfa
    return out


def gom(dosya, veri_json):
    yol = os.path.join(ROOT, dosya)
    t = io.open(yol, encoding="utf-8").read()
    blok = (BAS + "\n<script type=\"application/json\" id=\"quizText\">\n"
            + veri_json + "\n</script>\n" + BIT)
    if BAS in t and BIT in t:
        t = re.sub(re.escape(BAS) + r".*?" + re.escape(BIT), lambda _: blok, t,
                   count=1, flags=re.S)
    else:
        isaret = "</body>" if "</body>" in t else "</html>"
        t = t.replace(isaret, blok + "\n" + isaret, 1)
    io.open(yol, "w", encoding="utf-8", newline="\n").write(t)
    return os.path.getsize(yol)


def main():
    veri = yukle()
    js = json.dumps(veri, ensure_ascii=False, separators=(",", ":"))
    assert "</script" not in js.lower(), "gomulu JSON script etiketini kirabilir"
    assert "<!--" not in js, "gomulu JSON icinde HTML yorumu var"
    for ad in ("oku.html", "viewer.html", "galeri.html"):
        boy = gom(ad, js)
        print(ad, "-> quiz metni gomuldu,", len(js), "bayt JSON,", boy, "bayt dosya")
    for key, v in veri.items():
        print(" ", key, "metinli soru:", sum(len(x) for x in v.values()))


if __name__ == "__main__":
    import sys
    sys.exit(main())
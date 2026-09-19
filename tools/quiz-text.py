# -*- coding: utf-8 -*-
"""Deneme/test PDF'lerinden soru kok + sik METINLERINI cikarir -> quiz-text.json.

quiz-data.json'daki soru kutularini rehber olarak kullanir:
her sorunun (sayfa, no) icin kutunun y-uzantisi [q_y0, sonraki_soru_y0 veya
anahtar-satiri veya sayfa alti] araligindaki kelimeler toplanir; icinden
"A) ... B) ... C) ... D) ... E) ..." bloklari ayiklanir.

Cikti:
  {"<ders>": {"<sayfa>": {"<no>": {"kok": "...", "sik": {"A":..,"B":..,...}}}}}

HTML'e gomulen kisim yalnizca `kok` metnidir (tools/quiz-text-embed.py).
Girdi: quiz-data.json (tools/quiz.py + tools/quiz-fix.py).
"""
import importlib.util
import io
import json
import os
import re

import pymupdf

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

_spec = importlib.util.spec_from_file_location("_render", os.path.join(HERE, "render.py"))
_render = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_render)
FILES = {s["key"]: s["file"] for s in _render.SUBJECTS}

TEST_KEYS = ("turkce-test", "turkce-cikmis", "deneme")

SIK = re.compile(r"(^|\s)([A-E])[\)\.\-:]\s*")
SAYI = re.compile(r"^(\d{1,3})[\.\)]\s*(.*)$")


def norm(t):
    t = (t or "").replace("\u00ad", "").replace("\u200b", "")
    t = re.sub(r"[ \t]+", " ", t)
    return t.strip()


def siklari_bol(metin):
    """'A) xxx B) yyy ...' metnini (kok, {A..E: metin}) olarak ayirir."""
    mo = list(SIK.finditer(" " + metin))
    if not mo:
        return metin.strip(), {}
    kok = metin[:mo[0].start(2)].strip() if mo[0].start(2) > 1 else ""
    out = {}
    for i, m in enumerate(mo):
        harf = m.group(2)
        bas = m.end()
        bit = mo[i + 1].start() if i + 1 < len(mo) else len(metin) + 1
        parca = (" " + metin)[bas:bit].strip()
        out[harf] = norm(parca)
    # kok: ilk sik isaretinden onceki kisim (bastaki "5." no temizlenir)
    kok = norm(re.sub(r"^\d{1,3}[\.\)]\s*", "", (" " + metin)[:mo[0].start()].strip()))
    return kok, out


def main():
    veri = json.load(io.open(os.path.join(ROOT, "quiz-data.json"), encoding="utf-8"))
    cikti, rapor = {}, []
    for key in TEST_KEYS:
        yol = FILES[key]
        doc = pymupdf.open(yol)
        pages = veri.get(key, {}).get("pages", {})
        out, ns, ne = {}, 0, 0
        for p, e in pages.items():
            words = doc[int(p) - 1].get_text("words")
            words.sort(key=lambda w: (round(w[1], 1), w[0]))
            qs = sorted(e.get("q", []), key=lambda q: q["b"][1])
            # sayfa altindaki anahtar satirlarinin y-konumu (sinir icin)
            k_y = [x["b"][1] for x in e.get("k", []) if x.get("b")]
            alt_sinir = min(k_y) if k_y else 0.985
            sayfa = {}
            for i, q in enumerate(qs):
                y0 = q["b"][1] - 0.004
                y1 = qs[i + 1]["b"][1] - 0.004 if i + 1 < len(qs) else alt_sinir
                parca = [w[4] for w in words if w[1] >= y0 * doc[0].rect.height
                         and w[1] < y1 * doc[0].rect.height and w[0] < doc[0].rect.width * 0.96]
                metin = norm(" ".join(parca))
                kok, sik = siklari_bol(metin)
                ns += 1
                if len(sik) >= 4:
                    sayfa[str(q["n"])] = {"kok": kok, "sik": sik}
                else:
                    ne += 1
            if sayfa:
                out[p] = sayfa
        cikti[key] = out
        rapor.append(f"{key}: metinli soru sayfasi {len(out)} | soru {sum(len(v) for v in out.values())} | eksik {ne}")
        doc.close()
    with io.open(os.path.join(ROOT, "quiz-text.json"), "w", encoding="utf-8") as f:
        json.dump(cikti, f, ensure_ascii=False, separators=(",", ":"))
    for r in rapor:
        print(r)
    print("yazildi: quiz-text.json")


if __name__ == "__main__":
    main()

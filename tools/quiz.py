"""Deneme/test setlerinin kaynak PDF'lerinden *test modu* verisini cikarir.

Cikti: quiz-data.json
  { "<ders>": { "w": <pdf genislik pt>, "h": <pdf yukseklik pt>,
                "pages": { "<sayfa no>": {
                    "q": [ {"n": 12, "b": [x0,y0,x1,y1],
                            "c": {"A": [..], "B": [..], ...}} ],
                    "k": [ {"n": 12, "a": "B", "b": [x0,y0,x1,y1]} ] } } } }

Tum koordinatlar sayfa orani olarak (0..1) yazilir; boylece sayfa gorseli
hangi genislikte gosterilirse gosterilsin kaplama (overlay) birebir oturur.
Sayfa gorselleri `tools/render.py` ile AYNI PDF'ten uretildigi icin metin
katmani koordinatlari gorselle tam hizalidir.

`k` (anahtar) kayitlari hem puanlama icin hem de sayfada basili anahtar
satirinin ustune kapatma katmani cizmek icin kullanilir.
"""
import importlib.util
import json
import os
import re
import sys

import pymupdf

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

# Test modu olan setler: render.py SUBJECTS ile ayni PDF yollari.
_spec = importlib.util.spec_from_file_location("_render", os.path.join(HERE, "render.py"))
_render = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_render)
SUBJECTS = _render.SUBJECTS

TEST_KEYS = ("turkce-test", "turkce-cikmis", "deneme")

CHOICE = re.compile(r"^([A-E])\s*[\)\.\-:]\s*")
QNUM2 = re.compile(r"^(\d{1,3})$")
QNUM = re.compile(r"^(\d{1,3})\s*\.\s*(\S.*)?$")
NUMONLY = re.compile(r"^(\d{1,3})\s*[\.\)]?$")
LETONLY = re.compile(r"^([A-E])\s*[\.\)]?$")


def lines_of(page):
    """Sayfayi okuma sirasina dizilmis satirlara boler (sutun farkindalikli)."""
    pw = page.rect.width
    mid = pw * 0.45
    rows = {}
    for x0, y0, x1, y1, word, bno, lno, wno in page.get_text("words"):
        rows.setdefault((bno, lno), []).append((x0, y0, x1, y1, word, wno))
    out = []
    for (bno, lno), ws in rows.items():
        ws.sort(key=lambda t: t[5])
        x0 = min(t[0] for t in ws)
        y0 = min(t[1] for t in ws)
        y1 = max(t[3] for t in ws)
        xr = max(t[2] for t in ws)
        out.append({
            "col": 1 if x0 > mid else 0,
            "y": round(y0, 2),
            "box": (x0, y0, xr, y1),
            "words": [t[4] for t in ws],
            "wbox": [(t[0], t[1], t[2], t[3]) for t in ws],
        })
    out.sort(key=lambda l: (l["col"], l["y"], l["box"][0]))
    return out


def dedup(pages):
    """Ayni (sayfa, no) tekrarindan en iyisini sec; sahipsiz anahtari at."""
    for p, e in pages.items():
        seen = {}
        for q in e.get("q", []):
            n = str(q["n"])
            if n not in seen or len(q.get("c", {})) > len(seen[n].get("c", {})):
                seen[n] = q
        qs = sorted(seen.values(), key=lambda q: q["n"])
        nos = set(seen)
        ks = [x for x in e.get("k", []) if str(x["n"]) in nos]
        e.pop("q", None)
        e.pop("k", None)
        if qs:
            e["q"] = qs
        if ks:
            e["k"] = ks
    return pages


def frac(box, pw, ph):
    x0, y0, x1, y1 = box
    return [round(max(0.0, x0 / pw), 4), round(max(0.0, y0 / ph), 4),
            round(min(1.0, x1 / pw), 4), round(min(1.0, y1 / ph), 4)]


def key_rows(lines):
    """Sayfa altindaki '1. B  2. D  3. E' bicimli anahtar satirlarini bulur."""
    found = []
    for ln in lines:
        ws = ln["words"]
        if len(ws) < 8:
            continue
        pairs, i = [], 0
        while i + 1 < len(ws):
            m1, m2 = NUMONLY.match(ws[i]), LETONLY.match(ws[i + 1])
            if m1 and m2:
                pairs.append((int(m1.group(1)), m2.group(1)))
                i += 2
            else:
                i += 1
        if len(pairs) >= 4:
            found.append({"box": ln["box"], "pairs": pairs})
    return found


def parse_page(page, pno):
    pw, ph = page.rect.width, page.rect.height
    lines = lines_of(page)
    questions, cur = [], None
    for ln in lines:
        ws = ln["words"]
        if not ws:
            continue
        head = ws[0]
        qm = QNUM.match(head) or QNUM2.match(head)
        if qm:
            tail = ws[1] if len(ws) > 1 else ""
            # "8. C" gibi anahtar artigi veya "1. B  2. D" anahtar satiri -> soru degil
            if tail and (LETONLY.match(tail) or NUMONLY.match(tail)):
                qm = None
            else:
                if cur and len(cur["c"]) >= 2:
                    questions.append(cur)
                cur = {"n": int(qm.group(1)), "b": frac(ln["box"], pw, ph),
                       "col": ln["col"], "c": {}, "_y": ln["y"]}
                continue
        if qm is None and QNUM2.match(head) is None:
            pass
        cm = CHOICE.match(head)
        if cur is not None and cm and ln["col"] == cur["col"] and ln["y"] > cur["_y"]:
            letter = cm.group(1)
            if letter not in cur["c"]:
                cur["c"][letter] = frac(ln["box"], pw, ph)
    if cur and len(cur["c"]) >= 2:
        questions.append(cur)

    keys = []
    for kr in key_rows(lines):
        for n, a in kr["pairs"]:
            keys.append({"n": n, "a": a, "b": frac(kr["box"], pw, ph)})

    for q in questions:
        q.pop("_y", None)
        q.pop("col", None)
    return questions, keys


def main():
    only = sys.argv[1:] or list(TEST_KEYS)
    outp = os.path.join(ROOT, "quiz-data.json")
    koutp = os.path.join(HERE, "quiz-keys.json")
    # Mevcut veriyi koru: tek set üretilse bile diğer setler silinmesin.
    data, qkeys = {}, {}
    if os.path.exists(outp):
        try:
            data = json.load(open(outp, encoding="utf-8"))
        except Exception:
            data = {}
    if os.path.exists(koutp):
        try:
            qkeys = json.load(open(koutp, encoding="utf-8"))
        except Exception:
            qkeys = {}
    data, qkeys, report = data, qkeys, []
    by_key = {s["key"]: s for s in SUBJECTS}
    for key in only:
        sub = by_key.get(key)
        if not sub:
            print("!! bilinmeyen ders:", key)
            continue
        path = sub["file"]
        if not os.path.exists(path):
            report.append(f"{key}: KAYNAK PDF YOK -> {path}")
            continue
        doc = pymupdf.open(path)
        pages, nq, nk, qpages = {}, 0, 0, 0
        keymap = {}
        for i, page in enumerate(doc, start=1):
            qs, ks = parse_page(page, i)
            if not qs and not ks:
                continue
            entry = {}
            if qs:
                entry["q"] = qs
                nq += len(qs)
                qpages += 1
            if ks:
                entry["k"] = ks
                nk += len(ks)
                for x in ks:
                    keymap.setdefault(str(i), {})[str(x["n"])] = x["a"]
            pages[str(i)] = entry
        pages = dedup(pages)
        keymap = {p: e["k"] for p, e in pages.items() if e.get("k")}
        nq = sum(len(e.get("q", [])) for e in pages.values())
        nk = sum(len(e.get("k", [])) for e in pages.values())
        # Tek soruluk sayfa tespiti: telefonda kart görünümü için.
        # Bir soru birden çok sayfada görünüyorsa yalnızca EN İYİ (en çok şıklı)
        # sayfadaki kayıt "asıl" sayılır; diğer sayfalardaki aynı no'lu kayıtlar
        # atlanır. Böylece her soru tek bir sayfada gösterilir.
        byno = {}
        for p, e in pages.items():
            for q in e.get("q", []):
                byno.setdefault(str(q["n"]), []).append((p, q))
        single = {}
        for n, lst in byno.items():
            # en çok şık + en geniş kutu alanı kazanır
            def _skor(t):
                p, q = t
                c = q.get("c", {})
                b = q.get("b") or [0, 0, 0, 0]
                alan = max(0.0, b[2] - b[0]) * max(0.0, b[3] - b[1])
                return (len(c), round(alan, 4))
            lst.sort(key=_skor, reverse=True)
            kazanan, gerisi = lst[0][0], [t[0] for t in lst[1:]]
            single[n] = {"p": kazanan, "diger": gerisi}
        for p, e in pages.items():
            only = [q for q in e.get("q", []) if single.get(str(q["n"]), {}).get("p") == p]
            if only:
                e["qs"] = [q["n"] for q in only]
        # Soru -> sorunun ASIL sayfası eşlemesi (kart görünümü hangi sayfayı büyütecek)
        qmap = {n: v["p"] for n, v in single.items()}
        qkeys[key] = {p: {str(x["n"]): x["a"] for x in ks} for p, ks in keymap.items()}
        data[key] = {"w": round(doc[0].rect.width, 2),
                     "h": round(doc[0].rect.height, 2),
                     "pdf": os.path.basename(path),
                     "pages": pages, "qmap": qmap}
        report.append(f"{key}: sayfa {len(doc)} | soru iceren sayfa {qpages} | "
                      f"soru {nq} | anahtar kaydi {nk}")
        doc.close()

    out = outp
    with open(out, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    kout = koutp
    with open(kout, "w", encoding="utf-8") as f:
        json.dump(qkeys, f, ensure_ascii=False, separators=(",", ":"))
    for r in report:
        print(r)
    print("yazildi:", out, os.path.getsize(out), "bayt")
    print("yazildi:", kout, os.path.getsize(kout), "bayt")


if __name__ == "__main__":
    main()
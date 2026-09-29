# -*- coding: utf-8 -*-
"""quiz-enhance-choices.py
Tum test ve deneme setlerindeki eksik secenekleri (B, D, E vb.) ve yatay dizilimli A-B-C-D-E sorularini
quiz-data.json ve quiz-keys.json icinde eksiksiz hale getirir.
"""
import json
import io
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUIZ_DATA_PATH = os.path.join(ROOT, "quiz-data.json")
QUIZ_KEYS_PATH = os.path.join(ROOT, "tools", "quiz-keys.json")

SIKLAR = ["A", "B", "C", "D", "E"]


def fix_partial_choices(c):
    """Eksik secenek koordinatlarini geometriye gore tamamlar."""
    keys = list(c.keys())
    if len(keys) == 5:
        return c

    # Pattern 1: ['A', 'C', 'E'] (2-sutun: A & B, C & D, E)
    if set(keys) == {"A", "C", "E"}:
        box_a, box_c, box_e = c["A"], c["C"], c["E"]
        w_a = box_a[2] - box_a[0]
        w_c = box_c[2] - box_c[0]
        
        # A ve B
        c["A"] = [box_a[0], box_a[1], round(box_a[0] + w_a * 0.46, 4), box_a[3]]
        c["B"] = [round(box_a[0] + w_a * 0.52, 4), box_a[1], box_a[2], box_a[3]]
        
        # C ve D
        c["C"] = [box_c[0], box_c[1], round(box_c[0] + w_c * 0.46, 4), box_c[3]]
        c["D"] = [round(box_c[0] + w_c * 0.52, 4), box_c[1], box_c[2], box_c[3]]
        
        # E
        c["E"] = box_e
        return c

    # Pattern 2: ['A', 'D'] (3 ustte: A, B, C; 2 altta: D, E)
    if set(keys) == {"A", "D"}:
        box_a, box_d = c["A"], c["D"]
        w_a = box_a[2] - box_a[0]
        w_d = box_d[2] - box_d[0]
        
        c["A"] = [box_a[0], box_a[1], round(box_a[0] + w_a * 0.30, 4), box_a[3]]
        c["B"] = [round(box_a[0] + w_a * 0.35, 4), box_a[1], round(box_a[0] + w_a * 0.65, 4), box_a[3]]
        c["C"] = [round(box_a[0] + w_a * 0.70, 4), box_a[1], box_a[2], box_a[3]]
        
        c["D"] = [box_d[0], box_d[1], round(box_d[0] + w_d * 0.46, 4), box_d[3]]
        c["E"] = [round(box_d[0] + w_d * 0.52, 4), box_d[1], box_d[2], box_d[3]]
        return c

    # Pattern 3: ['A', 'B', 'C', 'D'] (yatay 4 sik, E eksik)
    if set(keys) == {"A", "B", "C", "D"}:
        box_a, box_d = c["A"], c["D"]
        dx = (box_d[0] - box_a[0]) / 3.0
        w_box = box_d[2] - box_d[0]
        c["E"] = [round(box_d[0] + dx, 4), box_d[1], round(box_d[0] + dx + w_box, 4), box_d[3]]
        return c

    # Pattern 4: ['A', 'B', 'D', 'E'] (C eksik)
    if set(keys) == {"A", "B", "D", "E"}:
        box_a, box_d = c["A"], c["D"]
        w_a = box_a[2] - box_a[0]
        c["C"] = [box_a[0], box_d[1], round(box_a[0] + w_a, 4), box_d[3]]
        return c

    # Pattern 5: ['A', 'B', 'D'] (C ve E eksik)
    if set(keys) == {"A", "B", "D"}:
        box_a, box_b, box_d = c["A"], c["B"], c["D"]
        w_d = box_d[2] - box_d[0]
        c["C"] = [box_a[0], box_d[1], round(box_a[0] + w_d * 0.46, 4), box_d[3]]
        c["D"] = [round(box_a[0] + w_d * 0.52, 4), box_d[1], box_d[2], box_d[3]]
        h = box_d[3] - box_d[1]
        c["E"] = [box_a[0], round(box_d[3] + 0.005, 4), round(box_a[0] + w_d * 0.46, 4), round(box_d[3] + 0.005 + h, 4)]
        return c

    # Pattern 6: ['A', 'B'] (C, D, E eksik - dikey ya da yatay)
    if set(keys) == {"A", "B"}:
        box_a, box_b = c["A"], c["B"]
        dy = box_b[1] - box_a[1]
        if abs(dy) > 0.015: # dikey
            h = box_a[3] - box_a[1]
            c["C"] = [box_a[0], round(box_b[1] + dy, 4), box_a[2], round(box_b[1] + dy + h, 4)]
            c["D"] = [box_a[0], round(box_b[1] + 2*dy, 4), box_a[2], round(box_b[1] + 2*dy + h, 4)]
            c["E"] = [box_a[0], round(box_b[1] + 3*dy, 4), box_a[2], round(box_b[1] + 3*dy + h, 4)]
        else: # yatay
            dx = box_b[0] - box_a[0]
            w = box_a[2] - box_a[0]
            c["C"] = [round(box_b[0] + dx, 4), box_a[1], round(box_b[0] + dx + w, 4), box_a[3]]
            c["D"] = [round(box_b[0] + 2*dx, 4), box_a[1], round(box_b[0] + 2*dx + w, 4), box_a[3]]
            c["E"] = [round(box_b[0] + 3*dx, 4), box_a[1], round(box_b[0] + 3*dx + w, 4), box_a[3]]
        return c

    # Genel tamamlama: Eksik harfleri sirayla doldur
    for h in SIKLAR:
        if h not in c:
            ref = c.get("A") or list(c.values())[0]
            c[h] = [ref[0], ref[1], ref[2], ref[3]]
    return c


def create_horizontal_5_choices(x_start, x_end, y_start, y_end):
    """Tek satirda A-B-C-D-E icin 5 esit aralikli sik kutusu uretir."""
    W = x_end - x_start
    slot = W / 5.0
    w_btn = slot * 0.88
    c = {}
    for idx, letter in enumerate(SIKLAR):
        x0 = x_start + idx * slot
        x1 = x0 + w_btn
        c[letter] = [round(x0, 4), round(y_start, 4), round(x1, 4), round(y_end, 4)]
    return c


def enhance_dataset():
    data = json.load(io.open(QUIZ_DATA_PATH, encoding="utf-8"))
    keys_data = json.load(io.open(QUIZ_KEYS_PATH, encoding="utf-8")) if os.path.exists(QUIZ_KEYS_PATH) else {}

    fixed_partial = 0
    added_questions = 0

    # 1. Var olan tum eksik sorulari tamamla
    for subj in ("turkce-test", "turkce-cikmis", "deneme"):
        if subj not in data:
            continue
        pages = data[subj].get("pages", {})
        for p, pdata in pages.items():
            for q in pdata.get("q", []):
                c = q.get("c", {})
                if len(c) < 5:
                    q["c"] = fix_partial_choices(c)
                    fixed_partial += 1

    # 2. turkce-test Sayfa 4 ozel yatay sorulari (5, 10, 11) ekle
    p4 = data.get("turkce-test", {}).get("pages", {}).get("4")
    if p4:
        existing_nums = {q["n"] for q in p4.get("q", [])}
        
        # Soru 5: Sol sutun, y: 0.1788 - 0.1899
        if 5 not in existing_nums:
            c5 = create_horizontal_5_choices(0.0593, 0.4414, 0.1788, 0.1920)
            p4["q"].append({"n": 5, "b": [0.0364, 0.0621, 0.4636, 0.1920], "c": c5})
            added_questions += 1
            keys_data.setdefault("turkce-test", {}).setdefault("4", {})["5"] = "A"

        # Soru 10: Sag sutun, y: 0.5783 - 0.5894
        if 10 not in existing_nums:
            c10 = create_horizontal_5_choices(0.5586, 0.9407, 0.5783, 0.5910)
            p4["q"].append({"n": 10, "b": [0.5264, 0.4237, 0.9636, 0.5910], "c": c10})
            added_questions += 1
            keys_data.setdefault("turkce-test", {}).setdefault("4", {})["10"] = "D"

        # Soru 11: Sag sutun, y: 0.7258 - 0.7369
        if 11 not in existing_nums:
            c11 = create_horizontal_5_choices(0.5593, 0.9329, 0.7258, 0.7380)
            p4["q"].append({"n": 11, "b": [0.5264, 0.6429, 0.9636, 0.7380], "c": c11})
            added_questions += 1
            keys_data.setdefault("turkce-test", {}).setdefault("4", {})["11"] = "A"

        p4["q"].sort(key=lambda x: x["n"])

    # Kaydet
    with io.open(QUIZ_DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

    with io.open(QUIZ_KEYS_PATH, "w", encoding="utf-8") as f:
        json.dump(keys_data, f, ensure_ascii=False, indent=1)

    print(f"quiz-data.json tamamlandi: {fixed_partial} eksik soru tamamlandi, {added_questions} soru eklendi.")


if __name__ == "__main__":
    enhance_dataset()

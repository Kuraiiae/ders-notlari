"""Site kapagini uretir: assets/cover.jpg (16:10).

Sade tasarim: lacivert zemin uzerinde yalnizca "KPSS ORTA OGRETIM" yazisi.
Arka planda el yazisi sayfasi veya baska bir terim YOKTUR.

Kullanim:  python tools/make-cover.py
"""
import os

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DST = os.path.join(ROOT, "assets", "cover-v2.jpg")

ARIAL_B = "C:/Windows/Fonts/arialbd.ttf"
ARIAL = "C:/Windows/Fonts/arial.ttf"
W, H = 1400, 875
BG = (7, 10, 22)
ACCENT = (124, 92, 255)
TITLE = "KPSS ORTA \u00d6\u011eRET\u0130M"
TOP = "D\u0130J\u0130TAL K\u00dcT\u00dcPHANE"
SUB = "639 sayfa \u00b7 Kitap Modu \u00b7 Galeri"
DOTS = ["#7c5cff", "#f4a261", "#2ec4b6", "#ff5f6d", "#a855f7", "#f59e0b", "#ef4444"]


def fit_font(draw, text, path, start, max_w):
    size = start
    while size > 10:
        f = ImageFont.truetype(path, size)
        if draw.textlength(text, font=f) <= max_w:
            return f
        size -= 4
    return ImageFont.truetype(path, 10)


def main():
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img, "RGBA")
    # ustte ve altta mor isima (radyal parlama)
    for cx, cy, rad, col in ((W // 2, -160, 620, (124, 92, 255)), (W // 2, H + 200, 560, (46, 196, 182))):
        for r in range(rad, 0, -6):
            a = int(46 * (1 - r / rad) ** 2)
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=col + (a,))
    # ince cerceve
    draw.rectangle([14, 14, W - 15, H - 15], outline=(124, 92, 255, 110), width=3)

    top_f = fit_font(draw, TOP, ARIAL_B, 54, W * 0.6)
    title_f = fit_font(draw, TITLE, ARIAL_B, 150, W * 0.88)
    sub_f = fit_font(draw, SUB, ARIAL, 52, W * 0.7)
    tw = draw.textlength(TOP, font=top_f)
    draw.text(((W - tw) / 2, 168), TOP, font=top_f, fill=ACCENT)

    mw = draw.textlength(TITLE, font=title_f)
    mh = title_f.size
    my = H / 2 - mh / 2 - 20
    draw.text(((W - mw) / 2, my), TITLE, font=title_f, fill="white")
    # altinda mor vurgu cizgisi
    lw, lh = 200, 7
    draw.rounded_rectangle([(W - lw) / 2, my + mh + 34, (W + lw) / 2, my + mh + 34 + lh],
                           radius=4, fill=ACCENT)

    sw = draw.textlength(SUB, font=sub_f)
    draw.text(((W - sw) / 2, my + mh + 74), SUB, font=sub_f, fill=(170, 182, 216))
    # 7 ders renginde nokta sirasi
    n = len(DOTS)
    r, gap = 13, 22
    total = n * (2 * r) + (n - 1) * gap
    y = my + mh + 74 + sub_f.size + 42
    x = (W - total) / 2 + r
    for c in DOTS:
        rgb = tuple(int(c[i:i + 2], 16) for i in (1, 3, 5))
        draw.ellipse([x - r, y - r, x + r, y + r], fill=rgb)
        x += 2 * r + gap

    img.convert("RGB").save(DST, quality=90)
    print("kapak yazildi:", DST, img.size)


if __name__ == "__main__":
    main()

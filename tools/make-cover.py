"""Site kapagini uretir: assets/cover.jpg (16:10).

Kaynak: assets/turkce/clean/page-001.jpg dosyasinin ustten 16:10 kirpilmis
hali + alt kisimda "KPSS ORTA OGRETIM" bant yazisi.

Kullanim:  python tools/make-cover.py
"""
import os

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets", "turkce", "clean", "page-001.jpg")
DST = os.path.join(ROOT, "assets", "cover.jpg")

ARIAL = "C:/Windows/Fonts/arialbd.ttf"
TITLE = "KPSS ORTA \u00d6\u011eRET\u0130M"
SUB = "Dijital K\u00fct\u00fcphane \u00b7 639 sayfa el yaz\u0131s\u0131 ders notu"


def fit_font(draw, text, path, start, max_w):
    size = start
    while size > 10:
        f = ImageFont.truetype(path, size)
        if draw.textlength(text, font=f) <= max_w:
            return f
        size -= 4
    return ImageFont.truetype(path, 10)


def main():
    base = Image.open(SRC).convert("RGB")
    w, h = base.size
    target_h = int(w * 10 / 16)
    # kaynaktaki "DERS NOTLARI" satiri bandin arkasinda kalsin diye
    # kirpma penceresi biraz asagidan baslar
    y0 = 45
    crop = base.crop((0, y0, w, min(h, y0 + target_h)))
    if crop.size[1] < target_h:  # cok kisa olursa alta beyaz doldur
        full = Image.new("RGB", (w, target_h), "white")
        full.paste(crop, (0, 0))
        crop = full

    draw = ImageDraw.Draw(crop)
    band_h = int(target_h * 0.34)
    band_y = target_h - band_h
    # alt bant: tam opak koyu lacivert (alttaki kaynak yazisi gorunmez)
    draw.rectangle([0, band_y, w, target_h], fill=(7, 10, 22))
    draw.line([0, band_y, w, band_y], fill=(124, 92, 255), width=4)

    title_f = fit_font(draw, TITLE, ARIAL, 120, w * 0.86)
    sub_f = fit_font(draw, SUB, ARIAL, 52, w * 0.80)
    tw = draw.textlength(TITLE, font=title_f)
    sw = draw.textlength(SUB, font=sub_f)
    th = title_f.size
    cy = band_y + band_h / 2
    ty = cy - th / 2 - sub_f.size * 0.72
    sy = cy + th / 2 - sub_f.size * 0.28
    draw.text(((w - tw) / 2, ty), TITLE, font=title_f, fill="white")
    draw.text(((w - sw) / 2, sy), SUB, font=sub_f, fill=(170, 182, 216))

    crop.convert("RGB").save(DST, quality=88)
    print("kapak yazildi:", DST, crop.size)


if __name__ == "__main__":
    main()

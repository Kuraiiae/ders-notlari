"""Taranmis ders-notu sayfalarini okumaya uygun hale getirir.

Gri zemin / defter cizgisi / isik lekesini bastirir, renkli murekkebi korur.
Yontem: morfolojik kapanisla zemin tahmini + bolme (document flattening),
ardindan hafif kontrast + keskinlestirme.

Kullanim:
  python tools/enhance.py tarih 1        # tek sayfa onizleme -> tools/preview/
  python tools/enhance.py --all          # tum dersler -> assets/<ders>/clean/
"""
import os
import sys

import cv2
import numpy as np
from PIL import Image, ImageEnhance

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "assets")
PREVIEW = os.path.join(os.path.dirname(os.path.abspath(__file__)), "preview")

KEYS = ["turkce", "turkce-test", "turkce-cikmis", "tarih", "cografya", "vatandaslik", "deneme"]
CLEAN_Q = int(os.environ.get("CLEAN_Q", "68"))


def clean_page(img_bgr):
    # 1) Zemini tahmin et (buyuk cekirdekli morfolojik kapanis)
    h, w = img_bgr.shape[:2]
    k = max(21, (min(h, w) // 28) | 1)  # tek sayi cekirdek
    if k % 2 == 0:
        k += 1
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k))
    bg = cv2.morphologyEx(img_bgr, cv2.MORPH_CLOSE, kernel)
    bg = cv2.GaussianBlur(bg, (0, 0), sigmaX=k / 3.0)
    # 2) Zeminle normalize et (bolme) -> duzgun beyaz zemin
    norm = cv2.divide(img_bgr, bg, scale=255)
    # 3) Hafif beyazlatma: en acik tonlari saf beyaza it
    norm = np.clip((norm.astype(np.float32) - 8) * (255.0 / 247.0), 0, 255).astype(np.uint8)
    # 4) Kontrast + renk canliligi + keskinlik (PIL)
    pil = Image.fromarray(cv2.cvtColor(norm, cv2.COLOR_BGR2RGB))
    pil = ImageEnhance.Color(pil).enhance(1.12)
    pil = ImageEnhance.Contrast(pil).enhance(1.10)
    pil = ImageEnhance.Sharpness(pil).enhance(1.35)
    return pil


def process_file(src, dst):
    bgr = cv2.imread(src, cv2.IMREAD_COLOR)
    if bgr is None:
        raise SystemExit("okunamadi: " + src)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    clean_page(bgr).save(dst, format="JPEG", quality=CLEAN_Q, optimize=True, progressive=True)


def main():
    args = sys.argv[1:]
    if args and args[0] == "--all":
        secili = args[1:] or KEYS
        bilinmeyen = [k for k in secili if k not in KEYS]
        if bilinmeyen:
            raise SystemExit("bilinmeyen ders: " + ", ".join(bilinmeyen))
        total = 0
        for key in secili:
            srcdir = os.path.join(ASSETS, key)
            pages = sorted(f for f in os.listdir(srcdir) if f.startswith("page-") and f.endswith(".jpg"))
            for f in pages:
                process_file(os.path.join(srcdir, f), os.path.join(srcdir, "clean", f))
                total += 1
                if total % 25 == 0:
                    print(f"  {total} sayfa temizlendi", flush=True)
        print(f"bitti: {total} sayfa -> assets/*/clean/")
        return
    if len(args) >= 1:
        key = args[0]
        nums = args[1:] or ["1"]
        os.makedirs(PREVIEW, exist_ok=True)
        for n in nums:
            src = os.path.join(ASSETS, key, f"page-{int(n):03d}.jpg")
            dst = os.path.join(PREVIEW, f"{key}-{int(n):03d}-clean.jpg")
            process_file(src, dst)
            print("onizleme:", dst)
        return
    print(__doc__)


if __name__ == "__main__":
    main()

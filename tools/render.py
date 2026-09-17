"""Taranmis PDF ders notlarini web icin sayfa gorsellerine + thumbnail'lara donusturur."""
import json
import os
import sys
import time

import pymupdf
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "assets")

SUBJECTS = [
    {
        "key": "turkce",
        "title": "Türkçe",
        "subtitle": "Dil Bilgisi ve Anlatım",
        "icon": "&#9998;",
        "file": r"C:\Users\KURAI\Downloads\turkce (1).pdf",
    },
    {
        "key": "turkce-test",
        "title": "Türkçe Testleri",
        "subtitle": "Video Ders Notları ve Testler",
        "icon": "&#128221;",
        "file": r"C:\Users\KURAI\Downloads\Turkce.pdf",
    },
    {
        "key": "turkce-cikmis",
        "title": "Türkçe Çıkmış Sorular",
        "subtitle": "Son 10 Yıl Konu Konu",
        "icon": "&#127919;",
        "file": r"C:\Users\KURAI\Downloads\paraf-akademi-kpss-lisans-son-10-yil-konu-konu-turkce-cikmis-sorular.pdf",
    },
    {
        "key": "tarih",
        "title": "Tarih",
        "subtitle": "Osmanlı'dan Cumhuriyet'e",
        "icon": "&#127963;",
        "file": r"C:\Users\KURAI\Downloads\tarih.pdf",
    },
    {
        "key": "cografya",
        "title": "Coğrafya",
        "subtitle": "Türkiye ve Dünya Coğrafyası",
        "icon": "&#127758;",
        "file": r"C:\Users\KURAI\Downloads\cografya.pdf",
    },
    {
        "key": "vatandaslik",
        "title": "Vatandaşlık",
        "subtitle": "Vatandaşlık ve İnsan Hakları",
        "icon": "&#9878;",
        "file": r"C:\Users\KURAI\Downloads\vatandaslik.pdf",
    },
    {
        "key": "deneme",
        "title": "KPSS Tam Deneme",
        "subtitle": "Karışık Deneme Bölmesi",
        "icon": "&#128202;",
        "file": r"C:\Users\KURAI\Downloads\türkçe 2.pdf",
    },
]

MAX_W = int(os.environ.get("MAX_W", "1400"))
THUMB_W = 300
JPEG_Q = int(os.environ.get("JPEG_Q", "74"))


def render(subject):
    key = subject["key"]
    out_dir = os.path.join(ASSETS, key)
    thumb_dir = os.path.join(out_dir, "thumbs")
    os.makedirs(thumb_dir, exist_ok=True)

    doc = pymupdf.open(subject["file"])
    total_bytes = 0
    t0 = time.time()
    pages = []
    for i, page in enumerate(doc):
        n = i + 1
        rect = page.rect
        zoom = MAX_W / rect.width
        if zoom > 200 / 72:
            zoom = 200 / 72
        mat = pymupdf.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=mat, colorspace=pymupdf.csRGB, alpha=False)

        full = os.path.join(out_dir, f"page-{n:03d}.jpg")
        pix.pil_save(full, format="JPEG", quality=JPEG_Q, optimize=True, progressive=True)

        img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
        ratio = THUMB_W / img.width
        thumb = img.resize((THUMB_W, max(1, int(img.height * ratio))), Image.LANCZOS)
        thumb.save(
            os.path.join(thumb_dir, f"page-{n:03d}.jpg"),
            format="JPEG",
            quality=62,
            optimize=True,
        )
        total_bytes += os.path.getsize(full)
        pages.append({"n": n, "w": pix.width, "h": pix.height})
        if n % 10 == 0 or n == doc.page_count:
            print(f"  {key} {n}/{doc.page_count}", flush=True)
    page_count = doc.page_count
    doc.close()
    info = dict(subject)
    info.pop("file", None)
    info["pages"] = page_count
    info["w"] = pages[0]["w"] if pages else 0
    info["h"] = pages[0]["h"] if pages else 0
    print(
        f"{key}: {page_count} sayfa, {total_bytes/1024/1024:.1f} MB, "
        f"{time.time()-t0:.1f}s",
        flush=True,
    )
    return info


def main():
    only = sys.argv[1:] if len(sys.argv) > 1 else None
    manifest_path = os.path.join(ROOT, "manifest.json")
    existing = {}
    if os.path.exists(manifest_path):
        with open(manifest_path, encoding="utf-8") as f:
            for item in json.load(f):
                existing[item["key"]] = item

    result = []
    for subject in SUBJECTS:
        if only and subject["key"] not in only:
            if subject["key"] in existing:
                result.append(existing[subject["key"]])
            continue
        info = render(subject)
        info["color"] = {
            "vatandaslik": "#ff5f6d",
            "turkce": "#7c5cff",
            "turkce-test": "#a855f7",
            "turkce-cikmis": "#f59e0b",
            "tarih": "#f4a261",
            "cografya": "#2ec4b6",
            "deneme": "#ef4444",
        }[subject["key"]]
        existing[subject["key"]] = info
        result.append(info)

    order = {s["key"]: i for i, s in enumerate(SUBJECTS)}
    result.sort(key=lambda x: order.get(x["key"], 99))
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print("manifest yazildi:", manifest_path)


if __name__ == "__main__":
    main()

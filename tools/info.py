import pymupdf, os, json, sys

files = [
    ("vatandaslik", r"C:\Users\KURAI\Downloads\vatandaslik.pdf"),
    ("turkce", r"C:\Users\KURAI\Downloads\turkce (1).pdf"),
    ("tarih", r"C:\Users\KURAI\Downloads\tarih.pdf"),
    ("cografya", r"C:\Users\KURAI\Downloads\cografya.pdf"),
]

out = []
for key, path in files:
    doc = pymupdf.open(path)
    info = {
        "key": key,
        "file": os.path.basename(path),
        "pages": doc.page_count,
        "size_mb": round(os.path.getsize(path) / 1024 / 1024, 1),
        "rect": [round(v) for v in doc[0].rect],
        "text_chars_p1": len(doc[0].get_text().strip()),
        "images": [len(doc[i].get_images(full=True)) for i in range(min(5, doc.page_count))],
    }
    out.append(info)
    doc.close()

with open(os.path.join(os.path.dirname(__file__), "info.json"), "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=2)
print("done")

import sys, os, time
import pymupdf

pdf = sys.argv[1]
out = sys.argv[2]
dpi = int(sys.argv[3]) if len(sys.argv) > 3 else 130
pages = None
if len(sys.argv) > 4 and sys.argv[4].strip():
    want = set()
    for part in sys.argv[4].replace(' ', '').split(','):
        if '-' in part:
            a, b = part.split('-')
            want.update(range(int(a), int(b) + 1))
        else:
            want.add(int(part))
    pages = want

os.makedirs(out, exist_ok=True)
doc = pymupdf.open(pdf)
zoom = dpi / 72.0
mat = pymupdf.Matrix(zoom, zoom)
t0 = time.time()
print("pages:", doc.page_count)
print("page size pts:", doc[0].rect)
total = 0
for i, page in enumerate(doc):
    n = i + 1
    if pages and n not in pages:
        continue
    pix = page.get_pixmap(matrix=mat, colorspace=pymupdf.csRGB, alpha=False)
    path = os.path.join(out, f"page-{n:03d}.jpg")
    pix.pil_save(path, format="JPEG", quality=78, optimize=True)
    sz = os.path.getsize(path)
    total += sz
    print(f"{n:03d} {pix.width}x{pix.height} {sz/1024:.0f}KB", flush=True)
print(f"total {total/1024/1024:.1f} MB in {time.time()-t0:.1f}s")

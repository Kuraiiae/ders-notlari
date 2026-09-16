"""index.html ve oku.html icindeki script'leri ayiklar (soz dizimi kontrolu icin)
ve manifestteki tum sayfa gorsellerinin (orijinal + temizlenmis) var oldugunu dogrular."""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HERE = os.path.dirname(os.path.abspath(__file__))

for name, out in (("index.html", "app.js"), ("oku.html", "oku.js")):
    with open(os.path.join(ROOT, name), encoding="utf-8") as f:
        html = f.read()
    m = re.search(r"<script>(.*?)</script>", html, re.S)
    assert m, f"script blogu bulunamadi: {name}"
    with open(os.path.join(HERE, out), "w", encoding="utf-8") as f:
        f.write(m.group(1))
    leftover = "__MANIFEST__" in html or "<!--SCRIPT" in html
    link_ok = True
    if name == "index.html":
        link_ok = "oku.html" in html
    if name == "oku.html":
        link_ok = "index.html" in html
    print(name, "| chars:", len(html), "| placeholder:", leftover, "| capraz-link:", link_ok)

with open(os.path.join(ROOT, "manifest.json"), encoding="utf-8") as f:
    manifest = json.load(f)

missing = []
for s in manifest:
    for n in range(1, s["pages"] + 1):
        for rel in (f"assets/{s['key']}/page-{n:03d}.jpg",
                    f"assets/{s['key']}/thumbs/page-{n:03d}.jpg",
                    f"assets/{s['key']}/clean/page-{n:03d}.jpg"):
            if not os.path.exists(os.path.join(ROOT, rel.replace("/", os.sep))):
                missing.append(rel)

print("eksik dosya:", len(missing))
for x in missing[:20]:
    print("  -", x)
print("dersler:", [(s["key"], s["pages"]) for s in manifest])

"""index.html icindeki script'i ayiklar (soz dizimi kontrolu icin) ve
manifestteki tum sayfa gorsellerinin var oldugunu dogrular."""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html_path = os.path.join(ROOT, "index.html")

with open(html_path, encoding="utf-8") as f:
    html = f.read()

m = re.search(r"<script>(.*?)</script>", html, re.S)
assert m, "script blogu bulunamadi"
with open(os.path.join(os.path.dirname(__file__), "app.js"), "w", encoding="utf-8") as f:
    f.write(m.group(1))

with open(os.path.join(ROOT, "manifest.json"), encoding="utf-8") as f:
    manifest = json.load(f)

missing = []
for s in manifest:
    for n in range(1, s["pages"] + 1):
        for rel in (f"assets/{s['key']}/page-{n:03d}.jpg",
                    f"assets/{s['key']}/thumbs/page-{n:03d}.jpg"):
            if not os.path.exists(os.path.join(ROOT, rel.replace("/", os.sep))):
                missing.append(rel)

leftover = "__MANIFEST__" in html
print("html chars:", len(html))
print("placeholder kaldi mi:", leftover)
print("eksik dosya:", len(missing))
for x in missing[:20]:
    print("  -", x)
print("dersler:", [(s["key"], s["pages"]) for s in manifest])

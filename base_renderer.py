import asyncio
import os
from playwright.async_api import async_playwright

OUTPUT_DIR = r"C:\Users\KURAI\Downloads\Temiz_Ders_Notlari"
SCRATCH_DIR = r"C:\Users\KURAI\.gemini\antigravity\scratch"
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

COMMON_CSS = """
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  body {
    background-color: #f3f3f3;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 10px;
    font-family: 'Patrick Hand', 'Comic Neue', cursive, sans-serif;
    color: #1a1a2e;
    -webkit-font-smoothing: antialiased;
  }
  .page {
    width: 800px;
    min-height: 1131px; /* Exact A4 aspect ratio 1:1.4142 (800 x 1131.37) */
    background: #ffffff;
    background-image: 
      repeating-linear-gradient(transparent, transparent 23px, #e8edf5 24px);
    position: relative;
    padding: 26px 34px 34px 34px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
    border-radius: 6px;
    border: 1px solid #d5dbe5;
    font-size: 15.5px;
    line-height: 1.36;
  }

  /* Titles */
  .top-banner {
    text-align: center;
    font-size: 19px;
    font-weight: 700;
    letter-spacing: 1.5px;
    color: #0288d1;
    margin-bottom: 8px;
    text-transform: uppercase;
  }
  .main-title-container {
    text-align: center;
    margin-bottom: 10px;
  }
  .main-title-bg {
    display: inline-block;
    background: #b2ebf2;
    padding: 3px 22px;
    border-radius: 6px;
    box-shadow: 1px 1px 0px rgba(0,0,0,0.06);
  }
  .main-title-bg.yellow { background: #fff59d; }
  .main-title-bg.pink { background: #f8bbd0; }
  .main-title-bg.green { background: #c8e6c9; }
  .main-title-bg.purple { background: #e1bee7; }
  .main-title-bg.orange { background: #ffe0b2; }

  .main-title {
    font-size: 24px;
    font-weight: 700;
    letter-spacing: 1.5px;
    color: #0d47a1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .main-title.dark { color: #1a237e; }
  .main-title.black { color: #212121; }

  .sub-title-banner {
    text-align: center;
    margin: 8px 0 6px 0;
  }
  .sub-title-pill {
    display: inline-block;
    padding: 2px 18px;
    border-radius: 16px;
    font-size: 18.5px;
    font-weight: bold;
    letter-spacing: 1px;
  }
  .pill-purple { background: #e1bee7; color: #4a148c; }
  .pill-blue { background: #b3e5fc; color: #01579b; }
  .pill-yellow { background: #fff9c4; color: #f57f17; }
  .pill-green { background: #c8e6c9; color: #1b5e20; }
  .pill-pink { background: #f8bbd0; color: #880e4f; }
  .pill-gray { background: #e0e0e0; color: #212121; }

  /* Sections */
  .section-heading-blue {
    font-size: 17.5px;
    font-weight: bold;
    color: #1565c0;
    margin: 7px 0 4px 0;
    text-decoration: underline wavy #90caf9;
  }
  .section-heading-red {
    font-size: 17px;
    font-weight: bold;
    color: #c62828;
    margin: 7px 0 4px 0;
  }
  .section-heading-purple {
    font-size: 17px;
    font-weight: bold;
    color: #6a1b9a;
    margin: 7px 0 4px 0;
  }

  /* Grids & Layouts */
  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 8px;
  }
  .grid-2-asym {
    display: grid;
    grid-template-columns: 1fr 1.15fr;
    gap: 12px;
    margin-bottom: 8px;
  }

  /* Boxes */
  .card-box {
    border-radius: 10px;
    padding: 6px 10px;
    background: rgba(255,255,255,0.8);
    font-size: 15px;
    line-height: 1.35;
    margin-bottom: 6px;
  }
  .card-box.border-red { border: 2px solid #e53935; }
  .card-box.border-blue { border: 2px solid #1e88e5; }
  .card-box.border-dark { border: 2px solid #37474f; }
  .card-box.border-green { border: 2px solid #43a047; }
  .card-box.border-purple { border: 2px solid #8e24aa; }

  /* Tables */
  .table-box {
    border: 2px solid #333;
    border-radius: 10px;
    padding: 6px 10px;
    background: rgba(255,255,255,0.75);
    font-size: 15px;
    line-height: 1.35;
    margin-bottom: 6px;
  }
  .table-row {
    display: flex;
    border-bottom: 1px dashed #d1d5db;
    padding: 2px 0;
  }
  .table-row:last-child {
    border-bottom: none;
  }
  .table-col-left {
    width: 48%;
    font-weight: bold;
    color: #111;
  }
  .table-col-right {
    width: 52%;
    color: #1e3a8a;
  }

  /* Dynamic Content & Diagrams */
  .content-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
  }
  .text-col {
    flex: 1;
  }
  .drawing-col {
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .two-column-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 8px;
  }
  .two-column-list ul {
    list-style: none;
    padding-left: 0;
  }
  .two-column-list li {
    position: relative;
    padding-left: 16px;
    margin-bottom: 3px;
  }
  .two-column-list li::before {
    content: "●";
    position: absolute;
    left: 0;
    color: #0288d1;
    font-size: 10px;
    top: 2px;
  }
  .center-highlight {
    text-align: center;
    margin: 8px 0;
    font-weight: bold;
    color: #2e7d32;
    font-size: 16px;
  }
  .note-box {
    border-radius: 8px;
    padding: 6px 12px;
    margin: 6px 0;
    background: #fff8e1;
    border-left: 4px solid #fbc02d;
    font-size: 14.5px;
    line-height: 1.34;
  }
  .note-box.alert {
    background: #ffebee;
    border-left: 4px solid #e53935;
  }
  .sticky-note {
    background: #fffde7;
    border: 1px solid #fff59d;
    border-radius: 8px;
    padding: 8px 12px;
    margin: 8px 0;
    box-shadow: 2px 3px 8px rgba(0,0,0,0.06);
    position: relative;
    font-size: 14.5px;
    line-height: 1.35;
  }
  .sticky-note .signature {
    text-align: right;
    font-family: 'Caveat', cursive;
    font-size: 18px;
    color: #e65100;
    font-weight: bold;
    margin-top: 4px;
  }
  .section-title {
    font-size: 17.5px;
    font-weight: bold;
    color: #b71c1c;
    margin: 7px 0 4px 0;
    border-bottom: 1.5px solid #ffcdd2;
    padding-bottom: 2px;
  }

  /* Quotes & Notes */
  .highlight-quote {
    font-size: 15.5px;
    line-height: 1.35;
    margin: 5px 0;
    color: #111;
  }
  .note-callout {
    font-size: 14.5px;
    color: #2e3842;
    padding: 5px 10px;
    background: #fffde7;
    border-left: 4px solid #fbc02d;
    border-radius: 4px;
    margin: 5px 0;
    line-height: 1.34;
  }

  /* Bullet lists */
  .bullet-list {
    list-style: none;
    font-size: 15px;
    line-height: 1.35;
    margin-bottom: 6px;
  }
  .bullet-list li {
    position: relative;
    padding-left: 16px;
    margin-bottom: 3px;
  }
  .bullet-list.square li::before {
    content: "■";
    position: absolute;
    left: 0;
    color: #1e3a8a;
    font-size: 11px;
    top: 2px;
  }
  .bullet-list.red-dot li::before {
    content: "●";
    position: absolute;
    left: 0;
    color: #d32f2f;
    font-size: 11px;
    top: 2px;
  }
  .bullet-list.blue-dot li::before {
    content: "●";
    position: absolute;
    left: 0;
    color: #0288d1;
    font-size: 11px;
    top: 2px;
  }
  .bullet-list.arrow li::before {
    content: "➔";
    position: absolute;
    left: 0;
    color: #ef6c00;
    font-size: 12px;
    top: 1px;
  }

  /* Footer */
  .footer-page {
    position: absolute;
    bottom: 8px;
    right: 24px;
    font-size: 14px;
    color: #a0aec0;
    font-family: 'Comfortaa', cursive, sans-serif;
  }
"""

def wrap_html(page_num, title, body_content):
    return f"""<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<title>{title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Caveat:wght@600;700&family=Comfortaa:wght@700&display=swap" rel="stylesheet">
<style>
{COMMON_CSS}
</style>
</head>
<body>
<div class="page">
  {body_content}
  <div class="footer-page">{page_num}</div>
</div>
</body>
</html>
"""

async def render_html_to_png(html_content, output_png_path):
    temp_html = os.path.join(SCRATCH_DIR, "temp_render.html")
    with open(temp_html, "w", encoding="utf-8") as f:
        f.write(html_content)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path=CHROME_PATH,
            headless=True
        )
        page = await browser.new_page(
            viewport={"width": 1000, "height": 1450},
            device_scale_factor=2
        )
        await page.goto(f"file:///{os.path.abspath(temp_html)}")
        await page.evaluate("document.fonts.ready")
        await asyncio.sleep(0.3)
        page_elem = await page.query_selector(".page")
        if page_elem:
            await page_elem.screenshot(path=output_png_path)
        else:
            await page.screenshot(path=output_png_path, full_page=True)
        await browser.close()
    print(f"Saved: {output_png_path}")

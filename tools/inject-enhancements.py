import glob
import os

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# turkce-ozet.html yerine *-ozet.html: ozet.py her ders icin <ders>-ozet.html
# uretir, yeni ders eklenince bu glob onu da otomatik kapsar.
files = (glob.glob(os.path.join(root, 'page_*.html'))
         + glob.glob(os.path.join(root, '*-ozet.html')))
injected = 0

for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'enhancements.js' not in content:
        if '</body>' in content:
            content = content.replace('</body>', '  <script src="enhancements.js"></script>\n</body>')
        elif '</html>' in content:
            content = content.replace('</html>', '  <script src="enhancements.js"></script>\n</html>')
        else:
            content += '\n<script src="enhancements.js"></script>'
        
        with open(fpath, 'w', encoding='utf-8', newline='\n') as f:
            f.write(content)
        injected += 1

print(f"Successfully injected enhancements.js into {injected} files.")
